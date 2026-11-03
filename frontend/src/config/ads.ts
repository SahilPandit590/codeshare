export interface AdsConfig {
  enabled: boolean;
  publisherId: string;
  homeSlotId: string;
  viewSlotId: string;
  isDev: boolean;
}

export const SMARTLINK_URL = 'https://asiafilm.org/4/a08e9ef6b2917c6eb574f09bf3ab6b48';

export const SUPPORT_UPI_ID = 'yukine590-2@okicici';
export const SUPPORT_UPI_URI = `upi://pay?pa=${encodeURIComponent(SUPPORT_UPI_ID)}`;
export const SUPPORT_QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(SUPPORT_UPI_URI)}`;

export const adsConfig: AdsConfig = {
  enabled: import.meta.env.VITE_ADS_ENABLED === 'true',
  publisherId: (import.meta.env.VITE_ADSENSE_PUBLISHER_ID || '').trim(),
  homeSlotId: (import.meta.env.VITE_ADSENSE_HOME_SLOT_ID || '').trim(),
  viewSlotId: (import.meta.env.VITE_ADSENSE_VIEW_SLOT_ID || '').trim(),
  isDev: Boolean(import.meta.env.DEV),
};
