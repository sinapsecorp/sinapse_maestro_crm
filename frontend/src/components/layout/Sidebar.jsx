import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Send, TrendingUp, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = ({ onClose }) => {
  const navigationItems = [
    {
      to: '/',
      icon: LayoutDashboard,
      label: 'Dashboard',
      description: 'Visão geral dos dados'
    },
    {
      to: '/leads',
      icon: FileText,
      label: 'Leads',
      description: 'Gerenciar contatos'
    },
    {
      to: '/campaigns',
      icon: Send,
      label: 'Campanhas',
      description: 'E-mail marketing'
    },
    {
      to: '/analytics',
      icon: TrendingUp,
      label: 'Analytics',
      description: 'Relatórios e métricas'
    }
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-card border-r border-border flex flex-col h-full animate-slide-in">
      {/* Logo Section */}
      <div className="flex items-center px-6 py-8 border-b border-border/50">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
            <img 
              src="/sinapse-negative.png" 
              alt="Logo" 
              className="h-6 w-auto filter brightness-0 invert" 
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Sinapse</h1>
            <p className="text-xs text-muted-foreground">Maestro</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all-smooth',
                    'hover:bg-accent/10 hover:text-accent-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                    isActive
                      ? 'bg-primary/10 text-primary border-l-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )
                }
              >
                <item.icon className="h-5 w-5 mr-3 transition-transform group-hover:scale-110" />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.description}
                  </div>
                </div>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer Section */}
      <div className="px-4 py-4 border-t border-border/50">
        <div className="space-y-2">
          <NavLink
            to="/settings/areas"
            className={({ isActive }) =>
              cn(
                'w-full flex items-center px-3 py-2 text-sm rounded-lg transition-all-smooth',
                'text-muted-foreground hover:text-foreground hover:bg-accent/10',
                isActive ? 'bg-primary/10 text-primary' : ''
              )
            }
          >
            <Settings className="h-4 w-4 mr-3" />
            Configurações
          </NavLink>
          <button className="w-full flex items-center px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all-smooth">
            <LogOut className="h-4 w-4 mr-3" />
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
