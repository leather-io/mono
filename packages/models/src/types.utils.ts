export type ValueOf<T> = T[keyof T];

export interface AllowAdditionalProperties {
  [x: string | number | symbol]: unknown;
}

type Primitive = null | undefined | string | number | boolean | symbol | bigint;

export type LiteralUnion<LiteralType, BaseType extends Primitive> =
  | LiteralType
  | (BaseType & Record<never, never>);

export type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T][];

export type ReplaceTypes<T, Replacements extends { [K in keyof T]?: any }> = Omit<
  T,
  keyof Replacements
> & {
  [K in keyof Replacements]: Replacements[K];
};

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
