import { describe, expect, test } from 'vitest';

import { anyRunFailed, fetchRunStatuses, formatRunStatuses } from './run-status.js';
import { fakeGitHub } from './test/fake-github.js';

const runsPath =
  'repos/leather-io/mono/actions/workflows/repo:fix-issue.yml/runs?event=workflow_dispatch&per_page=100&page=';

function run(id: number, issue: number, createdAt: string, conclusion: string | null) {
  return {
    id,
    display_title: `fix-issue: #${issue}`,
    status: conclusion === null ? 'in_progress' : 'completed',
    conclusion,
    html_url: `https://github.com/leather-io/mono/actions/runs/${id}`,
    created_at: createdAt,
  };
}

const runs = [
  run(10, 37, '2026-11-09T10:00:00Z', 'success'),
  run(11, 37, '2026-11-10T10:00:00Z', 'success'),
  run(12, 82, '2026-11-10T11:00:00Z', 'failure'),
  run(13, 90, '2026-11-10T12:00:00Z', null),
];

const firstPage = Array.from({ length: 100 }, (_, index) =>
  run(1000 + index, 500 + index, '2026-11-10T13:00:00Z', 'success')
);

const pulls: Record<string, unknown[]> = {
  'leather-io:bot/fix-issue-37-11': [
    {
      number: 216,
      html_url: 'https://github.com/leather-io/mono/pull/216',
      state: 'open',
      draft: false,
      body: '## Why\n\n- a reason\n',
    },
  ],
  'leather-io:bot/fix-issue-82-12': [
    {
      number: 217,
      html_url: 'https://github.com/leather-io/mono/pull/217',
      state: 'open',
      draft: true,
      body: '## Blocked\n\n- Should knip ignore it? Options: yes; no.\n\n## Tested\n\n- pnpm lint\n',
    },
  ],
};

function github() {
  return fakeGitHub((method, path) => {
    if (method === 'GET' && path === `${runsPath}1`) return { workflow_runs: firstPage };
    if (method === 'GET' && path === `${runsPath}2`) return { workflow_runs: runs };
    const head = /[?&]head=([^&]+)/.exec(path)?.[1];
    if (method === 'GET' && head) return pulls[decodeURIComponent(head)] ?? [];
    return undefined;
  });
}

describe('fetchRunStatuses', () => {
  test("pages back to each issue's latest run and shows its pull request and a draft's blocked questions", async () => {
    const statuses = await fetchRunStatuses(github(), 'leather-io/mono', [37, 82, 90, 5]);
    expect(formatRunStatuses(statuses)).toBe(
      [
        '#37  completed  success  #216 open  https://github.com/leather-io/mono/pull/216',
        '#82  completed  failure  #217 open draft  https://github.com/leather-io/mono/pull/217',
        '#90  in_progress  -  -  https://github.com/leather-io/mono/actions/runs/13',
        '#5  not found  -  -  -',
        '',
        'Blocked, waiting for answers:',
        '#82 https://github.com/leather-io/mono/pull/217',
        '  - Should knip ignore it? Options: yes; no.',
      ].join('\n')
    );
    expect(anyRunFailed(statuses)).toBe(true);
  });

  test('stops paging once every issue has a run', async () => {
    const client = github();
    await fetchRunStatuses(client, 'leather-io/mono', [500]);
    expect(client.calls.map(call => call.path)).toEqual([
      `${runsPath}1`,
      'repos/leather-io/mono/pulls?state=all&head=leather-io%3Abot%2Ffix-issue-500-1000',
    ]);
  });

  test('reports no failure while every run succeeded or is still running', async () => {
    const statuses = await fetchRunStatuses(github(), 'leather-io/mono', [37, 90]);
    expect(anyRunFailed(statuses)).toBe(false);
  });
});
