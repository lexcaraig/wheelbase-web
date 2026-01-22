import { Routes, Route } from 'react-router-dom'
import { EmergencyResponsePage } from './pages/EmergencyResponsePage'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <Routes>
      {/* Emergency Response Page - both paths supported */}
      <Route path="/respond/:token" element={<EmergencyResponsePage />} />
      <Route path="/emergency/respond/:token" element={<EmergencyResponsePage />} />

      {/* Catch-all for 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
