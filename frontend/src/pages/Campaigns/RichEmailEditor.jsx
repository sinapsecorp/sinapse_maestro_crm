import { useRef } from 'react'
import { Editor } from '@tinymce/tinymce-react'
// Self-host TinyMCE (evita uso do CDN e a exigência de API key)
import 'tinymce/tinymce'
import 'tinymce/icons/default'
import 'tinymce/themes/silver'
import 'tinymce/models/dom'
// Plugins usados
import 'tinymce/plugins/link'
import 'tinymce/plugins/image'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/table'
import 'tinymce/plugins/code'
import 'tinymce/plugins/autoresize'
// Skins (UI e conteúdo) para evitar carregamento via CDN e remover opacidade 0
import 'tinymce/skins/ui/oxide/skin.min.css'
import 'tinymce/skins/content/default/content.min.css'

export default function RichEmailEditor({ value, onChange }) {
  const editorRef = useRef(null)

  const handleInit = () => {}

  return (
    <Editor
      onInit={(evt, editor) => { editorRef.current = editor; handleInit() }}
      value={value || ''}
      onEditorChange={(content) => onChange && onChange(content)}
      init={{
        license_key: 'gpl',
        promotion: false,
        skin: false,
        content_css: false,
        menubar: false,
        statusbar: false,
        branding: false,
        height: 420,
        plugins: 'link image lists table code autoresize',
        toolbar: 'undo redo | blocks | bold italic underline forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image attachment table | removeformat | code',
        placeholder: 'Digite seu conteúdo aqui... Cole/arraste imagens ou use o botão de imagem.',
        content_style: 'body{background:#fff;color:#111;font-family:Arial,Helvetica,sans-serif;padding:8px;min-height:380px;} img{max-width:100%;height:auto;display:block;}',
        images_upload_handler: async (blobInfo) => {
          try {
            const form = new FormData()
            form.append('file', blobInfo.blob(), blobInfo.filename())
            const res = await fetch('http://localhost:8000/api/uploads', { method: 'POST', body: form, mode: 'cors' })
            const data = await res.json()
            if (!res.ok || !data?.url) throw new Error('upload failed')
            // Garante URL absoluta
            return data.url
          } catch (e) {
            return Promise.reject('Falha ao enviar imagem')
          }
        },
        // Evita usar HEAD para medir dimensões (pode falhar com CORS/StaticFiles)
        images_reuse_filename: true,
        automatic_uploads: true,
        convert_urls: false,
        image_dimensions: true,
        image_description: false,
        setup: (editor) => {
          // noop
        }
      }}
    />
  )
}
