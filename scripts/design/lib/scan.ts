// One ESLint pass per file. The lab's design-system rules (eslint-rules/design-system)
// run unchanged, so the report and `pnpm exec eslint -c eslint.design.config.js` agree
// on what counts as a raw colour, a raw button, a Radix import, an undefined textStyle.
// Small collector rules defined here add what the lint rules do not measure: the
// colour's mode, raw sizes, and token references that do not exist.
import { Linter } from 'eslint';
import tseslint from 'typescript-eslint';

import { designSystemPlugin } from '../../../eslint-rules/design-system/index.js';
import {
  collectLeaves,
  getPropertyName,
  getStaticString,
} from '../../../eslint-rules/design-system/shared.js';
import {
  type ColourVerdict,
  colourVerdict,
  composite,
  deltaE2000,
  extractColourLiterals,
  isNamedColour,
  parseColour,
  toHex,
} from './colour.ts';
import type { DesignSystem } from './system.ts';

type Mode = 'light' | 'dark';

interface Location {
  file: string;
  line: number;
  column: number;
}

interface ColourFinding extends Location {
  kind: 'colour';
  literal: string;
  property: string | null;
  mode: Mode;
  token: string;
  tokenValue: string;
  deltaE: number;
  verdict: ColourVerdict;
  sameValueTokens: string[];
  alternatives: { token: string; deltaE: number }[];
  note?: string;
  // Set when the literal is half of a { base, _dark } pair: the one token that fits both modes.
  pair?: {
    light: string;
    dark: string;
    token: string;
    lightDeltaE: number;
    darkDeltaE: number;
    verdict: ColourVerdict;
  };
}

type SizeGroup = 'spacing' | 'radius' | 'fontSize' | 'lineHeight' | 'dimension';
type SizeVerdict =
  | 'same — swap to token'
  | 'close — likely token, check'
  | 'off-scale — deliberate?';

interface SizeFinding extends Location {
  kind: 'size';
  literal: string;
  property: string;
  group: SizeGroup;
  px: number;
  token: string;
  tokenPx: number;
  diffPx: number;
  verdict: SizeVerdict;
  ties: string[];
}

interface TokenFinding extends Location {
  kind: 'token';
  tokenKind: 'textStyle' | 'colour' | 'spacing' | 'radius' | 'size';
  value: string;
  property: string;
  suggestion: string;
}

interface GuardrailFinding extends Location {
  kind: 'guardrail';
  rule: string;
  construct: string;
  message: string;
}

// A style prop set on a @leather.io/ui component: a change from how the shipped
// component looks (a Caption's ink, a Button's size, an icon's size or colour).
// Each one needs a why in DEVIATIONS.md, keyed `<Component>.<prop>`.
interface OverrideFinding extends Location {
  kind: 'override';
  component: string;
  prop: string;
  value: string;
}

export interface ScanResult {
  colours: ColourFinding[];
  sizes: SizeFinding[];
  tokens: TokenFinding[];
  guardrails: GuardrailFinding[];
  overrides: OverrideFinding[];
  parseErrors: { file: string; message: string }[];
}

// Props that restyle a ui component's text, ink or size. Layout props (margin,
// flex, gap, position) are composition, not a restyle, and are not listed.
const overrideProps = new Set([
  'color',
  'textStyle',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'letterSpacing',
  'textTransform',
  'opacity',
  'size',
]);
// Icons and IconButton also change shape through these.
const iconOverrideProps = new Set(['variant', 'width', 'height', 'boxSize']);

function overrideFor(component: string, prop: string): boolean {
  if (overrideProps.has(prop)) return true;
  return (/Icon$/.test(component) || component === 'IconButton') && iconOverrideProps.has(prop);
}

type Node = any; // ESTree node from typescript-eslint

