import { readFileSync } from 'node:fs';

import { colorThemes } from '@leather.io/tokens';

import { serverVersion } from '../config';

type BridgePage = 'connect' | 'approve';

interface StaticAsset {
  body: Buffer;
  contentType: string;
}

const escapeReplacements: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => escapeReplacements[char] ?? char);
}

function paletteToCssVariables(palette: Record<string, string>): string {
  return Object.entries(palette)
    .map(([token, value]) => `--${token.replace(/\./g, '-')}: ${value};`)
    .join('\n');
}

const cssVariables = [
  `:root {\n${paletteToCssVariables(colorThemes.base)}\n}`,
  `@media (prefers-color-scheme: dark) {\n:root {\n${paletteToCssVariables(colorThemes.dark)}\n}\n}`,
].join('\n');

const textCache = new Map<string, string>();

function loadText(relativePath: string): string {
  const cached = textCache.get(relativePath);
  if (cached !== undefined) return cached;
  const content = readFileSync(new URL(relativePath, import.meta.url), 'utf8');
  textCache.set(relativePath, content);
  return content;
}

export function renderBridgePage(page: BridgePage, requestId: string): string {
  return loadText(`./pages/${page}.html`)
    .replace('{{cssVars}}', cssVariables)
    .replace('{{requestId}}', escapeHtml(requestId))
    .replace('{{version}}', escapeHtml(serverVersion));
}

const staticAssetRoutes: Record<string, { relativePath: string; contentType: string }> = {
  '/assets/bridge.css': {
    relativePath: './assets/bridge.css',
    contentType: 'text/css; charset=utf-8',
  },
  '/assets/bridge-client.js': {
    relativePath: './assets/bridge-client.js',
    contentType: 'text/javascript; charset=utf-8',
  },
  '/assets/fonts/diatype-regular.woff2': {
    relativePath: './assets/fonts/diatype-regular.woff2',
    contentType: 'font/woff2',
  },
  '/assets/fonts/diatype-medium.woff2': {
    relativePath: './assets/fonts/diatype-medium.woff2',
    contentType: 'font/woff2',
  },
  '/assets/fonts/marche-super-pro.woff2': {
    relativePath: './assets/fonts/marche-super-pro.woff2',
    contentType: 'font/woff2',
  },
  '/favicon.ico': {
    relativePath: './assets/favicon.ico',
    contentType: 'image/x-icon',
  },
};

const assetCache = new Map<string, Buffer>();

export function getStaticAsset(pathname: string): StaticAsset | undefined {
  const route = staticAssetRoutes[pathname];
  if (!route) return undefined;
  const cached = assetCache.get(pathname);
  if (cached) return { body: cached, contentType: route.contentType };
  try {
    const body = readFileSync(new URL(route.relativePath, import.meta.url));
    assetCache.set(pathname, body);
    return { body, contentType: route.contentType };
  } catch {
    return undefined;
  }
}
