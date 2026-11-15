import { Terminal, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MinBitAssistantProps {
  type?: 'info' | 'warning' | 'success' | 'tip';
  title?: string;
  children: React.ReactNode;
}

const MinBitAssistant = ({ type = 'info', title, children }: MinBitAssistantProps) => {
  const icons = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
    tip: Terminal,
  };

  const styles = {
    info: 'bg-primary/10 border-primary/30 text-foreground',
    warning: 'bg-accent/10 border-accent/30 text-foreground',
    success: 'bg-primary/10 border-primary/30 text-foreground',
    tip: 'bg-muted border-muted-foreground/20 text-muted-foreground',
  };

  const Icon = icons[type];

  return (
    <div 
      className={cn('rounded-lg border p-4 space-y-2', styles[type])}
      role={type === 'warning' ? 'alert' : 'status'}
      aria-live={type === 'warning' ? 'assertive' : 'polite'}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div className="flex-1 space-y-1">
          {title && (
            <p className="font-semibold text-sm">{title}</p>
          )}
          <div className="text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default MinBitAssistant;
