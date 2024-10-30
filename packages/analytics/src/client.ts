import {
  AnalyticsClientConfig,
  EventProperties,
  ExternalAnalyticsClientInterface,
  JsonMap,
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

    async untypedTrack(event: string, properties?: JsonMap) {
      if (event.match(/^[a-zA-Z0-9\s][a-zA-Z0-9\s]*$/)) {
        throw new Error('Event must be snake_case');
      }
      return client.track(event as any, { ...properties, ...options.defaultProperties });
    },

    async screen(name: string, properties?: JsonMap) {
      return client.screen(name, { ...properties, ...options.defaultProperties });
    },

    async group(groupId: string, traits?: JsonMap) {
      return client.group(groupId, { ...traits, ...options.defaultTraits });
    },

    async identify(userId: string, traits?: JsonMap) {
      return client.identify(userId, { ...traits, ...options.defaultTraits });
    },
  };
}
