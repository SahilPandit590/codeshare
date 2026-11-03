export interface AdsConfig {
  enabled: boolean;
  publisherId: string;
  homeSlotId: string;
  viewSlotId: string;
  isDev: boolean;
}

export const SMARTLINK_URL = 'https://asiafilm.org/4/a08e9ef6b2917c6eb574f09bf3ab6b48';

export const adsConfig: AdsConfig = {
  enabled: import.meta.env.VITE_ADS_ENABLED === 'true',
  publisherId: (import.meta.env.VITE_ADSENSE_PUBLISHER_ID || '').trim(),
  homeSlotId: (import.meta.env.VITE_ADSENSE_HOME_SLOT_ID || '').trim(),
  viewSlotId: (import.meta.env.VITE_ADSENSE_VIEW_SLOT_ID || '').trim(),
  isDev: Boolean(import.meta.env.DEV),
};
