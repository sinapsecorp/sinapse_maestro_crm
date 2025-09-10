import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

export default function CampaignForm({ onSaved }) {
  const [form, setForm] = useState({ name: '', subject: '', body: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.post('/campaigns/', form);
      setMessage('Campanha criada.');
      onSaved && onSaved();
    } catch {
      setMessage('Falha ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input id="name" value={form.name} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="subject">Assunto</Label>
        <Input id="subject" value={form.subject} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="body">Corpo</Label>
        <textarea id="body" value={form.body} onChange={handleChange} className="w-full h-40 bg-input border border-border rounded-md p-2" />
      </div>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
    </form>
  );
}


