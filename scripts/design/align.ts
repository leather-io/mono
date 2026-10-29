import type { Page } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

export interface AlignFinding {
  kind: 'edge' | 'rails' | 'header';
  // What was measured: the child's text, or "header".
  subject: string;
  detail: string;
  // Signed distance in px (positive: inside the rail).
  delta: number;
}

export interface FrameAlignment {
  url: string;
  index: number;
  variant: string | null;
  screen: string | null;
  frame: string | null;
  theme: string | null;
  sheet: boolean;
  rails: { left: number; right: number; marked: boolean }[];
  checked: number;
  findings: AlignFinding[];
}

type FrameResult = Omit<FrameAlignment, 'url' | 'index'>;

// Runs in the page.
function measureFrames({ selector, tolerance }: { selector: string; tolerance: number }) {
  const anchorReach = 16;
  const coordinates = { origin: 0, scale: 1 };
  function localBox(rect: { left: number; right: number }) {
    return {
      left: (rect.left - coordinates.origin) / coordinates.scale,
      right: (rect.right - coordinates.origin) / coordinates.scale,
    };
  }
  function visible(element: Element) {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return (
      rect.width > 1 &&
      rect.height > 1 &&
      style.visibility !== 'hidden' &&
      style.display !== 'none' &&
      Number(style.opacity) > 0
    );
  }
  function paints(element: Element) {
    const style = getComputedStyle(element);
    const fill = style.backgroundColor.match(/[\d.]+/g)?.map(Number) ?? [];
    const filled = fill.length >= 3 && (fill[3] ?? 1) > 0.05;
    const bordered = ['Top', 'Right', 'Bottom', 'Left'].some(side => {
      const width = parseFloat(style.getPropertyValue(`border-${side.toLowerCase()}-width`));
      const colour = style.getPropertyValue(`border-${side.toLowerCase()}-color`);
      const alpha = colour.match(/[\d.]+/g)?.map(Number)[3] ?? 1;
      return (
        width > 0 &&
        style.getPropertyValue(`border-${side.toLowerCase()}-style`) !== 'none' &&
        alpha > 0.05
      );
    });
    return filled || bordered;
  }
  type Box = { left: number; right: number };
  function union(a: Box | null, b: Box): Box {
    return a ? { left: Math.min(a.left, b.left), right: Math.max(a.right, b.right) } : b;
  }
  // The horizontal extent of what a child draws.
  // Text that is meant to end on the right: right-aligned, or the end of a
  // flex row pushed right. Ragged left-aligned text (a wrapped address) is not.
  function endsRight(node: Node, stop: Element) {
    for (
      let element = node.parentElement;
      element && element !== stop.parentElement;
      element = element.parentElement
    ) {
      const style = getComputedStyle(element);
      if (style.textAlign === 'right' || style.textAlign === 'end') return true;
      const parent = element.parentElement;
      if (!parent) break;
      const flex = getComputedStyle(parent);
      if (!flex.display.includes('flex')) continue;
      const row = flex.flexDirection.startsWith('row');
      if (row && ['flex-end', 'end', 'space-between'].includes(flex.justifyContent)) return true;
      if (!row && ['flex-end', 'end'].includes(flex.alignItems)) return true;
    }
    return false;
  }
  type Ink = Box & { rightIsRaggedText: boolean };
  function ink(element: Element): Ink | null {
    const drawn: { box: Box | null; rightNode: Node | null } = { box: null, rightNode: null };
    const add = (rect: Box, node: Node) => {
      if (!drawn.box || rect.right > drawn.box.right) drawn.rightNode = node;
      drawn.box = union(drawn.box, rect);
    };
    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (!node.textContent?.trim()) return;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const rect of Array.from(range.getClientRects())) {
          if (rect.width > 0) add(localBox(rect), node);
        }
        return;
      }
      if (!(node instanceof Element) || !visible(node)) return;
      const tag = node.tagName.toLowerCase();
      if (tag === 'svg' || tag === 'img' || tag === 'canvas' || tag === 'video') {
        add(localBox(node.getBoundingClientRect()), node);
        return;
      }
      if (paints(node)) add(localBox(node.getBoundingClientRect()), node);
      node.childNodes.forEach(walk);
    };
    walk(element);
    if (!drawn.box) return null;
    const right = drawn.rightNode;
    const rightIsRaggedText =
      right !== null && right.nodeType === Node.TEXT_NODE && !endsRight(right, element);
    // Not a spread: a DOMRect's edges are prototype getters.
    return { left: drawn.box.left, right: drawn.box.right, rightIsRaggedText };
  }
  function label(element: Element) {
    const text =
      element instanceof HTMLElement ? element.innerText.trim().replace(/\s+/g, ' ') : '';
    return text ? text.slice(0, 40) : `<${element.tagName.toLowerCase()}>`;
  }
  function contentBox(element: Element) {
    const rect = localBox(element.getBoundingClientRect());
    const style = getComputedStyle(element);
    return {
      left: rect.left + parseFloat(style.paddingLeft) + parseFloat(style.borderLeftWidth),
      right: rect.right - parseFloat(style.paddingRight) - parseFloat(style.borderRightWidth),
    };
  }
  function fallbackRails(root: Element) {
    const width = root.clientWidth;
    const candidates = Array.from(root.querySelectorAll('*')).filter(element => {
      // A header is checked on its own (step 4); it is not a content rail.
      if (!visible(element) || element.closest('header')) return false;
      const style = getComputedStyle(element);
      const left = parseFloat(style.paddingLeft);
      const right = parseFloat(style.paddingRight);
      return (
        left >= 12 &&
        Math.abs(left - right) <= 1 &&
        element.getBoundingClientRect().width / coordinates.scale >= width * 0.8 &&
        Array.from(element.children).filter(visible).length >= 2
      );
    });
    return candidates.filter(
      element => !candidates.some(other => other !== element && other.contains(element))
    );
  }
  function closest(element: Element, attribute: string) {
    return element.closest(`[${attribute}]`)?.getAttribute(attribute) ?? null;
  }

  return Array.from(document.querySelectorAll<HTMLElement>(selector)).map((frame): FrameResult => {
    const sheets = Array.from(
      frame.querySelectorAll<HTMLElement>('[role="dialog"], [aria-modal="true"]')
    ).filter(visible);
    const root: HTMLElement = sheets[0] ?? frame;
    // The frame's inner edges (its 1px border is not part of the screen).
    const outer = root.getBoundingClientRect();
    coordinates.origin = outer.left;
    coordinates.scale = root.offsetWidth > 0 ? outer.width / root.offsetWidth : 1;
    const frameBox = {
      left: root.clientLeft,
      right: root.clientLeft + root.clientWidth,
    };
    const marked = Array.from(root.querySelectorAll('[data-gutter]')).filter(visible);
    const railElements = marked.length ? marked : fallbackRails(root);
    const findings: AlignFinding[] = [];
    let checked = 0;
    const rails = railElements.map(rail => {
      const box = contentBox(rail);
      for (const child of Array.from(rail.children)) {
        if (!visible(child)) continue;
        const position = getComputedStyle(child).position;
        if (position === 'absolute' || position === 'fixed') continue;
        const drawn = ink(child);
        if (!drawn) continue;
        const leftDelta = drawn.left - box.left;
        const rightDelta = box.right - drawn.right;
        const centred = leftDelta > tolerance && Math.abs(leftDelta - rightDelta) <= 2;
        if (centred) continue;
        checked += 1;
        if (Math.abs(leftDelta) <= anchorReach && Math.abs(leftDelta) > tolerance)
          findings.push({
            kind: 'edge',
            subject: label(child),
            detail: `left edge ${leftDelta > 0 ? 'inside' : 'outside'} the rail`,
            delta: Math.round(leftDelta * 10) / 10,
          });
        if (
          !drawn.rightIsRaggedText &&
          Math.abs(rightDelta) <= anchorReach &&
          Math.abs(rightDelta) > tolerance
        )
          findings.push({
            kind: 'edge',
            subject: label(child),
            detail: `right edge ${rightDelta > 0 ? 'inside' : 'outside'} the rail`,
            delta: Math.round(rightDelta * 10) / 10,
          });
      }
      return {
        left: Math.round((box.left - frameBox.left) * 10) / 10,
        right: Math.round((frameBox.right - box.right) * 10) / 10,
        marked: marked.length > 0,
      };
    });
    // Full-width rails share one inset (a centred tab card is one rail).
    const insets = rails.filter(rail => rail.left < 48 && rail.right < 48);
    for (const rail of insets) {
      const first = insets[0];
      if (
        Math.abs(rail.left - first.left) > tolerance ||
        Math.abs(rail.right - first.right) > tolerance
      )
        findings.push({
          kind: 'rails',
          subject: 'rails',
          detail: `a rail at ${rail.left}/${rail.right}px, another at ${first.left}/${first.right}px from the frame's edges`,
          delta: Math.round((rail.left - first.left) * 10) / 10,
        });
    }
    // Header glyphs: back vs the trailing action, and on the rail.
    const header = root.querySelector('header');
    if (header && visible(header)) {
      const glyphs = Array.from(
        header.querySelectorAll('button svg, [role="button"] svg, button img')
      ).filter(visible);
      if (glyphs.length >= 2) {
        const boxes = glyphs.map(glyph => localBox(glyph.getBoundingClientRect()));
        const leftInset = Math.min(...boxes.map(box => box.left)) - frameBox.left;
        const rightInset = frameBox.right - Math.max(...boxes.map(box => box.right));
        if (Math.abs(leftInset - rightInset) > tolerance)
          findings.push({
            kind: 'header',
            subject: 'header',
            detail: `icon glyphs ${Math.round(leftInset)}px from the left edge, ${Math.round(rightInset)}px from the right`,
            delta: Math.round((leftInset - rightInset) * 10) / 10,
          });
        const rail = insets[0];
        if (rail && Math.abs(leftInset - rail.left) > tolerance)
          findings.push({
            kind: 'header',
            subject: 'header',
            detail: `back glyph at ${Math.round(leftInset)}px, content rail at ${rail.left}px`,
            delta: Math.round((leftInset - rail.left) * 10) / 10,
          });
      }
    }
    return {
      variant: closest(frame, 'data-variant'),
      screen: closest(frame, 'data-screen'),
      frame: closest(frame, 'data-frame'),
      theme: closest(frame, 'data-theme'),
      sheet: sheets.length > 0,
      rails,
      checked,
      findings,
    };
  });
}

