/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { AdSlot } from '../../frontend/src/components/AdSlot';
import { adsConfig } from '../../frontend/src/config/ads';
import { HomePage } from '../../frontend/src/pages/HomePage';
import { PasteViewPage } from '../../frontend/src/pages/PasteViewPage';
import { AboutPage } from '../../frontend/src/pages/AboutPage';
import { PrivacyPolicyPage } from '../../frontend/src/pages/PrivacyPolicyPage';
import { TermsPage } from '../../frontend/src/pages/TermsPage';
import { api, ApiError } from '../../frontend/src/services/api';

vi.mock('../../frontend/src/services/api', () => {
  class MockApiError extends Error {
    public status: number;
    public code: string;
    constructor(message: string, status: number, code: string) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.code = code;
    }
  }

  return {
    api: {
      createPaste: vi.fn(),
      getPaste: vi.fn(),
      deletePaste: vi.fn(),
    },
    ApiError: MockApiError,
  };
});

describe('AdSense Monetization & Free-Tier Guard Tests', () => {
  const originalConfig = { ...adsConfig };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: advertising disabled
    adsConfig.enabled = false;
    adsConfig.publisherId = '';
    adsConfig.homeSlotId = '';
    adsConfig.viewSlotId = '';
    adsConfig.isDev = false;

    // Clear any injected scripts from DOM
    document.querySelectorAll('script[src*="pagead2.googlesyndication.com"]').forEach((s) => s.remove());
    window.adsbygoogle = [];
  });

  afterEach(() => {
    cleanup();
    Object.assign(adsConfig, originalConfig);
  });

  describe('AdSlot Component Guards', () => {
    it('renders null when ads are disabled (VITE_ADS_ENABLED=false)', () => {
      adsConfig.enabled = false;
      adsConfig.publisherId = 'ca-pub-1234567890123456';

      const { container } = render(<AdSlot slotId="1234567890" />);
      expect(container.firstChild).toBeNull();
      expect(document.querySelector('script[src*="pagead2.googlesyndication.com"]')).toBeNull();
    });

    it('renders null when publisher ID is missing or empty', () => {
      adsConfig.enabled = true;
      adsConfig.publisherId = '';

      const { container } = render(<AdSlot slotId="1234567890" />);
      expect(container.firstChild).toBeNull();
      expect(document.querySelector('script[src*="pagead2.googlesyndication.com"]')).toBeNull();
    });

    it('renders null when slot ID is missing', () => {
      adsConfig.enabled = true;
      adsConfig.publisherId = 'ca-pub-1234567890123456';

      const { container } = render(<AdSlot slotId="" />);
      expect(container.firstChild).toBeNull();
    });

    it('renders null when publisher ID is invalid or placeholder', () => {
      adsConfig.enabled = true;
      adsConfig.publisherId = 'ca-pub-XXXXXXXXXXXXXXXX'; // Invalid placeholder

      const { container } = render(<AdSlot slotId="1234567890" />);
      expect(container.firstChild).toBeNull();
    });

    it('renders ad unit and injects script once when configuration is fully valid', () => {
      adsConfig.enabled = true;
      adsConfig.publisherId = 'ca-pub-1234567890123456';

      const { container } = render(<AdSlot slotId="9876543210" />);
      const aside = screen.getByLabelText('Advertisement');
      expect(aside).toBeDefined();

      const ins = container.querySelector('ins.adsbygoogle');
      expect(ins).toBeDefined();
      expect(ins?.getAttribute('data-ad-client')).toBe('ca-pub-1234567890123456');
      expect(ins?.getAttribute('data-ad-slot')).toBe('9876543210');

      // Check script injected into document
      const script = document.querySelector('script[src*="pagead2.googlesyndication.com"]');
      expect(script).not.toBeNull();
    });

    it('does not repeatedly inject script on multiple ad slot renders', () => {
      adsConfig.enabled = true;
      adsConfig.publisherId = 'ca-pub-1234567890123456';

      render(
        <div>
          <AdSlot slotId="slot-1" />
          <AdSlot slotId="slot-2" />
        </div>
      );

      const scripts = document.querySelectorAll('script[src*="pagead2.googlesyndication.com"]');
      expect(scripts.length).toBe(1);
    });
  });

  describe('Ad Placement & Exclusion Rules', () => {
    it('does NOT render ads on expired paste page (410)', async () => {
      adsConfig.enabled = true;
      adsConfig.publisherId = 'ca-pub-1234567890123456';
      adsConfig.viewSlotId = 'view-slot-123';

      (api.getPaste as any).mockRejectedValue(
        new ApiError('This paste has expired and is no longer accessible', 410, 'PASTE_EXPIRED')
      );

      render(<PasteViewPage pasteId="expired-123" onNavigateHome={vi.fn()} />);

      // Wait for error state to render
      expect(await screen.findByText('Paste Expired')).toBeDefined();
      expect(screen.queryByLabelText('Advertisement')).toBeNull();
    });

    it('does NOT render ads on 404 not found page', async () => {
      adsConfig.enabled = true;
      adsConfig.publisherId = 'ca-pub-1234567890123456';
      adsConfig.viewSlotId = 'view-slot-123';

      (api.getPaste as any).mockRejectedValue(
        new ApiError('Paste not found', 404, 'NOT_FOUND')
      );

      render(<PasteViewPage pasteId="notfound-123" onNavigateHome={vi.fn()} />);

      expect(await screen.findByText('Paste Not Found')).toBeDefined();
      expect(screen.queryByLabelText('Advertisement')).toBeNull();
    });

    it('renders ad on active paste page below content', async () => {
      adsConfig.enabled = true;
      adsConfig.publisherId = 'ca-pub-1234567890123456';
      adsConfig.viewSlotId = 'view-slot-123';

      const now = new Date();
      (api.getPaste as any).mockResolvedValue({
        id: 'active-123',
        content: 'console.log("Active Paste")',
        language: 'javascript',
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 10 * 3600 * 1000).toISOString(),
      });

      render(<PasteViewPage pasteId="active-123" onNavigateHome={vi.fn()} />);

      expect(await screen.findByText('Expires in', { exact: false })).toBeDefined();
      expect(screen.getByLabelText('Advertisement')).toBeDefined();
    });

    it('renders ad on HomePage below paste creation form when enabled', () => {
      adsConfig.enabled = true;
      adsConfig.publisherId = 'ca-pub-1234567890123456';
      adsConfig.homeSlotId = 'home-slot-123';

      render(<HomePage onNavigateToPaste={vi.fn()} />);
      expect(screen.getByLabelText('Advertisement')).toBeDefined();
    });
  });

  describe('Compliance and Policy Pages', () => {
    it('renders Privacy Policy with cookie and advertising disclosures', () => {
      render(<PrivacyPolicyPage onNavigateHome={vi.fn()} onNavigateTerms={vi.fn()} />);

      expect(screen.getByText('Privacy Policy')).toBeDefined();
      expect(screen.getByText('3. Third-Party Advertising & Cookies')).toBeDefined();
      expect(screen.getByText('Google Ads Settings')).toBeDefined();
      expect(screen.getByText(/European Economic Area/)).toBeDefined();
    });

    it('renders Terms of Service with prohibited content and abuse reporting', () => {
      render(<TermsPage onNavigateHome={vi.fn()} onNavigatePrivacy={vi.fn()} />);

      expect(screen.getByText('Terms of Service')).toBeDefined();
      expect(screen.getByText('3. Prohibited Conduct and Content')).toBeDefined();
      expect(screen.getByText('5. Takedown and Abuse Requests')).toBeDefined();
    });

    it('renders About Page with purpose and architecture principles', () => {
      render(<AboutPage onNavigateHome={vi.fn()} onNavigatePrivacy={vi.fn()} onNavigateTerms={vi.fn()} />);

      expect(screen.getByText('About CodeShare')).toBeDefined();
      expect(screen.getByText('Our Purpose')).toBeDefined();
      expect(screen.getByText('Key Architecture Principles')).toBeDefined();
    });
  });
});
