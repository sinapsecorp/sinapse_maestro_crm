import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast.jsx';

export default function BulkDeleteByAreas({ onDone }) {
  const [areas, setAreas] = useState([])
  const [selected, setSelected] = useState([])
  const { show } = useToast();

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/api/areas-of-expertise/')
      setAreas(res.data)
    }
    load()
  }, [])

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleDelete = async () => {
    if (!selected.length) return
    await api.post('/api/leads/bulk-delete/by-areas', { area_of_expertise_ids: selected })
    show({ title: 'Remoção em massa', message: 'Leads removidos com sucesso.' })
    onDone && onDone()
  }

  return (
    <div className="space-y-3">
      <div className="max-h-64 overflow-auto border rounded-md p-2">
        {areas.map(a => (
          <label key={a.id} className="flex items-center gap-2 py-1">
            <input type="checkbox" checked={selected.includes(a.id)} onChange={() => toggle(a.id)} />
            <span>{a.name}</span>
          </label>
        ))}
      </div>
      <Button variant="destructive" onClick={handleDelete} disabled={!selected.length}>Remover todos os leads das áreas selecionadas</Button>
    </div>
  )
}


