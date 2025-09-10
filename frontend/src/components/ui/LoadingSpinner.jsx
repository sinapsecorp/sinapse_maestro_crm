import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const LoadingSpinner = ({ className }) => {
  return (
    <LoaderCircle className={cn('animate-spin text-primary', className)} />
  );
};

export default LoadingSpinner;
