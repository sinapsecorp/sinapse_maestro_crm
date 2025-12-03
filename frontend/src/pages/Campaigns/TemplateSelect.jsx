import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { okeEditableTemplate } from './emailTemplates'
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

  const extractContentWithStyles = (html) => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html || '', 'text/html')
      const isFromModels = !!doc.querySelector('meta[name="tpl-editor"][content="grapesjs"]')
      const body = doc?.body?.innerHTML || ''

      if (isFromModels) {
        // Reconstrói o wrapper com base na cfg salva, mas SEM permitir desalinhamento: sempre centralizado
        let cfg = null
        try {
          const meta = doc.querySelector('meta[name="tpl-config"]')
          const c = meta?.getAttribute('content') || ''
          if (c) {
            try { cfg = JSON.parse(c) } catch (_) {
              try { cfg = JSON.parse(decodeURIComponent(escape(atob(c)))) } catch (__) { cfg = null }
            }
          }
        } catch (_) {
          cfg = null
        }
        const width = Number(cfg?.width) || 600
        const align = '0 auto'
        const contentBg = cfg?.contentBg || 'transparent'
        const linkColor = cfg?.linkColor || '#0068a5'
        // Preserva quaisquer estilos do <head> (inclui CSS do GrapesJS)
        const styles = Array.from(doc.querySelectorAll('style'))
          .map((s) => s?.innerHTML || '')
          .filter(Boolean)
          .join('\n')
        const headStyleTag = styles ? `<style>${styles}</style>` : ''
        const linkStyle = `<style>a{color:${linkColor}}</style>`
        return `${headStyleTag}${linkStyle}<div style="max-width:${width}px;margin:${align};background:${contentBg}">${body}</div>`
      }

      // Fallback: mantém <style> do head + body
      const styles = Array.from(doc.querySelectorAll('style'))
        .map((s) => s?.innerHTML || '')
        .filter(Boolean)
        .join('\n')
      const headStyleTag = styles ? `<style>${styles}</style>` : ''
      const finalBody = body || (html || '')
      return `${headStyleTag}${finalBody}`
    } catch (_) {
      return html || ''
    }
  }

  const handleSelect = (tpl) => {
    if (emailChannel) {
      const content = extractContentWithStyles(tpl.content || '')
      setChannelTemplate(emailChannel.id, { subject: tpl.subject || form.subject, content })
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

      
    </div>
  )
}


