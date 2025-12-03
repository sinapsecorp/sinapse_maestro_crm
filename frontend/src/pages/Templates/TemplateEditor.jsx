import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Editor } from '@tinymce/tinymce-react'
import api from '@/services/api'
import { Button } from '@/components/ui/button'
import TemplateGallery from './TemplateGallery'
import { presetTemplates } from './presetTemplates'
import TemplateEditorConfigPanel from './TemplateEditorConfigPanel'

// Util: converte HTML do TINYMCE para um wrapper de e-mail seguro
function wrapEmail(html, config = {}) {
  const width = config.width || 600
  const contentBg = config.contentBg || '#ffffff'
  const font = config.font || 'Arial, Helvetica, sans-serif'
  const linkColor = config.linkColor || '#0068a5'

  const emailWrapper = `<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0; padding: 20px 0; font-family: ${font}; background: #f5f5f5; }
    .email-container { max-width: ${width}px; margin: 0 auto; background: ${contentBg}; }
    .email-content { padding: 20px; }
    a { color: ${linkColor}; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; margin: 0 !important; }
      .email-content { padding: 15px !important; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-content">
      ${html}
    </div>
  </div>
</body>
</html>`

  return emailWrapper
}

// Util: extrai apenas o conteúdo do <body> de um HTML completo
function extractBody(html) {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html || '', 'text/html')
    const body = doc?.body?.innerHTML
    if (typeof body === 'string' && body.length > 0) return body
    return html || ''
  } catch (_) {
    return html || ''
  }
}

// Util: extrai configurações do HTML salvo
function extractConfig(html) {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const meta = doc.querySelector('meta[name="tpl-config"]')
    if (meta?.getAttribute('content')) {
      const c = meta.getAttribute('content')
      let parsed = null
      try {
        parsed = JSON.parse(c)
      } catch (_) {
        try {
          parsed = JSON.parse(decodeURIComponent(escape(atob(c))))
        } catch (__) {
          parsed = null
        }
      }
      if (parsed && typeof parsed === 'object') {
        return parsed
      }
    }
  } catch (_) {}
  return {}
}

export default function TemplateEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [showGallery, setShowGallery] = useState(!id)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [config, setConfig] = useState({
    width: 600,
    bg: '#ffffff',
    contentBg: '#ffffff',
    font: 'Arial, Helvetica, sans-serif',
    linkColor: '#0068a5',
    preheader: ''
  })

  // Carregar template quando id presente
  useEffect(() => {
    if (!id) return
    ;(async () => {
      setLoading(true)
      try {
        const res = await api.get(`/api/templates/${id}`)
        setSubject(res.data?.subject || '')
        const raw = res.data?.content || ''
        const extractedConfig = extractConfig(raw)
        if (extractedConfig && Object.keys(extractedConfig).length > 0) {
          setConfig((prev) => ({ ...prev, ...extractedConfig }))
        } else if (res.data?.editor_config) {
          setConfig((prev) => ({ ...prev, ...(res.data.editor_config || {}) }))
        }
        setContent(extractBody(raw))
      } catch (e) {
        setError('Falha ao carregar template.')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  // Configuração do TINYMCE para email marketing
  const getTinyMCEConfig = () => {
    return {
      height: 600,
      menubar: false,
      plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
        'insertdatetime', 'media', 'table', 'help', 'wordcount'
      ],
      toolbar: 'undo redo | blocks | ' +
        'bold italic underline strikethrough | alignleft aligncenter ' +
        'alignright alignjustify | bullist numlist outdent indent | ' +
        'removeformat | forecolor backcolor | link image media | ' +
        'table | code fullscreen',
      toolbar_mode: 'sliding',
      content_css: false,
      body_class: 'email-content',
      content_style: `
        body.email-content {
          font-family: ${config.font};
          font-size: 14px;
          line-height: 1.6;
          color: #333333;
          max-width: ${config.width}px;
          margin: 0 auto;
          padding: 20px;
          background: ${config.contentBg};
        }
        body.email-content a { color: ${config.linkColor}; }
      `,
      font_family_formats: 'Arial=arial,helvetica,sans-serif; Tahoma=tahoma,arial,helvetica,sans-serif; Verdana=verdana,geneva,sans-serif; Georgia=georgia,times new roman,times,serif',
      fontsize_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt',
      link_context_toolbar: true,
      image_advtab: true,
      image_title: true,
      automatic_uploads: false,
      setup: (editor) => {
        editor.on('change', () => {
          setContent(editor.getContent())
        })
      }
    }
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')

    if (!(subject || '').trim()) {
      setError('Preencha o assunto antes de salvar.')
      return
    }

    const cfg = { ...config }
    // Serializa config de forma segura (base64) para evitar quebrar HTML
    let cfgB64 = ''
    try {
      cfgB64 = btoa(unescape(encodeURIComponent(JSON.stringify(cfg))))
    } catch (_) {
      cfgB64 = ''
    }
    const cfgMeta = `<meta name=\"tpl-config\" content='${cfgB64}'>`
    const editorMeta = `<meta name=\"tpl-editor\" content=\"tinymce\">`

    // Envolve o conteúdo do TINYMCE com wrapper de email seguro
    const wrappedContent = wrapEmail(content, cfg)
    const html = `<!doctype html><html><head><meta charset=\"UTF-8\">${editorMeta}${cfgMeta}</head><body>${wrappedContent}</body></html>`
    const payload = { subject: (subject || '').trim() || 'Sem assunto', content: html, editor_config: cfg }

    setLoading(true)
    try {
      if (id) {
        await api.put(`/api/templates/${id}`, payload)
        setSuccess('Template atualizado com sucesso.')
      } else {
        const res = await api.post('/api/templates/', payload)
        setSuccess('Template salvo com sucesso.')
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
    setContent(html)
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
        <div className="space-y-4">
          <div className="border border-border rounded-md overflow-hidden bg-white">
            <Editor
              apiKey="15pnntnp7hwu94l19im2zob4n5mko7abmn0kosz2197shhry"
              value={content}
              onEditorChange={(newContent) => setContent(newContent)}
              init={getTinyMCEConfig()}
              onInit={(evt, editor) => {
                console.log('TINYMCE initialized successfully');
                console.log('Editor:', editor);
              }}
              onLoadContent={(e) => {
                console.log('TINYMCE content loaded');
              }}
            />
          </div>
          <div className="border border-border rounded-md bg-card p-3">
            <div className="text-sm font-medium mb-2">Configurações</div>
            <TemplateEditorConfigPanel config={config} onChange={(patch) => setConfig((prev) => ({ ...prev, ...patch }))} />
          </div>
        </div>
      )}
    </div>
  )
}
