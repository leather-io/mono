// node --test scripts/design/align.test.ts
import type { Browser, Page } from '@playwright/test';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import { alignPage } from './align.ts';

const icon = '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z"/></svg>';
const iconButton = `<button style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;background:transparent;border:0;padding:0">${icon}</button>`;

function frame(body: string, header = '') {
  return `
    <div data-frame="popup" data-screen="s" style="width:390px;height:600px;display:flex;flex-direction:column;font:16px sans-serif">
      ${header}
      <div data-gutter style="padding:0 24px;display:flex;flex-direction:column;gap:16px">${body}</div>
    </div>`;
}

const row = (text: string, extra = '') =>
  `<div style="display:flex;align-items:center;gap:12px;${extra}"><span style="width:40px;height:40px;border-radius:50%;background:#eee;display:block"></span><span>${text}</span></div>`;

describe('design:align', () => {
  let browser: Browser;
  let page: Page;
  before(async () => {
    const { chromium } = await import('@playwright/test');
    browser = await chromium.launch();
    page = await browser.newPage();
  });
  after(async () => browser.close());

  it('passes rows, an input and a centred amount on one rail', async () => {
    await page.setContent(
      frame(`
        <div style="border:1px solid #ccc;height:48px"></div>
        ${row('Sofia Reyes')}
        <div style="text-align:center">120.00 STX</div>`)
    );
    const [result] = await alignPage(page, 'test');
    assert.deepEqual(result.findings, []);
    assert.equal(result.checked, 2);
    assert.deepEqual(result.rails, [{ left: 24, right: 24, marked: true }]);
  });

  it('flags a row indented off the rail and an input that overhangs it', async () => {
    await page.setContent(
      frame(`
        <div style="border:1px solid #ccc;height:48px;margin-right:-8px"></div>
        ${row('Kraken deposit', 'padding-left:8px')}`)
    );
    const [result] = await alignPage(page, 'test');
    assert.deepEqual(
      result.findings.map(f => [f.detail, f.delta]),
      [
        ['right edge outside the rail', -8],
        ['left edge inside the rail', 8],
      ]
    );
  });

  it('does not hold ragged left-aligned text to the right edge, but does right-aligned text', async () => {
    await page.setContent(
      frame(`
        <p style="margin:0;width:330px">SP2J 6ZY4 8GV1 EZ5V 2V5R B9MP</p>
        <div style="display:flex;justify-content:space-between;margin-right:-8px"><span>To</span><span>Sofia</span></div>`)
    );
    const [result] = await alignPage(page, 'test');
    assert.deepEqual(
      result.findings.map(f => [f.subject, f.delta]),
      [['To Sofia', -8]]
    );
  });

  it('flags asymmetric header icons and icons off the rail', async () => {
    const header = `<header style="display:flex;justify-content:space-between;padding:16px;padding-left:24px">${iconButton}${iconButton}</header>`;
    await page.setContent(frame(row('Sofia Reyes'), header));
    const [result] = await alignPage(page, 'test');
    assert.deepEqual(
      result.findings.map(f => [f.kind, f.delta]),
      [
        ['header', 8],
        ['header', 8],
      ]
    );
  });

  it('passes a symmetric header whose glyphs sit on the rail', async () => {
    const header = `<header style="display:flex;justify-content:space-between;padding:16px">${iconButton}${iconButton}</header>`;
    await page.setContent(frame(row('Sofia Reyes'), header));
    const [result] = await alignPage(page, 'test');
    assert.deepEqual(result.findings, []);
  });
  for (const scale of [0.65, 1.25]) {
    it(`keeps rails and symmetric header correct inside a ${scale} scaled preview`, async () => {
      const header = `<header style="display:flex;justify-content:space-between;padding:16px">${iconButton}${iconButton}</header>`;
      await page.setContent(
        `<div style="transform:scale(${scale});transform-origin:0 0">${frame(row('Sofia Reyes'), header)}</div>`
      );
      const [result] = await alignPage(page, 'test');
      assert.deepEqual(result.findings, []);
      assert.deepEqual(result.rails, [{ left: 24, right: 24, marked: true }]);
      assert.equal(result.checked, 1);
    });

    it(`reports actual CSS-pixel drift inside a ${scale} scaled preview`, async () => {
      await page.setContent(
        `<div style="transform:scale(${scale});transform-origin:0 0">${frame(row('Kraken deposit', 'padding-left:8px'))}</div>`
      );
      const [result] = await alignPage(page, 'test');
      assert.deepEqual(
        result.findings.map(f => [f.detail, f.delta]),
        [['left edge inside the rail', 8]]
      );
    });

    it(`finds unmarked rails inside a ${scale} scaled preview`, async () => {
      const body = frame(row('Sofia') + row('Edgar')).replace('data-gutter', 'data-test-gutter');
      await page.setContent(
        `<div style="transform:scale(${scale});transform-origin:0 0">${body}</div>`
      );
      const [result] = await alignPage(page, 'test');
      assert.deepEqual(result.findings, []);
      assert.deepEqual(result.rails, [{ left: 24, right: 24, marked: false }]);
      assert.equal(result.checked, 2);
    });
  }
});
