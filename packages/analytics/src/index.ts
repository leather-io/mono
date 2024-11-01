import { AnalyticsClient } from './client';
import { AnalyticsClientInterface, DefaultProperties, JsonMap } from './types';

export * from './types';
export function configureAnalyticsClient<T extends AnalyticsClientInterface>({
  client,
  defaultProperties,
  defaultTraits,
}: {
  client: T;
  defaultProperties: DefaultProperties;
  defaultTraits?: JsonMap;
}) {
  return AnalyticsClient<T>(client, { defaultProperties, defaultTraits }); // No need to pass EventProperties
}
