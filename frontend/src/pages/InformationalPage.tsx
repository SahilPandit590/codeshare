import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import type { ReactNode } from 'react';

export type InformationalPageKind =
  | 'features'
  | 'how-it-works'
  | 'faq'
  | 'online-code-sharing'
  | 'share-code-online'
  | 'online-code-snippets'
  | 'pastebin-alternative';

interface InformationalPageProps {
  kind: InformationalPageKind;
  onNavigateHome: () => void;
  onNavigateCreate?: () => void;
  onNavigateAbout?: () => void;
  onNavigatePrivacy?: () => void;
  onNavigateTerms?: () => void;
}

const pageContent: Record<InformationalPageKind, { title: string; intro: string; content: ReactNode }> = {
  features: {
    title: 'Code Snipper features for temporary code sharing',
    intro: 'A focused set of tools for moving code, logs and text between people and devices without creating an account.',
    content: (
      <>
        <section><h2>Share code without setup</h2><p>Open Code Snipper, paste your content and create a link. No signup, email verification or project setup is required for a quick handoff.</p></section>
        <section><h2>Syntax highlighting for 13 languages</h2><p>Choose Plain Text, JavaScript, TypeScript, Python, Java, C, C++, HTML, CSS, JSON, SQL, Bash or Markdown. Shared code is displayed read-only with language-aware highlighting.</p></section>
        <section><h2>Automatic 24-hour expiry</h2><p>Every paste is intended to be temporary. It becomes inaccessible after 24 hours, and a scheduled cleanup job removes expired records from active storage.</p></section>
        <section><h2>Creator deletion link</h2><p>When a paste is created, Code Snipper shows a private deletion token once. Keep that link safe if you need to remove the paste before it expires.</p></section>
        <section><h2>Safe display and practical limits</h2><p>Code Snipper treats submitted content as text and does not execute pasted code. Each paste is limited to 512 KB to keep sharing predictable on mobile and slower connections.</p></section>
      </>
    ),
  },
  'how-it-works': {
    title: 'How to share code with Code Snipper',
    intro: 'Code Snipper turns a block of source code, logs or notes into a temporary link in three straightforward steps.',
    content: (
      <>
        <section><h2>1. Write or paste your content</h2><p>Use the editor on the <a href="/create">create page</a> to enter code, a stack trace, configuration or plain text. Do not include passwords, API keys or private credentials.</p></section>
        <section><h2>2. Choose a language and create the link</h2><p>Select the closest language for readable syntax highlighting, then choose <strong>Create a paste</strong>. Code Snipper validates the content and generates a unique share URL.</p></section>
        <section><h2>3. Send the share link</h2><p>Copy the public link and send it to a teammate, support contact or another device. Recipients can read and copy the content without an account.</p></section>
        <section><h2>What happens after sharing?</h2><p>The snippet is stored temporarily, remains available for up to 24 hours and is then rejected as expired. The creator can use the private deletion link to remove it earlier.</p></section>
        <p><a href="/faq">Read the Code Snipper FAQ</a> or <a href="/create">create a snippet now</a>.</p>
      </>
    ),
  },
  faq: {
    title: 'Code Snipper frequently asked questions',
    intro: 'Answers about temporary online code sharing, limits, privacy and supported languages.',
    content: (
      <div className="space-y-3">
        <details open><summary>Do I need an account?</summary><p>No. Code Snipper is designed for anonymous, one-off sharing without registration.</p></details>
        <details><summary>How long does a snippet last?</summary><p>Snippets are intended to expire after 24 hours. They become inaccessible at the expiration boundary, even if background cleanup has not run yet.</p></details>
        <details><summary>What languages are supported?</summary><p>Plain Text, JavaScript, TypeScript, Python, Java, C, C++, HTML, CSS, JSON, SQL, Bash and Markdown are supported.</p></details>
        <details><summary>Does Code Snipper run my code?</summary><p>No. Content is displayed as text or syntax-highlighted code. It is not compiled or executed by the service.</p></details>
        <details><summary>Can I delete a snippet early?</summary><p>Yes. Save the private deletion link shown immediately after creation. It is the only creator deletion mechanism before expiry.</p></details>
        <details><summary>Is a share link private?</summary><p>A share link is accessible to anyone who receives it. Do not paste secrets or confidential data; use an approved secret-sharing system for sensitive material.</p></details>
        <details><summary>Is Code Snipper a replacement for GitHub Gist?</summary><p>It serves a different purpose: Code Snipper is for temporary, account-free sharing, while Gist is better for durable snippets, revisions, forking and collaboration history.</p></details>
      </div>
    ),
  },
  'online-code-sharing': {
    title: 'Online code sharing without signup',
    intro: 'Share a readable code link when you need a fast handoff rather than a full repository or collaborative workspace.',
    content: (
      <>
        <section><h2>A lightweight way to share source code online</h2><p>Code Snipper is useful when a chat message is too small, an attachment is inconvenient or a repository would add unnecessary setup. Paste the code, select a language and send one link.</p></section>
        <section><h2>Useful for debugging and support</h2><p>Share a reproducible example, error log, JSON response, shell command or configuration excerpt with a teammate or support contact. The read-only view keeps the original text easy to inspect and copy.</p></section>
        <section><h2>Temporary by design</h2><p>Shared content is automatically limited to a 24-hour window. This makes Code Snipper a better fit for short-lived troubleshooting than long-term documentation.</p></section>
        <section><h2>Know the privacy boundary</h2><p>Links are bearer links: anyone who has one can request the content. Transport uses HTTPS in production, but the service is not an end-to-end encrypted vault. Never paste credentials or personal data.</p></section>
        <p><a href="/share-code-online">See the three-step sharing workflow</a> or <a href="/create">share code online</a>.</p>
      </>
    ),
  },
  'share-code-online': {
    title: 'Share code online in seconds',
    intro: 'A practical workflow for sending code to teammates, support teams or another device with a clean temporary URL.',
    content: (
      <>
        <section><h2>Paste the exact code</h2><p>Start with the source code, logs or text you want to hand off. Code Snipper preserves the submitted content and shows it in a read-only editor.</p></section>
        <section><h2>Pick a language</h2><p>Choose one of the supported language modes so the recipient can scan the snippet more easily. Plain Text is available for logs, notes and unsupported formats.</p></section>
        <section><h2>Copy one link</h2><p>Create the paste, copy the public URL and share it wherever your team works. The recipient does not need an account or a special application.</p></section>
        <section><h2>Use the right tool for the job</h2><p>For permanent documentation, version history or private repositories, use a dedicated code host. Code Snipper is optimized for short-lived sharing and automatic expiry.</p></section>
        <p><a href="/how-it-works">Learn how the service works</a> or <a href="/create">create a shareable code link</a>.</p>
      </>
    ),
  },
  'online-code-snippets': {
    title: 'Online code snippets for developers',
    intro: 'Create temporary online snippets for examples, debugging, code review context and quick transfers between devices.',
    content: (
      <>
        <section><h2>Readable snippets in common languages</h2><p>Code Snipper supports JavaScript, TypeScript, Python, Java, C, C++, HTML, CSS, JSON, SQL, Bash, Markdown and plain text.</p></section>
        <section><h2>Examples of good uses</h2><p>Share a small function, a minimal bug reproduction, a command, a sample payload or a temporary log excerpt. The 512 KB limit keeps the service focused on snippets rather than projects.</p></section>
        <section><h2>Temporary and account-free</h2><p>Snippets do not require registration and are designed to expire after 24 hours. Save the deletion link if the content should disappear sooner.</p></section>
        <section><h2>What it is not</h2><p>Code Snipper is not a code execution sandbox, version-control system, permanent backup or encrypted secret manager. Use a tool designed for those requirements.</p></section>
        <p><a href="/features">Explore Code Snipper features</a> or <a href="/faq">read the FAQ</a>.</p>
      </>
    ),
  },
  'pastebin-alternative': {
    title: 'A Pastebin alternative for temporary code sharing',
    intro: 'Code Snipper is a focused alternative for developers who want an account-free, temporary link for code and text.',
    content: (
      <>
        <section><h2>Where Code Snipper fits</h2><p>Use Code Snipper for a quick code or text handoff with syntax highlighting, a 512 KB per-paste limit and automatic 24-hour expiry. It is intentionally small and simple.</p></section>
        <section><h2>Compared with a traditional paste service</h2><p>Code Snipper does not rely on a public paste archive, user accounts or permanent storage. Every paste is temporary and the creator receives a deletion link at creation time.</p></section>
        <section><h2>Compared with GitHub Gist</h2><p>Gist is the stronger choice when you need revisions, forks, comments, repositories or durable documentation. Code Snipper is the lighter choice for a short-lived share with no account.</p></section>
        <section><h2>Compared with encrypted paste tools</h2><p>Code Snipper safely renders code as text and uses HTTPS in production, but it does not provide client-side end-to-end encryption. Choose an encrypted tool when the server must not be able to read the content.</p></section>
        <p>This page is an independent comparison and is not affiliated with Pastebin, GitHub or any other service. <a href="/create">Try temporary code sharing</a> or <a href="/faq">read the FAQ</a>.</p>
      </>
    ),
  },
};

