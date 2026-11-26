import { describe, expect, test } from 'vitest';

import { renderFeedback } from './feedback.js';

describe('renderFeedback', () => {
  test('gives the notes and the merge a section each', () => {
    expect(
      renderFeedback({
        pullRequest: 7,
        ordinal: 2,
        requestedBy: 'alice',
        instructions: 'Truncate instead.',
        merge: { dev: 'd'.repeat(40), conflicts: ['apps/extension/fee-row.tsx'] },
      })
    ).toBe(
      [
        '# Feedback on pull request #7',
        '',
        'Revise 2 of 5, asked for by @alice. The status file needs one line under `answers` per thing asked for below.',
        '',
        '## What @alice asked for',
        '',
        'Truncate instead.',
        '',
        '## `dev` was merged into the branch and conflicts',
        '',
        `The workflow merged \`dev\` at \`${'d'.repeat(40)}\` into the pull request branch before you started. These files conflict; resolve every one:`,
        '',
        '- `apps/extension/fee-row.tsx`',
        '',
      ].join('\n')
    );
  });

  test('says when the merge had no conflicts, and leaves out notes there are none of', () => {
    const text = renderFeedback({
      pullRequest: 7,
      ordinal: 1,
      requestedBy: 'alice',
      instructions: '',
      merge: { dev: 'd'.repeat(40), conflicts: [] },
    });
    expect(text).toContain('## `dev` was merged into the branch\n');
    expect(text).toContain('The merge had no conflicts.');
    expect(text).not.toContain('asked for\n');
  });
});
