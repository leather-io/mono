import {
  AnalyticsClientConfig,
  EventProperties,
  ExternalAnalyticsClientInterface,
  Json,
} from './types';

export type AnalyticsClientOptions = Pick<
  AnalyticsClientConfig,
  'defaultProperties' | 'defaultTraits'
>;

export function AnalyticsClient<T extends ExternalAnalyticsClientInterface>(
  client: T,
  options: AnalyticsClientOptions
) {
  return {
    async track<K extends keyof EventProperties>(event: K, properties: EventProperties[K]) {
      return client.track(event, { ...properties, ...options.defaultProperties });
    },

    async untypedTrack(event: string, properties?: Json) {
      return client.track(event as any, { ...properties, ...options.defaultProperties });
    },

    async screen(name: string, properties?: Json) {
      return client.screen(name, { ...properties, ...options.defaultProperties });
    },

    async group(groupId: string, traits?: Json) {
      return client.group(groupId, { ...traits, ...options.defaultTraits });
    },

    async identify(userId: string, traits?: Json) {
      return client.identify(userId, { ...traits, ...options.defaultTraits });
    },
  };
}
