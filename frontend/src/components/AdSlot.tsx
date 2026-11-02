import { useEffect, useRef } from 'react';
import { adsConfig } from '../config/ads';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSlotProps {
  slotId: string;
  className?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
}

function loadAdSenseScript(publisherId: string) {
  if (typeof document === 'undefined') return;
  if (document.querySelector('script[src*="pagead2.googlesyndication.com"]')) {
    return;
  }
  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(publisherId)}`;
  document.head.appendChild(script);
}

export function AdSlot({ slotId, className = '', format = 'auto' }: AdSlotProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);

  // If ads are disabled or publisher ID / slot ID is missing, render nothing
  if (!adsConfig.enabled || !adsConfig.publisherId || !slotId) {
    return null;
  }

  // Ensure publisher ID looks like a valid ca-pub- ID before attempting to render
  if (!/^ca-pub-\d+$/.test(adsConfig.publisherId)) {
    return null;
  }

  useEffect(() => {
    // Only inject script when configuration is verified
    loadAdSenseScript(adsConfig.publisherId);

    // Initialize the ad slot once on mount
    if (!pushedRef.current && adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      } catch {
        // Silently catch ad blockers or initialization errors
      }
    }
  }, []);

  return (
    <aside
      className={`ad-container my-6 w-full max-w-5xl mx-auto flex flex-col items-center justify-center overflow-hidden transition-all ${className}`}
      aria-label="Advertisement"
    >
      <div className="text-[10px] tracking-wider text-slate-500 uppercase font-mono mb-1 select-none">
        Advertisement
      </div>
      <ins
        ref={adRef}
        className="adsbygoogle block w-full text-center"
        style={{ display: 'block', minHeight: '90px' }}
        data-ad-client={adsConfig.publisherId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </aside>
  );
}