const colourProps = new Set([
  'color',
  'bg',
  'bgColor',
  'background',
  'backgroundColor',
  'border',
  'borderColor',
  'borderTop',
  'borderBottom',
  'borderLeft',
  'borderRight',
  'borderTopColor',
  'borderBottomColor',
  'borderLeftColor',
  'borderRightColor',
  'outline',
  'outlineColor',
  'fill',
  'stroke',
  'boxShadow',
  'shadow',
  'shadowColor',
  'textShadow',
  'textDecorationColor',
  'caretColor',
  'accentColor',
  'tintColor',
  'placeholderTextColor',
  'underlayColor',
  'stopColor',
]);
const shadowProps = new Set(['boxShadow', 'shadow', 'textShadow', 'filter']);
const cssKeywords = new Set([
  'transparent',
  'currentcolor',
  'inherit',
  'initial',
  'unset',
  'revert',
  'none',
  'auto',
  'fit-content',
  'max-content',
  'min-content',
  'full',
  '100%',
]);

const spacingProps = new Set([
  'gap',
  'rowGap',
  'columnGap',
  'gridGap',
  'p',
  'px',
  'py',
  'pt',
  'pr',
  'pb',
  'pl',
  'ps',
  'pe',
  'padding',
  'paddingX',
  'paddingY',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'paddingInline',
  'paddingBlock',
  'paddingInlineStart',
  'paddingInlineEnd',
  'm',
  'mx',
  'my',
  'mt',
  'mr',
  'mb',
  'ml',
  'ms',
  'me',
  'margin',
  'marginX',
  'marginY',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'marginInline',
  'marginBlock',
]);
const radiusProps = new Set([
  'borderRadius',
  'rounded',
  'radius',
  'roundedTop',
  'roundedBottom',
  'roundedLeft',
  'roundedRight',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
]);
const dimensionProps = new Set([
  'width',
  'height',
  'w',
  'h',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'minW',
  'maxW',
  'minH',
  'maxH',
  'boxSize',
]);
const styleCallees = new Set([
  'css',
  'cva',
  'sva',
  'styled',
  'defineRecipe',
  'defineSlotRecipe',
  'StyleSheet',
]);

function sizeGroup(name: string | null): SizeGroup | null {
  if (!name) return null;
  if (spacingProps.has(name)) return 'spacing';
  if (radiusProps.has(name)) return 'radius';
  if (name === 'fontSize') return 'fontSize';
  if (name === 'lineHeight') return 'lineHeight';
  if (dimensionProps.has(name)) return 'dimension';
  return null;
}

function calleeName(callee: Node): string | null {
  if (callee.type === 'Identifier') return callee.name;
  if (callee.type === 'MemberExpression' && callee.object.type === 'Identifier')
    return callee.object.name;
  return null;
}

function jsxAttributeName(node: Node): string | null {
  return node.name?.type === 'JSXIdentifier' ? node.name.name : null;
}

// <svg>, <rect>, <div>: plain DOM elements, whose width/height are attributes, not style props.
const isIntrinsic = (tag: string) => /^[a-z][\w-]*$/.test(tag);

function jsxElementName(nameNode: Node): string | null {
  if (!nameNode) return null;
  if (nameNode.type === 'JSXIdentifier') return nameNode.name;
  if (nameNode.type === 'JSXMemberExpression')
    return `${jsxElementName(nameNode.object)}.${nameNode.property.name}`;
  return null;
}

// A size or colour value is a style value when it sits in a style call, in any
// JSX attribute of a component or Panda element (not an intrinsic <svg width>),
// or in a JSX style/css object.
function inStyleContext(ancestors: Node[]): boolean {
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const ancestor = ancestors[i];
    if (ancestor.type === 'CallExpression' && styleCallees.has(calleeName(ancestor.callee) ?? ''))
      return true;
    if (ancestor.type === 'TaggedTemplateExpression') return true;
    if (ancestor.type === 'JSXAttribute') {
      const element = ancestors[i - 1];
      const tag = element?.type === 'JSXOpeningElement' ? jsxElementName(element.name) : null;
      const attr = jsxAttributeName(ancestor);
      if (attr === 'style' || attr === 'css') return true;
      return tag !== null && !isIntrinsic(tag);
    }
  }
  return false;
}

function modeOf(ancestors: Node[]): Mode {
  for (const ancestor of ancestors) {
    if (ancestor.type !== 'Property') continue;
    const name = getPropertyName(ancestor) ?? '';
    if (/^_(os)?dark$/i.test(name) || (/dark/i.test(name) && name.includes('&'))) return 'dark';
  }
  return 'light';
}

