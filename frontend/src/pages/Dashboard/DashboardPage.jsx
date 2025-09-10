import WelcomeCard from './WelcomeCard';
import StatsCard from './StatsCard';
import LeadsChart from './LeadsChart';
import { Users, FileText, Send, Target } from 'lucide-react';

const DashboardPage = () => {
  return (
    <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <WelcomeCard />
        
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total de Leads"
            value="1,254"
            icon={Users}
            trend="up"
            trendValue="+12%"
            description="Comparado ao mês anterior"
            variant="success"
          />
          <StatsCard
            title="Campanhas Ativas"
            value="12"
            icon={Send}
            trend="up"
            trendValue="+2"
            description="Campanhas em andamento"
            variant="default"
          />
          <StatsCard
            title="Novos Leads (Mês)"
            value="152"
            icon={FileText}
            trend="down"
            trendValue="-5%"
            description="Últimos 30 dias"
            variant="warning"
          />
          <StatsCard
            title="Taxa de Conversão"
            value="24.5%"
            icon={Target}
            trend="up"
            trendValue="+1.2%"
            description="Lead para cliente"
            variant="success"
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LeadsChart />
          </div>
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <span className="text-sm font-medium">Importar Leads</span>
                  <FileText className="h-4 w-4" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <span className="text-sm font-medium">Nova Campanha</span>
                  <Send className="h-4 w-4" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <span className="text-sm font-medium">Ver Relatórios</span>
                  <Target className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default DashboardPage;
