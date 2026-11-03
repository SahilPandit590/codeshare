export const SITE_ORIGIN = 'https://snipper.work.gd';

export interface SeoMetadata {
  title: string;
  description: string;
  path: string;
  robots: 'index,follow' | 'noindex,follow' | 'noindex,nofollow';
}

const PUBLIC_PAGE_METADATA: Record<string, SeoMetadata> = {
  '/': {
    title: 'Code Snipper – Share Code Snippets Online Instantly',
    description: 'Create, store and share code snippets online with Code Snipper. Paste your code, generate a temporary link and send it to anyone.',
    path: '/',
    robots: 'index,follow',
  },
  '/about': {
    title: 'About Code Snipper – Temporary Code Sharing',
    description: 'Learn how Code Snipper provides simple, anonymous and temporary sharing for code snippets, logs, notes and plain text.',
    path: '/about',
    robots: 'index,follow',
  },
  '/privacy': {
    title: 'Privacy Policy – Code Snipper',
    description: 'Read the Code Snipper privacy policy, including temporary paste storage, deletion tokens, rate limiting and advertising disclosures.',
    path: '/privacy',
    robots: 'index,follow',
  },
  '/terms': {
    title: 'Terms of Service – Code Snipper',
    description: 'Review the Code Snipper terms for temporary, anonymous code and text sharing.',
    path: '/terms',
    robots: 'index,follow',
  },
  '/features': {
    title: 'Code Snipper Features – Fast, Temporary Code Sharing',
    description: 'Explore Code Snipper features: anonymous sharing, syntax highlighting, 24-hour expiry, deletion links and safe read-only rendering.',
    path: '/features',
    robots: 'index,follow',
  },
  '/how-it-works': {
    title: 'How Code Snipper Works – Create and Share Code Links',
    description: 'See how to paste code, choose a language, create a temporary sharing link and share it with teammates in seconds.',
    path: '/how-it-works',
    robots: 'index,follow',
  },
  '/faq': {
    title: 'Code Snipper FAQ – Online Code Sharing Questions',
    description: 'Answers about Code Snipper paste expiry, supported languages, privacy, deletion links, limits and sharing code without an account.',
    path: '/faq',
    robots: 'index,follow',
  },
  '/online-code-sharing': {
    title: 'Online Code Sharing Without Signup – Code Snipper',
    description: 'Share source code, logs and notes online without creating an account. Code Snipper creates a simple link and removes pastes after 24 hours.',
    path: '/online-code-sharing',
    robots: 'index,follow',
  },
  '/share-code-online': {
    title: 'Share Code Online in Seconds – Code Snipper',
    description: 'Paste code online, select a language and send a clean sharing link to a teammate, support agent or another device.',
    path: '/share-code-online',
    robots: 'index,follow',
  },
  '/online-code-snippets': {
    title: 'Online Code Snippets for Developers – Code Snipper',
    description: 'Create temporary online code snippets with syntax highlighting for JavaScript, TypeScript, Python, Java, C, C++, HTML, CSS and more.',
    path: '/online-code-snippets',
    robots: 'index,follow',
  },
  '/pastebin-alternative': {
    title: 'Pastebin Alternative for Temporary Code Sharing – Code Snipper',
    description: 'Compare Code Snipper with traditional paste tools: no signup, 512 KB pastes, syntax highlighting, simple links and automatic 24-hour expiry.',
    path: '/pastebin-alternative',
    robots: 'index,follow',
  },
  '/create': {
    title: 'Create a Code Snippet – Code Snipper',
    description: 'Create a temporary code or text sharing link with Code Snipper.',
    path: '/create',
    robots: 'noindex,follow',
  },
};

export function getSeoMetadata(pathname: string): SeoMetadata {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (PUBLIC_PAGE_METADATA[normalizedPath]) return PUBLIC_PAGE_METADATA[normalizedPath];

  const sharedMatch = normalizedPath.match(/^\/(p|s)\/([A-Za-z0-9_-]+)/);
  if (sharedMatch) {
    return {
      title: 'Shared Code Snippet – Code Snipper',
      description: 'A temporary code or text snippet shared through Code Snipper.',
      path: `/${sharedMatch[1]}/${sharedMatch[2]}`,
      robots: 'noindex,nofollow',
    };
  }

  return {
    title: 'Page Not Found – Code Snipper',
    description: 'The requested Code Snipper page could not be found.',
    path: normalizedPath,
    robots: 'noindex,nofollow',
  };
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function upsertCanonical(url: string): void {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }
  element.href = url;
}

function getStructuredData(metadata: SeoMetadata): unknown[] {
  if (metadata.robots.startsWith('noindex')) return [];

  const canonicalUrl = `${SITE_ORIGIN}${metadata.path === '/' ? '/' : metadata.path}`;
  const breadcrumb = metadata.path === '/' ? null : {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Code Snipper', item: `${SITE_ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name: metadata.title.split(' – ')[0], item: canonicalUrl },
    ],
  };

  if (metadata.path === '/') {
    return [
      {
        '@type': 'WebSite',
        '@id': `${SITE_ORIGIN}/#website`,
        url: `${SITE_ORIGIN}/`,
        name: 'Code Snipper',
        description: metadata.description,
      },
      {
        '@type': 'WebApplication',
        '@id': `${SITE_ORIGIN}/#application`,
        name: 'Code Snipper',
        url: `${SITE_ORIGIN}/`,
        description: metadata.description,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web',
      },
    ];
  }

  if (metadata.path === '/faq') {
    return [
      breadcrumb,
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'Do I need an account to use Code Snipper?', acceptedAnswer: { '@type': 'Answer', text: 'No. Code Snipper lets you create and share temporary code snippets without an account.' } },
          { '@type': 'Question', name: 'How long do Code Snipper snippets last?', acceptedAnswer: { '@type': 'Answer', text: 'Snippets are designed to expire and become inaccessible 24 hours after creation.' } },
          { '@type': 'Question', name: 'Does Code Snipper execute pasted code?', acceptedAnswer: { '@type': 'Answer', text: 'No. Code Snipper displays pasted content as text or syntax-highlighted code and does not execute it.' } },
        ],
      },
    ].filter(Boolean);
  }

  return breadcrumb ? [breadcrumb] : [];
}

export function applySeoMetadata(metadata: SeoMetadata): void {
  if (typeof document === 'undefined') return;

  const canonicalUrl = `${SITE_ORIGIN}${metadata.path === '/' ? '/' : metadata.path}`;
  document.title = metadata.title;
  upsertMeta('name', 'description', metadata.description);
  upsertMeta('name', 'robots', metadata.robots);
  upsertMeta('property', 'og:url', canonicalUrl);
  upsertMeta('property', 'og:title', metadata.title);
  upsertMeta('property', 'og:description', metadata.description);
  upsertMeta('name', 'twitter:title', metadata.title);
  upsertMeta('name', 'twitter:description', metadata.description);
  upsertCanonical(canonicalUrl);

  const existing = document.head.querySelector<HTMLScriptElement>('#structured-data');
  const structuredData = document.createElement('script');
  structuredData.id = 'structured-data';
  structuredData.type = 'application/ld+json';
  structuredData.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': getStructuredData(metadata),
  });
  existing?.remove();
  document.head.appendChild(structuredData);
}
