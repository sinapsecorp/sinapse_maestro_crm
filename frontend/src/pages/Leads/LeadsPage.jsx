import { useEffect, useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Upload, Download, Search, Filter } from "lucide-react";
import { LeadForm } from "./LeadForm";
import LeadImport from "./LeadImport";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { DataTable } from '@/components/DataTable';
import api from '@/services/api';
import { useToast } from '@/components/ui/toast.jsx';
import BulkDeleteByAreas from './BulkDeleteByAreas';

export default function LeadsPage() {
    const [open, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [leads, setLeads] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const { show } = useToast();
    const [stats, setStats] = useState(null);
    const [filterKey, setFilterKey] = useState(null);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const params = { skip: (page - 1) * pageSize, limit: pageSize };
            if (searchQuery) params.q = searchQuery;
            if (filterKey) params.f = filterKey;
            const res = await api.get('/leads/', { params });
            setLeads(res.data);
            const headerTotal = res.headers['x-total-count'] || res.headers['X-Total-Count'] || res.headers['X-total-count'];
            const parsed = headerTotal ? parseInt(headerTotal) : NaN;
            setTotal(!isNaN(parsed) ? parsed : (page === 1 ? res.data.length : total));
            // stats
            try {
                const st = await api.get('/leads/stats');
                setStats(st.data);
            } catch {}
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            setPage(1);
            fetchLeads();
        }, 400);
        return () => clearTimeout(delayDebounce);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    // Recarrega imediatamente ao trocar o filtro pelos cards
    useEffect(() => {
        setPage(1);
        fetchLeads();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterKey]);

    const handleEdit = (lead) => {
        setEditing(lead);
        setEditOpen(true);
    };

    const handleDelete = async (lead) => {
        if (!confirm('Deseja remover este lead?')) return;
        await api.delete(`/leads/${lead.id}`);
        show({ title: 'Lead removido', message: `${lead.full_name} removido.` });
        fetchLeads();
    };

    const columns = useMemo(() => [
        {
            header: 'CNPJ',
            cell: ({ row }) => row.original.cnpj || '-',
        },
        {
            header: 'Razão Social',
            cell: ({ row }) => row.original.razao_social || row.original.full_name,
        },
        {
            header: 'Email',
            cell: ({ row }) => row.original.email || '-',
        },
        {
            header: 'Telefone',
            cell: ({ row }) => row.original.telefone_principal || row.original.phone || '-',
        },
        {
            header: 'Cargo',
            cell: ({ row }) => row.original.job_title || '-',
        },
        {
            header: 'Ações',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(row.original)}>Editar</Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(row.original)}>Excluir</Button>
                </div>
            ),
        },
    ], []);

    return (
            <div className="space-y-6 animate-fade-in">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Leads</h1>
                        <p className="text-muted-foreground mt-1">
                            Gerencie seus contatos e prospects
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex items-center gap-3">
                            <Upload className="h-4 w-4" />
                            <LeadImport onImported={fetchLeads} />
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="destructive">Remover por Áreas</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                    <DialogTitle>Remover Leads por Áreas</DialogTitle>
                                    <DialogDescription>Selecione as áreas para remover todos os leads associados.</DialogDescription>
                                </DialogHeader>
                                <BulkDeleteByAreas onDone={() => { fetchLeads(); }} />
                            </DialogContent>
                        </Dialog>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Exportar
                        </Button>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2">
                                    <PlusCircle className="h-4 w-4" />
                                    Adicionar Lead
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[720px] w-[95vw]">
                                <DialogHeader>
                                    <DialogTitle>Adicionar Novo Lead</DialogTitle>
                                    <DialogDescription>
                                        Preencha as informações abaixo para criar um novo lead.
                                    </DialogDescription>
                                </DialogHeader>
                                <LeadForm setOpen={setOpen} onCreated={() => { setPage(1); fetchLeads(); show({ title: 'Lead criado', message: 'O lead foi cadastrado com sucesso.' }); }} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardContent className="pt-6">
                        {stats && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <button onClick={() => { setFilterKey('with_email'); }} className={`bg-muted/30 rounded-lg p-4 text-left ${filterKey==='with_email'?'ring-2 ring-ring':''}`}>
                              <div className="text-xs text-muted-foreground">Total com Email</div>
                              <div className="text-2xl font-bold">{stats.with_email}</div>
                            </button>
                            <button onClick={() => { setFilterKey('with_phone'); }} className={`bg-muted/30 rounded-lg p-4 text-left ${filterKey==='with_phone'?'ring-2 ring-ring':''}`}>
                              <div className="text-xs text-muted-foreground">Com Telefone</div>
                              <div className="text-2xl font-bold">{stats.with_phone}</div>
                            </button>
                            <button onClick={() => { setFilterKey('without_email_phone'); }} className={`bg-muted/30 rounded-lg p-4 text-left ${filterKey==='without_email_phone'?'ring-2 ring-ring':''}`}>
                              <div className="text-xs text-muted-foreground">Sem Email e Telefone</div>
                              <div className="text-2xl font-bold">{stats.without_email_phone}</div>
                            </button>
                            <button onClick={() => { setFilterKey('useful'); }} className={`bg-muted/30 rounded-lg p-4 text-left ${filterKey==='useful'?'ring-2 ring-ring':''}`}>
                              <div className="text-xs text-muted-foreground">Leads Úteis</div>
                              <div className="text-2xl font-bold">{stats.useful}</div>
                            </button>
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Buscar leads por nome, email, empresa..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-all"
                                />
                            </div>
                            <Button variant="outline" onClick={() => { setFilterKey(null); }}>Limpar Filtro</Button>
                            <Button variant="outline" className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                Filtros
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Leads Table Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Todos os Leads</CardTitle>
                        <CardDescription>
                            Lista completa dos seus leads e suas informações
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {leads.length ? (
                            <>
                                <DataTable columns={columns} data={leads} />
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-sm text-muted-foreground">
                                        {total} resultados
                                    </p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</Button>
                                        <span className="text-sm text-muted-foreground">Página {page} de {Math.max(1, Math.ceil(total / pageSize))}</span>
                                        <Button variant="outline" disabled={(page * pageSize) >= total} onClick={() => setPage(p => p + 1)}>Próxima</Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                                    <PlusCircle className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    Nenhum lead encontrado
                                </h3>
                                <p className="text-muted-foreground mb-4 max-w-sm">
                                    Comece adicionando seu primeiro lead ou importe uma lista de contatos.
                                </p>
                                <div className="flex gap-3">
                                    <Button 
                                        onClick={() => setOpen(true)}
                                        className="flex items-center gap-2"
                                    >
                                        <PlusCircle className="h-4 w-4" />
                                        Adicionar Primeiro Lead
                                    </Button>
                                    <Button variant="outline" className="flex items-center gap-2">
                                        <Upload className="h-4 w-4" />
                                        Importar Lista
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogContent className="sm:max-w-[720px] w-[95vw]">
                        <DialogHeader>
                            <DialogTitle>Editar Lead</DialogTitle>
                            <DialogDescription>Atualize as informações do lead.</DialogDescription>
                        </DialogHeader>
                        {editing && (
                            <LeadForm setOpen={setEditOpen} initialData={editing} onCreated={() => { setEditOpen(false); fetchLeads(); }} />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
    );
}
