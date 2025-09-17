import { Button } from '@/components/ui/button';
import api from '@/services/api';

export default function CampaignDispatch({ campaignId, onDone }) {
  const handleDispatch = async () => {
    await api.post(`/api/campaigns/${campaignId}/dispatch`);
    onDone && onDone();
  };

  return (
    <Button onClick={handleDispatch}>Disparar Campanha</Button>
  );
}


