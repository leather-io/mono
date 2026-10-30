// Today fidelity: screenshots a recreated "today" screen in the Playground and
// compares it with the baseline screenshot of the real extension, before any
// exploring starts. See docs/design/explore.md, step 1.
//
//   node scripts/design/today-fidelity.ts --url <playground url> --baseline <png> [--out <dir>]
//                                         [--name <name>] [--selector '[data-frame]'] [--index 0]
//
// Writes <out>/<name>-fidelity.png (baseline | recreation | diff in red) and
// <out>/<name>-fidelity.md (pixel ratio + a block-by-block structure diff), and
// prints the report. The frame is captured at 1× so it lines up with the
// baseline; a 390px frame is scaled to a 360px capture's width.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

import { compareImages, renderFidelityReport } from './lib/fidelity.ts';
import { decodePng, encodePng } from './lib/png.ts';

async function captureFrame(url: string, selector: string, index: number) {
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1600, height: 1200 },
      deviceScaleFactor: 1,
    });
    await page.goto(url, { waitUntil: 'load' });
    const frame = page.locator(selector).nth(index);
    await frame.waitFor({ timeout: 30_000 });
    await page.evaluate(() => document.fonts.ready);
    return await frame.screenshot({ animations: 'disabled' });
  } finally {
    await browser.close();
  }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { values } = parseArgs({
    options: {
      url: { type: 'string' },
      baseline: { type: 'string' },
      out: { type: 'string', default: '.' },
      name: { type: 'string' },
      selector: { type: 'string', default: '[data-frame]' },
      index: { type: 'string', default: '0' },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });
  if (values.help || !values.url || !values.baseline) {
    console.log(
      "Usage: node scripts/design/today-fidelity.ts --url <playground url> --baseline <png> [--out dir] [--name name] [--selector '[data-frame]'] [--index 0]"
    );
    process.exit(values.help ? 0 : 1);
  }
  const name = values.name ?? path.basename(values.baseline, '.png');
  const baseline = decodePng(readFileSync(values.baseline));
  const recreated = decodePng(
    await captureFrame(values.url, values.selector, Number(values.index))
  );
  const result = compareImages(baseline, recreated);
  mkdirSync(values.out, { recursive: true });
  const compositePath = path.join(values.out, `${name}-fidelity.png`);
  writeFileSync(compositePath, encodePng(result.composite));
  const report = renderFidelityReport(result, {
    baseline: values.baseline,
    recreated: values.url,
    composite: compositePath,
  });
  writeFileSync(path.join(values.out, `${name}-fidelity.md`), `${report}\n`);
  console.log(report);
}
