import AreasPage from './AreasPage'
import CredentialsPage from './CredentialsPage'
import { useState } from 'react'

export default function SettingsPage() {
  const tabs = [
    { key: 'areas', label: 'Áreas de Atuação', component: <AreasPage /> },
    { key: 'credentials', label: 'Credenciais', component: <CredentialsPage /> },
  ]
  const [active, setActive] = useState('areas')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>
      <div className="border-b border-border">
        <nav className="-mb-px flex gap-4">
          {tabs.map(t => (
            <button key={t.key} onClick={()=>setActive(t.key)} className={`px-3 py-2 text-sm border-b-2 ${active === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              {t.label}
            </button>
          ))}
        </nav>
      </div>
      <div>
        {tabs.find(t => t.key === active)?.component}
      </div>
    </div>
  )
}


