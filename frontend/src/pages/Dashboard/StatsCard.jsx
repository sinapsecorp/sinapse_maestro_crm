import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  className, 
  trend, 
  trendValue, 
  description,
  variant = 'default'
}) => {
  const variantStyles = {
    default: 'border-border hover:border-primary/30',
    success: 'border-green-500/20 bg-green-500/5',
    warning: 'border-yellow-500/20 bg-yellow-500/5',
    danger: 'border-red-500/20 bg-red-500/5',
  };

  const iconColors = {
    default: 'text-primary',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    danger: 'text-red-500',
  };

  return (
    <Card className={cn(
      'transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group',
      variantStyles[variant],
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        {Icon && (
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
            <Icon className={cn("h-4 w-4", iconColors[variant])} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold text-foreground animate-fade-in">
            {value}
          </div>
          {trend && trendValue && (
            <div className={cn(
              "flex items-center text-xs font-medium",
              trend === 'up' ? 'text-green-500' : 'text-red-500'
            )}>
              {trend === 'up' ? 
                <TrendingUp className="h-3 w-3 mr-1" /> : 
                <TrendingDown className="h-3 w-3 mr-1" />
              }
              {trendValue}
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
