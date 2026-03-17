import { useState } from 'react'
import axios from 'axios'
import { QRCodeCanvas as QRCode } from 'qrcode.react'
import { Link } from 'react-router-dom'

const API = 'http://localhost:3000'

function Home() {
  const [originalUrl, setOriginalUrl] = useState('')
  const [alias, setAlias] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShorten = async () => {
    try {
      setLoading(true)
      setError('')
      setResult(null)
      const body = { originalUrl }
      if (alias) body.alias = alias
      if (expiresAt) body.expiresAt = expiresAt
      const res = await axios.post(`${API}/api/links`, body)
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result.shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadQR = () => {
    const canvas = document.getElementById('qr-code')
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.shortCode}-qr.png`
    a.click()
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-3">
          Shorten. Share. <span style={{color: '#10B981'}}>Track.</span>
        </h1>
        <p style={{color: '#9CA3AF'}}>
          Turn long URLs into powerful short links with analytics
        </p>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-gray-700 p-6 mb-6" style={{background: '#1F2937'}}>
        <div className="flex gap-3 mb-4">
          <input
            type="url"
            placeholder="Paste your long URL here..."
            value={originalUrl}
            onChange={e => setOriginalUrl(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl text-sm outline-none text-white"
            style={{background: '#111827', border: '1px solid #374151'}}
          />
          <button
            onClick={handleShorten}
            disabled={loading || !originalUrl}
            className="px-6 py-3 rounded-xl text-sm font-medium text-white transition disabled:opacity-50"
            style={{background: '#10B981'}}
          >
            {loading ? 'Shortening...' : 'Shorten'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Custom alias (optional)"
            value={alias}
            onChange={e => setAlias(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm outline-none text-white"
            style={{background: '#111827', border: '1px solid #374151'}}
          />
          <input
            type="date"
            value={expiresAt}
            onChange={e => setExpiresAt(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm outline-none text-white"
            style={{background: '#111827', border: '1px solid #374151'}}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl px-4 py-3 text-sm mb-6"
          style={{background: '#450a0a', border: '1px solid #991b1b', color: '#fca5a5'}}>
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="rounded-2xl p-6" style={{background: '#1F2937', border: '1px solid #10B981'}}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold text-lg" style={{color: '#10B981'}}>
                {result.shortUrl}
              </div>
              <div className="text-sm truncate max-w-xs" style={{color: '#9CA3AF'}}>
                {result.originalUrl}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white transition"
                style={{background: '#10B981'}}
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
              <Link
                to={`/analytics/${result.shortCode}`}
                className="px-4 py-2 rounded-xl text-sm font-medium transition"
                style={{border: '1px solid #374151', color: '#9CA3AF'}}
              >
                Analytics
              </Link>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex items-center gap-6 pt-4" style={{borderTop: '1px solid #374151'}}>
            <div className="p-3 rounded-xl" style={{background: '#111827'}}>
              <QRCode
                id="qr-code"
                value={result.shortUrl}
                size={110}
                level="H"
                bgColor="#111827"
                fgColor="#10B981"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-1">
                QR Code generated!
              </p>
              <p className="text-xs mb-3" style={{color: '#9CA3AF'}}>
                Scan to visit the link on any device
              </p>
              <button
                onClick={handleDownloadQR}
                className="px-4 py-2 rounded-xl text-sm transition"
                style={{border: '1px solid #374151', color: '#9CA3AF'}}
              >
                Download PNG
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Home