import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

interface TermsPageProps {
  onNavigateHome: () => void;
  onNavigateCreate?: () => void;
  onNavigatePrivacy: () => void;
}

export function TermsPage({ onNavigateHome, onNavigateCreate, onNavigatePrivacy }: TermsPageProps) {
  return (
    <div className="app-shell">
      <Header onNavigateHome={onNavigateHome} onNavigateCreate={onNavigateCreate} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10">
        <div className="mb-6">
          <button
            onClick={onNavigateHome}
            className="back-link"
          >
            &larr; Back to Code Snipper
          </button>
        </div>

        <article className="prose prose-invert prose-slate max-w-none space-y-6">
          <h1 className="border-b border-slate-200 pb-4 text-3xl font-bold tracking-tight text-slate-950 dark:border-slate-800 dark:text-white">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Last Updated: November 2, 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200">1. Acceptance of Terms</h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              By accessing or using Code Snipper, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not access or use the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200">2. Description of Service</h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Code Snipper provides temporary, anonymous text and source code sharing. All content submitted to the service is ephemeral and will expire and be purged automatically 24 hours after creation. You are solely responsible for keeping backups of any data you submit.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200">3. Prohibited Conduct and Content</h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              You agree not to post, transmit, or share any content that:
            </p>
            <ul className="list-inside list-disc space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>Is illegal, defamatory, abusive, or promotes unlawful activity.</li>
              <li>Contains malicious software, exploits, ransomware, or botnet command keys.</li>
              <li>Infringes upon any copyright, trademark, trade secret, or other proprietary rights.</li>
              <li>Contains unauthorized disclosures of personally identifiable information (PII) or confidential credentials.</li>
              <li>Attempts to bypass or disrupt server rate limits, capacity constraints, or infrastructure stability.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200">4. Disclaimer of Warranties &amp; Limitation of Liability</h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. Code Snipper disclaims all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement. In no event shall Code Snipper or its operators be liable for lost data, lost profits, or consequential damages.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200">5. Takedown and Abuse Requests</h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              We respond promptly to valid intellectual property takedown and abuse reports. To request content removal, contact our abuse desk:
            </p>
            <div className="rounded border border-amber-200 bg-amber-50 p-3 font-mono text-xs text-amber-700 dark:border-amber-900/40 dark:bg-slate-900 dark:text-amber-300">
              Takedown and DMCA notice email: sahilpandit590@gmail.com
            </div>
          </section>
        </article>
      </main>

      <Footer
        onNavigateHome={onNavigateHome}
        onNavigatePrivacy={onNavigatePrivacy}
      />
    </div>
  );
}
