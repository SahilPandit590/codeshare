import React from 'react';
import { CreatePasteResponse } from '@codeshare/shared';
import { Check, Copy, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { useClipboard } from '../hooks/useClipboard';

interface PasteCreatedModalProps {
  paste: CreatePasteResponse;
  onClose: () => void;
  onViewPaste: (id: string) => void;
}

export const PasteCreatedModal: React.FC<PasteCreatedModalProps> = ({
  paste,
  onClose,
  onViewPaste,
}) => {
  const { copy: copyPublicUrl, copied: publicCopied } = useClipboard();
  const { copy: copyDeleteUrl, copied: deleteCopied } = useClipboard();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Paste Ready to Share!</h2>
            <p className="text-xs text-slate-400">
              Expires automatically in 24 hours at{' '}
              <span className="font-mono text-slate-300">
                {new Date(paste.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {/* Public Share Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Public Share URL
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={paste.url}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 select-all focus:outline-none"
              />
              <button
                onClick={() => copyPublicUrl(paste.url)}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  publicCopied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
                }`}
              >
                {publicCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{publicCopied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Secret Deletion Link */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-red-400 uppercase tracking-wider">
                Early Deletion Link (Secret)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={paste.deleteUrl}
                className="w-full px-3.5 py-2 bg-slate-950 border border-red-900/40 rounded-lg text-xs font-mono text-red-300 select-all focus:outline-none"
              />
              <button
                onClick={() => copyDeleteUrl(paste.deleteUrl)}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  deleteCopied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {deleteCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{deleteCopied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Save your deletion link now:</strong> This is the only time the deletion token will be shown. For your security, the server stores only a cryptographic SHA-256 hash.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Create Another Paste
          </button>
          <button
            onClick={() => onViewPaste(paste.id)}
            className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-600/20 transition-all"
          >
            <span>View Paste</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
