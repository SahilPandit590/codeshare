import { SMARTLINK_URL } from '../config/ads';

interface FooterProps {
  onNavigateHome?: () => void;
  onNavigateAbout?: () => void;
  onNavigatePrivacy?: () => void;
  onNavigateTerms?: () => void;
}

export function Footer({ onNavigateHome, onNavigateAbout, onNavigatePrivacy, onNavigateTerms }: FooterProps) {
  return (
    <footer className="border-t border-slate-200/80 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/30">
      <div className="page-container flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-slate-950 dark:text-white">Code Snipper</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Anonymous, ephemeral code and text sharing.</p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Footer navigation">
          {onNavigateHome && <a href="/" onClick={(event) => { event.preventDefault(); onNavigateHome(); }} className="footer-link">Home</a>}
          {onNavigateAbout && <a href="/about" onClick={(event) => { event.preventDefault(); onNavigateAbout(); }} className="footer-link">About</a>}
          <a href="/features" className="footer-link">Features</a>
          <a href="/how-it-works" className="footer-link">How it works</a>
          <a href="/faq" className="footer-link">FAQ</a>
          <a href="/online-code-sharing" className="footer-link">Online code sharing</a>
          <a href="/pastebin-alternative" className="footer-link">Pastebin alternative</a>
          {onNavigatePrivacy && <a href="/privacy" onClick={(event) => { event.preventDefault(); onNavigatePrivacy(); }} className="footer-link">Privacy Policy</a>}
          {onNavigateTerms && <a href="/terms" onClick={(event) => { event.preventDefault(); onNavigateTerms(); }} className="footer-link">Terms of Service</a>}
          <a href={SMARTLINK_URL} target="_blank" rel="noopener noreferrer" className="footer-link">Sponsored · Support us</a>
          <a className="footer-link" href="mailto:contact@example.com">Contact</a>
        </nav>
      </div>
      <div className="page-container border-t border-slate-200/70 py-4 text-xs text-slate-500 dark:border-slate-800/70 dark:text-slate-500">© {new Date().getFullYear()} Code Snipper</div>
    </footer>
  );
}
