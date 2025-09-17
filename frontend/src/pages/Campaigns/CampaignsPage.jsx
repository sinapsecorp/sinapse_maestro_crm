import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/DataTable';
import api from '@/services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button as UIButton } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { MoreHorizontal, Play, Pause, Copy, Pencil, Trash2, CheckCircle2, Loader2 } from 'lucide-react'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [total, setTotal] = useState(0);
  // Dialog de disparo
  const [dispatchOpen, setDispatchOpen] = useState(false)
  const [dispatchId, setDispatchId] = useState(null)
  const [areas, setAreas] = useState([])
  const [selectedAreas, setSelectedAreas] = useState([])
  const navigate = useNavigate();

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const params = { page, page_size: pageSize };
      const res = await api.get('/api/campaigns/', { params });
      setCampaigns(Array.isArray(res.data) ? res.data : []);
      const headerTotal = res.headers['x-total-count'] || res.headers['X-Total-Count'] || res.headers['X-total-count'];
      const parsed = headerTotal ? parseInt(headerTotal) : NaN;
      setTotal(!isNaN(parsed) ? parsed : (page === 1 ? (Array.isArray(res.data) ? res.data.length : 0) : total));
    } catch (e) {
      // Em caso de erro de auth ou rede, limpar lista e deixar o interceptor tratar
      setCampaigns([])
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleDispatch = async (id) => {
    setDispatchId(id)
    setSelectedAreas([])
    try {
      const res = await api.get('/api/areas-of-expertise/')
      setAreas(res.data || [])
    } catch (_) {
      setAreas([])
    }
    setDispatchOpen(true)
  }

  const confirmDispatch = async () => {
    const id = dispatchId
    if (!id) return
    const payload = selectedAreas.length ? { area_of_expertise_ids: selectedAreas } : {}
    const res = await api.post(`/api/campaigns/${id}/dispatch`, payload)
    const jobId = res.data?.job_id
    if (!jobId) return
    // marcar como rodando localmente
    setCampaigns((list) => list.map((c) => c.id === id ? { ...c, _jobId: jobId, _jobStatus: 'started' } : c))
    // iniciar polling simples
    const interval = setInterval(async () => {
      try {
        const r = await api.get(`/api/campaigns/${id}/dispatch/status`, { params: { job_id: jobId } })
        const status = r.data?.status
        setCampaigns((list) => list.map((c) => c.id === id ? { ...c, _jobStatus: status } : c))
        if (status === 'finished' || status === 'failed' || status === 'stopped') {
          clearInterval(interval)
        }
      } catch (_) {
        clearInterval(interval)
      }
    }, 2000)
    setDispatchOpen(false)
  };

  const handlePause = async (id) => {
    await api.post(`/api/campaigns/${id}/pause`)
    setCampaigns((list) => list.map((c) => c.id === id ? { ...c, _jobStatus: 'stopped' } : c))
  }

  const handleResume = async (id) => {
    await api.post(`/api/campaigns/${id}/resume`)
    setCampaigns((list) => list.map((c) => c.id === id ? { ...c, _jobStatus: 'queued' } : c))
  }

  const handleDuplicate = async (id) => {
    await api.post(`/api/campaigns/${id}/duplicate`)
    fetchCampaigns()
  }

  const handleDelete = async (id) => {
    if (!confirm('Excluir esta campanha?')) return
    try {
      await api.delete(`/api/campaigns/${id}`)
      // Remover imediatamente da lista sem reconsultar
      setCampaigns((list) => list.filter((c) => c.id !== id))
    } catch (e) {
      const msg = e?.response?.data?.detail || 'Falha ao excluir campanha'
      if (typeof window !== 'undefined') window.alert(msg)
    }
  }

  const columns = useMemo(() => [
    { header: 'Título', cell: ({ row }) => row.original.title || row.original.name },
    { header: 'Canais', cell: ({ row }) => (
      <div className="flex gap-1 flex-wrap">
        {(row.original.channels || []).map((c) => {
          const name = (c.name || '').toLowerCase();
          const color = name.includes('whatsapp') ? 'bg-green-500/15 text-green-600' : name.includes('sms') ? 'bg-yellow-500/15 text-yellow-600' : 'bg-blue-500/15 text-blue-600';
          return (
            <span key={c.id} className={`px-2 py-0.5 text-xs rounded ${color}`}>{c.name}</span>
          );
        })}
      </div>
    )},
    { header: 'Objetivo', cell: ({ row }) => {
      const v = row.original.objective
      if (!v) return <span className="text-muted-foreground">-</span>
      if (v === 'LEAD_GENERATION') return 'Geração de Lead'
      if (v === 'BRAND_AWARENESS') return 'Reconhecimento da Marca'
      if (v === 'PRODUCT_PROMOTION') return 'Divulgação Produto'
      if (v === 'CSAT') return 'CSAT'
      return v
    } },
    { header: 'Status', cell: ({ row }) => {
      const status = (row.original.status || '').toString()
      if (status === 'SENT') return <span className="text-green-500 font-medium">Concluída</span>
      if (status === 'SCHEDULED') return <span className="text-blue-500 font-medium">Agendada</span>
      if (status === 'ARCHIVED') return <span className="text-muted-foreground">Arquivada</span>
      return <span className="text-muted-foreground">Rascunho</span>
    }},
    { header: 'Ações', cell: ({ row }) => {
      const id = row.original.id
      return (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate(`/campaigns/${id}/edit`)} title="Editar"><Pencil className="h-4 w-4" /></Button>
          <Button size="sm" variant="outline" onClick={() => handleDelete(id)} title="Excluir"><Trash2 className="h-4 w-4" /></Button>
          <Button size="sm" onClick={() => handleDispatch(id)} title="Disparar"><Play className="h-4 w-4" /></Button>
          <Button size="sm" variant="outline" onClick={() => handlePause(id)} title="Pausar"><Pause className="h-4 w-4" /></Button>
          <Button size="sm" variant="outline" onClick={() => handleResume(id)} title="Retomar"><Play className="h-4 w-4" /></Button>
          <Button size="sm" variant="outline" onClick={() => handleDuplicate(id)} title="Duplicar"><Copy className="h-4 w-4" /></Button>
        </div>
      )
    }},
  ], []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Campanhas</h1>
        <div className="flex gap-2">
          <Link to="/campaigns/new">
            <UIButton>Adicionar Campanha</UIButton>
          </Link>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Todas as campanhas</CardTitle>
          <CardDescription>Gerencie e dispare suas campanhas</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={campaigns} />
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">{total} resultados</p>
            <div className="flex gap-2">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</Button>
              <span className="text-sm text-muted-foreground">Página {page} de {Math.max(1, Math.ceil(total / pageSize))}</span>
              <Button variant="outline" disabled={(page * pageSize) >= total} onClick={() => setPage(p => p + 1)}>Próxima</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Dialog open={dispatchOpen} onOpenChange={setDispatchOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disparar Campanha</DialogTitle>
            <DialogDescription>Selecione as Áreas de Atuação (opcional). Se nenhuma for selecionada, serão usados todos os leads elegíveis.</DialogDescription>
          </DialogHeader>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {areas.map((a) => {
              const checked = selectedAreas.includes(a.id)
              return (
                <label key={a.id} className={`px-3 py-1 rounded border cursor-pointer block ${checked ? 'bg-primary/10 border-primary' : 'border-border'}`}>
                  <input type="checkbox" className="mr-2" checked={checked} onChange={(e) => setSelectedAreas(e.target.checked ? [...selectedAreas, a.id] : selectedAreas.filter((x) => x !== a.id))} />
                  {a.name}
                </label>
              )
            })}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDispatchOpen(false)}>Cancelar</Button>
            <Button onClick={confirmDispatch}>Confirmar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