export function InformationalPage({ kind, onNavigateHome, onNavigateCreate, onNavigateAbout, onNavigatePrivacy, onNavigateTerms }: InformationalPageProps) {
  const page = pageContent[kind];

  return (
    <div className="app-shell">
      <Header onNavigateHome={onNavigateHome} onNavigateCreate={onNavigateCreate} onNavigateAbout={onNavigateAbout} />
      <main className="page-container flex-1 py-10 sm:py-14">
        <article className="mx-auto max-w-4xl space-y-8">
          <header className="max-w-3xl">
            <p className="eyebrow">Code Snipper</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">{page.title}</h1>
            <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-400">{page.intro}</p>
          </header>
          <div className="prose prose-slate max-w-none space-y-8 dark:prose-invert [&_details]:rounded-xl [&_details]:border [&_details]:border-slate-200 [&_details]:p-4 [&_details]:dark:border-slate-800 [&_summary]:cursor-pointer [&_summary]:font-semibold [&_summary]:text-slate-950 [&_summary]:dark:text-white">
            {page.content}
          </div>
        </article>
      </main>
      <Footer onNavigateHome={onNavigateHome} onNavigateAbout={onNavigateAbout} onNavigatePrivacy={onNavigatePrivacy} onNavigateTerms={onNavigateTerms} />
    </div>
  );
}
