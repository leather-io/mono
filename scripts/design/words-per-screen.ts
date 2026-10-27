// Words per screen: visible word counts for each device frame on Playground
// pages, so a copy budget can be checked with a number. See docs/design/explore.md.
//
//   node scripts/design/words-per-screen.ts <url...> [--urls urls.txt] [--json out.json | --json -]
//                                           [--selector '[data-frame]'] [--max-primaries 1]
//
// Every element matching --selector (default `[data-frame]`) is one frame. Its
// visible text (innerText, with visually hidden elements removed) is split on
// whitespace and each token is classified:
// - `addresses`: address-like tokens (bc1…, tb1…, SP…/ST…, sbtc…, 0x…, long
//   hashes) and truncated ones ("SP2J…9EJ7", "bc1q...4kf2"). An address split
//   into groups (AddressDisplayer: "SP2J 6ZY4 8GV1 …") counts as one address.
// - `numbers`: number-only tokens (0.00500000, ~20–40, $326.30, 14).
// - `words`: the rest. Punctuation-only tokens (·, —, →) are dropped.
// When a sheet is open (a visible [role="dialog"] or [aria-modal="true"] in the
// frame), only the sheet is counted: the dimmed screen behind it is excluded,
// and `sheet` is true in the output.
// `primaries` counts the solid buttons visible in the frame (or the open
// sheet): a button, [role=button] or link with a label whose own fill is
// opaque and contrasts with the surface behind it by 3:1 or more. That is
// Button variant="solid" in light and dark, intent="danger" included; outline,
// ghost, disabled and chip fills don't reach 3:1. A screen gets one primary
// (docs/design/review-checklist.md); any frame over --max-primaries (default 1)
// is listed after the table and the script exits 1.
// Frames are labelled by the closest data-variant, data-screen, data-frame and
// data-theme attributes. The table goes to stdout; --json writes JSON to a file,
// and --json - prints only the JSON.
import type { Page } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

export interface WordCount {
  words: number;
  numbers: number;
  addresses: number;
}

export interface FrameCount extends WordCount {
  url: string;
  index: number;
  variant: string | null;
  screen: string | null;
  frame: string | null;
  theme: string | null;
  // Only the open sheet was counted.
  sheet: boolean;
  // Solid (primary) buttons visible in the frame or open sheet.
  primaries: number;
  // Their labels, to name them in the failure list.
  primaryLabels: string[];
}

