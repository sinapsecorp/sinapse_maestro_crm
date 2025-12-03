
export default function TemplateEditorConfigPanel({ config, onChange }) {
  const width = config?.width ?? 600
  const contentBg = config?.contentBg ?? '#ffffff'
  const font = config?.font ?? 'Arial, Helvetica, sans-serif'
  const linkColor = config?.linkColor ?? '#0068a5'
  const preheader = config?.preheader ?? ''


  return (
    <div className="space-y-3">
      <div>
        <div className="text-sm font-medium mb-1">Largura (px)</div>
        <input type="number" min={320} max={960} value={width} onChange={(e) => onChange({ width: Number(e.target.value) })} className="w-full bg-input border border-border rounded-md px-2 py-1 text-sm" />
      </div>
      <div>
        <div className="text-sm font-medium mb-1">Fundo do conteúdo</div>
        <div className="text-xs text-muted-foreground mb-1">Cor da área interna</div>
        <div className="flex gap-1">
          <input type="color" value={contentBg} onChange={(e) => onChange({ contentBg: e.target.value })} className="w-8 h-8" />
          <input type="text" value={contentBg} onChange={(e) => onChange({ contentBg: e.target.value })} placeholder="#ffffff" className="flex-1 bg-input border border-border rounded-md px-2 py-1 text-sm" />
        </div>
      </div>
      <div>
        <div className="text-sm mb-1">Fonte padrão</div>
        <select value={font} onChange={(e) => onChange({ font: e.target.value })} className="w-full bg-input border border-border rounded-md px-2 py-1 text-sm">
          <option>Arial, Helvetica, sans-serif</option>
          <option>Tahoma, Geneva, sans-serif</option>
          <option>Verdana, Geneva, sans-serif</option>
        </select>
      </div>
      <div>
        <div className="text-sm mb-1">Cor do link</div>
        <input type="color" value={linkColor} onChange={(e) => onChange({ linkColor: e.target.value })} className="w-full h-8" />
      </div>
      <div>
        <div className="text-sm mb-1">Pré-cabeçalho</div>
        <input value={preheader} onChange={(e) => onChange({ preheader: e.target.value })} placeholder="Digite o pré-cabeçalho" className="w-full bg-input border border-border rounded-md px-2 py-1 text-sm" />
      </div>
    </div>
  )
}



