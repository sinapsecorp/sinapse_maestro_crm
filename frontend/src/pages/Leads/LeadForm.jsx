import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DialogFooter } from "@/components/ui/dialog";
import api from '@/services/api';
import { useToast } from '@/components/ui/toast.jsx';

export function LeadForm({ setOpen, onCreated, initialData }) {
    const [formData, setFormData] = useState({
        id: initialData?.id || null,
        // novos campos principais
        cnpj: initialData?.cnpj || '',
        razao_social: initialData?.razao_social || '',
        telefone_principal: initialData?.telefone_principal || '',
        telefone_secundario: initialData?.telefone_secundario || '',
        phone: initialData?.phone || '',
        // compatibilidade
        full_name: initialData?.full_name || '',
        email: initialData?.email || '',
        company: initialData?.company || '',
        job_title: initialData?.job_title || '',
        area_of_expertise_id: initialData?.area_of_expertise_id || ''
    });
    const [areasOfExpertise, setAreasOfExpertise] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { show } = useToast();

    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const response = await api.get('/areas-of-expertise/');
                setAreasOfExpertise(response.data);
            } catch (err) {
                console.error("Failed to fetch areas of expertise", err);
                setError('Não foi possível carregar as áreas de atuação.');
            }
        };
        fetchAreas();
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (value) => {
        setFormData(prev => ({ ...prev, area_of_expertise_id: value }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = { ...formData };
            if (formData.id) {
                await api.put(`/leads/${formData.id}`, payload);
                show({ title: 'Sucesso', message: 'Lead atualizado com sucesso.' });
            } else {
                await api.post('/leads/', payload);
                show({ title: 'Sucesso', message: 'Lead criado com sucesso.' });
            }
            onCreated && onCreated();
            setOpen(false);
        } catch (err) {
            console.error("Failed to create lead", err);
            const msg = err?.response?.data?.detail || 'Falha ao criar o lead. Verifique os dados e tente novamente.';
            setError(msg);
            show({ title: 'Erro', message: msg, variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-2 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input id="cnpj" value={formData.cnpj} onChange={handleChange} className="w-full" required />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="razao_social">Razão Social</Label>
                    <Input id="razao_social" value={formData.razao_social} onChange={handleChange} className="w-full" required />
                </div>

                <div className="sm:col-span-2 flex flex-col gap-2">
                    <Label htmlFor="full_name">Nome Completo (opcional)</Label>
                    <Input id="full_name" value={formData.full_name} onChange={handleChange} className="w-full" />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email (opcional)</Label>
                    <Input id="email" type="email" value={formData.email} onChange={handleChange} className="w-full" />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="telefone_principal">Telefone Principal</Label>
                    <Input id="telefone_principal" value={formData.telefone_principal} onChange={handleChange} className="w-full" placeholder="(99)99999-9999" />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="telefone_secundario">Telefone Secundário</Label>
                    <Input id="telefone_secundario" value={formData.telefone_secundario} onChange={handleChange} className="w-full" placeholder="(99)99999-9999" />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input id="company" value={formData.company} onChange={handleChange} className="w-full" />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="job_title">Cargo</Label>
                    <Input id="job_title" value={formData.job_title} onChange={handleChange} className="w-full" />
                </div>

                <div className="sm:col-span-2 flex flex-col gap-2">
                    <Label htmlFor="area_of_expertise_id">Área de Atuação</Label>
                    <Select onValueChange={handleSelectChange} value={formData.area_of_expertise_id}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione uma área" />
                        </SelectTrigger>
                        <SelectContent>
                            {areasOfExpertise.map(area => (
                                <SelectItem key={area.id} value={String(area.id)}>{area.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {error && <p className="text-red-500 text-sm sm:col-span-2 text-center">{error}</p>}
            </div>
            <DialogFooter>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar Lead'}
                </Button>
            </DialogFooter>
        </form>
    );
}
