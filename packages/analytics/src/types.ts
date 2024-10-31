export * from './events';
export interface DefaultProperties {
  platform: 'web' | 'extension' | 'mobile';
}

export interface AnalyticsClientInterface {
  screen: (name: string, ...args: any[]) => Promise<any>;
  track: (event: string, ...args: any[]) => Promise<any>;
  group: (groupId: string, traits?: any, ...args: any[]) => Promise<any>;
  identify: (
    userId?: string | undefined,
    traits?: any,
    ...args: any[]
  ) => Promise<any> | ((traits?: object) => Promise<any>);
}

export interface AnalyticsClientConfig<T extends AnalyticsClientInterface> {
  client: T;
  defaultProperties?: DefaultProperties;
  defaultTraits?: JsonMap;
}
export type JsonList = JsonValue[];
export type JsonValue =
  | boolean
  | number
  | string
  | null
  | JsonList
  | JsonMap
  | undefined
  | unknown
  | Error;
export interface JsonMap {
  [key: string]: JsonValue;
  [index: number]: JsonValue;
}

export type OptionalIfUndefined<T> = T extends undefined ? undefined : T;
