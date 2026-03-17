import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Links from './pages/Links'
import Analytics from './pages/Analytics'
import Navbar from './components/Navbar'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/links" element={<Links />} />
          <Route path="/analytics/:code" element={<Analytics />} />
        </Routes>
      </div>
    </div>
  )
}

export default App