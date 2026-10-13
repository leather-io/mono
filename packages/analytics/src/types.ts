export * from './events';

export interface DefaultProperties {
  platform: 'web' | 'extension' | 'mobile' | 'earn';
  [key: string]: JsonValue;
}

export interface AnalyticsClientInterface {
  track(eventName: string, properties: Record<string, any>): void;
  identify(uniqueId: string): Promise<void>;
  setGroup(groupKey: string, groupId: string): void;
  getGroup(
    groupKey: string,
    groupId: string
  ): {
    set(prop: string, to: string): void;
  };
  getPeople(): {
    set(properties: Record<string, any>): void;
  };
}

export interface AnalyticsClientConfig {
  client: AnalyticsClientInterface;
  defaultProperties?: DefaultProperties;
  defaultTraits?: JsonMap;
}

export type JsonList = JsonValue[];
export type JsonValue = boolean | number | string | undefined | null | JsonList | JsonMap | Error;
export interface JsonMap {
  [key: string]: JsonValue;
  [index: number]: JsonValue;
}

export type OptionalIfUndefined<T> = T extends undefined ? undefined : T;
