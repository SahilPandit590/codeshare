import { useState, useEffect } from 'react';
import { HomePage } from './pages/HomePage';
import { PasteViewPage } from './pages/PasteViewPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';

type RouteState =
  | { page: 'home' }
  | { page: 'view'; pasteId: string; token?: string }
  | { page: 'about' }
  | { page: 'privacy' }
  | { page: 'terms' };

function resolveRoute(): RouteState {
  const path = window.location.pathname;
  const search = new URLSearchParams(window.location.search);
  const token = search.get('token') || undefined;

  if (path.startsWith('/p/')) {
    const id = path.slice(3).split('/')[0];
    if (id) {
      return { page: 'view', pasteId: id, token };
    }
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

  return { page: 'home' };
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

  const navigateToPaste = (id: string, token?: string) => {
    const url = token ? `/p/${id}?token=${encodeURIComponent(token)}` : `/p/${id}`;
    window.history.pushState({}, '', url);
    setCurrentRoute({ page: 'view', pasteId: id, token });
  };

  const navigateHome = () => {
    window.history.pushState({}, '', '/');
    setCurrentRoute({ page: 'home' });
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

  if (currentRoute.page === 'about') {
    return (
      <AboutPage
        onNavigateHome={navigateHome}
        onNavigatePrivacy={navigatePrivacy}
        onNavigateTerms={navigateTerms}
      />
    );
  }

  if (currentRoute.page === 'privacy') {
    return (
      <PrivacyPolicyPage
        onNavigateHome={navigateHome}
        onNavigateTerms={navigateTerms}
      />
    );
  }

  if (currentRoute.page === 'terms') {
    return (
      <TermsPage
        onNavigateHome={navigateHome}
        onNavigatePrivacy={navigatePrivacy}
      />
    );
  }

  if (currentRoute.page === 'view' && currentRoute.pasteId) {
    return (
      <PasteViewPage
        pasteId={currentRoute.pasteId}
        initialToken={currentRoute.token}
        onNavigateHome={navigateHome}
        onNavigateAbout={navigateAbout}
        onNavigatePrivacy={navigatePrivacy}
        onNavigateTerms={navigateTerms}
      />
    );
  }

  return (
    <HomePage
      onNavigateToPaste={navigateToPaste}
      onNavigateAbout={navigateAbout}
      onNavigatePrivacy={navigatePrivacy}
      onNavigateTerms={navigateTerms}
    />
  );
}
