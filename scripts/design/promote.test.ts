// node --test scripts/design/promote.test.ts
import assert from 'node:assert/strict';
import path from 'node:path';
import { before, describe, it } from 'node:test';

import { type PromoteResult, analyze, parseDeviations } from './lib/analyze.ts';
import { deltaE2000Lab } from './lib/colour.ts';
import { renderMarkdown } from './lib/report.ts';

const fixture = path.join(import.meta.dirname, '__fixtures__/off-system-sketch');
const areaFixture = path.join(import.meta.dirname, '__fixtures__/area-sketch');

describe('CIEDE2000', () => {
  it('matches the Sharma, Wu, Dalal (2005) reference pairs', () => {
    const pairs: [number[], number[], number][] = [
      [[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425],
      [[50, 2.5, 0], [73, 25, -18], 27.1492],
      [[2.0776, 0.0795, -1.135], [0.9033, -0.0636, -0.5514], 0.9082],
    ];
    for (const [[L1, a1, b1], [L2, a2, b2], expected] of pairs) {
      assert.equal(
        deltaE2000Lab({ L: L1, a: a1, b: b1 }, { L: L2, a: a2, b: b2 }).toFixed(4),
        expected.toFixed(4)
      );
    }
  });
});

describe('promote report on the off-system fixture', () => {
  let result: PromoteResult;
  before(async () => {
    result = await analyze(fixture);
  });

  const component = (name: string) => {
    const found = result.components.find(assessment => assessment.component.name === name);
    assert.ok(found, `component ${name} was not found`);
    return found;
  };

  it('maps raw #F2F2F2 to a token: same — swap to token', () => {
    const colour = result.scan.colours.find(finding => finding.literal === '#F2F2F2');
    assert.ok(colour);
    assert.equal(colour.token, 'ink.component-background-default');
    assert.ok(colour.deltaE <= 2);
    assert.equal(colour.verdict, 'same — swap to token');
  });

  it('flags a colour far from every token as new', () => {
    const colour = result.scan.colours.find(finding => finding.literal === '#7A5CFA');
    assert.equal(colour?.verdict, 'new colour — deliberate?');
  });

  it('matches a { base, _dark } pair against both modes', () => {
    const dark = result.scan.colours.find(finding => finding.literal === '#433F3C');
    assert.equal(dark?.mode, 'dark');
    assert.equal(dark?.pair?.token, 'ink.border-default');
  });

  it('reports named colours', () => {
    assert.ok(
      result.scan.colours.some(
        finding => finding.literal === 'white' && finding.token === 'ink.background-primary'
      )
    );
  });

  it('maps the raw 13px gap to space.03, 1px off: close', () => {
    const size = result.scan.sizes.find(finding => finding.literal === '13px');
    assert.ok(size);
    assert.equal(size.property, 'gap');
    assert.equal(size.token, 'space.03');
    assert.equal(size.diffPx, 1);
    assert.equal(size.verdict, 'close — likely token, check');
  });

  it('maps 9999px radius to round', () => {
    const size = result.scan.sizes.find(finding => finding.literal === '9999px');
    assert.equal(size?.token, 'round');
    assert.equal(size?.verdict, 'same — swap to token');
  });

  it('reports the undefined textStyle and colour token', () => {
    const values = result.scan.tokens.map(token => `${token.tokenKind}:${token.value}`);
    assert.ok(values.includes('textStyle:heading.06'));
    assert.ok(values.includes('colour:ink.border-selected'));
  });

  it('proposes extending Button for PillButton, with the real difference only', () => {
    const { verdict, evidence, candidates } = component('PillButton');
    assert.equal(verdict.kind, 'extend');
    assert.equal(verdict.text, 'extend Button with prop(s) compact');
    assert.equal(candidates[0].ui, 'Button');
    assert.ok(
      evidence.some(line => line.includes('already built in')),
      'pill radius is Button default'
    );
    assert.ok(
      evidence.some(line => line.includes('aria-busy')),
      'loading maps to aria-busy'
    );
  });

  it('proposes reusing Button as-is for a pass-through wrapper', () => {
    const { verdict, evidence } = component('ConfirmButton');
    assert.equal(verdict.text, 'reuse Button as-is');
    assert.ok(evidence.some(line => line.includes('variant="solid"')));
  });

  it('proposes reusing BasicTooltip for a Radix-built tooltip', () => {
    assert.equal(component('InfoTooltip').verdict.text, 'reuse BasicTooltip as-is');
  });

  it('calls a component with no counterpart new', () => {
    assert.equal(component('AmountChip').verdict.kind, 'new');
  });

  it('skips page scaffolding', () => {
    assert.equal(component('OffSystemSketchPage').verdict.kind, 'scaffolding');
  });

  it('skips the screens a -screens.tsx file exports', () => {
    assert.equal(component('SketchReview').verdict.kind, 'scaffolding');
  });

  it('finds the raw <button>, styled.button, Radix import and local tooltip copy', () => {
    const constructs = result.scan.guardrails.map(hit => `${hit.rule}:${hit.construct}`);
    assert.ok(constructs.includes('no-raw-interactive:<button>'));
    assert.ok(constructs.includes('no-raw-interactive:styled.button'));
    assert.ok(constructs.includes('no-primitive-imports:@radix-ui/react-tooltip'));
    assert.ok(constructs.includes('no-local-duplicate:~/components/tooltip/basic-tooltip'));
  });

  it('checks the ledger against DEVIATIONS.md', () => {
    const row = (key: string) => result.ledger.find(entry => entry.key === key);
    assert.equal(row('#7A5CFA')?.status, 'documented');
    assert.equal(row('13px')?.status, 'undocumented', 'an empty why is undocumented');
    assert.equal(row('PillButton')?.status, 'undocumented', 'a TODO why is undocumented');
    assert.equal(row('heading.06')?.status, 'n/a (must fix)');
    assert.deepEqual(
      result.stale.map(entry => entry.key),
      ['#FF00AA']
    );
  });

  it('flags style props on ui components as restyles that need a why', () => {
    const keys = result.ledger.filter(row => row.category === 'override').map(row => row.key);
    assert.deepEqual(keys.sort(), ['Button.size', 'Caption.color', 'LockIcon.variant']);
    const status = (key: string) => result.ledger.find(row => row.key === key)?.status;
    assert.equal(status('Button.size'), 'documented');
    assert.equal(status('Caption.color'), 'undocumented');
    // Layout props (mt) are composition, not a restyle.
    assert.ok(!result.ledger.some(row => row.key === 'Button.mt'));
    assert.match(renderMarkdown(result), /### Restyled @leather\.io\/ui components/);
  });

  it('writes a drift score with counts per category', () => {
    const { drift } = result;
    assert.equal(drift.total, result.ledger.length);
    assert.deepEqual(Object.keys(drift.counts), [
      'colour',
      'size',
      'token',
      'component',
      'primitive',
      'override',
    ]);
    assert.equal(drift.counts.component, 4);
    assert.equal(drift.stale, 1);
    assert.match(drift.badge, /^drift \d+ · \d+ undocumented · 1 stale$/);
  });

  it('renders all six sections', () => {
    const markdown = renderMarkdown(result);
    for (const heading of ['## 1.', '## 2.', '## 3.', '## 4.', '## 5.', '## 6.'])
      assert.ok(markdown.includes(heading), heading);
  });

  it('escapes backslashes before pipes in Markdown table cells', () => {
    const token = result.scan.tokens[0];
    assert.ok(token);
    for (const [input, expected] of [
      [String.raw`one\|two`, String.raw`one\\\|two`],
      [String.raw`one\\|two`, String.raw`one\\\\\|two`],
      [String.raw`one\two`, String.raw`one\\two`],
      ['one|two\nthree', String.raw`one\|two three`],
    ]) {
      const markdown = renderMarkdown({
        ...result,
        scan: { ...result.scan, tokens: [{ ...token, property: input }] },
      });
      assert.ok(markdown.includes(` | ${expected} | `), markdown);
    }
  });
});

describe('promote report on an area with variants and shared/', () => {
  const statusOf = (result: PromoteResult, key: string) =>
    result.ledger.find(row => row.key === key)?.status;
  const tail = (file: string) => file.split('area-sketch/')[1];

  it('checks each row against the nearest DEVIATIONS.md when run on the area', async () => {
    const result = await analyze(areaFixture);
    assert.deepEqual(result.deviationsFiles.map(tail), [
      'shared/DEVIATIONS.md',
      'variants/a/DEVIATIONS.md',
      'variants/b/DEVIATIONS.md',
    ]);
    assert.equal(result.deviationsFile, null, 'the area has no DEVIATIONS.md of its own');
    assert.equal(statusOf(result, '#7A5CFA'), 'documented', 'shared/DEVIATIONS.md');
    assert.equal(statusOf(result, 'AmountRow'), 'documented', 'variants/a/DEVIATIONS.md');
    assert.equal(statusOf(result, '13px'), 'documented', 'variants/a/DEVIATIONS.md');
    assert.equal(statusOf(result, '#FF00AA'), 'undocumented');
    assert.deepEqual(
      result.stale.map(entry => [entry.key, tail(entry.file ?? '')]),
      [['#123456', 'variants/b/DEVIATIONS.md']]
    );
    assert.match(renderMarkdown(result), /variants\/b\/DEVIATIONS\.md:3\) has a reason/);
  });

  it("includes the area's shared/ folder in a variant's report", async () => {
    const result = await analyze(path.join(areaFixture, 'variants/b'));
    assert.deepEqual(result.included.map(tail), ['shared']);
    assert.ok(result.files.some(file => file.endsWith('shared/private-label.tsx')));
    assert.equal(statusOf(result, 'PrivateBadge'), 'documented');
    assert.equal(statusOf(result, 'HotBadge'), 'undocumented', 'moved to shared/, still counted');
    assert.equal(result.drift.undocumented, 2);
  });

  it('assesses row components in a -screens.tsx file but skips the exported screens', async () => {
    const result = await analyze(path.join(areaFixture, 'variants/a'));
    const verdict = (name: string) =>
      result.components.find(assessment => assessment.component.name === name)?.verdict.kind;
    assert.equal(verdict('AReview'), 'scaffolding');
    assert.notEqual(verdict('AmountRow'), 'scaffolding');
    assert.ok(result.ledger.some(row => row.key === 'AmountRow'));
  });
});

describe('DEVIATIONS.md parsing', () => {
  it('reads tables and bullets', () => {
    const entries = parseDeviations(
      [
        '| Deviation | Why |',
        '| --- | --- |',
        '| `#FFF` | reason |',
        '',
        '- `Foo` — because',
        '- 13px: spacing',
      ].join('\n')
    );
    assert.deepEqual(
      entries.map(entry => [entry.key, entry.why]),
      [
        ['#FFF', 'reason'],
        ['Foo', 'because'],
        ['13px', 'spacing'],
      ]
    );
  });
});
