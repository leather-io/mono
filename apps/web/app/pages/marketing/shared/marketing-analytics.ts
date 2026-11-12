import { analytics } from '~/utils/analytics/analytics';

import { type InstallPlatform } from './install-links';

// Click events for the marketing pages. Page views are already sent for every route by
// `useOnRouteChange(() => analytics.page())` in app.tsx, so nothing here tracks views.
// Names follow the app's existing `<object>_clicked` snake_case events (sign_in_clicked,
// external_link_clicked) and go through the same client, so `platform: 'web'` and `version`
// are added by its default properties. Don't add a `platform` property here: the default
// would overwrite it.
export type MarketingSection =
  | 'header'
  | 'home_hero'
  | 'home_features'
  | 'home_trust'
  | 'home_providers'
  | 'apps_core_token'
  | 'install_modal';

export interface MarketingEvents {
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
