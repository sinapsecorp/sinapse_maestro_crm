import { useEffect, useMemo, useRef, useState } from 'react'
import RichEmailEditor from './RichEmailEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCampaignWizard } from '@/hooks/useCampaignWizard'
import api from '@/services/api'
import { useNavigate } from 'react-router-dom'
import { okeEditableTemplate } from './emailTemplates'

export default function CampaignWizardChannel() {
  const navigate = useNavigate()
  const { form, channels, currentIndex, setCurrentIndex, setChannelTemplate, reset } = useCampaignWizard()

  const channel = channels[currentIndex]
  const current = useMemo(() => {
    const found = (form.templates || []).find((t) => t.channel_id === channel?.id)
    return found || { channel_id: channel?.id, subject: form.subject, content: '' }
  }, [form.templates, channel, form.subject])
  const isRich = /whatsapp|e-mail|email|sms/i.test((channel?.name || ''))
  const isEmail = /e-mail|email/i.test((channel?.name || ''))
  const editorRef = useRef(null)

  // Sem alternância Visual/HTML: sempre renderiza editor visual

  const prev = () => setCurrentIndex(Math.max(0, currentIndex - 1))
  const next = () => setCurrentIndex(Math.min(channels.length - 1, currentIndex + 1))

  const isLast = currentIndex >= channels.length - 1

  const saveAndNext = async () => {
    if (!isLast) {
      next()
      return
    }
    // Salvar ou atualizar campanha ao final
    const payload = { ...form }
    payload.templates = (form.templates || [])
    try {
      if (useCampaignWizard.getState().mode === 'edit' && useCampaignWizard.getState().campaignId) {
        await api.put(`/api/campaigns/${useCampaignWizard.getState().campaignId}`, payload)
      } else {
        await api.post('/api/campaigns/', payload)
      }
      // sucesso: somente agora resetar e voltar
      reset()
      navigate('/campaigns')
    } catch (e) {
      // falha: não sair do wizard; exibir alerta simples
      if (typeof window !== 'undefined') {
        const msg = e?.response?.data?.detail || 'Falha ao salvar campanha'
        window.alert(msg)
      }
    }
  }

  // Importante: não fazer early-return antes dos hooks acima para não quebrar a ordem de hooks

  // Conteúdo inicial permanece em branco; sem auto-template

  // Setar conteúdo inicial do editor rich (não e-mail) quando o canal muda
  useEffect(() => {
    if (isRich && !isEmail && editorRef.current) {
      // Usa o conteúdo salvo do current (template por canal) ou, se vazio, tenta body da campanha
      const html = current.content || form.body || ''
      editorRef.current.innerHTML = html
      // posiciona o caret ao final
      const range = document.createRange()
      range.selectNodeContents(editorRef.current)
      range.collapse(false)
      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel?.id, isRich, isEmail, current.content, form.body])

  // Removido modo HTML e alternadores

  const handlePaste = async (e) => {
    if (!isRich) return
    const items = e.clipboardData?.items || []
    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile()
        if (file) {
          e.preventDefault()
          await uploadAndInsertImage(file)
        }
      }
    }
  }

  const handleDrop = async (e) => {
    if (!isRich) return
    e.preventDefault()
    const files = e.dataTransfer?.files
    if (!files || !files.length) return
    for (const file of files) {
      await uploadAndInsertImage(file)
    }
  }

  const uploadAndInsertImage = async (file) => {
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('http://localhost:8000/api/uploads', { method: 'POST', body: form })
      if (!res.ok) return
      const data = await res.json()
      const url = data.url
      const imgHtml = `<img src="${url}" alt="Logo" style="width:100%;max-width:100%;height:auto;display:block;border-radius:8px;" />`
      // Inserir em slot se existir; preferência: logo, depois image; senão, ao início
      const hasLogo = (current.content || '').includes('data-slot="logo"')
      const hasImage = (current.content || '').includes('data-slot="image"')
      if (hasLogo) {
        const next = (current.content || '').replace(
          /<div[^>]*data-slot="logo"[^>]*>\s*<\/div>/i,
          `<div data-slot="logo" style="width:100%;text-align:center;">${imgHtml}</div>`
        )
        setChannelTemplate(channel.id, { content: next })
        if (editorRef.current) {
          editorRef.current.innerHTML = next
        }
      } else if (hasImage) {
        const next = (current.content || '').replace(
          /<div[^>]*data-slot="image"[^>]*>\s*<\/div>/i,
          `<div data-slot="image" style="text-align:center;margin:0 0 16px 0;">${imgHtml}</div>`
        )
        setChannelTemplate(channel.id, { content: next })
        if (editorRef.current) {
          editorRef.current.innerHTML = next
        }
      } else {
        // Sem slots: insere no topo
        const next = imgHtml + (current.content || '')
        setChannelTemplate(channel.id, { content: next })
        if (editorRef.current) {
          editorRef.current.innerHTML = next
        }
      }
    } catch (_) {}
  }

  // Removido fluxo de anexos de documentos

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Configurar: {channel?.name || 'Canal'}</h2>
        <div className="flex gap-2">
          <Button type="button" variant="outline" disabled={currentIndex <= 0} onClick={prev}>Anterior</Button>
          <Button type="button" onClick={saveAndNext}>{isLast ? 'Salvar' : 'Próximo'}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Assunto ({channel?.name || 'Canal'})</Label>
          <Input value={current.subject} onChange={(e) => setChannelTemplate(channel.id, { subject: e.target.value })} placeholder={form.subject} />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label>Conteúdo ({channel?.name || 'Canal'})</Label>
          {isEmail && (
            <div className="flex gap-2">
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setChannelTemplate(channel.id, { content: okeEditableTemplate({ primaryColor: '#0a78ff', contentBg: '#ffffff' }) })}>
                  Inserir modelo OKE
                </Button>
              </div>
            </div>
          )}
        </div>
        {isEmail ? (
          <div className="w-full border border-border rounded-md overflow-hidden">
            <RichEmailEditor
              value={(current.content || '')}
              onChange={(html) => setChannelTemplate(channel.id, { content: html })}
            />
          </div>
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="w-full min-h-[16rem] bg-input border border-border rounded-md p-2 max-w-none force-ltr"
            onInput={(e) => setChannelTemplate(channel.id, { content: e.currentTarget.innerHTML })}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          />
        )}
      </div>
    </div>
  )
}


