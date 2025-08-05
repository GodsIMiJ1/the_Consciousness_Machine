import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { DefendantLogin } from './components/DefendantLogin.tsx'
import { TribunalInterface } from './components/TribunalInterface.tsx'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default route - Defendant Login */}
          <Route path="/" element={<DefendantLogin />} />

          {/* Tribunal Interface with session ID */}
          <Route path="/tribunal/:summonsId" element={<TribunalInterface />} />

          {/* Admin/Judge direct access */}
          <Route path="/admin" element={<TribunalInterface />} />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
