import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/services/api'

export default function CredentialsPage() {
  const [accounts, setAccounts] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selected, setSelected] = useState(null)

  const [smtp, setSmtp] = useState({ host: '', port: '465', encryption: 'ssl', username: '', password: '', from_name: '', from_address: '', reply_to: '' })
  const [sms, setSms] = useState({ api_key: '', client_id: '', secret: '', provider: '' })
  const [wapp, setWapp] = useState({ api_key: '', client_id: '', secret: '', provider: '' })

  const fetchAccounts = async () => {
    const res = await api.get('/api/marketing/accounts')
    const list = res.data || []
    setAccounts(list)
    if (!selected && list.length) {
      setSelected(list[0].id)
    }
  }

  useEffect(() => { fetchAccounts() }, [])

  // Carregar credenciais existentes (sem segredos) quando selecionar uma conta
  useEffect(() => {
    if (!selected) return
    ;(async () => {
      try {
        const r = await api.get(`/api/marketing/accounts/${selected}/credentials`)
        const data = r.data || {}
        const s = data.smtp || {}
        setSmtp((prev) => ({
          ...prev,
          host: s.host || '',
          port: s.port || '465',
          encryption: s.encryption || 'ssl',
          from_name: s.from_name || '',
          from_address: s.from_address || '',
          reply_to: s.reply_to || '',
          // nunca preenche usuário/senha salvos por segurança
          username: '',
          password: '',
        }))
        const sm = data.sms || {}
        setSms((prev) => ({
          ...prev,
          provider: sm.provider || '',
          api_key: '',
          client_id: '',
          secret: '',
        }))
        const w = data.whatsapp || {}
        setWapp((prev) => ({
          ...prev,
          provider: w.provider || '',
          api_key: '',
          client_id: '',
          secret: '',
        }))
      } catch (_) {
        // ignore
      }
    })()
  }, [selected])

  const createAccount = async () => {
    await api.post('/api/marketing/accounts', { name, description })
    setName(''); setDescription('')
    fetchAccounts()
  }

  const removeAccount = async (id) => {
    await api.delete(`/api/marketing/accounts/${id}`)
    if (selected === id) setSelected(null)
    fetchAccounts()
  }

  const saveSmtp = async () => {
    if (!selected) return
    await api.put(`/api/marketing/accounts/${selected}/credentials/smtp`, smtp)
    alert('SMTP salvo')
  }
  const saveSms = async () => {
    if (!selected) return
    await api.put(`/api/marketing/accounts/${selected}/credentials/sms`, sms)
    alert('SMS salvo')
  }
  const saveWapp = async () => {
    if (!selected) return
    await api.put(`/api/marketing/accounts/${selected}/credentials/whatsapp`, wapp)
    alert('WhatsApp salvo')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Contas de Marketing</CardTitle>
          <CardDescription>Crie contas e configure credenciais por canal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Input placeholder="Nome da conta" value={name} onChange={(e)=>setName(e.target.value)} />
            <Input placeholder="Descrição (opcional)" value={description} onChange={(e)=>setDescription(e.target.value)} />
            <Button onClick={createAccount} disabled={!name}>Adicionar</Button>
          </div>
          <ul className="divide-y divide-border">
            {accounts.map(a => (
              <li key={a.id} onClick={()=>setSelected(a.id)} className={`py-3 flex items-center justify-between cursor-pointer ${selected === a.id ? 'bg-accent/10 px-2 rounded' : ''}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="acc" checked={selected === a.id} onChange={()=>setSelected(a.id)} />
                  <div>
                    <div className="font-medium">{a.name}</div>
                    {a.description && <div className="text-sm text-muted-foreground">{a.description}</div>}
                  </div>
                </div>
                <Button variant="outline" onClick={(e)=>{e.stopPropagation(); removeAccount(a.id)}}>Remover</Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {selected ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Credenciais SMTP (E-mail)</CardTitle>
              <CardDescription>Defina servidor e remetente. Por segurança, usuário e senha não são exibidos quando já salvos.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Input placeholder="Host" value={smtp.host} onChange={(e)=>setSmtp({ ...smtp, host: e.target.value })} />
              <Input placeholder="Porta" value={smtp.port} onChange={(e)=>setSmtp({ ...smtp, port: e.target.value })} />
              <Input placeholder="Criptografia (tls|ssl|empty)" value={smtp.encryption} onChange={(e)=>setSmtp({ ...smtp, encryption: e.target.value })} />
              <Input placeholder="Usuário" value={smtp.username} onChange={(e)=>setSmtp({ ...smtp, username: e.target.value })} />
              <Input placeholder="Senha" type="password" value={smtp.password} onChange={(e)=>setSmtp({ ...smtp, password: e.target.value })} />
              <Input placeholder="Nome do remetente" value={smtp.from_name} onChange={(e)=>setSmtp({ ...smtp, from_name: e.target.value })} />
              <Input placeholder="E-mail remetente" value={smtp.from_address} onChange={(e)=>setSmtp({ ...smtp, from_address: e.target.value })} />
              <Input placeholder="Reply-To" value={smtp.reply_to} onChange={(e)=>setSmtp({ ...smtp, reply_to: e.target.value })} />
              <div className="flex justify-end"><Button onClick={saveSmtp} disabled={!smtp.host || !smtp.port}>Salvar SMTP</Button></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Credenciais SMS</CardTitle>
              <CardDescription>Defina as chaves do provedor. Valores sensíveis não são exibidos quando já salvos.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Input placeholder="API_KEY" value={sms.api_key} onChange={(e)=>setSms({ ...sms, api_key: e.target.value })} />
              <Input placeholder="client_id" value={sms.client_id} onChange={(e)=>setSms({ ...sms, client_id: e.target.value })} />
              <Input placeholder="secret" type="password" value={sms.secret} onChange={(e)=>setSms({ ...sms, secret: e.target.value })} />
              <Input placeholder="Provedor (opcional)" value={sms.provider} onChange={(e)=>setSms({ ...sms, provider: e.target.value })} />
              <div className="flex justify-end"><Button onClick={saveSms}>Salvar SMS</Button></div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Credenciais WhatsApp</CardTitle>
              <CardDescription>Defina as chaves do provedor. Valores sensíveis não são exibidos quando já salvos.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <Input placeholder="API_KEY" value={wapp.api_key} onChange={(e)=>setWapp({ ...wapp, api_key: e.target.value })} />
              <Input placeholder="client_id" value={wapp.client_id} onChange={(e)=>setWapp({ ...wapp, client_id: e.target.value })} />
              <Input placeholder="secret" type="password" value={wapp.secret} onChange={(e)=>setWapp({ ...wapp, secret: e.target.value })} />
              <Input placeholder="Provedor (opcional)" value={wapp.provider} onChange={(e)=>setWapp({ ...wapp, provider: e.target.value })} />
              <div className="md:col-span-2 flex justify-end"><Button onClick={saveWapp}>Salvar WhatsApp</Button></div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent>
            <div className="text-sm text-muted-foreground">Selecione uma conta para configurar as credenciais.</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


