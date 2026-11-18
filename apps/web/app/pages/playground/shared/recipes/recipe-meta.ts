export interface RecipeMeta {
  name: string;
  mirrors: string;
  useWhen: string[];
  dontUseWhen: { situation: string; use: string }[];
}

export function defineRecipeMeta(meta: RecipeMeta): RecipeMeta {
  return meta;
}
