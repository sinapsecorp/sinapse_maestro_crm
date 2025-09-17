import { useEffect, useState } from 'react'

export default function TemplateEditorConfigPanel({ editor }) {
  const [width, setWidth] = useState(600)
  const [align, setAlign] = useState('center')
  const [bg, setBg] = useState('#ffffff')
  const [contentBg, setContentBg] = useState('transparent')
  const [font, setFont] = useState('Arial, Helvetica, sans-serif')
  const [linkColor, setLinkColor] = useState('#0068a5')
  const [preheader, setPreheader] = useState('')

  useEffect(() => {
    if (!editor) return
    const canvas = editor.Canvas.getDocument().body
    canvas.style.background = bg
    canvas.style.fontFamily = font
    const wrap = editor.getWrapper()
    wrap.addStyle({ maxWidth: `${width}px`, margin: align === 'left' ? '0 auto 0 0' : '0 auto' })
  }, [editor, width, align, bg, font])

  useEffect(() => {
    if (!editor) return
    const style = document.createElement('style')
    style.innerHTML = `a{color:${linkColor}}`
    editor.Canvas.getDocument().head.appendChild(style)
  }, [editor, linkColor])

  return (
    <div className="space-y-3">
      <div>
        <div className="text-sm font-medium mb-1">Largura (px)</div>
        <input type="number" min={320} max={960} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full bg-input border border-border rounded-md px-2 py-1 text-sm" />
      </div>
      <div>
        <div className="text-sm font-medium mb-1">Alinhamento</div>
        <select value={align} onChange={(e) => setAlign(e.target.value)} className="w-full bg-input border border-border rounded-md px-2 py-1 text-sm">
          <option value="left">Esquerda</option>
          <option value="center">Centro</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-sm mb-1">Fundo do e-mail</div>
          <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-full h-8" />
        </div>
        <div>
          <div className="text-sm mb-1">Fundo da área</div>
          <input type="text" value={contentBg} onChange={(e) => setContentBg(e.target.value)} className="w-full bg-input border border-border rounded-md px-2 py-1 text-sm" />
        </div>
      </div>
      <div>
        <div className="text-sm mb-1">Fonte padrão</div>
        <select value={font} onChange={(e) => setFont(e.target.value)} className="w-full bg-input border border-border rounded-md px-2 py-1 text-sm">
          <option>Arial, Helvetica, sans-serif</option>
          <option>Tahoma, Geneva, sans-serif</option>
          <option>Verdana, Geneva, sans-serif</option>
        </select>
      </div>
      <div>
        <div className="text-sm mb-1">Cor do link</div>
        <input type="color" value={linkColor} onChange={(e) => setLinkColor(e.target.value)} className="w-full h-8" />
      </div>
      <div>
        <div className="text-sm mb-1">Preheader</div>
        <input value={preheader} onChange={(e) => setPreheader(e.target.value)} placeholder="Digite o preheader" className="w-full bg-input border border-border rounded-md px-2 py-1 text-sm" />
      </div>
    </div>
  )
}


