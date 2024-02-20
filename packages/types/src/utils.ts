export type ValueOf<T> = T[keyof T];

export interface AllowAdditionalProperties {
  [x: string | number | symbol]: unknown;
}
