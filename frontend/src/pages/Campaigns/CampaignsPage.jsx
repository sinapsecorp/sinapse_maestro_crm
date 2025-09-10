import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/DataTable';
import api from '@/services/api';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/campaigns/');
      setCampaigns(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleDispatch = async (id) => {
    await api.post(`/campaigns/${id}/dispatch`);
    // Feedback simples
    alert('Campanha enfileirada para envio.');
  };

  const columns = useMemo(() => [
    { header: 'Nome', cell: ({ row }) => row.original.name },
    { header: 'Assunto', cell: ({ row }) => row.original.subject },
    { header: 'Status', cell: ({ row }) => row.original.status },
    { header: 'Ações', cell: ({ row }) => (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => handleDispatch(row.original.id)}>Disparar</Button>
      </div>
    )},
  ], []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Campanhas</h1>
        <div className="flex gap-2">
          {/* Navegação futura para criação/edição */}
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Todas as campanhas</CardTitle>
          <CardDescription>Gerencie e dispare suas campanhas</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={campaigns} />
        </CardContent>
      </Card>
    </div>
  );
}


