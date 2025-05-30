import { AnalyticsClientConfig, AnalyticsClientInterface, Events, JsonMap } from './types';

export function AnalyticsClient<T extends AnalyticsClientInterface>(
  config: AnalyticsClientConfig<T>
) {
  const { client: analyticsClient, defaultProperties = {}, defaultTraits = {} } = config;

  return {
    async track<K extends keyof Events>(
      event: K,
      properties?: undefined extends Events[K] ? [] : [param: Events[K]]
    ) {
      return analyticsClient.track(event, { ...properties, ...defaultProperties });
    },

    async untypedTrack(event: string, properties?: JsonMap | Record<string, unknown>) {
      if (event.match(/^[a-zA-Z0-9\s][a-zA-Z0-9\s]*$/)) {
        throw new Error('Event must be snake_case');
      }
      return analyticsClient.track(event as any, {
        ...properties,
        ...defaultProperties,
      });
    },

    async screen(name: string, properties?: JsonMap | Record<string, unknown>) {
      return analyticsClient.screen(name, { ...properties, ...defaultProperties });
    },

    group(groupId: string, traits?: JsonMap | Record<string, unknown>) {
      return analyticsClient.group(groupId, { ...traits, ...defaultTraits });
    },

    async identify(userId?: string, traits?: JsonMap | Record<string, unknown>) {
      return await analyticsClient.identify(userId, {
        ...traits,
        ...defaultTraits,
      });
    },

    page(category?: string, name?: string, properties?: JsonMap | Record<string, unknown>) {
      if (typeof analyticsClient.page === 'function') {
        return analyticsClient.page(category, name, {
          ...properties,
          ...defaultProperties,
        });
      }
      return Promise.resolve();
    },

    get client() {
      return analyticsClient;
    },
  };
}