export async function alignPage(page: Page, url: string, selector = '[data-frame]', tolerance = 1) {
  const frames = await page.evaluate(measureFrames, { selector, tolerance });
  return frames.map((frame, index): FrameAlignment => ({ url, index, ...frame }));
}

export async function alignUrls(urls: string[], selector = '[data-frame]', tolerance = 1) {
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const results: FrameAlignment[] = [];
  try {
    for (const url of urls) {
      await page.goto(url, { waitUntil: 'load' });
      await page.locator(selector).first().waitFor({ timeout: 30_000 });
      await page.evaluate(() => document.fonts.ready);
      results.push(...(await alignPage(page, url, selector, tolerance)));
    }
  } finally {
    await browser.close();
  }
  return results;
}

export function renderAlignment(rows: FrameAlignment[]) {
  const lines = rows.map(row => {
    const name = `${row.variant ?? '—'} · ${row.screen ?? `#${row.index + 1}`} · ${row.frame ?? '—'} · ${row.theme ?? '—'}${row.sheet ? ' (sheet)' : ''}`;
    const rails = row.rails
      .map(rail => `${rail.left}/${rail.right}${rail.marked ? '' : '*'}`)
      .join(' ');
    const head = `${row.findings.length ? '✗' : '✓'} ${name}  rails ${rails || 'none'}  checked ${row.checked}`;
    return [
      head,
      ...row.findings.map(f => `    ${f.kind}: ${f.subject} — ${f.detail} (${f.delta}px)`),
    ].join('\n');
  });
  return [
    ...lines,
    '',
    'rails: left/right inset from the frame in px; * = found without data-gutter',
  ].join('\n');
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      urls: { type: 'string' },
      json: { type: 'string' },
      selector: { type: 'string', default: '[data-frame]' },
      tolerance: { type: 'string', default: '1' },
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
      "Usage: node scripts/design/align.ts <url...> [--urls urls.txt] [--json out.json | --json -] [--selector '[data-frame]'] [--tolerance 1]"
    );
    process.exit(values.help ? 0 : 1);
  }
  const rows = await alignUrls(urls, values.selector, Number(values.tolerance));
  const json = `${JSON.stringify(rows, null, 2)}\n`;
  if (values.json === '-') process.stdout.write(json);
  else {
    console.log(renderAlignment(rows));
    if (values.json) writeFileSync(values.json, json);
  }
  if (rows.some(row => row.findings.length > 0)) process.exitCode = 1;
}
