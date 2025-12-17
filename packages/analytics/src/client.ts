import { AnalyticsClientConfig, Events, JsonMap } from './types';

export function AnalyticsClient(config: AnalyticsClientConfig) {
  const { client: analyticsClient, defaultProperties = {}, defaultTraits = {} } = config;

  return {
    track<K extends keyof Events>(
      event: K,
      ...[properties]: Events[K] extends undefined ? [] : [Events[K]]
    ) {
      analyticsClient.track(event, { ...properties, ...defaultProperties });
    },

    untypedTrack(event: string, properties?: JsonMap | Record<string, unknown>) {
      if (event.match(/^[a-zA-Z0-9\s][a-zA-Z0-9\s]*$/)) {
        throw new Error('Event must be snake_case');
      }
      analyticsClient.track(event as any, {
        ...properties,
        ...defaultProperties,
      });
    },

    screen(name: string, properties?: JsonMap | Record<string, unknown>) {
      analyticsClient.track('screen_view', {
        screen_name: name,
        ...properties,
        ...defaultProperties,
      });
    },

    group(groupId: string, traits: JsonMap | Record<string, unknown>) {
      if (Object.keys(traits).length === 0) {
        // eslint-disable-next-line no-console
        console.warn('Calling group analytics without traits');
        return;
      }

      analyticsClient.setGroup('company', groupId);
      const group = analyticsClient.getGroup('company', groupId);
      if (group) {
        Object.entries(traits).forEach(([key, value]) => {
          group.set(key, JSON.stringify(value));
        });
      }
    },

    async identify(userId?: string, traits?: JsonMap | Record<string, unknown>) {
      if (userId) {
        await analyticsClient.identify(userId);
      }

      const allTraits = { ...traits, ...defaultTraits };
      if (Object.keys(allTraits).length > 0) {
        const people = analyticsClient.getPeople();
        if (people) {
          people.set(allTraits);
        }
      }
    },

    page(category?: string, name?: string, properties?: JsonMap | Record<string, unknown>) {
      analyticsClient.track('page_view', {
        category,
        name,
        ...properties,
        ...defaultProperties,
      });
    },

    get client() {
      return analyticsClient;
    },
  };
}
