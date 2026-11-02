import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

interface AboutPageProps {
  onNavigateHome: () => void;
  onNavigatePrivacy: () => void;
  onNavigateTerms: () => void;
}

export function AboutPage({
  onNavigateHome,
  onNavigatePrivacy,
  onNavigateTerms,
}: AboutPageProps) {
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
            About CodeShare
          </h1>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-200">Our Purpose</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              CodeShare is a lightweight, privacy-centric platform created for developers, engineers, and collaborators who need to share snippets of text, configuration files, and source code quickly and anonymously without creating accounts or leaving a permanent digital footprint.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-200">Key Architecture Principles</h2>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-2">
              <li>
                <strong>Strict 24-Hour Ephemerality:</strong> Every paste is programmatically scheduled for automatic deletion exactly 24 hours after submission. Expired pastes become immediately inaccessible and are purged by scheduled background cleanup jobs.
              </li>
              <li>
                <strong>Zero Accounts &amp; Anonymity:</strong> We do not ask for names, email addresses, phone numbers, or passwords.
              </li>
              <li>
                <strong>Cryptographic Deletion Tokens:</strong> Creators receive a cryptographically secure token that allows voluntary early deletion before the 24-hour expiration window closes.
              </li>
              <li>
                <strong>Raw Data Security:</strong> All shared content is treated strictly as plain text or syntax-highlighted code with zero server-side or client-side execution, preventing Cross-Site Scripting (XSS).
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-200">Publisher Information &amp; Contact</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              CodeShare is maintained by independent open-source software engineers. For administrative inquiries, copyright notices, or abuse reporting, please reach out to our team:
            </p>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 font-mono text-xs text-amber-300 space-y-1">
              <div>[OWNER TO CONFIGURE: Administrative Email: admin@example.com]</div>
              <div>[OWNER TO CONFIGURE: Abuse / Takedown Email: abuse@example.com]</div>
            </div>
          </section>
        </article>
      </main>

      <Footer
        onNavigateHome={onNavigateHome}
        onNavigatePrivacy={onNavigatePrivacy}
        onNavigateTerms={onNavigateTerms}
      />
    </div>
  );
}

