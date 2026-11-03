import { useState, useEffect, type ReactNode } from 'react';
import { HomePage } from './pages/HomePage';
import { PasteViewPage } from './pages/PasteViewPage';
import { SnippetSharePage } from './pages/SnippetSharePage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { CreatePastePage } from './pages/CreatePastePage';
import { InformationalPage, type InformationalPageKind } from './pages/InformationalPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ThemeProvider } from './contexts/ThemeContext';
import { applySeoMetadata, getSeoMetadata } from './seo';

type RouteState =
  | { page: 'home' }
  | { page: 'create' }
  | { page: 'view'; pasteId: string; token?: string }
  | { page: 'snippet'; snippetId: string }
  | { page: 'about' }
  | { page: 'privacy' }
  | { page: 'terms' }
  | { page: 'informational'; kind: InformationalPageKind }
  | { page: 'not-found' };

function resolveRoute(): RouteState {
  const path = window.location.pathname.length > 1
    ? window.location.pathname.replace(/\/+$/, '')
    : window.location.pathname;
  const search = new URLSearchParams(window.location.search);
  const token = search.get('token') || undefined;

  if (path.startsWith('/p/')) {
    const id = path.slice(3).split('/')[0];
    if (id) {
      return { page: 'view', pasteId: id, token };
    }
  }

  if (path.startsWith('/s/')) {
    const id = path.slice(3).split('/')[0];
    if (id) {
      return { page: 'snippet', snippetId: id };
    }
  }

  if (path === '/create') {
    return { page: 'create' };
  }

  if (path === '/about') {
    return { page: 'about' };
  }

  if (path === '/privacy') {
    return { page: 'privacy' };
  }

  if (path === '/terms') {
    return { page: 'terms' };
  }

  const informationalPaths: Record<string, InformationalPageKind> = {
    '/features': 'features',
    '/how-it-works': 'how-it-works',
    '/faq': 'faq',
    '/online-code-sharing': 'online-code-sharing',
    '/share-code-online': 'share-code-online',
    '/online-code-snippets': 'online-code-snippets',
    '/pastebin-alternative': 'pastebin-alternative',
  };

  if (informationalPaths[path]) {
    return { page: 'informational', kind: informationalPaths[path] };
  }

  if (path === '/') return { page: 'home' };
  return { page: 'not-found' };
}

export function App() {
  const [currentRoute, setCurrentRoute] = useState<RouteState>(resolveRoute);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(resolveRoute());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    applySeoMetadata(getSeoMetadata(window.location.pathname));
  }, [currentRoute]);

  const navigateToPaste = (id: string, token?: string) => {
    // Keep a creator's token in React memory only. It is never added to the URL.
    const url = `/p/${id}`;
    window.history.pushState({}, '', url);
    setCurrentRoute({ page: 'view', pasteId: id, token });
  };

  const navigateHome = () => {
    window.history.pushState({}, '', '/');
    setCurrentRoute({ page: 'home' });
  };

  const navigateCreate = () => {
    window.history.pushState({}, '', '/create');
    setCurrentRoute({ page: 'create' });
  };

  const navigateAbout = () => {
    window.history.pushState({}, '', '/about');
    setCurrentRoute({ page: 'about' });
  };

  const navigatePrivacy = () => {
    window.history.pushState({}, '', '/privacy');
    setCurrentRoute({ page: 'privacy' });
  };

  const navigateTerms = () => {
    window.history.pushState({}, '', '/terms');
    setCurrentRoute({ page: 'terms' });
  };

  let page: ReactNode;

  if (currentRoute.page === 'about') {
    page = <AboutPage onNavigateHome={navigateHome} onNavigateCreate={navigateCreate} onNavigatePrivacy={navigatePrivacy} onNavigateTerms={navigateTerms} />;
  } else if (currentRoute.page === 'privacy') {
    page = <PrivacyPolicyPage onNavigateHome={navigateHome} onNavigateCreate={navigateCreate} onNavigateTerms={navigateTerms} />;
  } else if (currentRoute.page === 'terms') {
    page = <TermsPage onNavigateHome={navigateHome} onNavigateCreate={navigateCreate} onNavigatePrivacy={navigatePrivacy} />;
  } else if (currentRoute.page === 'informational') {
    page = (
      <InformationalPage
        kind={currentRoute.kind}
        onNavigateHome={navigateHome}
        onNavigateCreate={navigateCreate}
        onNavigateAbout={navigateAbout}
        onNavigatePrivacy={navigatePrivacy}
        onNavigateTerms={navigateTerms}
      />
    );
  } else if (currentRoute.page === 'create') {
    page = (
      <CreatePastePage
        onNavigateHome={navigateHome}
        onNavigateCreate={navigateCreate}
        onNavigateToPaste={navigateToPaste}
        onNavigateAbout={navigateAbout}
        onNavigatePrivacy={navigatePrivacy}
        onNavigateTerms={navigateTerms}
      />
    );
  } else if (currentRoute.page === 'view' && currentRoute.pasteId) {
    page = (
      <PasteViewPage
        pasteId={currentRoute.pasteId}
        initialToken={currentRoute.token}
        onNavigateHome={navigateHome}
        onNavigateCreate={navigateCreate}
        onNavigateAbout={navigateAbout}
        onNavigatePrivacy={navigatePrivacy}
        onNavigateTerms={navigateTerms}
      />
    );
  } else if (currentRoute.page === 'snippet' && currentRoute.snippetId) {
    page = (
      <SnippetSharePage
        snippetId={currentRoute.snippetId}
        onNavigateHome={navigateHome}
        onNavigateCreate={navigateCreate}
        onNavigateAbout={navigateAbout}
        onNavigatePrivacy={navigatePrivacy}
        onNavigateTerms={navigateTerms}
      />
    );
  } else if (currentRoute.page === 'not-found') {
    page = <NotFoundPage onNavigateHome={navigateHome} onNavigateCreate={navigateCreate} />;
  } else {
    page = (
      <HomePage
        onNavigateToPaste={navigateToPaste}
        onNavigateCreate={navigateCreate}
        onNavigateAbout={navigateAbout}
        onNavigatePrivacy={navigatePrivacy}
        onNavigateTerms={navigateTerms}
      />
    );
  }

  return <ThemeProvider>{page}</ThemeProvider>;
}
