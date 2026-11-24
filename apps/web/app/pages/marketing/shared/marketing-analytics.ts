import { analytics } from '~/utils/analytics/analytics';

import { type InstallPlatform } from './install-links';

// Click events for the marketing pages; page views are tracked for every route in app.tsx.
// Don't add a `platform` property: the client's default properties would overwrite it.
export type MarketingSection =
  | 'header'
  | 'home_hero'
  | 'home_features'
  | 'home_trust'
  | 'home_providers'
  | 'apps_core_token'
  | 'install_modal';

interface MarketingEvents {
  /** The "Install" trigger that opens the install modal (header, /apps "Buy" pill). */
  install_leather_clicked: { section: MarketingSection };
  /** A Chrome Web Store / App Store / Google Play pill. */
  store_link_clicked: { store: InstallPlatform; section: MarketingSection; url: string };
  /** A verb in the homepage headline (Buy. Send. Swap. Earn. Grow.). */
  hero_word_clicked: { word: string };
  /** A "Learn more" link on a homepage card. */
  learn_more_clicked: { section: MarketingSection; card: string; url: string };
  /** The sBTC / STX Staking cards in the homepage providers section. */
  provider_cta_clicked: { provider: string; cta: string; url: string };
  /** A card in the changelog strip (homepage, /apps). */
  changelog_entry_clicked: { slug: string };
}

export function trackMarketingEvent<K extends keyof MarketingEvents>(
  event: K,
  properties: MarketingEvents[K]
) {
  analytics.untypedTrack(event, { ...properties });
}
