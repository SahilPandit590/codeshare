import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

interface PrivacyPolicyPageProps {
  onNavigateHome: () => void;
  onNavigateCreate?: () => void;
  onNavigateTerms: () => void;
}

export function PrivacyPolicyPage({ onNavigateHome, onNavigateCreate, onNavigateTerms }: PrivacyPolicyPageProps) {
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
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Last Updated: November 2, 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200">1. Overview and Core Philosophy</h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Code Snipper is designed from the ground up for minimal data collection. We do not require registration, user accounts, email addresses, or personal identity verification. Pastes are shared anonymously and are designed to expire and be purged permanently within 24 hours of creation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200">2. Information We Process</h2>
            <ul className="list-inside list-disc space-y-2 text-sm text-slate-600 dark:text-slate-300">
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
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200">3. Third-Party Advertising &amp; Cookies</h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              This site may display advertisements served by Google AdSense and its advertising partners.
            </p>
            <ul className="list-inside list-disc space-y-2 text-sm text-slate-600 dark:text-slate-300">
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

          <section className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200">4. European Economic Area (EEA) &amp; Consent</h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              For users located in the EEA and UK, Google AdSense uses a Consent Management Platform (CMP) certified by Google and adhering to the IAB TCF framework before serving personalized advertising or reading non-essential cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200">5. Contact &amp; Abuse Reporting</h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              If you discover content on Code Snipper that violates legal statutes or terms of service, please contact our abuse contact immediately:
            </p>
            <div className="rounded border border-amber-200 bg-amber-50 p-3 font-mono text-xs text-amber-700 dark:border-amber-900/40 dark:bg-slate-900 dark:text-amber-300">
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
