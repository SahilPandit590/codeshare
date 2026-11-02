import React from 'react';
import { SUPPORTED_LANGUAGES, SupportedLanguage, LANGUAGE_LABELS } from '@codeshare/shared';
import { Code } from 'lucide-react';

interface LanguageSelectorProps {
  value: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
  disabled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <Code className="w-4 h-4" />
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as SupportedLanguage)}
          disabled={disabled}
           className="cursor-pointer rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
          aria-label="Select programming language"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
             <option key={lang} value={lang} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-200">
              {LANGUAGE_LABELS[lang]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
