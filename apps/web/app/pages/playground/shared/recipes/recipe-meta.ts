// When to reach for a recipe, and when not: the same shape as the ui package's
// component meta (packages/ui/src/utils/component-meta.shared.ts), so a recipe
// that moves into packages/ui keeps its rules. The recipes page prints these
// under each demo (/playground/recipes).
export interface RecipeMeta {
  name: string;
  // What it mirrors in the shipped extension, so a reviewer can compare.
  mirrors: string;
  useWhen: string[];
  dontUseWhen: { situation: string; use: string }[];
}

export function defineRecipeMeta(meta: RecipeMeta): RecipeMeta {
  return meta;
}
