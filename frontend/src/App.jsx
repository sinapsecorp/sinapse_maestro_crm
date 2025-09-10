import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute'

// Páginas
import LoginPage from './pages/Login/LoginPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import LeadsPage from './pages/Leads/LeadsPage'
import CampaignsPage from './pages/Campaigns/CampaignsPage'
import AreasPage from './pages/Settings/AreasPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/settings/areas" element={<AreasPage />} />
      </Route>
    </Routes>
  )
}

export default App
