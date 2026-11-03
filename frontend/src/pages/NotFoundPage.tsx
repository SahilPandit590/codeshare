import { Footer } from '../components/Footer';
import { Header } from '../components/Header';

interface NotFoundPageProps {
  onNavigateHome: () => void;
  onNavigateCreate: () => void;
}

export function NotFoundPage({ onNavigateHome, onNavigateCreate }: NotFoundPageProps) {
  return (
    <div className="app-shell">
      <Header onNavigateHome={onNavigateHome} onNavigateCreate={onNavigateCreate} />
      <main className="page-container flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">404</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">Page not found</h1>
          <p className="mt-5 text-slate-600 dark:text-slate-400">That Code Snipper page does not exist or is no longer available.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="/" onClick={(event) => { event.preventDefault(); onNavigateHome(); }} className="button-primary justify-center">Go home</a>
            <a href="/create" onClick={(event) => { event.preventDefault(); onNavigateCreate(); }} className="button-secondary justify-center">Create a paste</a>
          </div>
        </div>
      </main>
      <Footer onNavigateHome={onNavigateHome} />
    </div>
  );
}
