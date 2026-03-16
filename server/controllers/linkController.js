const { PrismaClient } = require('@prisma/client')
const { nanoid } = require('nanoid')
const redis = require('../lib/redis')
const UAParser = require('ua-parser-js')

const prisma = new PrismaClient()

// POST /api/links - shorten a URL
const createLink = async (req, res) => {
  try {
    const { originalUrl, alias } = req.body

    if (!originalUrl) {
      return res.status(400).json({ error: 'URL is required' })
    }

    const shortCode = alias || nanoid(6)

    if (alias) {
      const existing = await prisma.link.findUnique({
        where: { shortCode: alias }
      })
      if (existing) {
        return res.status(400).json({ error: 'Alias already taken' })
      }
    }

    const link = await prisma.link.create({
      data: {
        originalUrl,
        shortCode,
        alias: alias || null,
      }
    })

    await redis.set(shortCode, originalUrl, { ex: 86400 })

    res.status(201).json({
      shortCode: link.shortCode,
      shortUrl: `http://localhost:3000/${link.shortCode}`,
      originalUrl: link.originalUrl,
    })

  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' })
  }
}

// GET /:code - redirect to original URL
const redirectLink = async (req, res) => {
  try {
    const { code } = req.params

    const cachedUrl = await redis.get(code)
    if (cachedUrl) {
      const link = await prisma.link.findUnique({
        where: { shortCode: code }
      })
      if (link) logClick(req, link.id)
      return res.redirect(cachedUrl)
    }

    const link = await prisma.link.findUnique({
      where: { shortCode: code }
    })

    if (!link) {
      return res.status(404).json({ error: 'Link not found' })
    }

    if (link.expiresAt && link.expiresAt < new Date()) {
      return res.status(410).json({ error: 'Link has expired' })
    }

    await redis.set(code, link.originalUrl, { ex: 86400 })

    logClick(req, link.id)
    return res.redirect(link.originalUrl)

  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' })
  }
}

// GET /api/analytics/:code - get click data for a link
const getAnalytics = async (req, res) => {
  try {
    const { code } = req.params

    const link = await prisma.link.findUnique({
      where: { shortCode: code }
    })

    if (!link) {
      return res.status(404).json({ error: 'Link not found' })
    }

    const totalClicks = await prisma.click.count({
      where: { linkId: link.id }
    })

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const clicksByDay = await prisma.click.groupBy({
      by: ['clickedAt'],
      where: {
        linkId: link.id,
        clickedAt: { gte: thirtyDaysAgo }
      },
      _count: true,
      orderBy: { clickedAt: 'asc' }
    })

    const browserBreakdown = await prisma.click.groupBy({
      by: ['browser'],
      where: { linkId: link.id },
      _count: true
    })

    const deviceBreakdown = await prisma.click.groupBy({
      by: ['device'],
      where: { linkId: link.id },
      _count: true
    })

    const recentClicks = await prisma.click.findMany({
      where: { linkId: link.id },
      orderBy: { clickedAt: 'desc' },
      take: 10
    })

    res.json({
      link: {
        shortCode: link.shortCode,
        originalUrl: link.originalUrl,
        createdAt: link.createdAt,
        expiresAt: link.expiresAt,
        isExpired: link.expiresAt ? link.expiresAt < new Date() : false
      },
      totalClicks,
      clicksByDay,
      browserBreakdown,
      deviceBreakdown,
      recentClicks
    })

  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' })
  }
}

// GET /api/links - get all links
const getAllLinks = async (req, res) => {
  try {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { clicks: true }
        }
      }
    })
    res.json(links)
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' })
  }
}

// DELETE /api/links/:code - delete a link
const deleteLink = async (req, res) => {
  try {
    const { code } = req.params

    const link = await prisma.link.findUnique({
      where: { shortCode: code }
    })

    if (!link) {
      return res.status(404).json({ error: 'Link not found' })
    }

    // Delete clicks first (because they reference the link)
    await prisma.click.deleteMany({
      where: { linkId: link.id }
    })

    // Then delete the link
    await prisma.link.delete({
      where: { shortCode: code }
    })

    // Remove from Redis
    await redis.del(code)

    res.json({ message: 'Link deleted successfully' })

  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' })
  }
}

// Helper - log click in background
const logClick = (req, linkId) => {
  const parser = new UAParser(req.headers['user-agent'])
  const device = parser.getDevice().type || 'desktop'
  const browser = parser.getBrowser().name || 'unknown'
  const referrer = req.headers['referer'] || null

  prisma.click.create({
    data: {
      linkId,
      device,
      browser,
      referrer,
    }
  }).catch(console.error)
}

module.exports = { createLink, redirectLink, getAnalytics, getAllLinks, deleteLink }