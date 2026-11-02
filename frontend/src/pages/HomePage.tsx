import React, { useState, useMemo } from 'react';
import { SupportedLanguage, CreatePasteResponse } from '@codeshare/shared';
import { Header } from '../components/Header';
import { LanguageSelector } from '../components/LanguageSelector';
import { Editor } from '../components/Editor';
import { StatusBanner } from '../components/StatusBanner';
import { PasteCreatedModal } from '../components/PasteCreatedModal';
import { AdSlot } from '../components/AdSlot';
import { Footer } from '../components/Footer';
import { adsConfig } from '../config/ads';
import { api, ApiError } from '../services/api';
import { Share2, Loader2, Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface HomePageProps {
  onNavigateToPaste: (id: string) => void;
  onNavigateAbout?: () => void;
  onNavigatePrivacy?: () => void;
  onNavigateTerms?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateToPaste,
  onNavigateAbout,
  onNavigatePrivacy,
  onNavigateTerms,
}) => {
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState<SupportedLanguage>('text');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdPaste, setCreatedPaste] = useState<CreatePasteResponse | null>(null);

  // Compute character, byte and line counts
  const stats = useMemo(() => {
    const lines = content.length === 0 ? 0 : content.split('\n').length;
    const chars = content.length;
    const bytes = new Blob([content]).size;
    return { lines, chars, bytes };
  }, [content]);

  const isValidContent = content.trim().length > 0;
  const isTooLarge = stats.bytes > 524288; // 512 KB

  const handleCreate = async () => {
    if (!isValidContent || isTooLarge || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await api.createPaste({
        content,
        language,
      });
      setCreatedPaste(response);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected network error occurred. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setContent('');
    setErrorMessage(null);
    setCreatedPaste(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0d14] text-slate-100">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {/* Error notification */}
        {errorMessage && (
          <div className="mb-4">
            <StatusBanner
              type="error"
              message={errorMessage}
              onClose={() => setErrorMessage(null)}
            />
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 mb-4">
          <div className="flex items-center space-x-3">
            <LanguageSelector
              value={language}
              onChange={setLanguage}
              disabled={isLoading}
            />

            <span className="text-xs text-slate-500 font-mono hidden sm:inline">|</span>

            <div className="text-xs text-slate-400 font-mono flex items-center space-x-3">
              <span>{stats.lines} line{stats.lines === 1 ? '' : 's'}</span>
              <span>{stats.chars} char{stats.chars === 1 ? '' : 's'}</span>
              <span className={isTooLarge ? 'text-red-400 font-bold' : 'text-slate-500'}>
                {(stats.bytes / 1024).toFixed(1)} KB / 512 KB
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {content.length > 0 && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                Clear
              </button>
            )}

            <button
              type="button"
              onClick={handleCreate}
              disabled={!isValidContent || isTooLarge || isLoading}
              className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-500/25 transition-all transform active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Link...</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Create Share Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 min-h-[500px] flex flex-col">
          <Editor
            value={content}
            onChange={setContent}
            language={language}
            readOnly={isLoading}
            minHeight="620px"
          />
        </div>

        {/* Feature badges / info footer */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-400 text-xs">
          <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-200">Strict 24-Hour Expiration</p>
              <p className="text-slate-400 mt-0.5">
                Pastes become inaccessible exactly 24 hours after creation, backed by automated hourly cleanup.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-200">Zero Authentication & Safe</p>
              <p className="text-slate-400 mt-0.5">
                No tracking or accounts. Content is treated as raw data with zero script evaluation.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-200">Early Deletion Capability</p>
              <p className="text-slate-400 mt-0.5">
                Creators receive a private cryptographic token to purge pastes before the 24h window expires.
              </p>
            </div>
          </div>
        </div>

        {/* Responsive Ad Banner below paste creation interface */}
        <AdSlot slotId={adsConfig.homeSlotId} className="my-8" />
      </main>

      {/* Footer */}
      <Footer
        onNavigateAbout={onNavigateAbout}
        onNavigatePrivacy={onNavigatePrivacy}
        onNavigateTerms={onNavigateTerms}
      />

      {/* Modal on success */}
      {createdPaste && (
        <PasteCreatedModal
          paste={createdPaste}
          onClose={() => setCreatedPaste(null)}
          onViewPaste={onNavigateToPaste}
        />
      )}
    </div>
  );
};

