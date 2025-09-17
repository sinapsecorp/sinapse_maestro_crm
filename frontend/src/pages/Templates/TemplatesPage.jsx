import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function TemplatesPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const allSelected = selected.size > 0 && selected.size === (items?.length || 0)

  const filtered = useMemo(() => {
    const s = (q || '').toLowerCase().trim()
    if (!s) return items
    return items.filter((i) => (i.subject || '').toLowerCase().includes(s))
  }, [q, items])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/templates/')
      setItems(res.data || [])
      setSelected(new Set())
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const ok = window.confirm('Excluir este template? Esta ação não pode ser desfeita.')
    if (!ok) return
    setDeletingId(id)
    try {
      await api.delete(`/api/templates/${id}`)
      setItems((prev) => prev.filter((i) => i.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set((items || []).map((i) => i.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selected.size === 0) return
    const ok = window.confirm(`Excluir ${selected.size} template(s)? Esta ação não pode ser desfeita.`)
    if (!ok) return
    // Executa exclusões em sequência simples para simplificar UI (poderia ser Promise.all)
    for (const id of Array.from(selected)) {
      try { await api.delete(`/api/templates/${id}`) } catch (_) { /* ignora erro individual */ }
    }
    await load()
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Modelos de E-mail</h1>
          <p className="text-sm text-muted-foreground">Gerencie e crie modelos editáveis</p>
        </div>
        <div className="flex gap-2">
          <Link to="/templates/new" className="inline-block">
            <Button>Novo Template</Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por assunto..."
          className="w-full max-w-md bg-input border border-border rounded-md px-3 py-2 text-sm"
        />
        <Button variant="outline" onClick={load} disabled={loading}>{loading ? 'Atualizando...' : 'Atualizar'}</Button>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
          Selecionar todos
        </label>
        <Button variant="destructive" onClick={handleBulkDelete} disabled={selected.size === 0}>Excluir selecionados</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t) => (
          <Card key={t.id} className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggleSelect(t.id)} />
                <span className="text-muted-foreground">{new Date(t.created_at).toLocaleString()}</span>
              </label>
            </div>
            <div className="font-medium">{t.subject}</div>
            <div className="truncate text-sm" dangerouslySetInnerHTML={{ __html: t.content }} />
            <div className="flex gap-2 mt-auto">
              <Link to={`/templates/${t.id}/edit`}><Button variant="outline" size="sm">Editar</Button></Link>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(t.id)}
                disabled={deletingId === t.id}
              >{deletingId === t.id ? 'Excluindo...' : 'Excluir'}</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}


