export * from './events';

export interface DefaultProperties {
  platform: 'web' | 'extension' | 'mobile' | 'earn';
  [key: string]: string | number | boolean | undefined;
}

export interface AnalyticsClientInterface {
  screen: (name: string, ...args: any[]) => Promise<any>;
  track: (event: string, ...args: any[]) => Promise<any>;
  group: (groupId: string, traits?: any, ...args: any[]) => Promise<any>;
  identify: (...args: any[]) => Promise<any>;
  page?: (name: string, ...args: any[]) => Promise<any>;
}

export interface AnalyticsClientConfig<T extends AnalyticsClientInterface> {
  client: T;
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
