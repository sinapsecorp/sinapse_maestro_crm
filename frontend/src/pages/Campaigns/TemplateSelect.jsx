import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { presetTemplates, presetLabels } from '@/pages/Templates/presetTemplates'
import { Label } from '@/components/ui/label'
import { useCampaignWizard } from '@/hooks/useCampaignWizard'
import { useNavigate } from 'react-router-dom'
import api from '@/services/api'

export default function TemplateSelect() {
  const navigate = useNavigate()
  const { setChannelTemplate, channels, form } = useCampaignWizard()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const emailChannel = useMemo(() => channels.find((c) => /(e-mail|email)/i.test(c?.name || '')), [channels])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await api.get('/api/templates/')
        setTemplates(res.data || [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleSelect = (tpl) => {
    if (emailChannel) {
      setChannelTemplate(emailChannel.id, { subject: tpl.subject || form.subject, content: tpl.content || '' })
    }
    navigate('/campaigns/new/channel')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Selecionar modelo para E-mail</h2>
          <p className="text-sm text-muted-foreground">Escolha um modelo pronto para iniciar a campanha</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/campaigns/new/channel')}>Pular</Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Carregando modelos...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="border border-border rounded-md p-3 bg-card">
              <div className="text-sm text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</div>
              <div className="font-medium mb-2">{t.subject}</div>
              <div className="h-24 overflow-hidden text-sm" dangerouslySetInnerHTML={{ __html: t.content }} />
              <div className="pt-2">
                <Button size="sm" onClick={() => handleSelect(t)}>Usar este</Button>
              </div>
            </div>
          ))}
          {!templates.length && (
            <div className="text-sm text-muted-foreground">Nenhum modelo cadastrado ainda.</div>
          )}
        </div>
      )}

      <div className="pt-6 space-y-2">
        <Label>Ou começar de um modelo pronto</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {Object.keys(presetTemplates).map((k) => (
            <Button key={k} variant="outline" size="sm" onClick={() => handleSelect({ subject: form.subject, content: presetTemplates[k]() })}>
              {presetLabels[k] || k}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}


