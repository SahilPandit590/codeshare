/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Header } from '../../frontend/src/components/Header';
import { LanguageSelector } from '../../frontend/src/components/LanguageSelector';
import { StatusBanner } from '../../frontend/src/components/StatusBanner';
import { DeleteConfirmModal } from '../../frontend/src/components/DeleteConfirmModal';
import { PasteCreatedModal } from '../../frontend/src/components/PasteCreatedModal';
import { Footer } from '../../frontend/src/components/Footer';
import { AboutPage } from '../../frontend/src/pages/AboutPage';
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS } from '@codeshare/shared';

describe('Frontend Component Tests', () => {
  afterEach(() => {
    cleanup();
  });
  describe('Header Component', () => {
    it('renders Code Snipper branding, tagline, and 24h expiry badge', () => {
      render(<Header />);

      expect(screen.getByText('Code Snipper')).toBeDefined();
      expect(screen.getByText('Share text. Share code. Keep it temporary.')).toBeDefined();
      expect(screen.getByText('24h Expiry')).toBeDefined();
    });

    it('renders and responds to New Paste button click when showNewButton is true', () => {
      const handleNew = vi.fn();
      render(<Header onNewPaste={handleNew} showNewButton={true} />);

      const newButton = screen.getByText('New Paste');
      expect(newButton).toBeDefined();
      fireEvent.click(newButton);
      expect(handleNew).toHaveBeenCalledOnce();
    });
  });

  describe('LanguageSelector Component', () => {
    it('renders all 13 supported languages with default selection', () => {
      const handleChange = vi.fn();
      render(<LanguageSelector value="text" onChange={handleChange} />);

      const select = screen.getByLabelText('Select programming language') as HTMLSelectElement;
      expect(select.value).toBe('text');

      for (const lang of SUPPORTED_LANGUAGES) {
        expect(screen.getByText(LANGUAGE_LABELS[lang])).toBeDefined();
      }
    });

    it('triggers onChange with selected language', () => {
      const handleChange = vi.fn();
      render(<LanguageSelector value="text" onChange={handleChange} />);

      const select = screen.getByLabelText('Select programming language');
      fireEvent.change(select, { target: { value: 'python' } });

      expect(handleChange).toHaveBeenCalledWith('python');
    });
  });

  describe('StatusBanner Component', () => {
    it('renders error message and allows closing', () => {
      const handleClose = vi.fn();
      render(
        <StatusBanner
          type="error"
          message="Invalid input payload"
          onClose={handleClose}
        />
      );

      expect(screen.getByText('Invalid input payload')).toBeDefined();
      const closeBtn = screen.getByLabelText('Close message');
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledOnce();
    });
  });

  describe('DeleteConfirmModal Component', () => {
    it('requires deletion token and triggers onConfirm', async () => {
      const handleConfirm = vi.fn().mockResolvedValue(undefined);
      const handleClose = vi.fn();

      render(
        <DeleteConfirmModal
          isOpen={true}
          onClose={handleClose}
          onConfirm={handleConfirm}
          initialToken="secret-token-12345"
          isDeleting={false}
        />
      );

      expect(screen.getByText('Delete Paste Early')).toBeDefined();
      expect(
        screen.getByText('Once deleted, this paste and its contents will be permanently purged from the database immediately.')
      ).toBeDefined();

      const confirmBtn = screen.getByText('Confirm Permanent Deletion');
      fireEvent.click(confirmBtn);

      expect(handleConfirm).toHaveBeenCalledWith('secret-token-12345');
    });
  });

  describe('PasteCreatedModal Component', () => {
    it('renders share URL, delete URL and security alert', () => {
      const handleClose = vi.fn();
      const handleView = vi.fn();

      const mockPaste = {
        id: 'test-paste-id',
        shortCode: 'abc6aD',
        url: 'https://snipper.work.gd/abc6aD',
        shareUrl: 'https://snipper.work.gd/abc6aD',
        language: 'typescript' as const,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        deleteToken: 'secret-token-xyz',
        deleteUrl: 'https://snipper.work.gd/p/test-paste-id?token=secret-token-xyz',
      };

      render(
        <PasteCreatedModal
          paste={mockPaste}
          onClose={handleClose}
          onViewPaste={handleView}
        />
      );

      expect(screen.getByText('Paste Ready to Share!')).toBeDefined();
      expect(screen.getByDisplayValue('https://snipper.work.gd/abc6aD')).toBeDefined();
      expect(screen.getByDisplayValue('https://snipper.work.gd/p/test-paste-id?token=secret-token-xyz')).toBeDefined();
      expect(screen.getByText(/Save your deletion link now/)).toBeDefined();

      const viewBtn = screen.getByText('View Paste');
      fireEvent.click(viewBtn);
      expect(handleView).toHaveBeenCalledWith('test-paste-id');
    });
  });

  describe('Footer sponsored link', () => {
    it('renders the Smartlink as an explicit new-tab sponsored link', () => {
      render(<Footer />);

      const link = screen.getByRole('link', { name: 'Sponsored' });
      expect(link.getAttribute('href')).toBe('https://asiafilm.org/4/a08e9ef6b2917c6eb574f09bf3ab6b48');
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      expect(screen.getByRole('link', { name: 'Contact' }).getAttribute('href')).toBe('mailto:sahilpandit590@gmail.com');
    });

    it('opens the support popup with the UPI ID and QR code', () => {
      render(<Footer />);

      fireEvent.click(screen.getByRole('button', { name: 'Support us' }));

      expect(screen.getByRole('dialog')).toBeDefined();
      expect(screen.getByDisplayValue('yukine590-2@okicici')).toBeDefined();
      const qr = screen.getByAltText('UPI QR code for yukine590-2@okicici');
      expect(qr).toBeDefined();
      expect(qr.getAttribute('src')).toBe('/support-upi-qr.png');
    });
  });

  it('renders the configured About-page contact email', () => {
    render(<AboutPage onNavigateHome={vi.fn()} onNavigatePrivacy={vi.fn()} onNavigateTerms={vi.fn()} />);

    expect(screen.getByText('Administrative Email: sahilpandit590@gmail.com')).toBeDefined();
    expect(screen.getByText('Abuse / Takedown Email: sahilpandit590@gmail.com')).toBeDefined();
  });
});
