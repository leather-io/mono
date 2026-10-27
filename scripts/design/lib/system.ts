// Loads the Leather design-system values the report measures against.
// Primary source: the built @leather.io/tokens package (packages/tokens/dist).
// Fallback: a leather-system.json snapshot (--system <path>), for when tokens
// are not built.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { type Rgba, composite, parseColour } from './colour.ts';

export const repoRoot = path.resolve(import.meta.dirname, '../../..');

interface ColourToken {
  name: string;
  light: string;
  dark: string;
  lightRgb: Rgba;
  darkRgb: Rgba;
  translucent: boolean;
}

interface TextStyleToken {
  name: string;
  fontSizePx: number;
  lineHeightPx: number;
}

export interface DesignSystem {
  source: string;
  colours: ColourToken[];
  // Unthemed colour tokens valid in a colour prop (current, overlay, ...).
  extraColourNames: string[];
  spacing: Record<string, number>;
  radii: Record<string, number>;
  sizes: Record<string, number>;
  textStyles: TextStyleToken[];
  background: { light: Rgba; dark: Rgba };
}

function px(value: string | number): number | null {
  if (typeof value === 'number') return value;
  const match = /^(-?[\d.]+)(px|rem)?$/.exec(value.trim());
  if (!match) return null;
  return match[2] === 'rem' ? parseFloat(match[1]) * 16 : parseFloat(match[1]);
}

function pxMap(entries: [string, unknown][]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [name, raw] of entries) {
    const value = typeof raw === 'object' && raw !== null && 'value' in raw ? raw.value : raw;
    const parsed = typeof value === 'string' || typeof value === 'number' ? px(value) : null;
    if (parsed !== null) result[name] = parsed;
  }
  return result;
}

function finish(
  source: string,
  colourPairs: { name: string; light: string; dark: string }[],
  rest: Omit<DesignSystem, 'source' | 'colours' | 'background'>
): DesignSystem {
  const lookup = new Map(colourPairs.map(pair => [pair.name, pair]));
  const bgPair = lookup.get('ink.background-primary');
  const background = {
    light: parseColour(bgPair?.light ?? '#FFFFFF')!,
    dark: parseColour(bgPair?.dark ?? '#12100F')!,
  };
  const colours = colourPairs.flatMap(pair => {
    const light = parseColour(pair.light);
    const dark = parseColour(pair.dark);
    if (!light || !dark) return [];
    return [
      {
        ...pair,
        lightRgb: composite(light, background.light),
        darkRgb: composite(dark, background.dark),
        translucent: light.a < 1 || dark.a < 1,
      },
    ];
  });
  return { source, colours, background, ...rest };
}

async function fromTokensPackage(): Promise<DesignSystem | null> {
  const entry = path.join(repoRoot, 'packages/tokens/dist/index.js');
  if (!existsSync(entry)) return null;
  const tokens = await import(pathToFileURL(entry).href);
  const base: Record<string, string> = tokens.colorThemes.base;
  const dark: Record<string, string> = tokens.colorThemes.dark;
  const colourPairs = Object.keys(base).map(name => ({
    name,
    light: base[name],
    dark: dark[name] ?? base[name],
  }));
  const textVariants: Record<string, { value: { fontSize: string; lineHeight: string } }> =
    tokens.getWebTextVariants();
  return finish('packages/tokens/dist (built @leather.io/tokens)', colourPairs, {
    extraColourNames: Object.keys(tokens.tokens.colors ?? {}),
    spacing: pxMap(Object.entries(tokens.tokens.spacing)),
    radii: pxMap(Object.entries(tokens.tokens.radii)),
    sizes: pxMap(Object.entries(tokens.tokens.sizes)),
    textStyles: Object.entries(textVariants).map(([name, variant]) => ({
      name,
      fontSizePx: px(variant.value.fontSize) ?? 0,
      lineHeightPx: px(variant.value.lineHeight) ?? 0,
    })),
  });
}

interface SystemJson {
  colors: {
    unthemed_colors?: Record<string, string>;
    groups: { tokens: { name: string; light: string; dark: string }[] }[];
  };
  typography: { textStyles: { name: string; font_size_px: number; line_height_px: number }[] };
  spacing: { web_scale: Record<string, string>; sizes: Record<string, unknown> };
  radii: { web: Record<string, string> };
}

function fromSystemJson(file: string): DesignSystem {
  const json: SystemJson = JSON.parse(readFileSync(file, 'utf8'));
  const colourPairs = json.colors.groups.flatMap(group =>
    group.tokens.map(token => ({ name: token.name, light: token.light, dark: token.dark }))
  );
  return finish(file, colourPairs, {
    extraColourNames: Object.keys(json.colors.unthemed_colors ?? {}),
    spacing: pxMap(Object.entries(json.spacing.web_scale)),
    radii: pxMap(Object.entries(json.radii.web)),
    sizes: pxMap(Object.entries(json.spacing.sizes)),
    textStyles: json.typography.textStyles.map(style => ({
      name: style.name,
      fontSizePx: style.font_size_px,
      lineHeightPx: style.line_height_px,
    })),
  });
}

export async function loadDesignSystem(systemJson?: string): Promise<DesignSystem> {
  if (systemJson) return fromSystemJson(systemJson);
  const fromPackage = await fromTokensPackage();
  if (fromPackage) return fromPackage;
  throw new Error(
    'packages/tokens/dist is missing. Run `pnpm --filter @leather.io/tokens build`, or pass --system <leather-system.json>.'
  );
}
