import React from 'react';
import { ArrowRight, Clock3, Code2, Link2, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AdSlot } from '../components/AdSlot';
import { adsConfig } from '../config/ads';

interface HomePageProps {
  onNavigateToPaste: (id: string) => void;
  onNavigateCreate?: () => void;
  onNavigateAbout?: () => void;
  onNavigatePrivacy?: () => void;
  onNavigateTerms?: () => void;
}

const features = [
  { icon: UserRound, title: 'No account required', text: 'Share immediately without signing up or handing over personal details.' },
  { icon: Link2, title: 'One simple link', text: 'A clean URL makes it easy to send code to a teammate or move between devices.' },
  { icon: Clock3, title: 'Expires after 24 hours', text: 'Every paste is temporary by design and automatically becomes inaccessible.' },
  { icon: Trash2, title: 'Delete it early', text: 'Keep the private deletion token and remove a paste whenever you need to.' },
  { icon: Code2, title: 'Developer-friendly', text: 'Use syntax highlighting for popular languages or share plain text and logs.' },
];

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateCreate,
  onNavigateAbout,
  onNavigatePrivacy,
  onNavigateTerms,
}) => {
  const create = onNavigateCreate ?? (() => undefined);

  return (
    <div className="app-shell">
      <Header
        onNavigateHome={() => undefined}
        onNavigateCreate={create}
        onNavigateAbout={onNavigateAbout}
      />

      <main className="flex-1">
        <section className="page-container relative overflow-hidden pb-16 pt-16 sm:pb-24 sm:pt-24">
          <div className="pointer-events-none absolute -right-20 top-12 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/10" />
          <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-2xl">
              <div className="eyebrow inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Fast, private, temporary sharing
              </div>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl dark:text-white">
                Share code and text with a link that stays simple.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                CodeShare turns a snippet, log, or note into a clean shareable link in seconds. No account. No clutter. Automatically gone after 24 hours.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={create} className="button-primary justify-center px-5 py-3 text-sm">
                  Create a paste <ArrowRight className="h-4 w-4" />
                </button>
                <a href="#how-it-works" className="button-secondary justify-center px-5 py-3 text-sm">
                  How it works
                </a>
              </div>
              <p className="mt-5 text-xs text-slate-500 dark:text-slate-500">
                Built for quick collaboration · 512 KB per paste · 24-hour expiry
              </p>
            </div>

            <div className="surface-card relative mx-auto w-full max-w-md p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <Code2 className="h-4 w-4" />
                  </div>
                  New paste
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Ready in seconds</span>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950 shadow-sm dark:border-slate-700">
                <div className="flex items-center gap-1.5 border-b border-slate-800 px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-slate-600" /><span className="h-2 w-2 rounded-full bg-slate-600" /><span className="h-2 w-2 rounded-full bg-slate-600" />
                  <span className="ml-auto font-mono text-[10px] text-slate-500">javascript</span>
                </div>
                <pre className="overflow-hidden p-5 text-xs leading-7 text-slate-300"><code><span className="text-blue-400">const</span> link = <span className="text-amber-300">await</span> share({'{'}
  content: snippet,
  expires: <span className="text-emerald-300">'24h'</span>
{'}'});</code></pre>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3 text-xs text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                Your deletion token is shown only once.
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-slate-200/80 bg-slate-50/80 py-14 dark:border-slate-800 dark:bg-slate-900/30 sm:py-16">
          <div className="page-container">
            <div className="max-w-xl">
              <p className="eyebrow">How it works</p>
              <h2 className="section-title">From blank page to shared link.</h2>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                ['01', 'Write or paste', 'Drop in your code, text, logs, or notes.'],
                ['02', 'Generate a link', 'Choose a language and create your temporary paste.'],
                ['03', 'Share anywhere', 'Send the link knowing it will expire automatically.'],
              ].map(([number, title, text]) => (
                <div key={number} className="surface-card p-5">
                  <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">{number}</span>
                  <h3 className="mt-5 text-base font-semibold text-slate-950 dark:text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="page-container py-14 sm:py-16">
          <div className="max-w-xl">
            <p className="eyebrow">Designed for sharing</p>
            <h2 className="section-title">Everything you need. Nothing in the way.</h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-transparent p-4 transition-colors hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-800 dark:hover:bg-slate-900/50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400"><Icon className="h-5 w-5" /></div>
                <div><h3 className="font-semibold text-slate-950 dark:text-white">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{text}</p></div>
              </div>
            ))}
          </div>
        </section>

        <AdSlot slotId={adsConfig.homeSlotId} className="mb-10" />
      </main>

      <Footer
        onNavigateHome={() => undefined}
        onNavigateAbout={onNavigateAbout}
        onNavigatePrivacy={onNavigatePrivacy}
        onNavigateTerms={onNavigateTerms}
      />
    </div>
  );
};
