import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import StatsCard from '@/pages/Dashboard/StatsCard'
import api from '@/services/api'
import { Calendar, Send, Users, BarChart3, Layers, Mail, MessageSquare, Phone } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

function DateRangePicker({ value, onChange }) {
  const [start, setStart] = useState(value?.start || '')
  const [end, setEnd] = useState(value?.end || '')

  useEffect(() => {
    onChange?.({ start, end })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end])

  return (
    <div className="flex items-end gap-3">
      <div className="flex flex-col">
        <label className="text-xs text-muted-foreground">Início</label>
        <input type="date" className="bg-background border border-border rounded px-2 py-1 text-sm" value={start} onChange={e => setStart(e.target.value)} />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-muted-foreground">Fim</label>
        <input type="date" className="bg-background border border-border rounded px-2 py-1 text-sm" value={end} onChange={e => setEnd(e.target.value)} />
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const today = new Date().toISOString().slice(0, 10)
  const [filterRange, setFilterRange] = useState({ start: '', end: '' })
  const [appliedRange, setAppliedRange] = useState({ start: '', end: '' })
  const [loading, setLoading] = useState(false)
  const [overview, setOverview] = useState(null)
  const [mainTab, setMainTab] = useState('overview')
  const [tab, setTab] = useState('email')
  const [delivery, setDelivery] = useState(null)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [deliveryDetails, setDeliveryDetails] = useState([])
  const [detailsTotal, setDetailsTotal] = useState(0)
  const [detailsPage, setDetailsPage] = useState(1)
  const detailsPageSize = 20
  const [campaigns, setCampaigns] = useState([])

  const fetchOverview = async () => {
    setLoading(true)
    try {
      const params = {}
      if (appliedRange.start) params.start_date = appliedRange.start
      if (appliedRange.end) params.end_date = appliedRange.end
      const res = await api.get('/api/analytics/overview', { params })
      setOverview(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(fetchOverview, 200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedRange.start, appliedRange.end])

  useEffect(() => {
    // carrega lista de campanhas para o dropdown de drill-down
    const loadCampaigns = async () => {
      try {
        const res = await api.get('/api/campaigns/', { params: { page: 1, page_size: 50 } })
        setCampaigns(Array.isArray(res.data) ? res.data : [])
      } catch (_) {
        setCampaigns([])
      }
    }
    loadCampaigns()
  }, [])

  useEffect(() => {
    const fetchDelivery = async () => {
      if (mainTab !== 'delivery') { setDelivery(null); return }
      const params = {}
      if (appliedRange.start) params.start_date = appliedRange.start
      if (appliedRange.end) params.end_date = appliedRange.end
      params.channel = tab
      try {
        const res = await api.get('/api/analytics/delivery/summary', { params })
        setDelivery(res.data)
      } catch (_) {
        setDelivery(null)
      }
    }
    const t = setTimeout(fetchDelivery, 200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, appliedRange.start, appliedRange.end, mainTab])

  useEffect(() => {
    const fetchDetails = async () => {
      if (mainTab !== 'delivery') { setDeliveryDetails([]); return }
      try {
        if (!selectedCampaign) {
          const params = {}
          if (appliedRange.start) params.start_date = appliedRange.start
          if (appliedRange.end) params.end_date = appliedRange.end
          params.channel = tab
          params.page = detailsPage
          params.page_size = detailsPageSize
          const res = await api.get('/api/analytics/delivery/leads', { params })
          setDeliveryDetails(Array.isArray(res.data) ? res.data : [])
          const headerTotal = res.headers?.['x-total-count'] || res.headers?.['X-Total-Count'] || res.headers?.['X-total-count']
          const parsed = headerTotal ? parseInt(headerTotal) : NaN
          setDetailsTotal(!isNaN(parsed) ? parsed : (detailsPage === 1 ? (Array.isArray(res.data) ? res.data.length : 0) : detailsTotal))
        } else {
          const params = { channel: tab, page: detailsPage, page_size: detailsPageSize }
          const res = await api.get(`/api/analytics/delivery/campaign/${selectedCampaign}`, { params })
          setDeliveryDetails(Array.isArray(res.data) ? res.data : [])
          const headerTotal = res.headers?.['x-total-count'] || res.headers?.['X-Total-Count'] || res.headers?.['X-total-count']
          const parsed = headerTotal ? parseInt(headerTotal) : NaN
          setDetailsTotal(!isNaN(parsed) ? parsed : (detailsPage === 1 ? (Array.isArray(res.data) ? res.data.length : 0) : detailsTotal))
        }
      } catch (_) {
        setDeliveryDetails([])
        setDetailsTotal(0)
      }
    }
    fetchDetails()
  }, [selectedCampaign, tab, mainTab, appliedRange.start, appliedRange.end, detailsPage])

  // Resetar página quando filtros/campanha mudarem
  useEffect(() => {
    setDetailsPage(1)
  }, [selectedCampaign, tab, appliedRange.start, appliedRange.end])

  const perDayData = useMemo(() => {
    return Array.isArray(overview?.campaigns_per_day) ? overview.campaigns_per_day : []
  }, [overview])

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Acompanhe o desempenho das campanhas</p>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <DateRangePicker value={filterRange} onChange={setFilterRange} />
          <Button onClick={() => { setAppliedRange(filterRange); }} variant="default">Filtrar</Button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border mb-4">
        <button onClick={() => setMainTab('overview')} className={`px-4 py-2 -mb-px border-b-2 ${mainTab==='overview' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}>Visão Geral</button>
        <button onClick={() => setMainTab('delivery')} className={`px-4 py-2 -mb-px border-b-2 ${mainTab==='delivery' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}>Relatórios de Entrega</button>
      </div>

      {mainTab === 'overview' && (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Leads"
          value={(overview?.total_leads ?? 0).toLocaleString()}
          icon={Users}
          variant="success"
        />
        <StatsCard
          title="Campanhas Disparadas"
          value={(overview?.campaigns_sent ?? 0).toLocaleString()}
          icon={Send}
          variant="default"
        />
        <StatsCard
          title="Canais Ativos"
          value={(overview?.campaigns_by_channel?.length ?? 0).toString()}
          icon={BarChart3}
          variant="warning"
        />
        <StatsCard
          title="Áreas de Atuação"
          value={(overview?.campaigns_by_area?.length ?? 0).toString()}
          icon={Layers}
          variant="default"
        />
      </div>
      )}

      {mainTab === 'overview' && (
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Campanhas por Dia</CardTitle>
            <CardDescription>Soma de disparos por data</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={perDayData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campanhas por Canal</CardTitle>
            <CardDescription>Distribuição por canal</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(overview?.campaigns_by_channel || []).map((item) => (
                <li key={item.channel} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.channel}</span>
                  <span className="font-semibold">{item.count}</span>
                </li>
              ))}
              {(!overview?.campaigns_by_channel || overview.campaigns_by_channel.length === 0) && (
                <li className="text-sm text-muted-foreground">Sem dados no período</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
      )}

      {mainTab === 'delivery' && (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Relatórios de Entrega</CardTitle>
              <CardDescription>Métricas por canal com drill-down por campanha</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <button onClick={() => setTab('email')} className={`px-3 py-1 rounded border ${tab==='email' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>
                <div className="flex items-center gap-1"><Mail className="h-4 w-4"/> E-mail</div>
              </button>
              <button onClick={() => setTab('whatsapp')} className={`px-3 py-1 rounded border ${tab==='whatsapp' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>
                <div className="flex items-center gap-1"><MessageSquare className="h-4 w-4"/> WhatsApp</div>
              </button>
              <button onClick={() => setTab('sms')} className={`px-3 py-1 rounded border ${tab==='sms' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>
                <div className="flex items-center gap-1"><Phone className="h-4 w-4"/> SMS</div>
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <StatsCard title="Campanhas" value={(delivery?.campaigns ?? 0).toString()} icon={Layers} />
            <StatsCard title="Disparos" value={(delivery?.sends ?? 0).toString()} icon={Send} />
            <StatsCard title="Falhas" value={(delivery?.failed ?? 0).toString()} icon={BarChart3} variant="danger" />
            <StatsCard title="Entregues" value={(delivery?.delivered ?? 0).toString()} icon={BarChart3} variant="success" />
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Selecione uma campanha para ver detalhes de entrega por lead</div>
              <select className="bg-background border border-border rounded px-2 py-1 text-sm" value={selectedCampaign || ''} onChange={(e) => setSelectedCampaign(e.target.value || null)}>
                <option value="">Campanha...</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            {/* Tabela simples de detalhes */}
            <div className="rounded-md border">
              <table className="w-full text-sm [&>tbody>tr:nth-child(odd)]:bg-muted/20">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left p-2">Lead</th>
                    <th className="text-left p-2">E-mail</th>
                    <th className="text-left p-2">Empresa</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Motivo (falha)</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryDetails.map((r) => (
                    <tr key={r.campaign_lead_id} className="border-t border-border/60">
                      <td className="p-2">{r.full_name || '-'}</td>
                      <td className="p-2">{r.email || '-'}</td>
                      <td className="p-2">{r.company || '-'}</td>
                      <td className="p-2">{
                        r.status === 'DELIVERED' ? 'Entregue' :
                        r.status === 'OPENED' ? 'Aberto' :
                        r.status === 'CLICKED' ? 'Clicado' :
                        r.status === 'CONVERTED' ? 'Converteu' :
                        r.status || '-'
                      }</td>
                      <td className="p-2 text-muted-foreground">{r.error_reason || '-'}</td>
                    </tr>
                  ))}
                  {deliveryDetails.length === 0 && (
                    <tr>
                      <td className="p-4 text-center text-muted-foreground" colSpan={5}>Selecione uma campanha para visualizar.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">{detailsTotal} resultados</p>
              <div className="flex gap-2">
                <Button variant="outline" disabled={detailsPage === 1} onClick={() => setDetailsPage(p => Math.max(1, p - 1))}>Anterior</Button>
                <span className="text-sm text-muted-foreground">Página {detailsPage} de {Math.max(1, Math.ceil(detailsTotal / detailsPageSize))}</span>
                <Button variant="outline" disabled={(detailsPage * detailsPageSize) >= detailsTotal} onClick={() => setDetailsPage(p => p + 1)}>Próxima</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      )}
      {mainTab === 'overview' && (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campanhas por Área de Atuação</CardTitle>
            <CardDescription>Segmentação por área</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(overview?.campaigns_by_area || []).map((item) => (
                <li key={item.area} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.area}</span>
                  <span className="font-semibold">{item.count}</span>
                </li>
              ))}
              {(!overview?.campaigns_by_area || overview.campaigns_by_area.length === 0) && (
                <li className="text-sm text-muted-foreground">Sem dados no período</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status das Campanhas</CardTitle>
            <CardDescription>Distribuição por status</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(overview?.campaigns_by_status || []).map((item) => (
                <li key={item.status} className="flex items-center justify-between text-sm">
                  <span className={`flex items-center gap-2 ${
                    item.status === 'Ativas' ? 'text-green-600' : 
                    item.status === 'Pausadas' ? 'text-yellow-600' : 
                    'text-gray-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === 'Ativas' ? 'bg-green-500' : 
                      item.status === 'Pausadas' ? 'bg-yellow-500' : 
                      'bg-gray-500'
                    }`}></div>
                    {item.status}
                  </span>
                  <span className="font-semibold">{item.count}</span>
                </li>
              ))}
              {(!overview?.campaigns_by_status || overview.campaigns_by_status.length === 0) && (
                <li className="text-sm text-muted-foreground">Sem dados no período</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
      )}
    </div>
  )
}


