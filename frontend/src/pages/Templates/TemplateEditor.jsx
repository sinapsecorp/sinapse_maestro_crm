import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import grapesjs from 'grapesjs'
import 'grapesjs/dist/css/grapes.min.css'
import api from '@/services/api'
import { Button } from '@/components/ui/button'
import TemplateGallery from './TemplateGallery'
import { presetTemplates } from './presetTemplates'
import TemplateEditorConfigPanel from './TemplateEditorConfigPanel'

// Util: converte HTML puro do GrapesJS para um wrapper de e-mail seguro
function wrapEmail(html) {
  const doc = `<!doctype html><html><head><meta charset="UTF-8"></head><body>${html}</body></html>`
  return doc
}

export default function TemplateEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editorRef = useRef(null)
  const containerRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [subject, setSubject] = useState('')
  const [initialHtml, setInitialHtml] = useState('')
  const [showGallery, setShowGallery] = useState(!id)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Inicializa editor apenas uma vez
  useEffect(() => {
    if (editorRef.current || !containerRef.current) return

    const e = grapesjs.init({
      container: containerRef.current,
      height: '80vh',
      fromElement: false,
      storageManager: false,
      canvas: { styles: [] },
      selectorManager: { componentFirst: true },
      blockManager: { appendTo: '#blocks-panel' },
      styleManager: { appendTo: '#styles-panel' },
      layerManager: { appendTo: '#layers-panel' },
      traitManager: { appendTo: '#traits-panel' },
      deviceManager: { devices: [{ name: 'Desktop', width: '' }, { name: 'Mobile', width: '320px' }] },
    })

    // Blocos principais (Conteúdo)
    const bm = e.BlockManager
    bm.add('title', { label: 'Título', category: 'Conteúdo', content: '<h1 style="margin:0 0 8px">Título</h1>' })
    bm.add('paragraph', { label: 'Parágrafo', category: 'Conteúdo', content: '<p style="margin:0 0 12px">Escreva um parágrafo.</p>' })
    bm.add('list', { label: 'Lista', category: 'Conteúdo', content: '<ul><li>Item</li><li>Item</li></ul>' })
    bm.add('image', { label: 'Imagem', category: 'Mídia', content: { type: 'image', attributes: { alt: 'Imagem' }, style: { width: '100%' } } })
    bm.add('video', { label: 'Vídeo', category: 'Mídia', content: '<div style="text-align:center"><a href="#">Link para vídeo</a></div>' })
    bm.add('button', { label: 'Botão', category: 'Interativos', content: '<a href="#" style="display:inline-block;background:#0a78ff;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none">Call to Action</a>' })
    bm.add('social', { label: 'Redes Sociais', category: 'Interativos', content: '<p>Redes: <a href="#">Facebook</a> · <a href="#">Instagram</a></p>' })
    bm.add('divider', { label: 'Divisor', category: 'Estrutura', content: '<hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>' })
    bm.add('spacer', { label: 'Espaçador', category: 'Estrutura', content: '<div style="height:16px"></div>' })
    bm.add('table', { label: 'Tabela', category: 'Estrutura', content: '<table style="width:100%;border-collapse:collapse"><tr><td>Col A</td><td>Col B</td></tr></table>' })
    bm.add('menu', { label: 'Menu', category: 'Estrutura', content: '<p><a href="#">Home</a> · <a href="#">Produtos</a> · <a href="#">Contato</a></p>' })
    bm.add('html', { label: 'HTML', category: 'Avançado', content: '<div data-gjs-type="text">Cole seu HTML</div>' })
    bm.add('icons', { label: 'Ícones', category: 'Avançado', content: '<p>⭐ ⭐ ⭐</p>' })
    bm.add('consent', { label: 'Consentimento', category: 'Avançado', content: '<p style="font-size:12px;color:#666">Caso não queira mais receber estes e-mails, <a href="#">cancele sua inscrição</a>.</p>' })

    // Rows/Colunas rápidas
    bm.add('row1', { label: '1 coluna', category: 'Linhas', content: '<div class="row"><div class="col" style="width:100%"></div></div>' })
    bm.add('row2', { label: '2 colunas', category: 'Linhas', content: '<div class="row" style="display:flex;gap:12px"><div class="col" style="flex:1"></div><div class="col" style="flex:1"></div></div>' })
    bm.add('row3', { label: '3 colunas', category: 'Linhas', content: '<div class="row" style="display:flex;gap:12px"><div class="col" style="flex:1"></div><div class="col" style="flex:1"></div><div class="col" style="flex:1"></div></div>' })

    // Configurações globais simplificadas via comandos customizados
    e.on('load', () => {
      if (initialHtml) e.setComponents(initialHtml)
    })

    editorRef.current = e
  }, [initialHtml])

  // Carregar template quando id presente
  useEffect(() => {
    if (!id) return
    ;(async () => {
      setLoading(true)
      try {
        const res = await api.get(`/api/templates/${id}`)
        setSubject(res.data?.subject || '')
        setInitialHtml(res.data?.content || '')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const handleSave = async () => {
    setError('')
    setSuccess('')
    const current = editorRef.current
    const html = wrapEmail(current?.getHtml() || '')
    const payload = { subject: (subject || '').trim() || 'Sem assunto', content: html }

    // Valida assunto
    if (!(subject || '').trim()) {
      setError('Preencha o assunto antes de salvar.')
      return
    }

    setLoading(true)
    try {
      if (id) {
        await api.put(`/api/templates/${id}`, payload)
        setSuccess('Template atualizado com sucesso.')
      } else {
        const res = await api.post('/api/templates/', payload)
        setSuccess('Template salvo com sucesso.')
        // após criar, ir para edição (mantém na mesma página com id)
        navigate(`/templates/${res.data?.id || ''}/edit`, { replace: true })
      }
    } catch (e) {
      const msg = e?.response?.data?.detail || 'Falha ao salvar o template.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const startFrom = (key) => {
    setShowGallery(false)
    let html = ''
    if (presetTemplates[key]) html = presetTemplates[key]()
    setInitialHtml(html)
    // força re-render do editor se já montado
    const e = editorRef.current
    if (e) e.setComponents(html)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 flex gap-2 items-center">
          <input
            className="w-full max-w-xl bg-input border border-border rounded-md px-3 py-2 text-sm"
            placeholder="Assunto do e-mail"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/templates')}>Voltar</Button>
          {id && (
            <Button
              variant="destructive"
              onClick={async () => {
                const ok = window.confirm('Excluir este template? Esta ação não pode ser desfeita.')
                if (!ok) return
                setLoading(true)
                setError('')
                setSuccess('')
                try {
                  await api.delete(`/api/templates/${id}`)
                  navigate('/templates', { replace: true })
                } catch (e) {
                  const msg = e?.response?.data?.detail || 'Falha ao excluir o template.'
                  setError(msg)
                } finally {
                  setLoading(false)
                }
              }}
              disabled={loading}
            >{loading ? 'Excluindo...' : 'Excluir'}</Button>
          )}
          <Button onClick={handleSave} disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </div>

      {(error || success) && (
        <div className={`text-sm ${error ? 'text-red-600' : 'text-green-600'}`}>{error || success}</div>
      )}

      {showGallery ? (
        <TemplateGallery onSelect={startFrom} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] gap-4">
          <div id="blocks-panel" className="border border-border rounded-md bg-card p-2 overflow-auto" />
          <div className="border border-border rounded-md overflow-hidden">
            <div ref={containerRef} />
          </div>
          <div className="space-y-3">
            <div id="layers-panel" className="border border-border rounded-md bg-card p-2 overflow-auto" />
            <div id="styles-panel" className="border border-border rounded-md bg-card p-2 overflow-auto" />
            <div id="traits-panel" className="border border-border rounded-md bg-card p-2 overflow-auto" />
            <div className="border border-border rounded-md bg-card p-3">
              <div className="text-sm font-medium mb-2">Configurações</div>
              <TemplateEditorConfigPanel editor={editorRef.current} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


