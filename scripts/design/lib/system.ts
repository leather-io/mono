import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { type Rgba, composite, parseColour } from './colour.ts';
import {
  arrayValue,
  isFunction,
  numberValue,
  objectValue,
  stringMap,
  stringValue,
} from './values.ts';

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
    light: parseColour(bgPair?.light ?? '#FFFFFF') ?? { r: 255, g: 255, b: 255, a: 1 },
    dark: parseColour(bgPair?.dark ?? '#12100F') ?? { r: 18, g: 16, b: 15, a: 1 },
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
  const imported: unknown = await import(pathToFileURL(entry).href);
  const module = objectValue(imported);
  const themes = objectValue(module.colorThemes);
  const base = stringMap(themes.base);
  const dark = stringMap(themes.dark);
  const colourPairs = Object.keys(base).map(name => ({
    name,
    light: base[name],
    dark: dark[name] ?? base[name],
  }));
  if (!isFunction(module.getWebTextVariants)) throw new Error('Missing getWebTextVariants');
  const textVariants = objectValue(module.getWebTextVariants());
  const tokens = objectValue(module.tokens);
  return finish('packages/tokens/dist (built @leather.io/tokens)', colourPairs, {
    extraColourNames: Object.keys(objectValue(tokens.colors ?? {})),
    spacing: pxMap(Object.entries(objectValue(tokens.spacing))),
    radii: pxMap(Object.entries(objectValue(tokens.radii))),
    sizes: pxMap(Object.entries(objectValue(tokens.sizes))),
    textStyles: Object.entries(textVariants).map(([name, variant]) => {
      const value = objectValue(objectValue(variant).value);
      return {
        name,
        fontSizePx: px(stringValue(value.fontSize)) ?? 0,
        lineHeightPx: px(stringValue(value.lineHeight)) ?? 0,
      };
    }),
  });
}

function fromSystemJson(file: string): DesignSystem {
  const parsed: unknown = JSON.parse(readFileSync(file, 'utf8'));
  const json = objectValue(parsed);
  const colors = objectValue(json.colors);
  const typography = objectValue(json.typography);
  const spacing = objectValue(json.spacing);
  const radii = objectValue(json.radii);
  const colourPairs = arrayValue(colors.groups).flatMap(group =>
    arrayValue(objectValue(group).tokens).map(value => {
      const token = objectValue(value);
      return {
        name: stringValue(token.name),
        light: stringValue(token.light),
        dark: stringValue(token.dark),
      };
    })
  );
  return finish(file, colourPairs, {
    extraColourNames: Object.keys(objectValue(colors.unthemed_colors ?? {})),
    spacing: pxMap(Object.entries(objectValue(spacing.web_scale))),
    radii: pxMap(Object.entries(objectValue(radii.web))),
    sizes: pxMap(Object.entries(objectValue(spacing.sizes))),
    textStyles: arrayValue(typography.textStyles).map(value => {
      const style = objectValue(value);
      return {
        name: stringValue(style.name),
        fontSizePx: numberValue(style.font_size_px),
        lineHeightPx: numberValue(style.line_height_px),
      };
    }),
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
