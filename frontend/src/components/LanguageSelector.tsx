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
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Code className="w-4 h-4" />
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as SupportedLanguage)}
          disabled={disabled}
          className="pl-9 pr-8 py-1.5 bg-slate-900 border border-slate-700/80 hover:border-slate-600 focus:border-blue-500 rounded-lg text-sm font-medium text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50 cursor-pointer"
          aria-label="Select programming language"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang} value={lang} className="bg-slate-900 text-slate-200">
              {LANGUAGE_LABELS[lang]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

