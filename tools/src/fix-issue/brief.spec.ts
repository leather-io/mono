import { describe, expect, test } from 'vitest';

import { extractBrief, isBriefComment, renderBriefComment } from './brief.js';

const brief =
  '# #12: Fee row wraps\n\n## Decisions\n\n- Settled: wrap the label — it must stay readable';

describe('brief comment', () => {
  test('wraps the brief in a folded block that reads back unchanged', () => {
    const comment = renderBriefComment(`\n${brief}\n\n`);
    expect(comment).toBe(
      [
        '<!-- fix-issue:brief -->',
        '<details>',
        '<summary>The brief this pull request was written from</summary>',
        '',
        brief,
        '',
        '</details>',
        '<!-- /fix-issue:brief -->',
        '',
      ].join('\n')
    );
    expect(isBriefComment(comment)).toBe(true);
    expect(comment === null ? null : extractBrief(comment)).toBe(brief);
  });

  test('keeps a brief that has a folded block of its own', () => {
    const nested = `${brief}\n\n<details>\n<summary>Log</summary>\n\ntrace\n\n</details>`;
    const comment = renderBriefComment(nested);
    expect(comment === null ? null : extractBrief(comment)).toBe(nested);
  });

  test('renders nothing for an empty brief or one too long for a comment', () => {
    expect(renderBriefComment(undefined)).toBeNull();
    expect(renderBriefComment(' \n')).toBeNull();
    expect(renderBriefComment('x'.repeat(65_536))).toBeNull();
  });

  test('reads no brief from any other comment', () => {
    expect(isBriefComment(null)).toBe(false);
    expect(isBriefComment('Superseded by #101.')).toBe(false);
    expect(extractBrief('Superseded by #101.')).toBeNull();
    expect(extractBrief('<!-- fix-issue:brief -->\nbroken')).toBeNull();
  });
});
