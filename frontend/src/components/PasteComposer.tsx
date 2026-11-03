import { useMemo, useState } from 'react';
import { CreateSnippetResponse, SupportedLanguage } from '@codeshare/shared';
import { Loader2, Share2, Trash2 } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { LazyEditor } from './LazyEditor';
import { StatusBanner } from './StatusBanner';
import { PasteCreatedModal } from './PasteCreatedModal';
import { api, ApiError } from '../services/api';

interface PasteComposerProps {
  onNavigateToPaste: (id: string) => void;
}

export function PasteComposer({ onNavigateToPaste }: PasteComposerProps) {
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState<SupportedLanguage>('text');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdPaste, setCreatedPaste] = useState<CreateSnippetResponse | null>(null);

  const stats = useMemo(() => {
    const lines = content.length === 0 ? 0 : content.split('\n').length;
    return { lines, chars: content.length, bytes: new Blob([content]).size };
  }, [content]);

  const isValidContent = content.trim().length > 0;
  const isTooLarge = stats.bytes > 524288;

  const handleCreate = async () => {
    if (!isValidContent || isTooLarge || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      setCreatedPaste(await api.createSnippet({ code: content, language }));
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError
          ? err.message
          : 'An unexpected network error occurred. Please check your connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setContent('');
    setErrorMessage(null);
    setCreatedPaste(null);
  };

  return (
    <>
      {errorMessage && (
        <StatusBanner type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />
      )}

      <section className="surface-card overflow-hidden" aria-labelledby="composer-title">
        <div className="border-b border-slate-200/80 px-4 py-4 dark:border-slate-800 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow">New paste</p>
              <h1 id="composer-title" className="mt-1 text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
                Write or paste your content
              </h1>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 sm:justify-end">
              <LanguageSelector value={language} onChange={setLanguage} disabled={isLoading} />
              <span className="hidden h-4 w-px bg-slate-200 dark:bg-slate-700 sm:block" />
              <span className={isTooLarge ? 'font-medium text-red-600 dark:text-red-400' : ''}>
                {stats.lines} lines · {(stats.bytes / 1024).toFixed(1)} / 512 KB
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-5">
          <LazyEditor
            value={content}
            onChange={setContent}
            language={language}
            readOnly={isLoading}
            minHeight="min(620px, 62vh)"
            placeholder="Paste code, logs, notes, or any text you want to share..."
          />
          <p className="mt-3 text-xs leading-5 text-amber-700 dark:text-amber-300">
            Do not paste passwords, API keys, private credentials, or other sensitive secrets.
          </p>
          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>{stats.chars.toLocaleString()} characters</span>
              <span aria-hidden="true">·</span>
              <span>Expires automatically in 24 hours</span>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              {content.length > 0 && (
                <button type="button" onClick={reset} disabled={isLoading} className="button-secondary flex-1 sm:flex-none">
                  <Trash2 className="h-4 w-4" />
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={handleCreate}
                disabled={!isValidContent || isTooLarge || isLoading}
                className="button-primary flex-1 sm:flex-none"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                {isLoading ? 'Creating link…' : 'Create a paste'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {createdPaste && (
        <PasteCreatedModal
          paste={createdPaste}
          onClose={() => setCreatedPaste(null)}
          onViewPaste={onNavigateToPaste}
        />
      )}
    </>
  );
}
