/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, render, screen, cleanup, fireEvent } from '@testing-library/react';
import { Header } from '../../frontend/src/components/Header';
import { ThemeProvider, themeStorageKey } from '../../frontend/src/contexts/ThemeContext';

describe('Theme preference', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => ({ matches: true, addEventListener: () => undefined, removeEventListener: () => undefined }),
    });
  });

  afterEach(() => cleanup());

  it('uses the operating system preference on first visit and switches themes', () => {
    render(<ThemeProvider><Header /></ThemeProvider>);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    const toggle = screen.getByRole('button', { name: 'Switch to light theme' });
    act(() => fireEvent.click(toggle));

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(window.localStorage.getItem(themeStorageKey)).toBe('light');
  });

  it('restores a saved preference over the operating system preference', () => {
    window.localStorage.setItem(themeStorageKey, 'light');
    render(<ThemeProvider><Header /></ThemeProvider>);

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeDefined();
  });
});
