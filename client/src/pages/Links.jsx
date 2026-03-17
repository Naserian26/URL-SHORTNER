import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const API = 'http://localhost:3000'

function Links() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchLinks = async () => {
    try {
      const res = await axios.get(`${API}/api/links`)
      setLinks(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLinks()
  }, [])

  const handleDelete = async (code) => {
    if (!confirm('Delete this link?')) return
    try {
      await axios.delete(`${API}/api/links/${code}`)
      setLinks(links.filter(l => l.shortCode !== code))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return (
    <div className="text-center py-20" style={{color: '#9CA3AF'}}>
      Loading links...
    </div>
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">My Links</h1>
        <Link
          to="/"
          className="px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{background: '#10B981'}}
        >
          + New Link
        </Link>
      </div>

      {links.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{background: '#1F2937', color: '#9CA3AF'}}>
          No links yet. Go shorten something!
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{background: '#1F2937', border: '1px solid #374151'}}>
          {/* Table header */}
          <div className="grid grid-cols-12 px-4 py-3 text-xs font-medium" style={{color: '#9CA3AF', borderBottom: '1px solid #374151'}}>
            <span className="col-span-3">Short URL</span>
            <span className="col-span-4">Original URL</span>
            <span className="col-span-2 text-center">Clicks</span>
            <span className="col-span-2 text-center">Created</span>
            <span className="col-span-1"></span>
          </div>

          {/* Table rows */}
          {links.map(link => (
            <div
              key={link.id}
              className="grid grid-cols-12 px-4 py-3 items-center"
              style={{borderBottom: '1px solid #374151'}}
            >
              <span className="col-span-3 text-sm font-medium" style={{color: '#10B981'}}>
                /{link.shortCode}
              </span>
              <span className="col-span-4 text-sm truncate" style={{color: '#9CA3AF'}}>
                {link.originalUrl}
              </span>
              <span className="col-span-2 text-sm text-center text-white">
                {link._count?.clicks || 0}
              </span>
              <span className="col-span-2 text-xs text-center" style={{color: '#9CA3AF'}}>
                {new Date(link.createdAt).toLocaleDateString()}
              </span>
              <div className="col-span-1 flex gap-1 justify-end">
                <Link
                  to={`/analytics/${link.shortCode}`}
                  className="px-2 py-1 rounded-lg text-xs"
                  style={{background: '#111827', color: '#10B981'}}
                >
                  Stats
                </Link>
                <button
                  onClick={() => handleDelete(link.shortCode)}
                  className="px-2 py-1 rounded-lg text-xs"
                  style={{background: '#111827', color: '#EF4444'}}
                >
                  Del
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Links