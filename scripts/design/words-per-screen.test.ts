// node --test scripts/design/words-per-screen.test.ts
import type { Browser, Page } from '@playwright/test';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import { classifyToken, countPage, countWords, tooManyPrimaries } from './words-per-screen.ts';

describe('words per screen', () => {
  it('counts number-only tokens separately', () => {
    for (const token of ['0.00500000', '~20–40', '$326.30', '14', '35%', '18s', '(2)'])
      assert.equal(classifyToken(token), 'numbers', token);
  });

  it('counts address-like tokens separately, whole or truncated', () => {
    for (const token of [
      'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
      'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.sbtc-token',
      '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      'sbtcpriv1q8x…4kf2',
      'SP2J…9EJ7',
      'SPXH...RKCB',
      '(bc1q…4kf2)',
    ])
      assert.equal(classifyToken(token), 'addresses', token);
  });

  it('counts words, including units, names and all-caps labels', () => {
    for (const token of ['Send', 'sBTC', 'Alex', "Who's", 'STATEMENTS', 'Loading…', 'SP'])
      assert.equal(classifyToken(token), 'words', token);
  });

  it('drops punctuation-only tokens', () => {
    for (const token of ['·', '—', '→', '…', '|']) assert.equal(classifyToken(token), null, token);
  });

  it('counts a review line', () => {
    assert.deepEqual(countWords('Total\n0.00502000 sBTC · $326.30\nSend privately'), {
      words: 4,
      numbers: 2,
      addresses: 0,
    });
  });

  it('counts a truncated recipient as an address, not a word', () => {
    assert.deepEqual(countWords('To Rena SP2J…9EJ7'), { words: 2, numbers: 0, addresses: 1 });
  });
});

describe('words per screen in a page', () => {
  let browser: Browser;
  let page: Page;
  before(async () => {
    const { chromium } = await import('@playwright/test');
    browser = await chromium.launch();
    page = await browser.newPage();
  });
  after(async () => browser.close());

  const chunks = (address: string) =>
    `<div style="display:flex;column-gap:1ch;flex-wrap:wrap">${(address.match(/.{1,4}/g) ?? [])
      .map(chunk => `<span>${chunk}</span>`)
      .join('')}</div>`;

  it('counts an address shown in groups as one address', async () => {
    await page.setContent(`
      <div data-frame="popup" data-screen="review" style="width:390px;height:600px">
        <div><span>To</span> <span>Rena</span></div>
        ${chunks('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7')}
        <p>bc1q xy2k gdyg jrsq tzq2 n0yr f249 3p83 kkfj hx0w lh</p>
        <p>Fee 0.0025 STX</p>
      </div>`);
    const [frame] = await countPage(page, 'test');
    assert.deepEqual(
      {
        words: frame.words,
        numbers: frame.numbers,
        addresses: frame.addresses,
        sheet: frame.sheet,
      },
      { words: 4, numbers: 1, addresses: 2, sheet: false }
    );
  });

  it('counts only the open sheet, not the dimmed screen behind it', async () => {
    await page.setContent(`
      <div data-frame="popup" data-screen="explain" style="width:390px;height:600px;position:relative">
        <div aria-hidden="true">
          <h1>Receive</h1>
          <p>Native SegWit For most Bitcoin payments</p>
        </div>
        <div style="position:absolute;inset:0;display:flex;align-items:flex-end">
          <div role="dialog" aria-label="Which one?" style="width:100%">
            <h2>Which one?</h2>
            <p>Use Native SegWit unless the sender asks for Taproot.</p>
          </div>
        </div>
      </div>`);
    const [frame] = await countPage(page, 'test');
    assert.equal(frame.sheet, true);
    assert.equal(frame.words, 11, 'the screen behind would add 7');
  });

  const solid = (label: string, fill = '#12100f', ink = '#f5f1ed') =>
    `<button style="background:${fill};color:${ink};height:48px">${label}</button>`;

  it('counts solid buttons, not outline, ghost, chip or disabled ones', async () => {
    await page.setContent(`
      <div data-frame="popup" data-screen="sent" style="width:390px;height:600px;background:#fff">
        ${solid('View details')}
        ${solid('Copy ID')}
        <button style="background:transparent;border:1px solid #ddd">Manage</button>
        <button style="background:#f5f1ed">Chip</button>
        <button style="background:#12100f" disabled>Disabled</button>
        <button style="background:#12100f;width:40px" aria-label="Close"><svg width="24" height="24"></svg></button>
      </div>`);
    const [frame] = await countPage(page, 'test');
    assert.equal(frame.primaries, 2);
    assert.deepEqual(frame.primaryLabels, ['View details', 'Copy ID']);
    assert.equal(tooManyPrimaries([frame]).length, 1);
  });

  it('counts a solid button in the dark theme and a danger one', async () => {
    await page.setContent(`
      <div data-frame="popup" data-theme="dark" style="width:390px;height:600px;background:#12100f">
        ${solid('Continue', '#f5f1ed', '#12100f')}
      </div>
      <div data-frame="popup" style="width:390px;height:600px;background:#fff">
        ${solid('Remove wallet', '#c22d2d', '#fff')}
        <button style="background:transparent">Cancel</button>
      </div>`);
    const frames = await countPage(page, 'test');
    assert.deepEqual(
      frames.map(frame => frame.primaries),
      [1, 1]
    );
    assert.equal(tooManyPrimaries(frames).length, 0);
  });
});
