import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
 
// Editor simples baseado em contenteditable. Para algo mais robusto, podemos trocar por TipTap/Quill futuramente.

export default function CampaignForm({ onSaved }) {
  const [form, setForm] = useState({ title: '', subject: '', channel_ids: [], area_ids: [], template: { subject: '', content: '' }, templates: [] });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [channels, setChannels] = useState([]);
  const [areas, setAreas] = useState([]);
  const [step, setStep] = useState(1);
  const [channelEditIndex, setChannelEditIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [ch, ar] = await Promise.all([
          api.get('/api/channels/'),
          api.get('/api/areas-of-expertise/')
        ]);
        setChannels(ch.data || []);
        setAreas(ar.data || []);
      } catch (e) {
        // fallback: mantém arrays vazios e mostra aviso
      }
    })();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const selectedChannels = useMemo(() => {
    return channels.filter((c) => form.channel_ids.includes(c.id));
  }, [channels, form.channel_ids]);

  // Garantir que sempre exista um template para o canal atual quando estiver na etapa 2
  useEffect(() => {
    if (step !== 2) return;
    if (!selectedChannels.length) return;
    // Corrigir índice fora do intervalo
    if (channelEditIndex > selectedChannels.length - 1) {
      setChannelEditIndex(selectedChannels.length - 1);
      return;
    }
    const ch = selectedChannels[channelEditIndex];
    if (!ch) return;
    setForm((f) => {
      const exists = (f.templates || []).some((t) => t.channel_id === ch.id);
      if (exists) return f;
      return { ...f, templates: [...(f.templates || []), { channel_id: ch.id, subject: f.subject, content: '' }] };
    });
  }, [step, selectedChannels, channelEditIndex]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (!form.channel_ids.length) {
        setMessage('Selecione pelo menos um canal.');
        return;
      }
      const payload = { ...form };
      payload.template = {
        subject: form.template.subject || form.subject,
        content: form.template.content || '',
      };
      payload.templates = (form.templates || [])
        .filter((t) => t.channel_id)
        .map((t) => ({
          channel_id: t.channel_id,
          subject: t.subject || form.subject,
          content: t.content || '',
        }));
      await api.post('/api/campaigns/', payload);
      setMessage('Campanha criada.');
      onSaved && onSaved();
    } catch (err) {
      const detail = err?.response?.data?.detail || err?.message || 'Falha ao salvar.';
      setMessage(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {step === 1 && (
        <>
          <div>
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={form.title} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="subject">Assunto</Label>
            <Input id="subject" value={form.subject} onChange={handleChange} required />
          </div>
          <div>
            <Label>Canais</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {!channels.length && (
                <div className="text-sm text-muted-foreground">Nenhum canal disponível. Verifique a conexão com a API.</div>
              )}
              {channels.map((c) => {
                const checked = form.channel_ids.includes(c.id);
                return (
                  <label key={c.id} className={`px-3 py-1 rounded border cursor-pointer ${checked ? 'bg-primary/10 border-primary' : 'border-border'}`}>
                    <input type="checkbox" className="mr-2" checked={checked} onChange={(e) => {
                      setForm((f) => ({ ...f, channel_ids: e.target.checked ? [...f.channel_ids, c.id] : f.channel_ids.filter((x) => x !== c.id) }));
                    }} />
                    {c.name}
                  </label>
                )
              })}
            </div>
          </div>
          <div>
            <Label>Áreas de Atuação</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {!areas.length && (
                <div className="text-sm text-muted-foreground">Nenhuma área encontrada. Cadastre em Configurações &gt; Áreas.</div>
              )}
              {areas.map((a) => {
                const checked = form.area_ids.includes(a.id);
                return (
                  <label key={a.id} className={`px-3 py-1 rounded border cursor-pointer ${checked ? 'bg-primary/10 border-primary' : 'border-border'}`}>
                    <input type="checkbox" className="mr-2" checked={checked} onChange={(e) => {
                      setForm((f) => ({ ...f, area_ids: e.target.checked ? [...f.area_ids, a.id] : f.area_ids.filter((x) => x !== a.id) }));
                    }} />
                    {a.name}
                  </label>
                )
              })}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            {message && <p className="text-sm text-muted-foreground mr-auto">{message}</p>}
            <Button type="button" onClick={() => setStep(2)} disabled={!form.title || !form.subject || !form.channel_ids.length}>Avançar</Button>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          {/* Editor para E-mail/WhatsApp (template geral) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="template.subject">Assunto para E-mail/Whatsapp</Label>
              <Input id="template.subject" value={form.template.subject} onChange={(e) => setForm({ ...form, template: { ...form.template, subject: e.target.value } })} placeholder={form.subject} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label>Conteúdo (rich)</Label>
            </div>
            <div
              contentEditable
              className="w-full min-h-[16rem] bg-input border border-border rounded-md p-2 prose max-w-none"
              onInput={(e) => setForm({ ...form, template: { ...form.template, content: e.currentTarget.innerHTML } })}
              dangerouslySetInnerHTML={{ __html: form.template.content }}
            />
            <p className="text-xs text-muted-foreground mt-1">Suporta links, emojis e imagens (cole/arraste).</p>
          </div>

          {/* Passo sequencial por canal quando houver 2+ canais */}
          {selectedChannels.length > 1 && (
            <div className="mt-6 rounded-md border border-border p-3">
              <div className="flex items-center justify-between mb-3">
                <Label>Conteúdo por canal</Label>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" disabled={channelEditIndex <= 0} onClick={() => setChannelEditIndex((i) => Math.max(0, i - 1))}>Anterior</Button>
                  <Button type="button" variant="outline" disabled={channelEditIndex >= selectedChannels.length - 1} onClick={() => setChannelEditIndex((i) => Math.min(selectedChannels.length - 1, i + 1))}>Próximo</Button>
                </div>
              </div>
              {(() => {
                const ch = selectedChannels[channelEditIndex];
                if (!ch) return null;
                const current = (form.templates || []).find((t) => t.channel_id === ch.id) || { channel_id: ch.id, subject: form.subject, content: '' };
                const setCurrent = (next) => {
                  setForm((f) => ({
                    ...f,
                    templates: [...(f.templates || []).filter((t) => t.channel_id !== ch.id), { ...current, ...next, channel_id: ch.id }],
                  }));
                };
                const isRich = /whatsapp|e-mail|email/i.test(ch.name || '');
                return (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Assunto ({ch.name})</Label>
                        <Input value={current.subject} onChange={(e) => setCurrent({ subject: e.target.value })} placeholder={form.subject} />
                      </div>
                    </div>
                    <div className="mt-3">
                      <Label>Conteúdo ({ch.name})</Label>
                      {isRich ? (
                        <div
                          contentEditable
                          className="w-full min-h-[12rem] bg-input border border-border rounded-md p-2 prose max-w-none"
                          onInput={(e) => setCurrent({ content: e.currentTarget.innerHTML })}
                          dangerouslySetInnerHTML={{ __html: current.content }}
                        />
                      ) : (
                        <textarea value={current.content} onChange={(e) => setCurrent({ content: e.target.value })} className="w-full h-40 bg-input border border-border rounded-md p-2" />
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          <div className="flex justify-between gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>Voltar</Button>
            <div className="flex items-center gap-3">
              {message && <p className="text-sm text-muted-foreground mr-auto">{message}</p>}
              <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </div>
        </>
      )}
    </form>
  );
}


