import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GetPasteResponse, LANGUAGE_LABELS } from '@codeshare/shared';
import { Header } from '../components/Header';
import { Editor } from '../components/Editor';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { AdSlot } from '../components/AdSlot';
import { Footer } from '../components/Footer';
import { adsConfig } from '../config/ads';
import { api, ApiError } from '../services/api';
import { useClipboard } from '../hooks/useClipboard';
import {
  Copy,
  Check,
  Share2,
  Trash2,
  Clock,
  AlertTriangle,
  FileX,
  Hourglass,
  PlusCircle,
  Loader2,
} from 'lucide-react';

interface PasteViewPageProps {
  pasteId: string;
  initialToken?: string;
  onNavigateHome: () => void;
  onNavigateAbout?: () => void;
  onNavigatePrivacy?: () => void;
  onNavigateTerms?: () => void;
}

export const PasteViewPage: React.FC<PasteViewPageProps> = ({
  pasteId,
  initialToken = '',
  onNavigateHome,
  onNavigateAbout,
  onNavigatePrivacy,
  onNavigateTerms,
}) => {
  const [paste, setPaste] = useState<GetPasteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Deletion modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Clipboard hooks
  const { copy: copyContent, copied: contentCopied } = useClipboard();
  const { copy: copyLink, copied: linkCopied } = useClipboard();

  // Fetch paste on mount or ID change
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setErrorStatus(null);
    setErrorMessage(null);

    // Immediately strip the secret deletion token from the visible URL to prevent
    // Referrer header leakage and browser history exposure.
    // The token is captured in `initialToken` prop before this effect runs.
    if (initialToken) {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('token');
      window.history.replaceState({}, '', cleanUrl.toString());
    }

    api
      .getPaste(pasteId)
      .then((data) => {
        if (isMounted) {
          setPaste(data);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setIsLoading(false);
          if (err instanceof ApiError) {
            setErrorStatus(err.status);
            setErrorMessage(err.message);
          } else {
            setErrorStatus(500);
            setErrorMessage('Could not load paste. Please verify your connection.');
          }
        }
      });

    return () => {
      isMounted = false;
    };
  }, [pasteId]);

  // Compute countdown to expiration
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!paste) return;

    const updateTimer = () => {
      const now = Date.now();
      const expiry = new Date(paste.expiresAt).getTime();
      const diffMs = expiry - now;

      if (diffMs <= 0) {
        setTimeRemaining('Expired');
        setErrorStatus(410);
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [paste]);

  // Handle early deletion
  const handleDelete = useCallback(
    async (token: string) => {
      setIsDeleting(true);
      try {
        await api.deletePaste(pasteId, token);
        setIsDeleteModalOpen(false);
        setDeleteSuccess(true);
        // Clear deletion query param from URL without reloading
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        window.history.replaceState({}, '', url.toString());
      } finally {
        setIsDeleting(false);
      }
    },
    [pasteId]
  );

  // Line count memo
  const lineCount = useMemo(() => {
    if (!paste) return 0;
    return paste.content.split('\n').length;
  }, [paste]);

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0d14] text-slate-100">
        <Header onNewPaste={onNavigateHome} showNewButton />
        <main className="flex-1 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm font-mono text-slate-400">Loading secure paste...</p>
        </main>
      </div>
    );
  }

  // 2. Successful Deletion State
  if (deleteSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0d14] text-slate-100">
        <Header onNewPaste={onNavigateHome} showNewButton />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Paste Permanently Deleted</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              This paste has been wiped from the database and is no longer accessible by anyone.
            </p>
            <div className="pt-2">
              <button
                onClick={onNavigateHome}
                className="w-full flex items-center justify-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-600/20 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create a New Paste</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 3. Expired State (410)
  if (errorStatus === 410) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0d14] text-slate-100">
        <Header onNewPaste={onNavigateHome} showNewButton />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Hourglass className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Paste Expired</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              This paste reached its 24-hour expiration limit and has been securely purged.
            </p>
            <div className="pt-2">
              <button
                onClick={onNavigateHome}
                className="w-full flex items-center justify-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-600/20 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create a New Paste</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 4. Not Found State (404)
  if (errorStatus === 404) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0d14] text-slate-100">
        <Header onNewPaste={onNavigateHome} showNewButton />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto">
              <FileX className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Paste Not Found</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              The link you followed may be incorrect, or the paste was deleted early by its creator.
            </p>
            <div className="pt-2">
              <button
                onClick={onNavigateHome}
                className="w-full flex items-center justify-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-600/20 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create a New Paste</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 5. Generic Error State
  if (errorMessage && !paste) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0d14] text-slate-100">
        <Header onNewPaste={onNavigateHome} showNewButton />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Error Loading Paste</h2>
            <p className="text-sm text-slate-400 leading-relaxed">{errorMessage}</p>
            <div className="pt-2">
              <button
                onClick={onNavigateHome}
                className="w-full flex items-center justify-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!paste) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0d14] text-slate-100">
      <Header onNewPaste={onNavigateHome} showNewButton />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {/* Paste Header / Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 mb-4">
          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <span className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-xs font-semibold">
              {LANGUAGE_LABELS[paste.language] || paste.language}
            </span>

            <span className="text-xs text-slate-500 font-mono hidden sm:inline">•</span>

            <div className="flex items-center space-x-1.5 text-xs text-amber-300 font-mono bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Expires in {timeRemaining}</span>
            </div>

            <span className="text-xs text-slate-500 font-mono hidden sm:inline">•</span>

            <span className="text-xs text-slate-400 font-mono">
              {lineCount} line{lineCount === 1 ? '' : 's'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => copyContent(paste.content)}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                contentCopied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {contentCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{contentCopied ? 'Copied Content' : 'Copy Content'}</span>
            </button>

            <button
              onClick={() => {
                // Never copy the token-containing URL — always strip the token param
                const cleanUrl = new URL(window.location.href);
                cleanUrl.searchParams.delete('token');
                copyLink(cleanUrl.toString());
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                linkCopied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{linkCopied ? 'Copied Link' : 'Copy Link'}</span>
            </button>

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 transition-all"
              title="Delete paste early with deletion token"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>

        {/* Read-Only Editor */}
        <div className="flex-1 min-h-[500px] flex flex-col">
          <Editor
            value={paste.content}
            language={paste.language}
            readOnly={true}
            minHeight="620px"
          />
        </div>

        {/* Responsive Ad Banner below paste content */}
        <AdSlot slotId={adsConfig.viewSlotId} className="my-6" />

        {/* Footer info */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-2 pt-2">
          <span>Created at: {new Date(paste.createdAt).toUTCString()}</span>
          <span>Expires at: {new Date(paste.expiresAt).toUTCString()}</span>
        </div>
      </main>

      {/* Footer */}
      <Footer
        onNavigateHome={onNavigateHome}
        onNavigateAbout={onNavigateAbout}
        onNavigatePrivacy={onNavigatePrivacy}
        onNavigateTerms={onNavigateTerms}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        initialToken={initialToken}
        isDeleting={isDeleting}
      />
    </div>
  );
};
