import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/services/api'

export default function AreasPage() {
  const [areas, setAreas] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const fetchAreas = async () => {
    const res = await api.get('/api/areas-of-expertise/')
    setAreas(res.data)
  }

  useEffect(() => { fetchAreas() }, [])

  const handleCreate = async () => {
    await api.post('/api/areas-of-expertise/', { name, description })
    setName('')
    setDescription('')
    fetchAreas()
  }

  const handleDelete = async (id) => {
    await api.delete(`/api/areas-of-expertise/${id}`)
    fetchAreas()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Áreas de Atuação</CardTitle>
          <CardDescription>Gerencie as áreas usadas nos leads</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Input placeholder="Nome" value={name} onChange={(e)=>setName(e.target.value)} />
            <Input placeholder="Descrição" value={description} onChange={(e)=>setDescription(e.target.value)} />
            <Button onClick={handleCreate}>Adicionar</Button>
          </div>
          <ul className="divide-y divide-border">
            {areas.map(a => (
              <li key={a.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{a.name}</div>
                  {a.description && <div className="text-sm text-muted-foreground">{a.description}</div>}
                </div>
                <Button variant="outline" onClick={()=>handleDelete(a.id)}>Remover</Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
