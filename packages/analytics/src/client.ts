import { AnalyticsClientConfig, AnalyticsClientInterface, Events, JsonMap } from './types';

export function AnalyticsClient<T extends AnalyticsClientInterface>(
  analyticsClient: T,
  options: Pick<AnalyticsClientConfig<T>, 'defaultProperties' | 'defaultTraits'>
) {
  return {
    async track<K extends keyof Events>(
      event: K,
      ...properties: undefined extends Events[K] ? [] : [param: Events[K]]
    ) {
      return analyticsClient.track(event, { ...properties, ...options.defaultProperties });
    },
    async untypedTrack(event: string, properties?: JsonMap) {
      if (event.match(/^[a-zA-Z0-9\s][a-zA-Z0-9\s]*$/)) {
        throw new Error('Event must be snake_case');
      }
      return analyticsClient.track(event as any, { ...properties, ...options.defaultProperties });
    },
    screen: (name: string, ...args: any[]) => analyticsClient.screen(name, ...args),
    group: (groupId: string, traits?: any, ...args: any[]) =>
      analyticsClient.group(groupId, traits, ...args),
    identify: (...args: any[]) => analyticsClient.identify(...args),
    page: (name: string, ...args: any[]) =>
      analyticsClient.page ? analyticsClient.page(name, ...args) : Promise.resolve(),
    client: analyticsClient,
  };
}
