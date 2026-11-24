import { existsSync, writeFileSync } from 'node:fs';
import { afterEach, describe, expect, test } from 'vitest';
import { z } from 'zod';

import { runOrThrow } from './exec.js';
import { gitBlobSha } from './git.js';
import { openPullRequest, renderBody, renderScreenshotTable } from './pull-request.js';
import type { FixStatus } from './status.js';
import { type GitHubRoute, fakeGitHub } from './test/fake-github.js';
import {
  type TestRepo,
  binaryContent,
  blockedStatus,
  createTestRepo,
  discardLog,
  doneStatus,
} from './test/test-repo.js';

const repoName = 'leather-io/mono';
const png = Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), Buffer.from('image')]);

const handoff = {
  path: 'knip.json',
  change: 'add apps/web/tests/feature-map/*.features.ts to the web workspace entry list',
};

const doneBody = [
  'Closes #12',
  '',
  '## Why',
  '',
  '- The fee row wrapped out of view below 360px.',
  '',
  '## How',
  '',
  '- Let the row wrap its label instead of overflowing.',
  '',
  '## Tested',
  '',
  '- pnpm --filter @leather.io/extension test:unit',
  '- Not verified: the E2E spec, it needs a built extension.',
  '',
].join('\n');

const treeSchema = z.object({
  tree: z.array(
    z.object({ path: z.string(), mode: z.string(), type: z.string(), sha: z.string().nullable() })
  ),
});
const bodySchema = z.object({ body: z.string() });

function treeEntries(tree: unknown) {
  return [...treeSchema.parse(tree).tree].sort((a, b) => a.path.localeCompare(b.path));
}

function blob(content: string | Buffer): string {
  return gitBlobSha(Buffer.from(content));
}

function existingPull(draft: boolean, fullName = repoName) {
  return [
    {
      number: 7,
      draft,
      node_id: 'PR_node',
      html_url: 'https://github.com/leather-io/mono/pull/7',
      head: { ref: 'bot/fix-issue-12-777', repo: { full_name: fullName } },
    },
  ];
}

describe('renderBody', () => {
  test('closes the issues and lists why, how and tested', () => {
    expect(renderBody(doneStatus, [12], '')).toBe(doneBody);
  });

  test('refers to the issues and leads with the questions when blocked', () => {
    expect(renderBody({ ...blockedStatus, why: ['Reason.'] }, [12, 14], '')).toBe(
      [
        'Refs #12',
        'Refs #14',
        '',
        '## Blocked',
        '',
        `- ${blockedStatus.questions[0]}`,
        '',
        '## Why',
        '',
        '- Reason.',
        '',
      ].join('\n')
    );
  });

  test('closes the issues and still lists the questions of a done fix', () => {
    const question = 'Maintainer action: change the staging workflow key.';
    expect(renderBody({ ...doneStatus, questions: [question] }, [12], '')).toBe(
      doneBody.replace('Closes #12\n', `Closes #12\n\n## Questions\n\n- ${question}\n`)
    );
  });

  test('lists follow-ups after tested and before the screenshots', () => {
    const followUp = '`packages/ui/src/sheet.tsx`: share the close animation duration';
    expect(renderBody({ ...doneStatus, followUps: [followUp] }, [12], '| table |')).toBe(
      `${doneBody}\n## Follow-ups\n\n- ${followUp}\n\n## Screenshots\n\n| table |\n`
    );
  });

  test('ends with the screenshot table', () => {
    expect(renderBody(doneStatus, [12], '| table |')).toBe(
      `${doneBody}\n## Screenshots\n\n| table |\n`
    );
  });
});

describe('renderScreenshotTable', () => {
  test('shows a dash for a missing side and escapes pipes in captions', () => {
    expect(
      renderScreenshotTable([
        {
          id: 'narrow',
          caption: 'Narrow | popup',
          before: null,
          after: 'https://example.test/after.png',
        },
      ])
    ).toBe(
      [
        '| State | Before | After |',
        '| --- | --- | --- |',
        '| Narrow \\| popup | — | ![After: narrow](https://example.test/after.png) |',
      ].join('\n')
    );
  });
});

