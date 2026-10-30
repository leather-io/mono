import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { bandsOf, compareBands, compareImages } from './lib/fidelity.ts';
import { type Image, blankImage, decodePng, encodePng } from './lib/png.ts';

// A white 100×200 screen with dark rectangles at the given rows and columns.
function screen(blocks: { top: number; height: number; left: number; right: number }[]): Image {
  const image = blankImage(100, 200);
  for (const block of blocks)
    for (let y = block.top; y < block.top + block.height; y++)
      for (let x = block.left; x <= block.right; x++)
        image.data.set([20, 20, 20, 255], (y * 100 + x) * 4);
  return image;
}

describe('png', () => {
  it('decodes an indexed pixel through its palette', () => {
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAMAAAAoyzS7AAAAA1BMVEUUKDzOZ+RbAAAACklEQVR4nGNgAAAAAgABSK+kcQAAAABJRU5ErkJggg==',
      'base64'
    );
    assert.deepEqual([...decodePng(png).data], [20, 40, 60, 255]);
  });

  it('rejects an indexed PNG without a palette', () => {
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAMAAAAoyzS7AAAACklEQVR4nGNgAAAAAgABSK+kcQAAAABJRU5ErkJggg==',
      'base64'
    );
    assert.throws(() => decodePng(png), /PNG palette is missing/);
  });

  it('round-trips RGBA through encode and decode', () => {
    const image = screen([{ top: 10, height: 5, left: 3, right: 40 }]);
    const decoded = decodePng(encodePng(image));
    assert.equal(decoded.width, 100);
    assert.equal(decoded.height, 200);
    assert.deepEqual(decoded.data, image.data);
  });
});

describe('today fidelity', () => {
  const header = { top: 10, height: 20, left: 10, right: 90 };
  const button = { top: 50, height: 48, left: 10, right: 90 };
  const banner = { top: 120, height: 30, left: 10, right: 90 };
  const tabs = { top: 170, height: 2, left: 0, right: 99 };

  it('finds blocks of rows with ink and their horizontal extent', () => {
    const bands = bandsOf(screen([header, button]), 8, 0);
    assert.deepEqual(bands, [header, button]);
  });

  it('reports a shorter button and inset tabs', () => {
    const findings = compareBands(
      [header, button, tabs],
      [header, { ...button, height: 36 }, { ...tabs, left: 10, right: 89 }]
    );
    assert.deepEqual(findings[1].notes, ['height -12px']);
    assert.deepEqual(findings[2].notes, ['left edge +10px', 'right edge -10px']);
  });

  it('aligns blocks so one missing banner does not shift the rest', () => {
    const findings = compareBands(
      [header, button, banner, tabs],
      [header, button, { ...tabs, top: 120 }]
    );
    assert.deepEqual(
      findings.map(finding => finding.notes[0] ?? 'same'),
      ['same', 'same', 'missing in the recreation', 'starts -50px']
    );
  });

  it('measures the pixel difference and builds a three-up composite', () => {
    const result = compareImages(screen([header]), screen([header, button]));
    assert.equal(result.differingPixels, 48 * 81);
    assert.equal(result.composite.width, 100 * 3 + 32);
  });
});
