import { useMemo } from 'react'
import { Button } from '@/components/ui/button'

const gallery = [
  { key: 'oke', name: 'Modelo OKE', description: 'Layout centralizado com CTA', preview: '', suggested: true },
]

export default function TemplateGallery({ onSelect }) {
  const items = useMemo(() => gallery, [])
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Modelos prontos</h2>
        <p className="text-sm text-muted-foreground">Escolha um modelo para começar</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((m) => (
          <div key={m.key} className="border border-border rounded-md overflow-hidden bg-card">
            <div className="aspect-[4/3] bg-muted" />
            <div className="p-3 space-y-1">
              <div className="font-medium">{m.name}</div>
              <div className="text-xs text-muted-foreground">{m.description}</div>
              <div className="pt-2">
                <Button size="sm" onClick={() => onSelect && onSelect(m.key)}>Usar este modelo</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}





