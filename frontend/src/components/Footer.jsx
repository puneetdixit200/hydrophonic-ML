import React from 'react'
import { Heart } from 'lucide-react'

/**
 * Footer Component
 * Displays footer with model information and credits
 */
function Footer() {
  return (
    <footer className="bg-hydro-dark text-white py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold mb-3 text-hydro-accent">About</h3>
            <p className="text-sm text-gray-300">
              Hydroponic plant health prediction using advanced ML and environmental analysis.
            </p>
          </div>

          {/* Model Info */}
          <div>
            <h3 className="font-bold mb-3 text-hydro-accent">Model Info</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>🤖 XGBoost Multi-Output Regression</li>
              <li>📊 Version: 1.0.0</li>
              <li>🎯 Confidence-based predictions</li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-bold mb-3 text-hydro-accent">Features</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ Real-time health prediction</li>
              <li>✓ Nutrient analysis</li>
              <li>✓ Disease risk assessment</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
            Made with <Heart className="w-4 h-4 text-red-500" /> for hydroponic farmers
          </p>
          <p className="text-xs text-gray-500 mt-2">© 2025 Hydroponic Plant Predictor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
