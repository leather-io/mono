import mixpanel, { type OverridedMixpanel } from 'mixpanel-browser';
import { VERSION } from '~/constants/constants';

import { configureAnalyticsClient } from '@leather.io/analytics';
import { noop } from '@leather.io/utils';

const writeKey = import.meta.env.LEATHER_MIXPANEL_TOKEN;

function getMockedMixpanel() {
  // eslint-disable-next-line no-console
  console.warn('Using mocked mixpanel. No analytics are sent');
  return {
    identify() {
      return Promise.resolve();
    },
    track: noop,
    getPeople() {
      return { set: noop };
    },
    setGroup: noop,
    getGroup() {
      return { set: noop };
    },
  };
}

if (writeKey) {
  mixpanel.init(writeKey, {
    track_pageview: 'full-url',
    persistence: 'localStorage',
    batch_requests: true,
    batch_size: 10,
    batch_flush_interval_ms: 5000,
    debug: import.meta.env.DEV,
    // Only ignore "Do Not Track" mode in dev
    ignore_dnt: import.meta.env.DEV,
  });
}

function configureMixpanel(mixpanelClient: OverridedMixpanel) {
  return Object.assign(mixpanelClient, {
    setGroup: mixpanelClient.set_group,
    getGroup: mixpanelClient.get_group,
    getPeople() {
      return mixpanelClient.people;
    },
  });
}

export const analytics = configureAnalyticsClient({
  client: writeKey ? configureMixpanel(mixpanel) : getMockedMixpanel(),
  defaultProperties: { platform: 'web', version: VERSION },
});
