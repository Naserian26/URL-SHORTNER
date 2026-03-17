import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const location = useLocation()

  return (
    <nav className="border-b border-gray-800 px-4 py-3" style={{background: '#1F2937'}}>
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-white">
          snip<span style={{color: '#10B981'}}>.</span>ly
        </Link>
        <div className="flex gap-2">
          <Link
            to="/"
            className="text-sm px-4 py-2 rounded-xl transition"
            style={{
              background: location.pathname === '/' ? '#10B981' : 'transparent',
              color: location.pathname === '/' ? 'white' : '#9CA3AF',
            }}
          >
            Shorten
          </Link>
          <Link
            to="/links"
            className="text-sm px-4 py-2 rounded-xl transition"
            style={{
              background: location.pathname === '/links' ? '#10B981' : 'transparent',
              color: location.pathname === '/links' ? 'white' : '#9CA3AF',
            }}
          >
            My Links
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar