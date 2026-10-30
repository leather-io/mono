import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import { Mixpanel } from 'mixpanel-react-native';

import { configureAnalyticsClient } from '@leather.io/analytics';
import type { AnalyticsPreference, NetworkConfiguration } from '@leather.io/models';
import { noop } from '@leather.io/utils';

import { getDeviceId } from './get-device-id';

type Network = NetworkConfiguration['chain']['bitcoin']['mode'];

const FIRST_OPEN_KEY = 'first_open_tracked';

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
    init() {
      return Promise.resolve();
    },
    registerSuperProperties: noop,
  };
}

const mixpanelClient = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN
  ? new Mixpanel(process.env.EXPO_PUBLIC_MIXPANEL_TOKEN, false)
  : getMockedMixpanel();

async function initMixpanelClient() {
  await mixpanelClient.init();
  const currentVersion = Application.nativeApplicationVersion || '';
  const nativeBuildVersion = Application.nativeBuildVersion || '';
  mixpanelClient.registerSuperProperties({
    platform: 'mobile',
    version: currentVersion,
    buildVersion: nativeBuildVersion,
  });
}
void initMixpanelClient();

export function setAnalyticsNetwork(network: Network) {
  mixpanelClient.registerSuperProperties({ network });
}

async function identifyUserByDeviceId() {
  const id = await getDeviceId();
  if (id) {
    return analytics.identify(id);
  }
}
void identifyUserByDeviceId();

const analyticsClient = configureAnalyticsClient({
  client: mixpanelClient,
  defaultProperties: {
    platform: 'mobile',
  },
});

let analyticsEnabled = false;

export function applyAnalyticsPreference(analyticsPreference: AnalyticsPreference) {
  if (analyticsPreference === 'rejects-tracking') {
    analytics.track('user_setting_updated', { analytics: 'rejects-tracking' });
  }

  analyticsEnabled = analyticsPreference === 'consent-given';
}

export const analytics = new Proxy(analyticsClient, {
  get(target, prop, receiver) {
    const value: unknown = Reflect.get(target, prop, receiver);

    if (typeof value === 'function') {
      return (...args: unknown[]) => {
        if (!analyticsEnabled) return;
        const result: unknown = value.apply(target, args);
        return result;
      };
    }

    return value;
  },
});

export async function trackFirstAppOpen() {
  const hasTrackedFirstOpen = await AsyncStorage.getItem(FIRST_OPEN_KEY);

  if (!hasTrackedFirstOpen) {
    analytics.track('application_first_opened', {
      timestamp: new Date().toISOString(),
    });
    await AsyncStorage.setItem(FIRST_OPEN_KEY, 'true');
  }
}
