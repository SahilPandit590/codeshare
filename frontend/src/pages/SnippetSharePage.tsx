import React, { useEffect, useState } from 'react';
import { AlertTriangle, Check, Clock, Copy, FileX, Hourglass, Loader2, Plus } from 'lucide-react';
import { GetSnippetResponse, LANGUAGE_LABELS } from '@codeshare/shared';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Editor } from '../components/Editor';
import { AdSlot } from '../components/AdSlot';
import { adsConfig } from '../config/ads';
import { useClipboard } from '../hooks/useClipboard';
import { api, ApiError } from '../services/api';

interface SnippetSharePageProps {
  snippetId: string;
  onNavigateHome: () => void;
  onNavigateCreate?: () => void;
  onNavigateAbout?: () => void;
  onNavigatePrivacy?: () => void;
  onNavigateTerms?: () => void;
}

function StateCard({
  title,
  message,
  icon,
  onNavigateHome,
}: {
  title: string;
  message: string;
  icon: React.ReactNode;
  onNavigateHome: () => void;
}) {
  return (
    <main className="page-container flex flex-1 items-center justify-center py-12">
      <div className="surface-card w-full max-w-md p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400">{icon}</div>
        <h1 className="mt-5 text-xl font-bold tracking-tight text-slate-950 dark:text-white">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{message}</p>
        <button type="button" onClick={onNavigateHome} className="button-primary mt-6 w-full justify-center">
          <Plus className="h-4 w-4" /> Create a new paste
        </button>
      </div>
    </main>
  );
}

export const SnippetSharePage: React.FC<SnippetSharePageProps> = ({
  snippetId,
  onNavigateHome,
  onNavigateCreate,
  onNavigateAbout,
  onNavigatePrivacy,
  onNavigateTerms,
}) => {
  const [snippet, setSnippet] = useState<GetSnippetResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { copy, copied } = useClipboard();

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setErrorStatus(null);
    setErrorMessage(null);

    api.getSnippet(snippetId).then((data) => {
      if (mounted) {
        setSnippet(data);
        setIsLoading(false);
      }
    }).catch((error: unknown) => {
      if (!mounted) return;
      setIsLoading(false);
      if (error instanceof ApiError) {
        setErrorStatus(error.status);
        setErrorMessage(error.message);
      } else {
        setErrorStatus(503);
        setErrorMessage('CodeShare is temporarily unavailable. Please try again in a moment.');
      }
    });

    return () => {
      mounted = false;
    };
  }, [snippetId]);

  const shell = (content: React.ReactNode) => (
    <div className="app-shell">
      <Header onNavigateHome={onNavigateHome} onNavigateCreate={onNavigateCreate} showNewButton onNavigateAbout={onNavigateAbout} />
      {content}
      <Footer onNavigateHome={onNavigateHome} onNavigateAbout={onNavigateAbout} onNavigatePrivacy={onNavigatePrivacy} onNavigateTerms={onNavigateTerms} />
    </div>
  );

  if (isLoading) {
    return shell(
      <main className="flex flex-1 flex-col items-center justify-center gap-3 py-20">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading shared snippet…</p>
      </main>,
    );
  }
  if (errorStatus === 404 || errorStatus === 400) {
    return shell(<StateCard title="Snippet Not Found" message="This share link is invalid or the snippet has been removed." icon={<FileX className="h-7 w-7" />} onNavigateHome={onNavigateHome} />);
  }
  if (errorStatus === 410) {
    return shell(<StateCard title="Snippet Expired" message="This snippet reached its 24-hour expiration limit and is no longer accessible." icon={<Hourglass className="h-7 w-7" />} onNavigateHome={onNavigateHome} />);
  }
  if (errorMessage && !snippet) {
    return shell(<StateCard title="Unable to Load Snippet" message={errorMessage} icon={<AlertTriangle className="h-7 w-7" />} onNavigateHome={onNavigateHome} />);
  }
  if (!snippet) return null;

  return shell(
    <main className="page-container flex-1 py-6 sm:py-8">
      <div className="surface-card overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-200/80 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400">{LANGUAGE_LABELS[snippet.language] || snippet.language}</span>
            <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300"><Clock className="h-3.5 w-3.5" /> Read-only share</span>
          </div>
          <button type="button" onClick={() => void copy(snippet.code)} className={copied ? 'button-primary bg-emerald-600 hover:bg-emerald-500' : 'button-secondary'}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy code'}
          </button>
        </div>
        <div className="p-3 sm:p-5"><Editor value={snippet.code} language={snippet.language} readOnly minHeight="min(620px, 70vh)" /></div>
      </div>
      <AdSlot slotId={adsConfig.viewSlotId} className="my-6" />
      <p className="px-1 pt-2 text-xs text-slate-500 dark:text-slate-400">Created {new Date(snippet.createdAt).toUTCString()} · Expires {new Date(snippet.expiresAt).toUTCString()}</p>
    </main>,
  );
};
