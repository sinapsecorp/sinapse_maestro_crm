import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

export default function LeadImport({ onImported }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [areas, setAreas] = useState([]);
  const [areaId, setAreaId] = useState('');
  const [job, setJob] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/areas-of-expertise/');
        setAreas(res.data);
      } catch {}
    };
    load();
    // Restaurar job em andamento
    const savedJob = localStorage.getItem('leads_import_job_id');
    if (savedJob) {
      setJob(savedJob);
      startPolling(savedJob);
    }
  }, []);

  const startPolling = (job_id) => {
    const interval = setInterval(async () => {
      try {
        const st = await api.get('/api/leads/import/status', { params: { job_id } });
        const { status, meta } = st.data;
        if (status === 'finished' || status === 'failed' || status === 'stopped') {
          clearInterval(interval);
          localStorage.removeItem('leads_import_job_id');
          setJob(null);
          onImported && onImported();
          setMessage(`Importação ${status}. Inseridos: ${meta.inserted || 0}, Atualizados: ${meta.updated || 0}, Ignorados: ${meta.skipped || 0}`);
        } else if (typeof meta?.progress === 'number') {
          setMessage(`Processando... ${meta.progress}%`);
        } else {
          setMessage('Processando...');
        }
      } catch (e) {
        clearInterval(interval);
      }
    }, 1000);
  }

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setMessage('');
    try {
      const form = new FormData();
      form.append('file', file);
      if (areaId) form.append('area_of_expertise_id', areaId);
      const res = await api.post('/api/leads/import', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { job_id, total } = res.data;
      setMessage(`Arquivo enviado. ${total} linhas enfileiradas.`);
      localStorage.setItem('leads_import_job_id', job_id);
      setJob(job_id);
      startPolling(job_id);
    } catch (e) {
      setMessage('Falha ao enviar CSV.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input type="file" accept=".csv,.xls,.xlsx" onChange={(e) => setFile(e.target.files?.[0])} />
      <select className="bg-input border border-border rounded px-2 py-1" value={areaId} onChange={(e)=>setAreaId(e.target.value)}>
        <option value="">Selecione a área</option>
        {areas.map(a => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </select>
      <Button onClick={handleUpload} disabled={!file || !areaId || loading}>Enviar</Button>
      {message && <span className="text-sm text-muted-foreground">{message}</span>}
      {job && (
        <div className="w-40 h-2 bg-muted rounded overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: (/([0-9]+)%/.test(message) ? parseInt(message.match(/([0-9]+)%/)[1]) : 0) + '%' }}
          />
        </div>
      )}
    </div>
  );
}


