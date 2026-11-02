import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

interface TermsPageProps {
  onNavigateHome: () => void;
  onNavigatePrivacy: () => void;
}

export function TermsPage({ onNavigateHome, onNavigatePrivacy }: TermsPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header onNewPaste={onNavigateHome} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10">
        <div className="mb-6">
          <button
            onClick={onNavigateHome}
            className="text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            &larr; Back to CodeShare
          </button>
        </div>

        <article className="prose prose-invert prose-slate max-w-none space-y-6">
          <h1 className="text-3xl font-bold tracking-tight text-white border-b border-slate-800 pb-4">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Last Updated: November 2, 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-200">1. Acceptance of Terms</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              By accessing or using CodeShare, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not access or use the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-200">2. Description of Service</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              CodeShare provides temporary, anonymous text and source code sharing. All content submitted to the service is ephemeral and will expire and be purged automatically 24 hours after creation. You are solely responsible for keeping backups of any data you submit.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-200">3. Prohibited Conduct and Content</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              You agree not to post, transmit, or share any content that:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-2">
              <li>Is illegal, defamatory, abusive, or promotes unlawful activity.</li>
              <li>Contains malicious software, exploits, ransomware, or botnet command keys.</li>
              <li>Infringes upon any copyright, trademark, trade secret, or other proprietary rights.</li>
              <li>Contains unauthorized disclosures of personally identifiable information (PII) or confidential credentials.</li>
              <li>Attempts to bypass or disrupt server rate limits, capacity constraints, or infrastructure stability.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-200">4. Disclaimer of Warranties &amp; Limitation of Liability</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              The service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. CodeShare disclaims all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement. In no event shall CodeShare or its operators be liable for lost data, lost profits, or consequential damages.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-200">5. Takedown and Abuse Requests</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              We respond promptly to valid intellectual property takedown and abuse reports. To request content removal, contact our abuse desk:
            </p>
            <div className="bg-slate-900 p-3 rounded font-mono text-xs text-amber-300 border border-amber-900/40">
              [OWNER TO CONFIGURE: Takedown and DMCA notice email: abuse@example.com]
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

