interface FooterProps {
  onNavigateHome?: () => void;
  onNavigateAbout?: () => void;
  onNavigatePrivacy?: () => void;
  onNavigateTerms?: () => void;
}

export function Footer({
  onNavigateHome,
  onNavigateAbout,
  onNavigatePrivacy,
  onNavigateTerms,
}: FooterProps) {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-900/40 py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">CodeShare</span>
          <span>&copy; {new Date().getFullYear()}</span>
          <span className="text-slate-600">&bull;</span>
          <span>Anonymous, ephemeral code and text sharing.</span>
        </div>
        <div className="flex items-center gap-4">
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Home
            </button>
          )}
          {onNavigateAbout && (
            <button
              onClick={onNavigateAbout}
              className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              About
            </button>
          )}
          {onNavigatePrivacy && (
            <button
              onClick={onNavigatePrivacy}
              className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
          )}
          {onNavigateTerms && (
            <button
              onClick={onNavigateTerms}
              className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}

