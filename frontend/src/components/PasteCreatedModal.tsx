import React from 'react';
import { ArrowRight, Check, CheckCircle2, Copy, ShieldAlert, X } from 'lucide-react';
import { CreateSnippetResponse } from '@codeshare/shared';
import { useClipboard } from '../hooks/useClipboard';

interface PasteCreatedModalProps {
  paste: CreateSnippetResponse;
  onClose: () => void;
  onViewPaste: (id: string) => void;
}

export const PasteCreatedModal: React.FC<PasteCreatedModalProps> = ({ paste, onClose, onViewPaste }) => {
  const { copy: copyPublicUrl, copied: publicCopied } = useClipboard();
  const { copy: copyDeleteUrl, copied: deleteCopied } = useClipboard();
  const publicUrl = paste.shareUrl || paste.url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="presentation">
      <div className="relative max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 sm:p-8" role="dialog" aria-modal="true" aria-labelledby="paste-created-title">
        <button type="button" onClick={onClose} className="icon-button absolute right-4 top-4" aria-label="Close paste created dialog"><X className="h-4 w-4" /></button>
        <div className="flex items-start gap-3 pr-8">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="h-6 w-6" /></div>
          <div>
            <h2 id="paste-created-title" className="text-xl font-bold tracking-tight">Paste Ready to Share!</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Expires automatically in 24 hours at {new Date(paste.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.</p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="public-share-url" className="field-label">Public share URL</label>
            <div className="flex gap-2">
              <input id="public-share-url" type="text" readOnly value={publicUrl} className="field-input min-w-0 flex-1 font-mono text-xs" />
              <button type="button" onClick={() => copyPublicUrl(publicUrl)} className={publicCopied ? 'button-primary shrink-0 bg-emerald-600 hover:bg-emerald-500' : 'button-primary shrink-0'}>{publicCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}<span className="hidden sm:inline">{publicCopied ? 'Copied' : 'Copy'}</span></button>
            </div>
          </div>
          <div>
            <label htmlFor="private-delete-url" className="field-label text-red-700 dark:text-red-400">Early deletion link (private)</label>
            <div className="flex gap-2">
              <input id="private-delete-url" type="text" readOnly value={paste.deleteUrl} className="field-input min-w-0 flex-1 border-red-200 font-mono text-xs text-red-700 dark:border-red-900/50 dark:bg-slate-950 dark:text-red-300" />
              <button type="button" onClick={() => copyDeleteUrl(paste.deleteUrl)} className={deleteCopied ? 'button-primary shrink-0 bg-emerald-600 hover:bg-emerald-500' : 'button-secondary shrink-0'}>{deleteCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}<span className="hidden sm:inline">{deleteCopied ? 'Copied' : 'Copy'}</span></button>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p><strong>Save your deletion link now.</strong> It is shown only to you and is the only way to delete the paste before it expires. The token is never stored in the database.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="button-secondary">Create Another Paste</button>
          <a href={publicUrl} target="_blank" rel="noreferrer" className="button-secondary justify-center">Open share link <ArrowRight className="h-4 w-4" /></a>
          <button type="button" onClick={() => onViewPaste(paste.id)} className="button-primary">View Paste <ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
};
