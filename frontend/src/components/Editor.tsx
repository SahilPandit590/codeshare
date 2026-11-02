import React, { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { SupportedLanguage } from '@codeshare/shared';
import { Loader2 } from 'lucide-react';

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
      <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-sm">
        <textarea
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{ minHeight }}
          className="w-full h-full p-4 bg-transparent text-slate-100 resize-y focus:outline-none focus:ring-1 focus:ring-blue-500/50 leading-relaxed font-mono"
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
      className="relative w-full rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-2xl transition-all"
      style={{ minHeight }}
    >
      <MonacoEditor
        height={minHeight}
        language={monacoLang}
        theme="vs-dark"
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
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-xs font-mono">Initializing editor...</span>
            <button
              onClick={() => setUseFallback(true)}
              className="text-xs text-blue-400 hover:underline pt-2"
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