describe('openPullRequest', () => {
  let repo: TestRepo;
  afterEach(() => repo.cleanup());

  function setup(
    status: FixStatus | Record<string, unknown>,
    change: (() => void) | null = () => repo.makeFix()
  ) {
    repo = createTestRepo();
    change?.();
    repo.git(['add', '-A']);
    writeFileSync(
      repo.paths.patchFile,
      runOrThrow('git', ['diff', '--cached', '--binary', '--no-renames', 'HEAD'], {
        cwd: repo.root,
      })
    );
    repo.git(['reset', '-q', '--hard']);
    repo.git(['clean', '-fdq']);
    repo.writeStatus(status);
  }

  function open(route?: GitHubRoute, overrides: { parentSha?: string; coAuthor?: string } = {}) {
    const client = fakeGitHub(route);
    const result = openPullRequest({
      client,
      paths: repo.paths,
      repo: repoName,
      issue: 12,
      branch: 'bot/fix-issue-12-777',
      baseBranch: 'dev',
      parentSha: overrides.parentSha ?? repo.head,
      coAuthor: overrides.coAuthor,
      runId: '777',
      runAttempt: '1',
      serverUrl: 'https://github.com',
      log: discardLog,
    });
    return { client, result };
  }

  function callsTo(client: ReturnType<typeof fakeGitHub>, method: string, suffix: string) {
    return client.calls.filter(call => call.method === method && call.path.endsWith(suffix));
  }

  test('commits the fix and opens a pull request when none exists', async () => {
    setup(doneStatus);
    const { client, result } = open();
    await expect(result).resolves.toBe('https://github.com/leather-io/mono/pull/101');
    const tree = callsTo(client, 'POST', '/git/trees')[0]?.body;
    expect(tree).toMatchObject({ base_tree: 'base-tree-sha' });
    expect(treeEntries(tree)).toEqual([
      {
        path: 'apps/extension/fee-row.spec.tsx',
        mode: '100644',
        type: 'blob',
        sha: blob('test("wraps", () => {});\n'),
      },
      {
        path: 'apps/extension/fee-row.tsx',
        mode: '100644',
        type: 'blob',
        sha: blob('export const feeRow = 2;\n'),
      },
      { path: 'apps/extension/old.ts', mode: '100644', type: 'blob', sha: null },
      { path: 'packages/utils/icon.bin', mode: '100644', type: 'blob', sha: blob(binaryContent) },
    ]);
    expect(callsTo(client, 'POST', '/git/blobs')).toHaveLength(3);
    expect(callsTo(client, 'POST', '/git/commits')[0]?.body).toEqual({
      message: doneStatus.commit,
      tree: 'new-tree-sha',
      parents: [repo.head],
    });
    expect(callsTo(client, 'POST', '/git/refs')[0]?.body).toEqual({
      ref: 'refs/heads/bot/fix-issue-12-777',
      sha: 'new-commit-sha',
    });
    expect(callsTo(client, 'POST', '/pulls')[0]?.body).toEqual({
      title: doneStatus.commit,
      head: 'bot/fix-issue-12-777',
      base: 'dev',
      body: doneBody,
      draft: false,
    });
    expect(existsSync(repo.paths.applyDir)).toBe(false);
    expect(repo.git(['status', '--porcelain'])).toBe('');
  });

  describe('co-author', () => {
    function withUser(name: string | null): GitHubRoute {
      return (_method, path) =>
        path === 'users/alice' ? { id: 42, login: 'alice', name } : undefined;
    }

    test('credits the dispatcher with their name and no-reply email', async () => {
      setup(doneStatus);
      const { client, result } = open(withUser('Alice Smith'), { coAuthor: 'alice' });
      await result;
      expect(callsTo(client, 'POST', '/git/commits')[0]?.body).toMatchObject({
        message: `${doneStatus.commit}\n\nCo-authored-by: Alice Smith <42+alice@users.noreply.github.com>\n`,
      });
    });

    test('falls back to the login when the dispatcher has no public name', async () => {
      setup(doneStatus);
      const { client, result } = open(withUser(null), { coAuthor: 'alice' });
      await result;
      expect(callsTo(client, 'POST', '/git/commits')[0]?.body).toMatchObject({
        message: `${doneStatus.commit}\n\nCo-authored-by: alice <42+alice@users.noreply.github.com>\n`,
      });
    });

    test('credits no bot', async () => {
      setup(doneStatus);
      const { client, result } = open(undefined, { coAuthor: 'github-actions[bot]' });
      await result;
      expect(client.calls.some(call => call.path.startsWith('users/'))).toBe(false);
      expect(callsTo(client, 'POST', '/git/commits')[0]?.body).toMatchObject({
        message: doneStatus.commit,
      });
    });
  });

  describe('earlier pull requests for the same issue', () => {
    function openPull(number: number, ref: string, fullName = repoName) {
      return {
        number,
        draft: false,
        node_id: `PR_${number}`,
        html_url: `https://github.com/leather-io/mono/pull/${number}`,
        head: { ref, repo: { full_name: fullName } },
      };
    }

    const others = [
      openPull(50, 'bot/fix-issue-12-111'),
      openPull(51, 'bot/fix-issue-123-5'),
      openPull(52, 'bot/fix-issue-12-222', 'someone/mono'),
      openPull(53, 'bot/fix-issue-12-by-hand'),
    ];

    const untouched = { state: 'open', draft: false, commits: 1 };

    function withOpenPulls(fail = false, earlier = untouched): GitHubRoute {
      return (method, path) => {
        if (method === 'GET' && path.includes('/pulls?') && path.includes('head=')) return [];
        if (method === 'GET' && path.includes('/pulls?')) return others;
        if (method === 'GET' && path.endsWith('/pulls/50')) return earlier;
        if (fail && method === 'PATCH' && path.endsWith('/pulls/50')) {
          throw new Error('closing failed');
        }
        return undefined;
      };
    }

    function expectKept(client: ReturnType<typeof fakeGitHub>) {
      expect(callsTo(client, 'POST', '/issues/50/comments')).toHaveLength(0);
      expect(callsTo(client, 'PATCH', '/pulls/50')).toHaveLength(0);
      expect(callsTo(client, 'DELETE', '/git/refs/heads/bot/fix-issue-12-111')).toHaveLength(0);
    }

    test('closes the earlier run of the same issue and deletes its branch', async () => {
      setup(doneStatus);
      const { client, result } = open(withOpenPulls());
      await expect(result).resolves.toBe('https://github.com/leather-io/mono/pull/101');
      expect(callsTo(client, 'POST', '/issues/50/comments')[0]?.body).toEqual({
        body: 'Superseded by #101.',
      });
      expect(callsTo(client, 'PATCH', '/pulls/50')[0]?.body).toEqual({ state: 'closed' });
      expect(callsTo(client, 'DELETE', '/git/refs/heads/bot/fix-issue-12-111')).toHaveLength(1);
      for (const number of [51, 52, 53]) {
        expect(
          client.calls.some(
            call =>
              call.path.endsWith(`/pulls/${number}`) ||
              call.path.endsWith(`/issues/${number}/comments`)
          )
        ).toBe(false);
      }
    });

    test('keeps an earlier pull request someone added commits to', async () => {
      setup(doneStatus);
      const { client, result } = open(withOpenPulls(false, { ...untouched, commits: 2 }));
      await expect(result).resolves.toBe('https://github.com/leather-io/mono/pull/101');
      expectKept(client);
    });

    test('keeps an earlier pull request that is no longer open', async () => {
      setup(doneStatus);
      const { client, result } = open(withOpenPulls(false, { ...untouched, state: 'closed' }));
      await expect(result).resolves.toBe('https://github.com/leather-io/mono/pull/101');
      expectKept(client);
    });

    test('keeps a ready earlier pull request when the new one is a draft', async () => {
      setup({ ...doneStatus, handoff: [handoff] });
      const { client, result } = open(withOpenPulls());
      await expect(result).resolves.toBe('https://github.com/leather-io/mono/pull/101');
      expect(callsTo(client, 'POST', '/pulls')[0]?.body).toMatchObject({ draft: true });
      expectKept(client);
    });

    test('closes an earlier draft when the new pull request is a draft too', async () => {
      setup({ ...doneStatus, handoff: [handoff] });
      const { client, result } = open(withOpenPulls(false, { ...untouched, draft: true }));
      await expect(result).resolves.toBe('https://github.com/leather-io/mono/pull/101');
      expect(callsTo(client, 'PATCH', '/pulls/50')[0]?.body).toEqual({ state: 'closed' });
    });

    test('still returns the new pull request when superseding fails', async () => {
      setup(doneStatus);
      const { client, result } = open(withOpenPulls(true));
      await expect(result).resolves.toBe('https://github.com/leather-io/mono/pull/101');
      expect(callsTo(client, 'DELETE', '/git/refs/heads/bot/fix-issue-12-111')).toHaveLength(0);
    });
  });

  test('keeps the executable bit', async () => {
    setup(doneStatus, () => repo.write('packages/utils/run.sh', 'echo changed\n', 0o755));
    const { client, result } = open();
    await result;
    expect(callsTo(client, 'POST', '/git/trees')[0]?.body).toMatchObject({
      tree: [{ path: 'packages/utils/run.sh', mode: '100755' }],
    });
  });

  function withBranchHead(parents: readonly string[], draft = true): GitHubRoute {
    return (method, path) => {
      if (path.includes('/git/matching-refs/heads/bot/fix-issue-12-777')) {
        return [{ ref: 'refs/heads/bot/fix-issue-12-777', object: { sha: 'old-sha' } }];
      }
      if (method === 'GET' && path.endsWith('/git/commits/old-sha')) {
        return { tree: { sha: 'old-tree-sha' }, parents: parents.map(sha => ({ sha })) };
      }
      if (method === 'GET' && path.includes('/pulls?')) return existingPull(draft);
      return undefined;
    };
  }

  test('force-updates the branch and readies the draft pull request', async () => {
    setup(doneStatus);
    const { client, result } = open(withBranchHead([repo.head]));
    await expect(result).resolves.toBe('https://github.com/leather-io/mono/pull/7');
    expect(callsTo(client, 'PATCH', '/git/refs/heads/bot/fix-issue-12-777')[0]?.body).toEqual({
      sha: 'new-commit-sha',
      force: true,
    });
    expect(callsTo(client, 'PATCH', '/pulls/7')[0]?.body).toEqual({
      title: doneStatus.commit,
      body: doneBody,
    });
    const mutation = client.calls.find(call => call.method === 'GRAPHQL');
    expect(mutation?.path).toMatch(/markPullRequestReadyForReview/);
    expect(mutation?.body).toEqual({ id: 'PR_node' });
  });

  test.each([
    ['a revise commit on top of its own', ['bot-commit-sha']],
    ['a merge of dev', ['bot-commit-sha', 'dev-sha']],
  ])('refuses to force-update a branch that holds %s', async (_name, parents) => {
    setup(doneStatus);
    const { client, result } = open(withBranchHead(parents));
    await expect(result).rejects.toThrow(
      "refusing to overwrite bot/fix-issue-12-777: it holds commits beyond this run's own"
    );
    expect(callsTo(client, 'POST', '/git/commits')).toHaveLength(0);
    expect(callsTo(client, 'PATCH', '/git/refs/heads/bot/fix-issue-12-777')).toHaveLength(0);
  });

  describe('brief', () => {
    const brief = '# #12: Fee row wraps\n\n## Decisions\n\n- Settled: wrap the label';
    const stored = [
      '<!-- fix-issue:brief -->',
      '<details>',
      '<summary>The brief this pull request was written from</summary>',
      '',
      brief,
      '',
      '</details>',
      '<!-- /fix-issue:brief -->',
      '',
    ].join('\n');

    function openWith(route: GitHubRoute | undefined, text: string | undefined) {
      const client = fakeGitHub(route);
      const result = openPullRequest({
        client,
        paths: repo.paths,
        repo: repoName,
        issue: 12,
        branch: 'bot/fix-issue-12-777',
        baseBranch: 'dev',
        parentSha: repo.head,
        brief: text,
        log: discardLog,
      });
      return { client, result };
    }

    test('stores the brief as a comment on a new pull request', async () => {
      setup(doneStatus);
      const { client, result } = openWith(undefined, `${brief}\n`);
      await result;
      expect(callsTo(client, 'POST', '/issues/101/comments')[0]?.body).toEqual({ body: stored });
    });

    test('stores nothing when the dispatch carried no brief', async () => {
      setup(doneStatus);
      const { client, result } = openWith(undefined, ' \n');
      await result;
      expect(callsTo(client, 'POST', '/issues/101/comments')).toHaveLength(0);
    });

    test('stores the brief once when the job runs again', async () => {
      setup(doneStatus);
      const { client, result } = openWith((method, path) => {
        if (method === 'GET' && path.includes('/issues/7/comments')) return [{ body: stored }];
        return withBranchHead([repo.head], false)(method, path, undefined);
      }, brief);
      await expect(result).resolves.toBe('https://github.com/leather-io/mono/pull/7');
      expect(callsTo(client, 'POST', '/issues/7/comments')).toHaveLength(0);
    });

    test('still opens the pull request when the brief cannot be stored', async () => {
      setup(doneStatus);
      const { result } = openWith((method, path) => {
        if (method === 'POST' && path.endsWith('/issues/101/comments')) {
          throw new Error('comment failed');
        }
        return undefined;
      }, brief);
      await expect(result).resolves.toBe('https://github.com/leather-io/mono/pull/101');
    });
  });

  test('ignores a pull request with the same branch name from another repository', async () => {
    setup(doneStatus);
    const { client, result } = open((method, path) =>
      method === 'GET' && path.includes('/pulls?') ? existingPull(false, 'someone/mono') : undefined
    );
    await expect(result).resolves.toBe('https://github.com/leather-io/mono/pull/101');
    expect(callsTo(client, 'POST', '/pulls')).toHaveLength(1);
  });

  test('opens a draft when the fixer is blocked with partial work', async () => {
    setup(blockedStatus);
    const { client, result } = open();
    await result;
    const pull = callsTo(client, 'POST', '/pulls')[0]?.body;
    expect(pull).toMatchObject({ draft: true });
    expect(bodySchema.parse(pull).body).toMatch(/^Refs #12\n\n## Blocked\n/);
  });

  test('turns a ready pull request back into a draft when blocked', async () => {
    setup(blockedStatus);
    const { client, result } = open((method, path) =>
      method === 'GET' && path.includes('/pulls?') ? existingPull(false) : undefined
    );
    await result;
    expect(client.calls.find(call => call.method === 'GRAPHQL')?.path).toMatch(
      /convertPullRequestToDraft/
    );
  });

  test('comments the questions on the issue when blocked before changing anything', async () => {
    setup(blockedStatus, null);
    const { client, result } = open();
    await expect(result).resolves.toBe(
      'https://github.com/leather-io/mono/issues/12#issuecomment-1'
    );
    expect(callsTo(client, 'POST', '/issues/12/comments')[0]?.body).toEqual({
      body: `The \`repo:fix-issue\` run (https://github.com/leather-io/mono/actions/runs/777) stopped before changing anything.\n\nIt needs answers to:\n\n- ${blockedStatus.questions[0]}\n`,
    });
    expect(callsTo(client, 'POST', '/pulls')).toHaveLength(0);
  });

  test('lists the maintainer changes on the issue when nothing it may change was needed', async () => {
    setup({ ...doneStatus, handoff: [handoff] }, null);
    const { client, result } = open();
    await result;
    expect(callsTo(client, 'POST', '/issues/12/comments')[0]?.body).toEqual({
      body: `The \`repo:fix-issue\` run (https://github.com/leather-io/mono/actions/runs/777) stopped before changing anything.\n\nA maintainer needs to make these changes, outside the paths the run may change:\n\n- \`knip.json\`: add apps/web/tests/feature-map/*.features.ts to the web workspace entry list\n`,
    });
  });

  test('opens a draft that lists the maintainer changes when a finished fix hands some off', async () => {
    setup({ ...doneStatus, handoff: [handoff] });
    const { client, result } = open();
    await result;
    const pull = callsTo(client, 'POST', '/pulls')[0]?.body;
    expect(pull).toMatchObject({ draft: true });
    expect(bodySchema.parse(pull).body).toMatch(
      /^Closes #12\n\n## Needs a maintainer\n\n- `knip\.json`: add apps\/web/
    );
  });

  test('fails when the fixer is done but nothing changed', async () => {
    setup(doneStatus, null);
    await expect(open().result).rejects.toThrow('state is done but nothing changed');
  });

  test('refuses a patch that touches .github/', async () => {
    setup(doneStatus, () => repo.write('.github/workflows/evil.yml', 'on: push\n'));
    const { client, result } = open();
    await expect(result).rejects.toThrow(
      /refusing to apply the patch[\s\S]*\.github\/workflows\/evil\.yml/
    );
    expect(client.calls).toEqual([]);
  });

  test('refuses to commit when the applied tree holds a change outside the allowed paths', async () => {
    setup(doneStatus);
    repo.write(
      'tmp/hooks/post-checkout',
      '#!/bin/sh\nmkdir -p .github/workflows\necho "on: push" > .github/workflows/evil.yml\n',
      0o755
    );
    repo.git(['config', 'core.hooksPath', `${repo.root}/tmp/hooks`]);
    const { client, result } = open();
    await expect(result).rejects.toThrow(/refusing to commit[\s\S]*\.github\/workflows\/evil\.yml/);
    expect(client.calls).toEqual([]);
  });

  test('refuses to run on a different commit than the fix was made against', async () => {
    setup(doneStatus);
    await expect(open(undefined, { parentSha: 'f'.repeat(40) }).result).rejects.toThrow(
      /HEAD is not f+/
    );
  });

  test('refuses an invalid status', async () => {
    setup({ ...doneStatus, commit: 'fix: no scope' });
    await expect(open().result).rejects.toThrow(/not a conventional subject/);
  });

  describe('screenshots', () => {
    const withScreenshots: FixStatus = {
      ...doneStatus,
      screenshots: [
        { id: 'fee-row-narrow', caption: 'Fee row on a 320px popup' },
        { id: 'fee-row-new', caption: 'New | wrapped label' },
      ],
    };

    function shoot(side: string, id: string, content: Buffer = png) {
      repo.write(`tmp/fix-issue/screenshots/${side}/${id}.png`, content);
    }

    test('publishes them to a new screenshots branch and tables them', async () => {
      setup(withScreenshots);
      shoot('before', 'fee-row-narrow');
      shoot('after', 'fee-row-narrow');
      shoot('after', 'fee-row-new');
      const { client, result } = open();
      await result;
      const screenshotTree = callsTo(client, 'POST', '/git/trees')[0]?.body;
      expect(screenshotTree).toEqual({
        tree: [
          {
            path: '12/777-1/before/fee-row-narrow.png',
            mode: '100644',
            type: 'blob',
            sha: blob(png),
          },
          {
            path: '12/777-1/after/fee-row-narrow.png',
            mode: '100644',
            type: 'blob',
            sha: blob(png),
          },
          {
            path: '12/777-1/after/fee-row-new.png',
            mode: '100644',
            type: 'blob',
            sha: blob(png),
          },
        ],
      });
      expect(callsTo(client, 'POST', '/git/refs')[0]?.body).toEqual({
        ref: 'refs/heads/bot/screenshots-12',
        sha: 'new-commit-sha',
      });
      const base = 'https://raw.githubusercontent.com/leather-io/mono/new-commit-sha/12/777-1';
      const body = callsTo(client, 'POST', '/pulls')[0]?.body;
      expect(body).toMatchObject({
        body: `${doneBody}\n## Screenshots\n\n${[
          '| State | Before | After |',
          '| --- | --- | --- |',
          `| Fee row on a 320px popup | ![Before: fee-row-narrow](${base}/before/fee-row-narrow.png) | ![After: fee-row-narrow](${base}/after/fee-row-narrow.png) |`,
          `| New \\| wrapped label | — | ![After: fee-row-new](${base}/after/fee-row-new.png) |`,
        ].join('\n')}\n`,
      });
    });

    test('adds to an existing screenshots branch without forcing', async () => {
      setup(withScreenshots);
      shoot('after', 'fee-row-narrow');
      const { client, result } = open((_method, path) =>
        path.includes('/git/matching-refs/heads/bot/screenshots-12')
          ? [{ ref: 'refs/heads/bot/screenshots-12', object: { sha: 'shots-head' } }]
          : undefined
      );
      await result;
      expect(callsTo(client, 'POST', '/git/trees')[0]?.body).toMatchObject({
        base_tree: 'base-tree-sha',
      });
      expect(callsTo(client, 'PATCH', '/git/refs/heads/bot/screenshots-12')[0]?.body).toEqual({
        sha: 'new-commit-sha',
      });
    });

    test('still opens the pull request, without screenshots, when publishing them fails', async () => {
      setup(withScreenshots);
      shoot('after', 'fee-row-narrow');
      const { client, result } = open((method, path, body) => {
        const ref = typeof body === 'object' && body !== null && 'ref' in body ? body.ref : null;
        if (method === 'POST' && ref === 'refs/heads/bot/screenshots-12') {
          throw new Error('Reference update failed');
        }
        return undefined;
      });
      await expect(result).resolves.toBe('https://github.com/leather-io/mono/pull/101');
      expect(callsTo(client, 'POST', '/pulls')[0]?.body).toMatchObject({ body: doneBody });
      expect(callsTo(client, 'POST', '/git/refs').map(call => call.body)).toContainEqual({
        ref: 'refs/heads/bot/fix-issue-12-777',
        sha: 'new-commit-sha',
      });
    });

    test('skips files that are not PNGs and adds no section without images', async () => {
      setup(withScreenshots);
      shoot('after', 'fee-row-narrow', Buffer.from('<svg onload=alert(1)>'));
      const { client, result } = open();
      await result;
      expect(client.calls.some(call => call.path.includes('bot/screenshots-12'))).toBe(false);
      expect(callsTo(client, 'POST', '/pulls')[0]?.body).toMatchObject({ body: doneBody });
    });
  });
});