// { base: '#F2F2F2', _dark: '#1E1E1E' }: both literals share the object's position as key.
function pairKeyOf(node: Node, ancestors: Node[]): string | null {
  const property = ancestors[ancestors.length - 1];
  const object = ancestors[ancestors.length - 2];
  if (
    property?.type !== 'Property' ||
    property.value !== node ||
    object?.type !== 'ObjectExpression'
  )
    return null;
  const keys = object.properties.map((prop: Node) => getPropertyName(prop));
  if (
    !keys.includes('base') ||
    !keys.some((key: string | null) => key && /^_(os)?dark$/i.test(key))
  )
    return null;
  return `${object.range[0]}`;
}

function nearestPropertyName(ancestors: Node[]): string | null {
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const ancestor = ancestors[i];
    if (ancestor.type === 'Property') {
      const name = getPropertyName(ancestor);
      if (
        name &&
        !['base', '_dark', '_osDark', '_light', 'sm', 'md', 'lg', 'xl', '2xl'].includes(name)
      )
        return name;
    }
    if (ancestor.type === 'JSXAttribute') return jsxAttributeName(ancestor);
  }
  return null;
}

function levenshtein(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

function closestNames(value: string, names: string[], count = 2): string[] {
  const family = value.split('.')[0];
  const pool = names.some(name => name.startsWith(`${family}.`))
    ? names.filter(name => name.startsWith(`${family}.`))
    : names;
  return [...pool].sort((a, b) => levenshtein(value, a) - levenshtein(value, b)).slice(0, count);
}

function parsePx(piece: string): number | null {
  const match = /^(-?\d*\.?\d+)(px|rem)$/.exec(piece);
  if (!match) return null;
  return match[2] === 'rem' ? parseFloat(match[1]) * 16 : parseFloat(match[1]);
}

function roleOf(property: string | null): 'text' | 'background' | 'border' | null {
  if (!property) return null;
  if (
    /^(color|fill|stroke|caretColor|textDecorationColor|placeholderTextColor|tintColor)$/.test(
      property
    )
  )
    return 'text';
  if (/^(bg|bgColor|background|backgroundColor|underlayColor)$/.test(property)) return 'background';
  if (/^(border|outline)/.test(property)) return 'border';
  return null;
}

function roleMatches(token: string, role: ReturnType<typeof roleOf>): boolean {
  if (!role) return true;
  if (role === 'text') return /text|action|invert|stacks/.test(token);
  if (role === 'background') return /background|action|invert|stacks/.test(token);
  return /border|underline|action/.test(token);
}

function matchColour(
  literal: string,
  mode: Mode,
  property: string | null,
  system: DesignSystem
): Omit<ColourFinding, keyof Location | 'kind' | 'literal' | 'property' | 'mode'> | null {
  const parsed = parseColour(literal);
  if (!parsed) return null;
  const rendered = composite(parsed, system.background[mode]);
  const ranked = system.colours
    .map(token => ({
      token: token.name,
      value: mode === 'light' ? token.light : token.dark,
      translucent: token.translucent,
      deltaE: deltaE2000(rendered, mode === 'light' ? token.lightRgb : token.darkRgb),
    }))
    .sort((a, b) => a.deltaE - b.deltaE);
  const role = roleOf(property);
  // Among tokens within 1 ΔE of the winner, prefer one whose role fits the
  // property (a text colour for color=, a background for bg=), then an opaque
  // token for an opaque literal (a translucent token only matches on one
  // surface), then a `default` token over its same-valued siblings.
  const near = ranked.filter(entry => entry.deltaE <= ranked[0].deltaE + 1);
  const preference = (entry: (typeof ranked)[number]) =>
    (roleMatches(entry.token, role) ? 0 : 4) +
    (parsed.a >= 1 && entry.translucent ? 2 : 0) +
    (entry.token.includes('default') ? 0 : 0.5) +
    entry.deltaE / 100;
  const best = [...near].sort((a, b) => preference(a) - preference(b))[0];
  const sameValueTokens = ranked
    .filter(entry => entry.token !== best.token && Math.abs(entry.deltaE - best.deltaE) < 0.01)
    .map(entry => entry.token);
  const alternatives = ranked
    .filter(entry => entry.token !== best.token && !sameValueTokens.includes(entry.token))
    .slice(0, 2)
    .map(entry => ({ token: entry.token, deltaE: round(entry.deltaE) }));
  let note: string | undefined;
  if (parsed.a < 1)
    note = `translucent (alpha ${round(parsed.a)}), compared as rendered over ${toHex(system.background[mode])}`;
  if (property && shadowProps.has(property)) {
    note = [note, 'inside a shadow: if this is elevation, use boxShadow="elevation" instead']
      .filter(Boolean)
      .join('; ');
  }
  return {
    token: best.token,
    tokenValue: best.value,
    deltaE: round(best.deltaE),
    verdict: colourVerdict(best.deltaE),
    sameValueTokens,
    alternatives,
    note,
  };
}

function matchPair(
  light: string,
  dark: string,
  system: DesignSystem
): ColourFinding['pair'] | undefined {
  const lightRgb = parseColour(light);
  const darkRgb = parseColour(dark);
  if (!lightRgb || !darkRgb) return undefined;
  const lightRendered = composite(lightRgb, system.background.light);
  const darkRendered = composite(darkRgb, system.background.dark);
  const best = system.colours
    .map(token => ({
      token: token.name,
      lightDeltaE: deltaE2000(lightRendered, token.lightRgb),
      darkDeltaE: deltaE2000(darkRendered, token.darkRgb),
    }))
    .sort(
      (a, b) => Math.max(a.lightDeltaE, a.darkDeltaE) - Math.max(b.lightDeltaE, b.darkDeltaE)
    )[0];
  return {
    light,
    dark,
    token: best.token,
    lightDeltaE: round(best.lightDeltaE),
    darkDeltaE: round(best.darkDeltaE),
    verdict: colourVerdict(Math.max(best.lightDeltaE, best.darkDeltaE)),
  };
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function matchSize(px: number, group: SizeGroup, system: DesignSystem) {
  const scale: [string, number][] =
    group === 'spacing'
      ? Object.entries(system.spacing)
      : group === 'radius'
        ? Object.entries(system.radii)
        : group === 'dimension'
          ? Object.entries(system.sizes)
          : system.textStyles.map(style => [
              `textStyle="${style.name}"`,
              group === 'fontSize' ? style.fontSizePx : style.lineHeightPx,
            ]);
  const magnitude = Math.abs(px);
  const ranked = scale
    .map(([token, value]) => ({ token, value, diff: magnitude - value }))
    .sort((a, b) => Math.abs(a.diff) - Math.abs(b.diff));
  const best = ranked[0];
  const ties = ranked
    .filter(entry => entry !== best && Math.abs(entry.diff) === Math.abs(best.diff))
    .map(entry => entry.token);
  const abs = Math.abs(best.diff);
  const verdict: SizeVerdict =
    abs === 0
      ? 'same — swap to token'
      : abs <= 2
        ? 'close — likely token, check'
        : 'off-scale — deliberate?';
  const negative = px < 0 && group === 'spacing';
  return {
    token: negative ? `-${best.token}` : best.token,
    tokenPx: negative ? -best.value : best.value,
    diffPx: round(best.diff),
    verdict,
    ties,
  };
}

interface Collected {
  overrides: { node: Node; component: string; prop: string; value: string }[];
  strings: Map<
    string,
    { value: string; mode: Mode; property: string | null; pairKey: string | null }
  >;
  named: { node: Node; value: string; mode: Mode; property: string }[];
  sizes: { node: Node; raw: string; px: number; property: string; group: SizeGroup }[];
  tokens: {
    node: Node;
    tokenKind: TokenFinding['tokenKind'];
    value: string;
    property: string;
    suggestion: string;
  }[];
}

function locKey(node: Node) {
  return `${node.loc.start.line}:${node.loc.start.column + 1}`;
}

function collectorPlugin(collected: Collected, system: DesignSystem, uiExports: Set<string>) {
  const colourNames = new Set([
    ...system.colours.map(token => token.name),
    ...system.extraColourNames,
  ]);
  const spacingNames = new Set(Object.keys(system.spacing));
  const radiusNames = new Set(Object.keys(system.radii));
  const sizeNames = new Set([...Object.keys(system.sizes), ...spacingNames]);
  const refGroups: Record<string, { kind: TokenFinding['tokenKind']; names: Set<string> }> = {
    colors: { kind: 'colour', names: colourNames },
    spacing: { kind: 'spacing', names: spacingNames },
    radii: { kind: 'radius', names: radiusNames },
    sizes: { kind: 'size', names: sizeNames },
  };

  function checkValue(propName: string | null, valueNode: Node, ancestors: Node[]) {
    if (!propName) return;
    const mode = modeOf(ancestors);
    const styled = inStyleContext(ancestors);
    for (const leaf of collectLeaves(valueNode)) {
      const text = getStaticString(leaf);
      const number = leaf.type === 'Literal' && typeof leaf.value === 'number' ? leaf.value : null;

      if (colourProps.has(propName) && text !== null) {
        const pieces = /^(border|outline)/.test(propName)
          ? text.trim().split(/\s+/)
          : [text.trim()];
        for (const piece of pieces) {
          if (isNamedColour(piece) && !cssKeywords.has(piece.toLowerCase())) {
            collected.named.push({ node: leaf, value: piece, mode, property: propName });
          }
        }
        const bare = text.trim().replace(/\/\d+$/, '');
        if (/^[a-z][a-zA-Z0-9]*(\.[a-zA-Z0-9-]+)+$/.test(bare) && !colourNames.has(bare)) {
          collected.tokens.push({
            node: leaf,
            tokenKind: 'colour',
            value: text,
            property: propName,
            suggestion: closestNames(bare, [...colourNames]).join(' or '),
          });
        }
      }

      const group = sizeGroup(propName);
      if (!group || (!styled && number !== null)) continue;
      if (number !== null) {
        if (number === 0 || group === 'lineHeight') continue;
        collected.sizes.push({
          node: leaf,
          raw: String(number),
          px: number,
          property: propName,
          group,
        });
        continue;
      }
      if (text === null || /calc\(|var\(|token\(|\{/.test(text)) continue;
      const trimmed = text.trim();
      if (
        group === 'spacing' &&
        /^-?space\.\d+$/.test(trimmed) &&
        !spacingNames.has(trimmed.replace(/^-/, ''))
      ) {
        collected.tokens.push({
          node: leaf,
          tokenKind: 'spacing',
          value: trimmed,
          property: propName,
          suggestion: closestNames(trimmed.replace(/^-/, ''), [...spacingNames]).join(' or '),
        });
        continue;
      }
      if (
        group === 'radius' &&
        /^[a-z][\w-]*$/i.test(trimmed) &&
        !radiusNames.has(trimmed) &&
        !cssKeywords.has(trimmed.toLowerCase())
      ) {
        collected.tokens.push({
          node: leaf,
          tokenKind: 'radius',
          value: trimmed,
          property: propName,
          suggestion: [...radiusNames].join(', '),
        });
        continue;
      }
      for (const piece of trimmed.split(/\s+/)) {
        const px = parsePx(piece);
        if (px === null || px === 0) continue;
        collected.sizes.push({ node: leaf, raw: piece, px, property: propName, group });
      }
    }
  }

  function checkRefs(node: Node, text: string) {
    const refs = [
      ...text.matchAll(/\{(colors|spacing|radii|sizes)\.([^}]+)\}/g),
      ...text.matchAll(/token\((colors|spacing|radii|sizes)\.([^),\s]+)/g),
    ];
    for (const ref of refs) {
      const group = refGroups[ref[1]];
      if (!group || group.names.has(ref[2])) continue;
      collected.tokens.push({
        node,
        tokenKind: group.kind,
        value: ref[0],
        property: 'token reference',
        suggestion: closestNames(ref[2], [...group.names]).join(' or '),
      });
    }
  }

  const collect = {
    create(context: any) {
      return {
        Literal(node: Node) {
          if (typeof node.value !== 'string') return;
          const ancestors = context.sourceCode.getAncestors(node);
          collected.strings.set(locKey(node), {
            value: node.value,
            mode: modeOf(ancestors),
            property: nearestPropertyName(ancestors),
            pairKey: pairKeyOf(node, ancestors),
          });
          if (inStyleContext(ancestors)) checkRefs(node, node.value);
        },
        TemplateElement(node: Node) {
          const ancestors = context.sourceCode.getAncestors(node);
          const value = node.value.cooked ?? node.value.raw;
          collected.strings.set(locKey(node), {
            value,
            mode: modeOf(ancestors),
            property: nearestPropertyName(ancestors),
            pairKey: null,
          });
          if (inStyleContext(ancestors)) checkRefs(node, value);
        },
        JSXAttribute(node: Node) {
          const ancestors = context.sourceCode.getAncestors(node);
          const element = ancestors[ancestors.length - 1];
          const tag = element?.type === 'JSXOpeningElement' ? jsxElementName(element.name) : null;
          if (tag && isIntrinsic(tag)) return; // <svg width=...>
          const attr = jsxAttributeName(node);
          if (tag && attr && uiExports.has(tag) && overrideFor(tag, attr)) {
            const text = node.value ? getStaticString(node.value) : 'true';
            const source = context.sourceCode.getText(node.value ?? node);
            collected.overrides.push({
              node,
              component: tag,
              prop: attr,
              value: text ?? source.replace(/^\{|\}$/g, ''),
            });
          }
          checkValue(jsxAttributeName(node), node.value, [...ancestors, node]);
        },
        Property(node: Node) {
          const ancestors = context.sourceCode.getAncestors(node);
          const name = getPropertyName(node);
          // Plain objects outside style calls only count when the value is an explicit px/rem string.
          if (!inStyleContext([...ancestors, node])) {
            const text = getStaticString(node.value);
            if (text === null || !/\d(px|rem)\b/.test(text)) return;
          }
          checkValue(name, node.value, [...ancestors, node]);
        },
      };
    },
  };
  return { rules: { collect } };
}

function relativeDuplicates(uiExports: string[]) {
  const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  return [
    {
      pattern: '^@app/ui/components/tooltip/(basic-tooltip|tooltip)$',
      replacement: 'BasicTooltip or Tooltip from @leather.io/ui',
    },
    ...uiExports.map(name => ({
      pattern: `^(?!@leather\\.io/)(?:.*/)?${kebab(name)}(?:\\.web)?$`,
      replacement: `${name} from @leather.io/ui`,
    })),
  ];
}

export function scanFile(
  file: string,
  code: string,
  system: DesignSystem,
  uiExports: string[],
  result: ScanResult,
  // Components whose style props count as restyles (ui exports and icons).
  restyleNames: string[] = uiExports
) {
  const collected: Collected = {
    overrides: [],
    strings: new Map(),
    named: [],
    sizes: [],
    tokens: [],
  };
  const linter = new Linter({ configType: 'flat' });
  const messages = linter.verify(
    code,
    [
      {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
          parser: tseslint.parser as any,
          parserOptions: { ecmaFeatures: { jsx: true } },
        },
        plugins: {
          'design-system': designSystemPlugin as any,
          promote: collectorPlugin(collected, system, new Set(restyleNames)) as any,
        },
        rules: {
          'promote/collect': 'error',
          'design-system/no-raw-color': ['error', { checkShadows: true }],
          'design-system/valid-text-style': [
            'error',
            { textStyles: system.textStyles.map(style => style.name) },
          ],
          'design-system/no-raw-interactive': 'error',
          'design-system/no-primitive-imports': 'error',
          'design-system/no-local-duplicate': [
            'error',
            { duplicates: relativeDuplicates(uiExports) },
          ],
          'design-system/no-text-opacity': 'error',
          'design-system/no-mono-amount': ['error', { checkTabular: true }],
          'design-system/no-dead-chevron': 'error',
        },
      },
    ],
    { filename: file.endsWith('x') ? 'input.tsx' : 'input.ts' }
  );

  const seenColour = new Set<string>();
  const pairs = new Map<string, ColourFinding[]>();
  const lines = code.split('\n');
  for (const message of messages) {
    const where = { file, line: message.line, column: message.column };
    if (message.fatal) {
      result.parseErrors.push({ file, message: message.message });
      continue;
    }
    switch (message.ruleId) {
      case 'design-system/no-raw-color': {
        const source = collected.strings.get(`${message.line}:${message.column}`);
        if (!source) break;
        for (const literal of extractColourLiterals(source.value)) {
          const key = `${message.line}:${message.column}:${literal}`;
          if (seenColour.has(key)) continue;
          seenColour.add(key);
          const match = matchColour(literal, source.mode, source.property, system);
          if (!match) continue;
          const finding: ColourFinding = {
            kind: 'colour',
            ...where,
            literal,
            property: source.property,
            mode: source.mode,
            ...match,
          };
          result.colours.push(finding);
          if (source.pairKey && literal === source.value.trim()) {
            const group = pairs.get(source.pairKey) ?? [];
            group.push(finding);
            pairs.set(source.pairKey, group);
          }
        }
        break;
      }
      case 'design-system/valid-text-style': {
        const value = /instead of '([^']+)'/.exec(message.message)?.[1] ?? '?';
        const suggestion = /\(([^)]*)\)/.exec(message.message)?.[1] ?? '';
        result.tokens.push({
          kind: 'token',
          ...where,
          tokenKind: 'textStyle',
          value,
          property: 'textStyle',
          suggestion,
        });
        break;
      }
      case 'design-system/no-raw-interactive':
      case 'design-system/no-primitive-imports':
      case 'design-system/no-local-duplicate':
      case 'design-system/no-text-opacity':
      case 'design-system/no-mono-amount':
      case 'design-system/no-dead-chevron': {
        const lineText = lines[message.line - 1] ?? '';
        const construct =
          message.messageId === 'rawButton'
            ? '<button>'
            : message.messageId === 'styledButton'
              ? 'styled.button'
              : message.messageId === 'deadChevron'
                ? 'navigates without a destination'
                : message.messageId === 'monoAmount'
                  ? `mono amount: ${/instead of (\S+)/.exec(message.message)?.[1] ?? ''}`
                  : (/'([^']+)'/.exec(message.message)?.[1] ?? lineText.trim().slice(0, 60));
        result.guardrails.push({
          kind: 'guardrail',
          ...where,
          rule: message.ruleId.replace('design-system/', ''),
          construct,
          message: message.message,
        });
        break;
      }
    }
  }

  for (const group of pairs.values()) {
    const light = group.find(finding => finding.mode === 'light');
    const dark = group.find(finding => finding.mode === 'dark');
    if (!light || !dark) continue;
    const pair = matchPair(light.literal, dark.literal, system);
    light.pair = pair;
    dark.pair = pair;
  }

  for (const named of collected.named) {
    const match = matchColour(named.value, named.mode, named.property, system);
    if (!match) continue;
    result.colours.push({
      kind: 'colour',
      file,
      line: named.node.loc.start.line,
      column: named.node.loc.start.column + 1,
      literal: named.value,
      property: named.property,
      mode: named.mode,
      ...match,
      note: ['named CSS colour', match.note].filter(Boolean).join('; '),
    });
  }
  for (const size of collected.sizes) {
    result.sizes.push({
      kind: 'size',
      file,
      line: size.node.loc.start.line,
      column: size.node.loc.start.column + 1,
      literal: size.raw,
      property: size.property,
      group: size.group,
      px: size.px,
      ...matchSize(size.px, size.group, system),
    });
  }
  for (const override of collected.overrides) {
    result.overrides.push({
      kind: 'override',
      file,
      line: override.node.loc.start.line,
      column: override.node.loc.start.column + 1,
      component: override.component,
      prop: override.prop,
      value: override.value,
    });
  }
  for (const token of collected.tokens) {
    result.tokens.push({
      kind: 'token',
      file,
      line: token.node.loc.start.line,
      column: token.node.loc.start.column + 1,
      tokenKind: token.tokenKind,
      value: token.value,
      property: token.property,
      suggestion: token.suggestion,
    });
  }
}
