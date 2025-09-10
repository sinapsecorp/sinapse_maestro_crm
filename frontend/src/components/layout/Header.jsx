import { useState } from 'react';
import { Bell, Search, Menu, User, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Header = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-accent/10 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        {/* Search Bar */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar leads, campanhas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-64 lg:w-80 bg-muted/50 border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-all"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-accent/10 transition-colors group">
          <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-accent/10 transition-colors group"
          >
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-foreground">User Name</p>
              <p className="text-xs text-muted-foreground">user@email.com</p>
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 text-muted-foreground transition-transform group-hover:text-foreground",
              isUserMenuOpen && "rotate-180"
            )} />
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg py-2 z-50 animate-scale-in">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-sm font-medium text-foreground">User Name</p>
                <p className="text-xs text-muted-foreground">user@email.com</p>
              </div>
              <div className="py-1">
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-accent/10 transition-colors">
                  Perfil
                </button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-accent/10 transition-colors">
                  Configurações
                </button>
                <hr className="my-1 border-border" />
                <button className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors">
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
