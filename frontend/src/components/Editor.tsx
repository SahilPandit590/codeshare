import React, { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { SupportedLanguage } from '@codeshare/shared';
import { Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface EditorProps {
  value: string;
  onChange?: (value: string) => void;
  language: SupportedLanguage;
  readOnly?: boolean;
  minHeight?: string;
  placeholder?: string;
}

const MONACO_LANG_MAP: Record<SupportedLanguage, string> = {
  text: 'plaintext',
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  html: 'html',
  css: 'css',
  json: 'json',
  sql: 'sql',
  bash: 'shell',
  markdown: 'markdown',
};

export const Editor: React.FC<EditorProps> = ({
  value,
  onChange,
  language,
  readOnly = false,
  minHeight = '500px',
  placeholder = 'Paste or type your code / text here...',
}) => {
  const [useFallback, setUseFallback] = useState(false);
  const { theme } = useTheme();
  const monacoLang = MONACO_LANG_MAP[language] || 'plaintext';

  // Handle Tab key in fallback textarea for natural code editing
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && !readOnly && onChange) {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  if (useFallback) {
    return (
      <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 font-mono text-sm dark:border-slate-800 dark:bg-slate-950">
        <textarea
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{ minHeight }}
          className="h-full w-full resize-y bg-transparent p-4 leading-relaxed text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50 dark:text-slate-100 dark:placeholder-slate-600"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition-all dark:border-slate-800/80 dark:bg-slate-950"
      style={{ minHeight }}
    >
      <MonacoEditor
        height={minHeight}
        language={monacoLang}
         theme={theme === 'dark' ? 'vs-dark' : 'vs'}
        value={value}
        onChange={(val) => onChange?.(val || '')}
        options={{
          readOnly,
          domReadOnly: readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          wordWrap: 'on',
          lineHeight: 22,
          renderLineHighlight: readOnly ? 'none' : 'line',
          tabSize: 2,
          quickSuggestions: false,
        }}
        loading={
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center space-y-3 text-slate-500 dark:text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-xs font-mono">Initializing editor...</span>
            <button
              onClick={() => setUseFallback(true)}
              className="pt-2 text-xs text-blue-600 hover:underline dark:text-blue-400"
            >
              Switch to lightweight editor
            </button>
          </div>
        }
        onMount={() => {
          // Loaded successfully
        }}
        // If CDN fails, gracefully fall back to native code editor
        beforeMount={() => {}}
      />
    </div>
  );
};
