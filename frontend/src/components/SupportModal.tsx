import { Copy, X } from 'lucide-react';
import { SUPPORT_QR_URL, SUPPORT_UPI_ID } from '../config/ads';
import { useClipboard } from '../hooks/useClipboard';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const { copy, copied } = useClipboard();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-dialog-title"
      >
        <button type="button" onClick={onClose} className="icon-button absolute right-4 top-4" aria-label="Close support dialog">
          <X className="h-4 w-4" />
        </button>
        <h2 id="support-dialog-title" className="pr-6 text-xl font-bold">Support Code Snipper</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Scan the QR code with your UPI app or use the UPI ID below.</p>
        <div className="mx-auto mt-5 flex w-fit rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700">
          <img src={SUPPORT_QR_URL} alt={`UPI QR code for ${SUPPORT_UPI_ID}`} width="240" height="240" className="h-48 w-48 sm:h-60 sm:w-60" />
        </div>
        <div className="mt-5 text-left">
          <label htmlFor="support-upi-id" className="field-label">UPI ID</label>
          <div className="flex gap-2">
            <input id="support-upi-id" type="text" readOnly value={SUPPORT_UPI_ID} className="field-input min-w-0 flex-1 font-mono text-sm" />
            <button type="button" onClick={() => void copy(SUPPORT_UPI_ID)} className="button-secondary shrink-0" aria-label="Copy UPI ID">
              <Copy className="h-4 w-4" />
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
        <button type="button" onClick={onClose} className="button-primary mt-6 w-full justify-center">Done</button>
      </div>
    </div>
  );
}
