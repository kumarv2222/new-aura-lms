import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import clsx from 'clsx';

type Variant = 'error' | 'success' | 'info';

const config = {
  error: { icon: AlertCircle, bg: 'rgba(255,77,109,0.1)', border: 'rgba(255,77,109,0.25)', color: '#ff4d6d' },
  success: { icon: CheckCircle2, bg: 'rgba(0,201,167,0.1)', border: 'rgba(0,201,167,0.25)', color: '#00c9a7' },
  info: { icon: Info, bg: 'rgba(240,180,41,0.08)', border: 'rgba(240,180,41,0.2)', color: '#f0b429' },
};

export default function Alert({ variant = 'error', message }: { variant?: Variant; message: string }) {
  const { icon: Icon, bg, border, color } = config[variant];
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-lg text-sm"
      style={{ background: bg, border: `1px solid ${border}`, color }}>
      <Icon size={15} className="shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}
