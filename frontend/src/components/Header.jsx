import React from 'react'
import { Leaf } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * Header Component
 * Displays navigation and branding
 */
function Header() {
  return (
    <header className="bg-gradient-to-r from-hydro-dark to-hydro-green shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="bg-white p-2 rounded-lg">
            <Leaf className="w-6 h-6 text-hydro-green" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">🌱 Hydro Predictor</h1>
            <p className="text-hydro-light text-sm">AI-Powered Plant Health System</p>
          </div>
        </Link>
      </div>
    </header>
  )
}

export default Header
