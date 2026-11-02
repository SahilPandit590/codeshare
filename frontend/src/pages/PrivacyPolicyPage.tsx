import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

interface PrivacyPolicyPageProps {
  onNavigateHome: () => void;
  onNavigateTerms: () => void;
}

export function PrivacyPolicyPage({ onNavigateHome, onNavigateTerms }: PrivacyPolicyPageProps) {
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
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Last Updated: November 2, 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-200">1. Overview and Core Philosophy</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              CodeShare is designed from the ground up for minimal data collection. We do not require registration, user accounts, email addresses, or personal identity verification. Pastes are shared anonymously and are designed to expire and be purged permanently within 24 hours of creation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-200">2. Information We Process</h2>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-2">
              <li>
                <strong>Paste Content:</strong> The text or code you submit is stored ephemerally with a cryptographic hash of your deletion token. It is purged permanently within 24 hours.
              </li>
              <li>
                <strong>IP Addresses &amp; Security Logs:</strong> IP addresses are processed transiently in memory to enforce rate limits and prevent denial-of-service abuse. We do not correlate IP addresses with user identities.
              </li>
              <li>
                <strong>Deletion Tokens:</strong> A cryptographic SHA-256 hash of your deletion token is saved to allow voluntary early deletion. Raw deletion tokens are never stored in our database.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-200">3. Third-Party Advertising &amp; Cookies</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              This site may display advertisements served by Google AdSense and its advertising partners.
            </p>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-2">
              <li>
                Third-party vendors, including Google, use cookies to serve ads based on prior visits to this website or other websites.
              </li>
              <li>
                Google&apos;s use of advertising cookies enables it and its partners to serve ads to users based on their visit to your sites and/or other sites on the Internet.
              </li>
              <li>
                Users may opt out of personalized advertising by visiting{' '}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline"
                >
                  Google Ads Settings
                </a>
                .
              </li>
            </ul>
          </section>

          <section className="space-y-3 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
            <h2 className="text-xl font-semibold text-slate-200">4. European Economic Area (EEA) &amp; Consent</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              For users located in the EEA and UK, Google AdSense uses a Consent Management Platform (CMP) certified by Google and adhering to the IAB TCF framework before serving personalized advertising or reading non-essential cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-200">5. Contact &amp; Abuse Reporting</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              If you discover content on CodeShare that violates legal statutes or terms of service, please contact our abuse contact immediately:
            </p>
            <div className="bg-slate-900 p-3 rounded font-mono text-xs text-amber-300 border border-amber-900/40">
              [OWNER TO CONFIGURE: Contact email for privacy and abuse inquiries: contact@example.com]
            </div>
          </section>
        </article>
      </main>

      <Footer
        onNavigateHome={onNavigateHome}
        onNavigateTerms={onNavigateTerms}
      />
    </div>
  );
}

