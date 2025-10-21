/**
 * Main App Component
 * Sets up routing between input dashboard and results view
 */

import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import InputDashboard from './pages/InputDashboard'
import ResultsView from './pages/ResultsView'
import Header from './components/Header'
import Footer from './components/Footer'
import './App.css'

function App() {
  const [predictionData, setPredictionData] = useState(null)

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-hydro-light to-white flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={<InputDashboard onPredictionComplete={setPredictionData} />}
            />
            <Route
              path="/results"
              element={predictionData ? <ResultsView data={predictionData} /> : <Navigate to="/" />}
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
