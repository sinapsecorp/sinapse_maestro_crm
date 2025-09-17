import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute'

// Páginas
import LoginPage from './pages/Login/LoginPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import AnalyticsPage from './pages/Analytics/AnalyticsPage'
import LeadsPage from './pages/Leads/LeadsPage'
import CampaignsPage from './pages/Campaigns/CampaignsPage'
import SettingsPage from './pages/Settings/SettingsPage'
import CampaignWizardStart from './pages/Campaigns/CampaignWizardStart'
import CampaignWizardChannel from './pages/Campaigns/CampaignWizardChannel'
import TemplateSelect from './pages/Campaigns/TemplateSelect'
import TemplatesPage from './pages/Templates/TemplatesPage'
import TemplateEditor from './pages/Templates/TemplateEditor'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/campaigns/new" element={<CampaignWizardStart />} />
        <Route path="/campaigns/:id/edit" element={<CampaignWizardStart />} />
        <Route path="/campaigns/new/template-select" element={<TemplateSelect />} />
        <Route path="/campaigns/new/channel" element={<CampaignWizardChannel />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/templates/new" element={<TemplateEditor />} />
        <Route path="/templates/:id/edit" element={<TemplateEditor />} />
        <Route path="/settings/areas" element={<SettingsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Route>
    </Routes>
  )
}

export default App
