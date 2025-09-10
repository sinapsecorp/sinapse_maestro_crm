import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

const data = [
  { name: 'Tecnologia', leads: 400, growth: '+12%' },
  { name: 'Saúde', leads: 300, growth: '+8%' },
  { name: 'Finanças', leads: 200, growth: '-2%' },
  { name: 'Educação', leads: 278, growth: '+15%' },
  { name: 'Varejo', leads: 189, growth: '+5%' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">
          <span className="text-primary font-semibold">{data.leads}</span> leads
        </p>
        <p className="text-xs text-muted-foreground">
          Crescimento: <span className={data.growth.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
            {data.growth}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const LeadsChart = () => {
  const totalLeads = data.reduce((sum, item) => sum + item.leads, 0);
  
  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-foreground">Leads por Área de Atuação</CardTitle>
            <CardDescription className="mt-1">
              Total de <span className="text-primary font-semibold">{totalLeads.toLocaleString()}</span> leads distribuídos por setor
            </CardDescription>
          </div>
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              opacity={0.3} 
            />
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="leads" 
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              className="transition-all duration-300 hover:opacity-80"
            />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Legend personalizada */}
        <div className="flex items-center justify-center mt-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="w-3 h-3 bg-primary rounded-sm"></div>
            <span>Quantidade de Leads</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadsChart;
