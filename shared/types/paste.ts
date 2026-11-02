export const SUPPORTED_LANGUAGES = [
  'text',
  'javascript',
  'typescript',
  'python',
  'java',
  'c',
  'cpp',
  'html',
  'css',
  'json',
  'sql',
  'bash',
  'markdown',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  text: 'Plain Text',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  sql: 'SQL',
  bash: 'Bash',
  markdown: 'Markdown',
};

export interface CreatePasteRequest {
  content: string;
  language?: SupportedLanguage;
}

export interface CreateSnippetRequest {
  code: string;
  language?: SupportedLanguage;
}

export interface CreatePasteResponse {
  id: string;
  url: string;
  language: SupportedLanguage;
  createdAt: string;
  expiresAt: string;
  deleteToken: string;
  deleteUrl: string;
}

export interface CreateSnippetResponse extends CreatePasteResponse {
  shareUrl?: string;
}

export interface GetPasteResponse {
  id: string;
  content: string;
  language: SupportedLanguage;
  createdAt: string;
  expiresAt: string;
}

export interface GetSnippetResponse {
  id: string;
  code: string;
  language: SupportedLanguage;
  createdAt: string;
  expiresAt: string;
}

export interface DeletePasteResponse {
  message: string;
  id: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  database: 'connected' | 'disconnected' | 'unreachable';
  version: string;
}
