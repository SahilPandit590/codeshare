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
          {onNavigateHome && <button type="button" onClick={onNavigateHome} className="footer-link">Home</button>}
          {onNavigateAbout && <button type="button" onClick={onNavigateAbout} className="footer-link">About</button>}
          {onNavigatePrivacy && <button type="button" onClick={onNavigatePrivacy} className="footer-link">Privacy Policy</button>}
          {onNavigateTerms && <button type="button" onClick={onNavigateTerms} className="footer-link">Terms of Service</button>}
          <a className="footer-link" href="mailto:contact@example.com">Contact</a>
        </nav>
      </div>
      <div className="page-container border-t border-slate-200/70 py-4 text-xs text-slate-500 dark:border-slate-800/70 dark:text-slate-500">© {new Date().getFullYear()} Code Snipper</div>
    </footer>
  );
}