const edgePunctuation = /^[\p{Ps}\p{Pi}"'¿¡]+|[\p{Pe}\p{Pf}"',.:;!?]+$/gu;
const punctuationOnly = /^[\p{P}\p{S}]+$/u;
const numberOnly = /^[~≈<>±+\-−$€£¥]*\d[\d.,:/–—\-]*[%×x]?(s|ms|min|h|d|k|m)?$/u;

// An address with a known prefix: bc1/tb1/bcrt1, Stacks SP/ST/SM/SN (with a
// digit, so all-caps words stay words), 0x, sbtc.
const prefixedAddress =
  '(?:bc1|tb1|bcrt1)[a-z0-9]{8,}|S[PMTN](?=[0-9A-Z]*\\d)[0-9A-Z]{8,}(?:\\.[\\w-]+)?|0x[0-9a-fA-F]{8,}|sbtc(?=[a-z0-9]*\\d)[a-z0-9]{8,}';
// One token: a prefixed address, or any 25+ character mix of letters and
// digits (a hash, a legacy address).
const fullAddress = new RegExp(
  `^(?:${prefixedAddress}|(?=[A-Za-z0-9]*\\d)(?=[A-Za-z0-9]*[A-Za-z])[A-Za-z0-9]{25,})$`
);
// A truncated address: "SP2J…9EJ7", "SPXH...RKCB", "sbtcpriv1q8x…4kf2".
const truncatedAddress = /^[\p{L}\p{N}]{2,}(?:…|\.{2,3})[\p{L}\p{N}]{2,}$/u;

export function classifyToken(raw: string): keyof WordCount | null {
  const token = raw.replace(edgePunctuation, '');
  if (token === '' || punctuationOnly.test(token)) return null;
  if (fullAddress.test(token) || truncatedAddress.test(token)) return 'addresses';
  return numberOnly.test(token) ? 'numbers' : 'words';
}

export function countWords(text: string): WordCount {
  const count: WordCount = { words: 0, numbers: 0, addresses: 0 };
  for (const token of text.split(/\s+/)) {
    const kind = classifyToken(token);
    if (kind) count[kind] += 1;
  }
  return count;
}

interface FrameText {
  text: string;
  // Addresses shown in groups (one element, several space-separated chunks).
  groupedAddresses: number;
  sheet: boolean;
  primaryLabels: string[];
  variant: string | null;
  screen: string | null;
  frame: string | null;
  theme: string | null;
}

// Runs in the page. Hides visually hidden elements (sr-only clip, ≤1px boxes)
// and grouped addresses for the moment innerText is read, then restores them.
// With an open sheet, reads only the sheet.
function readFrames({ selector, address }: { selector: string; address: string }): FrameText[] {
  const addressPattern = new RegExp(address);
  function visuallyHidden(element: HTMLElement) {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const clipped =
      /rect\(0(px)?,? 0(px)?,? 0(px)?,? 0(px)?\)/.test(style.clip) ||
      /inset\(50%\)/.test(style.clipPath);
    const tiny = rect.width <= 1 && rect.height <= 1 && style.overflow === 'hidden';
    return clipped || tiny;
  }
  function visible(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    return rect.width > 1 && rect.height > 1 && getComputedStyle(element).visibility !== 'hidden';
  }
  // An address split into chunks: its text is a whole prefixed address once
  // the whitespace is gone, and it has whitespace or several chunk elements.
  function groupedAddress(element: Element | null) {
    if (!element) return false;
    const text = element.textContent ?? '';
    const joined = text.replace(/\s+/g, '');
    return (
      joined.length > 0 &&
      addressPattern.test(joined) &&
      (/\s/.test(text.trim()) || element.children.length > 1)
    );
  }
  // Solid buttons: an opaque own fill at 3:1 or more against the surface.
  function rgba(value: string) {
    const parts = value.match(/[\d.]+/g)?.map(Number) ?? [];
    return parts.length >= 3 ? { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 } : null;
  }
  function luminance({ r, g, b }: { r: number; g: number; b: number }) {
    const channel = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  }
  function surfaceOf(element: HTMLElement) {
    for (let node = element.parentElement; node; node = node.parentElement) {
      const fill = rgba(getComputedStyle(node).backgroundColor);
      if (fill && fill.a >= 0.9) return fill;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  }
  function primaryLabels(root: HTMLElement) {
    const candidates = Array.from(
      root.querySelectorAll<HTMLElement>('button, [role="button"], a[href]')
    );
    return candidates
      .filter(element => {
        if (!visible(element) || (element as HTMLButtonElement).disabled) return false;
        const label = element.innerText.trim();
        if (!label) return false;
        const fill = rgba(getComputedStyle(element).backgroundColor);
        if (!fill || fill.a < 0.9) return false;
        const [light, dark] = [luminance(fill), luminance(surfaceOf(element))].sort(
          (x, y) => y - x
        );
        return (light + 0.05) / (dark + 0.05) >= 3;
      })
      .map(element => element.innerText.trim().replace(/\s+/g, ' '));
  }
  function closest(element: Element, attribute: string) {
    return element.closest(`[${attribute}]`)?.getAttribute(attribute) ?? null;
  }
  return Array.from(document.querySelectorAll<HTMLElement>(selector)).map(frame => {
    const sheets = Array.from(
      frame.querySelectorAll<HTMLElement>('[role="dialog"], [aria-modal="true"]')
    ).filter(visible);
    const roots = sheets.length ? sheets : [frame];
    const all = roots.flatMap(root => [
      root,
      ...Array.from(root.querySelectorAll<HTMLElement>('*')),
    ]);
    const groups = all.filter(
      element =>
        groupedAddress(element) && !groupedAddress(element.parentElement) && visible(element)
    );
    const hidden = [...all.filter(visuallyHidden), ...groups];
    const previous = hidden.map(element => element.style.display);
    hidden.forEach(element => (element.style.display = 'none'));
    const text = roots.map(root => root.innerText).join('\n');
    hidden.forEach((element, i) => (element.style.display = previous[i]));
    return {
      text,
      groupedAddresses: groups.length,
      sheet: sheets.length > 0,
      primaryLabels: roots.flatMap(primaryLabels),
      variant: closest(frame, 'data-variant'),
      screen: closest(frame, 'data-screen'),
      frame: closest(frame, 'data-frame'),
      theme: closest(frame, 'data-theme'),
    };
  });
}

// Counts every frame on a loaded page.
export async function countPage(page: Page, url: string, selector = '[data-frame]') {
  const frames = await page.evaluate(readFrames, { selector, address: `^(?:${prefixedAddress})$` });
  return frames.map(({ text, groupedAddresses, primaryLabels, ...labels }, index): FrameCount => {
    const count = countWords(text);
    return {
      url,
      index,
      ...labels,
      ...count,
      addresses: count.addresses + groupedAddresses,
      primaries: primaryLabels.length,
      primaryLabels,
    };
  });
}

export async function countFrames(urls: string[], selector = '[data-frame]') {
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const results: FrameCount[] = [];
  try {
    for (const url of urls) {
      await page.goto(url, { waitUntil: 'load' });
      await page.locator(selector).first().waitFor({ timeout: 30_000 });
      await page.evaluate(() => document.fonts.ready);
      results.push(...(await countPage(page, url, selector)));
    }
  } finally {
    await browser.close();
  }
  return results;
}

export function renderTable(rows: FrameCount[]) {
  const header = [
    'url',
    'variant',
    'screen',
    'frame',
    'theme',
    'words',
    'numbers',
    'addresses',
    'primaries',
  ];
  const body = rows.map(row => [
    row.url.replace(/^https?:\/\/[^/]+/, ''),
    row.variant ?? '—',
    `${row.screen ?? `#${row.index + 1}`}${row.sheet ? ' (sheet)' : ''}`,
    row.frame ?? '—',
    row.theme ?? '—',
    String(row.words),
    String(row.numbers),
    String(row.addresses),
    String(row.primaries),
  ]);
  const widths = header.map((cell, i) => Math.max(cell.length, ...body.map(r => r[i].length)));
  const line = (cells: string[]) =>
    `| ${cells.map((cell, i) => (i >= 5 ? cell.padStart(widths[i]) : cell.padEnd(widths[i]))).join(' | ')} |`;
  return [
    line(header),
    `|${widths.map((w, i) => (i >= 5 ? `${'-'.repeat(w + 1)}:` : '-'.repeat(w + 2))).join('|')}|`,
    ...body.map(line),
  ].join('\n');
}

// Frames with more solid buttons than a screen may have.
export function tooManyPrimaries(rows: FrameCount[], max = 1) {
  return rows.filter(row => row.primaries > max);
}

export function renderPrimaryFailures(rows: FrameCount[], max = 1) {
  return tooManyPrimaries(rows, max).map(
    row =>
      `✗ ${row.variant ?? '—'} · ${row.screen ?? `#${row.index + 1}`} · ${row.frame ?? '—'} · ${row.theme ?? '—'}: ${row.primaries} solid buttons (${row.primaryLabels.map(label => `"${label}"`).join(', ')}). Keep one solid; the others outline or ghost.`
  );
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      urls: { type: 'string' },
      json: { type: 'string' },
      selector: { type: 'string', default: '[data-frame]' },
      'max-primaries': { type: 'string', default: '1' },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });
  const fromFile = values.urls
    ? readFileSync(values.urls, 'utf8')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
    : [];
  const urls = [...positionals, ...fromFile];
  if (values.help || urls.length === 0) {
    console.log(
      "Usage: node scripts/design/words-per-screen.ts <url...> [--urls urls.txt] [--json out.json | --json -] [--selector '[data-frame]'] [--max-primaries 1]"
    );
    process.exit(values.help ? 0 : 1);
  }
  const rows = await countFrames(urls, values.selector);
  const maxPrimaries = Number(values['max-primaries']);
  const json = `${JSON.stringify(rows, null, 2)}\n`;
  const failures = renderPrimaryFailures(rows, maxPrimaries);
  if (values.json === '-') process.stdout.write(json);
  else {
    console.log(renderTable(rows));
    if (failures.length) console.log(`\n${failures.join('\n')}`);
    if (values.json) writeFileSync(values.json, json);
  }
  if (failures.length) process.exitCode = 1;
}
