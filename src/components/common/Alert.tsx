import { AlertTriangle, Info, CircleAlert } from 'lucide-react';
import type { AlertSeverity } from '@/services/clinicalAlerts';
import type { ReactNode } from 'react';

interface AlertProps {
  severity?: AlertSeverity;
  title?: string;
  children: ReactNode;
}

const styles: Record<AlertSeverity, { wrapper: string; icon: string; title: string }> = {
  info: {
    wrapper: 'bg-clinical-50 border-clinical-200',
    icon: 'text-clinical-600',
    title: 'text-clinical-900',
  },
  warning: {
    wrapper: 'bg-warning-50 border-warning-200',
    icon: 'text-warning-600',
    title: 'text-warning-700',
  },
  danger: {
    wrapper: 'bg-danger-50 border-danger-200',
    icon: 'text-danger-600',
    title: 'text-danger-700',
  },
};

export function Alert({ severity = 'info', title, children }: AlertProps) {
  const s = styles[severity];
  const Icon = severity === 'info' ? Info : severity === 'warning' ? AlertTriangle : CircleAlert;

  return (
    <div
      className={`flex gap-3 rounded-lg border p-3 text-sm ${s.wrapper}`}
      role={severity === 'danger' ? 'alert' : 'status'}
    >
      <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${s.icon}`} aria-hidden />
      <div className="flex-1">
        {title && <p className={`font-semibold ${s.title}`}>{title}</p>}
        <div className="text-slate-700">{children}</div>
      </div>
    </div>
  );
}
