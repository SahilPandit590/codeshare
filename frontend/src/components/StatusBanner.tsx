import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface StatusBannerProps {
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({ type, message, onClose }) => {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-300',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300',
    warning: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300',
    info: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-300',
  };

  const icons = {
    error: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />,
  };

  return (
    <div
      className={`flex items-start justify-between p-4 rounded-xl border ${styles[type]} text-sm animate-in fade-in transition-all`}
      role="alert"
    >
      <div className="flex items-center space-x-3">
        {icons[type]}
        <p className="font-medium leading-relaxed">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
           className="ml-4 p-1 text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          aria-label="Close message"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
