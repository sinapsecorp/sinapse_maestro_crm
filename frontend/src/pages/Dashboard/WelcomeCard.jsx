import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp } from 'lucide-react';

const WelcomeCard = () => {
  const currentHour = new Date().getHours();
  const greeting = 
    currentHour < 12 ? 'Bom dia!' :
    currentHour < 18 ? 'Boa tarde!' : 'Boa noite!';

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {greeting}
            </CardTitle>
            <CardDescription className="text-base mt-2 text-muted-foreground">
              Este é o seu painel de controle. Aqui você pode gerenciar seus leads e campanhas.
            </CardDescription>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 transition-all duration-200">
            <Plus className="h-4 w-4" />
            Criar Nova Campanha
          </Button>
          <Button variant="outline" className="border-primary/20 hover:bg-primary/5">
            Ver Relatórios
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeCard;
