import React, { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (token: string) => Promise<void>;
  initialToken?: string;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ isOpen, onClose, onConfirm, initialToken = '', isDeleting }) => {
  const [token, setToken] = useState(initialToken);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setToken(initialToken);
      setError(null);
    }
  }, [isOpen, initialToken]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token.trim()) {
      setError('Enter the private deletion token to continue.');
      return;
    }
    setError(null);
    try {
      await onConfirm(token.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete this paste. Check the token and try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="presentation">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
        <button type="button" onClick={onClose} disabled={isDeleting} className="icon-button absolute right-4 top-4" aria-label="Close modal"><X className="h-4 w-4" /></button>
        <div className="flex items-start gap-3 pr-8">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400"><Trash2 className="h-5 w-5" /></div>
          <div><h3 id="delete-dialog-title" className="text-lg font-bold">Delete Paste Early</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">This action is permanent and irreversible.</p></div>
        </div>
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><p>Once deleted, this paste and its contents will be permanently purged from the database immediately.</p></div>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div><label htmlFor="token-input" className="field-label">Private deletion token</label><input id="token-input" type="text" value={token} onChange={(event) => setToken(event.target.value)} placeholder="Paste the token shown when you created it" disabled={isDeleting} className="field-input w-full font-mono text-sm" autoComplete="off" /></div>
          {error && <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">{error}</p>}
          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} disabled={isDeleting} className="button-secondary">Cancel</button><button type="submit" disabled={isDeleting || !token.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50">{isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}{isDeleting ? 'Deleting…' : 'Confirm Permanent Deletion'}</button></div>
        </form>
      </div>
    </div>
  );
};
