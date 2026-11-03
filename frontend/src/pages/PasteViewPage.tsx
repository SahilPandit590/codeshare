import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, Clock, Copy, FileX, Hourglass, Loader2, Plus, Share2, Trash2 } from 'lucide-react';
import { GetPasteResponse, LANGUAGE_LABELS } from '@codeshare/shared';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { LazyEditor } from '../components/LazyEditor';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { AdSlot } from '../components/AdSlot';
import { adsConfig } from '../config/ads';
import { useClipboard } from '../hooks/useClipboard';
import { api, ApiError } from '../services/api';

interface PasteViewPageProps {
  pasteId: string;
  initialToken?: string;
  onNavigateHome: () => void;
  onNavigateCreate?: () => void;
  onNavigateAbout?: () => void;
  onNavigatePrivacy?: () => void;
  onNavigateTerms?: () => void;
}

function StateCard({ title, message, icon, onNavigateHome }: { title: string; message: string; icon: React.ReactNode; onNavigateHome: () => void }) {
  return (
    <main className="page-container flex flex-1 items-center justify-center py-12">
      <div className="surface-card w-full max-w-md p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400">{icon}</div>
        <h1 className="mt-5 text-xl font-bold tracking-tight text-slate-950 dark:text-white">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{message}</p>
        <button type="button" onClick={onNavigateHome} className="button-primary mt-6 w-full justify-center"><Plus className="h-4 w-4" /> Create a new paste</button>
      </div>
    </main>
  );
}

export const PasteViewPage: React.FC<PasteViewPageProps> = ({ pasteId, initialToken = '', onNavigateHome, onNavigateCreate, onNavigateAbout, onNavigatePrivacy, onNavigateTerms }) => {
  const [paste, setPaste] = useState<GetPasteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const { copy: copyContent, copied: contentCopied } = useClipboard();
  const { copy: copyLink, copied: linkCopied } = useClipboard();

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setErrorStatus(null);
    setErrorMessage(null);

    // A token may arrive once from a creator's private link. Remove it before
    // the page can be shared, logged, or added to browser history again.
    if (initialToken) {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('token');
      window.history.replaceState({}, '', `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`);
    }

    api.getPaste(pasteId).then((data) => {
      if (mounted) { setPaste(data); setIsLoading(false); }
    }).catch((err: unknown) => {
      if (!mounted) return;
      setIsLoading(false);
      if (err instanceof ApiError) { setErrorStatus(err.status); setErrorMessage(err.message); }
      else { setErrorStatus(500); setErrorMessage('Could not load this paste. Please check your connection.'); }
    });

    return () => { mounted = false; };
  }, [pasteId, initialToken]);

  useEffect(() => {
    if (!paste) return;
    const updateTimer = () => {
      const diff = new Date(paste.expiresAt).getTime() - Date.now();
      if (diff <= 0) { setTimeRemaining('Expired'); setErrorStatus(410); return; }
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };
    updateTimer();
    const interval = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(interval);
  }, [paste]);

  const handleDelete = useCallback(async (token: string) => {
    setIsDeleting(true);
    try {
      await api.deletePaste(pasteId, token);
      setIsDeleteModalOpen(false);
      setDeleteSuccess(true);
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('token');
      window.history.replaceState({}, '', `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`);
    } finally {
      setIsDeleting(false);
    }
  }, [pasteId]);

  const lineCount = useMemo(() => paste?.content.split('\n').length ?? 0, [paste]);
  const shell = (content: React.ReactNode) => (
    <div className="app-shell"><Header onNavigateHome={onNavigateHome} onNavigateCreate={onNavigateCreate} showNewButton onNavigateAbout={onNavigateAbout} />{content}<Footer onNavigateHome={onNavigateHome} onNavigateAbout={onNavigateAbout} onNavigatePrivacy={onNavigatePrivacy} onNavigateTerms={onNavigateTerms} /></div>
  );

  if (isLoading) return shell(<main className="flex flex-1 flex-col items-center justify-center gap-3 py-20"><Loader2 className="h-7 w-7 animate-spin text-blue-600" /><p className="text-sm text-slate-500 dark:text-slate-400">Loading secure paste…</p></main>);
  if (deleteSuccess) return shell(<StateCard title="Paste permanently deleted" message="This paste has been removed from Code Snipper and is no longer accessible by anyone." icon={<Check className="h-7 w-7" />} onNavigateHome={onNavigateHome} />);
  if (errorStatus === 410) return shell(<StateCard title="Paste Expired" message="This paste reached its 24-hour expiration limit and has been securely purged." icon={<Hourglass className="h-7 w-7" />} onNavigateHome={onNavigateHome} />);
  if (errorStatus === 404) return shell(<StateCard title="Paste Not Found" message="The link may be incorrect, or the paste was already deleted by its creator." icon={<FileX className="h-7 w-7" />} onNavigateHome={onNavigateHome} />);
  if (errorMessage && !paste) return shell(<StateCard title="Error Loading Paste" message={errorMessage} icon={<AlertTriangle className="h-7 w-7" />} onNavigateHome={onNavigateHome} />);
  if (!paste) return null;

  return shell(
    <main className="page-container flex-1 py-6 sm:py-8">
      <div className="surface-card overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-200/80 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400">{LANGUAGE_LABELS[paste.language] || paste.language}</span>
            <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300"><Clock className="h-3.5 w-3.5" /> Expires in {timeRemaining}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{lineCount} line{lineCount === 1 ? '' : 's'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => copyContent(paste.content)} className={contentCopied ? 'button-primary bg-emerald-600 hover:bg-emerald-500' : 'button-secondary'}>{contentCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{contentCopied ? 'Copied' : 'Copy content'}</button>
            <button type="button" onClick={() => { const url = new URL(window.location.href); url.searchParams.delete('token'); void copyLink(url.toString()); }} className={linkCopied ? 'button-primary bg-emerald-600 hover:bg-emerald-500' : 'button-secondary'}>{linkCopied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}{linkCopied ? 'Copied' : 'Share link'}</button>
            <button type="button" onClick={() => setIsDeleteModalOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"><Trash2 className="h-4 w-4" /> Delete paste</button>
          </div>
        </div>
         <div className="p-3 sm:p-5"><LazyEditor value={paste.content} language={paste.language} readOnly minHeight="min(620px, 70vh)" /></div>
      </div>
      <AdSlot slotId={adsConfig.viewSlotId} className="my-6" />
      <div className="flex flex-col gap-1 px-1 pt-2 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:justify-between"><span>Created {new Date(paste.createdAt).toUTCString()}</span><span>Expires {new Date(paste.expiresAt).toUTCString()}</span></div>
      <DeleteConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDelete} initialToken={initialToken} isDeleting={isDeleting} />
    </main>
  );
};
