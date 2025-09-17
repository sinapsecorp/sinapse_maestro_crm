import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import api from '@/services/api'
import { useNavigate } from 'react-router-dom'
import { useCampaignWizard } from '@/hooks/useCampaignWizard'
import { useParams } from 'react-router-dom'

export default function CampaignWizardStart() {
  const [channels, setChannels] = useState([])
  const [accounts, setAccounts] = useState([])
  const [areas, setAreas] = useState([])
  const navigate = useNavigate()
  const params = useParams()
  const { form, setForm, setChannels: setWizardChannels, setCurrentIndex, reset, setMode, setCampaignId, loadFromCampaign } = useCampaignWizard()

  useEffect(() => {
    ;(async () => {
      try {
        const [ch, ar, acc] = await Promise.all([
          api.get('/api/channels/'),
          api.get('/api/areas-of-expertise/'),
          api.get('/api/marketing/accounts'),
        ])
        setChannels(ch.data || [])
        setAreas(ar.data || [])
        setAccounts(acc.data || [])
      } catch (_) {}
    })()
  }, [])

  const next = () => {
    const selected = channels.filter((c) => form.channel_ids.includes(c.id))
    setWizardChannels(selected)
    setCurrentIndex(0)
    const hasEmail = selected.some((c) => /(e-mail|email)/i.test(c?.name || ''))
    if (hasEmail) {
      navigate('/campaigns/new/template-select')
    } else {
      navigate('/campaigns/new/channel')
    }
  }

  useEffect(() => {
    // Se for edição, carregar campanha
    const id = params.id
    if (id) {
      ;(async () => {
        try {
          const c = await api.get(`/api/campaigns/${id}`)
          loadFromCampaign(c.data)
          setMode('edit')
          setCampaignId(id)
          // garantir que listas locais tenham opções atuais
          const [ch, ar] = await Promise.all([
            api.get('/api/channels/'),
            api.get('/api/areas-of-expertise/'),
          ])
          setChannels(ch.data || [])
          setAreas(ar.data || [])
          // preencher áreas selecionadas se vieram da API
          if (Array.isArray(c.data?.areas)) {
            setForm((f) => ({ ...f, area_ids: (c.data.areas || []).map((a) => a.id) }))
          }
        } catch (_) {}
      })()
    } else {
      reset()
      setMode('create')
      setCampaignId(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Título</Label>
        <Input id="title" value={form.title} onChange={(e) => setForm({ title: e.target.value })} required />
      </div>
      <div>
        <Label htmlFor="subject">Assunto</Label>
        <Input id="subject" value={form.subject} onChange={(e) => setForm({ subject: e.target.value })} required />
      </div>
      <div>
        <Label htmlFor="objective">Objetivo da Campanha</Label>
        <Select value={form.objective || ''} onValueChange={(v) => setForm({ objective: v || null })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o objetivo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LEAD_GENERATION">Geração de Lead</SelectItem>
            <SelectItem value="BRAND_AWARENESS">Reconhecimento da Marca</SelectItem>
            <SelectItem value="PRODUCT_PROMOTION">Divulgação Produto</SelectItem>
            <SelectItem value="CSAT">CSAT</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Conta de Marketing</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {accounts.map((a) => (
            <label key={a.id} className={`px-3 py-1 rounded border cursor-pointer ${form.marketing_account_id === a.id ? 'bg-primary/10 border-primary' : 'border-border'}`}>
              <input type="radio" name="acc" className="mr-2" checked={form.marketing_account_id === a.id} onChange={() => setForm({ marketing_account_id: a.id })} />
              {a.name}
            </label>
          ))}
          {!accounts.length && <div className="text-sm text-muted-foreground">Nenhuma conta cadastrada. Cadastre em Configurações &gt; Credenciais.</div>}
        </div>
      </div>
      <div>
        <Label>Canais</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {channels.map((c) => {
            const checked = form.channel_ids.includes(c.id)
            return (
              <label key={c.id} className={`px-3 py-1 rounded border cursor-pointer ${checked ? 'bg-primary/10 border-primary' : 'border-border'}`}>
                <input type="checkbox" className="mr-2" checked={checked} onChange={(e) => setForm({ channel_ids: e.target.checked ? [...form.channel_ids, c.id] : form.channel_ids.filter((x) => x !== c.id) })} />
                {c.name}
              </label>
            )
          })}
        </div>
      </div>
      <div>
        <Label>Áreas de Atuação</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {areas.map((a) => {
            const checked = form.area_ids.includes(a.id)
            return (
              <label key={a.id} className={`px-3 py-1 rounded border cursor-pointer ${checked ? 'bg-primary/10 border-primary' : 'border-border'}`}>
                <input type="checkbox" className="mr-2" checked={checked} onChange={(e) => setForm({ area_ids: e.target.checked ? [...form.area_ids, a.id] : form.area_ids.filter((x) => x !== a.id) })} />
                {a.name}
              </label>
            )
          })}
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="button" disabled={!form.title || !form.subject || !form.channel_ids.length || !form.marketing_account_id} onClick={next}>Avançar</Button>
      </div>
    </div>
  )
}


