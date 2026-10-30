import type { TSESTree } from '@typescript-eslint/utils';

export function neverLink(anchor: string): string;
export function getStaticString(node: TSESTree.Node | null | undefined): string | null;
export function getPropertyName(node: TSESTree.Node | null | undefined): string | null;
export function getJsxName(node: TSESTree.JSXTagNameExpression | null | undefined): string | null;
export function getJsxAttribute(
  openingElement: TSESTree.JSXOpeningElement,
  name: string
): TSESTree.JSXAttribute | undefined;
export function collectLeaves(
  node: TSESTree.Node | null | undefined,
  leaves?: TSESTree.Node[]
): TSESTree.Node[];
