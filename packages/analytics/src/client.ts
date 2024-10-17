import { AnalyticsClientConfig, AnalyticsClientInterface, EventProperties, JsonMap } from './types';

export type AnalyticsClientOptions = Pick<
  AnalyticsClientConfig,
  'defaultProperties' | 'defaultTraits'
>;

export class AnalyticsClient<T extends AnalyticsClientInterface> {
  constructor(
    private readonly client: T,
    private readonly options: AnalyticsClientOptions
  ) {
    this.client = client;
    this.options = options;
  }

  public async track<K extends keyof EventProperties>(event: K, properties: EventProperties[K]) {
    return this.client.track(event, { ...properties, ...this.options.defaultProperties });
  }

  public async untypedTrack(event: string, properties?: JsonMap) {
    return this.client.track(event, { ...properties, ...this.options.defaultProperties });
  }

  public async screen(name: string, properties?: JsonMap) {
    return this.client.screen(name, { ...properties, ...this.options.defaultProperties });
  }

  public async group(groupId: string, traits?: JsonMap) {
    return this.client.group(groupId, { ...traits, ...this.options.defaultTraits });
  }

  public async identify(userId: string, traits?: JsonMap) {
    return this.client.identify(userId, { ...traits, ...this.options.defaultTraits });
  }
}
