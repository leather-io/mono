import { analytics } from '~/utils/analytics/analytics';

import { trackMarketingEvent } from './marketing-analytics';

vi.mock('~/utils/analytics/analytics', () => ({
  analytics: { untypedTrack: vi.fn() },
}));

describe('trackMarketingEvent', () => {
  afterEach(() => vi.clearAllMocks());

  it('sends the event through the app analytics client with its properties', () => {
    trackMarketingEvent('store_link_clicked', {
      store: 'ios',
      section: 'home_hero',
      url: 'https://apps.apple.com/us/app/leather-self-custody-wallet/id6499127775',
    });

    expect(analytics.untypedTrack).toHaveBeenCalledWith('store_link_clicked', {
      store: 'ios',
      section: 'home_hero',
      url: 'https://apps.apple.com/us/app/leather-self-custody-wallet/id6499127775',
    });
  });

  it('keeps every event name snake_case, as the analytics client requires', () => {
    trackMarketingEvent('hero_word_clicked', { word: 'swap' });
    trackMarketingEvent('changelog_entry_clicked', { slug: 'v6-30' });

    const names = vi.mocked(analytics.untypedTrack).mock.calls.map(([name]) => name);
    names.forEach(name => expect(name).toMatch(/^[a-z]+(_[a-z]+)+$/));
  });
});
