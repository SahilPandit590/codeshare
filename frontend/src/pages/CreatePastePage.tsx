import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { PasteComposer } from '../components/PasteComposer';
import { AdSlot } from '../components/AdSlot';
import { adsConfig } from '../config/ads';

interface CreatePastePageProps {
  onNavigateHome: () => void;
  onNavigateCreate?: () => void;
  onNavigateToPaste: (id: string) => void;
  onNavigateAbout?: () => void;
  onNavigatePrivacy?: () => void;
  onNavigateTerms?: () => void;
}

export function CreatePastePage({
  onNavigateHome,
  onNavigateCreate,
  onNavigateToPaste,
  onNavigateAbout,
  onNavigatePrivacy,
  onNavigateTerms,
}: CreatePastePageProps) {
  return (
    <div className="app-shell">
      <Header onNavigateHome={onNavigateHome} onNavigateCreate={onNavigateCreate} onNavigateAbout={onNavigateAbout} />
      <main className="page-container flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 max-w-2xl">
            <button type="button" onClick={onNavigateHome} className="back-link">← Back to home</button>
            <p className="eyebrow mt-6">Share in seconds</p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              No account, setup, or formatting required. Add your content, choose a language, and get one clean link.
            </p>
          </div>
          <PasteComposer onNavigateToPaste={onNavigateToPaste} />
          <AdSlot slotId={adsConfig.homeSlotId} className="mt-8" />
        </div>
      </main>
      <Footer
        onNavigateHome={onNavigateHome}
        onNavigateAbout={onNavigateAbout}
        onNavigatePrivacy={onNavigatePrivacy}
        onNavigateTerms={onNavigateTerms}
      />
    </div>
  );
}
