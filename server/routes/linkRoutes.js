const express = require('express')
const router = express.Router()
const { createLink, getAnalytics, getAllLinks, deleteLink } = require('../controllers/linkController')

// POST /api/links
router.post('/', createLink)

// GET /api/links
router.get('/', getAllLinks)

// GET /api/links/analytics/:code
router.get('/analytics/:code', getAnalytics)

// DELETE /api/links/:code
router.delete('/:code', deleteLink)

module.exports = router