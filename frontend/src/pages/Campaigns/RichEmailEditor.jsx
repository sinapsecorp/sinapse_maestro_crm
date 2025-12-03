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
        menubar: 'edit view format table',
        statusbar: false,
        branding: false,
        height: 420,
        plugins: 'link image lists table code autoresize',
        toolbar: 'undo redo | blocks | bold italic underline forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image table | removeformat | code',
        placeholder: 'Digite seu conteúdo aqui... Cole/arraste imagens ou use o botão de imagem.',
        // Estilos mínimos para não forçar padding nem largura total de tabelas
        content_style: 'body{background:#fff;color:#111;font-family:Arial,Helvetica,sans-serif;min-height:380px;} img{max-width:100%;height:auto;display:block;} td,th{vertical-align:top;}',
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
        // Preservar estilos inline em links/botões e elementos de tabela
        extended_valid_elements: 'a[*],span[*],div[*],table[*],tbody[*],tr[*],td[*],th[*],img[*],style[*]',
        valid_children: '+body[style],+div[style],+a[style],+table[tbody|tr|td|th],+tr[td|th]',
        valid_styles: {
          '*': 'background,background-color,border,border-radius,color,display,margin,margin-top,margin-right,margin-bottom,margin-left,padding,padding-top,padding-right,padding-bottom,padding-left,text-decoration,text-transform,vertical-align,width,height,max-width,font-weight,text-align,line-height'
        },
        verify_html: false,
        keep_styles: true,
        forced_root_block: false,
        // Preservar atributos importantes para botões
        custom_elements: 'a[style|href|target|class]',
        // Não limpar estilos inline
        cleanup: false,
        cleanup_on_startup: false,
        setup: (editor) => {
          // Preservar estilos de botões ao colar/editar
          editor.on('BeforeSetContent', (e) => {
            // Garante que links com estilos de botão mantenham seus estilos
            if (e.content) {
              e.content = e.content.replace(
                /<a([^>]*style="[^"]*background[^"]*"[^>]*)>/gi,
                (match, attrs) => {
                  // Adiciona atributos para preservar o estilo de botão
                  if (!attrs.includes('data-button="true"')) {
                    return match.replace('>', ' data-button="true">');
                  }
                  return match;
                }
              );
            }
          });
          
          // Preservar estilos ao salvar
          editor.on('GetContent', (e) => {
            if (e.content) {
              // Remove atributos temporários
              e.content = e.content.replace(/ data-button="true"/gi, '');
            }
          });
        }
      }}
    />
  )
}
