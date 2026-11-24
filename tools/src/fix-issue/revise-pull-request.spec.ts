import { existsSync, writeFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { z } from 'zod';

import { runOrThrow } from './exec.js';
import { gitBlobSha } from './git.js';
import { GitHubError } from './github.js';
import { mergeDev } from './merge.js';
import { openPullRequest } from './pull-request.js';
import { carriedScreenshots } from './revise-pull-request.js';
import type { FixStatus } from './status.js';
import { type GraphqlRoute, fakeGitHub, reviewThread, threadsPage } from './test/fake-github.js';
import {
  type TestRepo,
  blockedStatus,
  conflictingFile,
  createPullRequestBranch,
  createTestRepo,
  discardLog,
  doneStatus,
  pullRequestBranch,
} from './test/test-repo.js';

const repoName = 'leather-io/mono';
const appLogin = 'leather-fix-issue[bot]';
const resolved = 'export const feeRow = 4;\n';
const permissionsPath = /^repos\/leather-io\/mono\/collaborators\/([^/]+)\/permission$/;

const reviseStatus: FixStatus = {
  ...doneStatus,
  commit: 'fix(extension): wrap the fee label instead of truncating it',
  feedback: [
    { id: 'instructions', addressed: true, reply: 'Wrapped the label in fee-row.tsx.' },
    { id: 'thread-11', addressed: true, reply: 'Wrapped it.' },
    { id: 'thread-21', addressed: false, reply: 'Not renamed: the brief settles the name.' },
    { id: 'review-5', addressed: true, reply: 'Renamed the constant.' },
  ],
};
const mergeStatus: FixStatus = {
  ...reviseStatus,
  feedback: [{ id: 'merge', addressed: true, reply: 'Kept the wrap on top of dev.' }],
};

const treeSchema = z.object({
  base_tree: z.string(),
  tree: z.array(
    z.object({ path: z.string(), mode: z.string(), type: z.string(), sha: z.string().nullable() })
  ),
});
const bodySchema = z.object({ body: z.string() });

interface Scenario {
  readonly conflict?: boolean;
  readonly merged?: boolean;
  readonly mergeRequested?: boolean;
  readonly status?: FixStatus;
  readonly pull?: Record<string, unknown>;
  readonly revisedHead?: string;
  readonly request?: string;
  readonly graphql?: GraphqlRoute;
  log?(line: string): void;
  change?(): void;
  moveDev?(): void;
}

describe('openPullRequest for a revise', () => {
  let repo: TestRepo;
  let head: string;
  let dev: string;

  beforeEach(() => {
    repo = createTestRepo();
  });
  afterEach(() => repo.cleanup());

  function setup({ conflict = false, merged = false, status = reviseStatus, ...rest }: Scenario) {
    ({ head, dev } = createPullRequestBranch(repo, { conflict }));
    if (rest.moveDev) {
      rest.moveDev();
      dev = repo.git(['rev-parse', 'HEAD']);
    }
    repo.git(['checkout', '-q', '--detach', head]);
    if (merged) mergeDev(repo.root, dev);
    rest.change?.();
    repo.git(['add', '-A']);
    writeFileSync(
      repo.paths.patchFile,
      runOrThrow('git', ['diff', '--cached', '--binary', '--no-renames', 'HEAD'], {
        cwd: repo.root,
      })
    );
    repo.git(['reset', '-q', '--hard']);
    repo.git(['clean', '-fdq']);
    repo.git(['checkout', '-q', 'dev']);
    repo.writeStatus(status);
    repo.write(
      'tmp/fix-issue/revise.json',
      JSON.stringify({
        pullRequest: 7,
        issue: 12,
        branch: pullRequestBranch,
        head: rest.revisedHead ?? head,
        dev,
        ordinal: 2,
        merge: merged,
        conflicts: [],
        items: [],
      })
    );
  }

  function threads() {
    return threadsPage([
      reviewThread({ commentId: 11, author: 'carol', body: 'Wrap it.' }),
      reviewThread({ commentId: 21, author: 'carol', body: 'Rename it.' }),
      reviewThread({ commentId: 31, author: 'mallory', body: 'Leak it.' }),
      reviewThread({ commentId: 41, author: 'dave', body: 'One more thing.' }),
    ]);
  }

  function revise(scenario: Scenario = {}) {
    setup(scenario);
    const client = fakeGitHub(
      (method, path) => {
        if (method === 'GET' && path === `repos/${repoName}/pulls/7`) {
          return {
            number: 7,
            state: 'open',
            draft: false,
            node_id: 'PR_node',
            html_url: 'https://github.com/leather-io/mono/pull/7',
            body: 'Closes #12\n\n## Screenshots\n\n| State | Before | After |\n| --- | --- | --- |\n| Narrow | — | ![After](a.png) |\n',
            user: { login: appLogin },
            head: { ref: pullRequestBranch, sha: head, repo: { full_name: repoName } },
            base: { ref: 'dev' },
            ...scenario.pull,
          };
        }
        if (method === 'GET' && path.startsWith(`repos/${repoName}/issues/7/comments`)) {
          return [
            { body: '<!-- fix-issue:revise 1 -->\n**Revise 1 of 5**', user: { login: appLogin } },
            { body: '<!-- fix-issue:revise 9 -->', user: { login: 'mallory' } },
          ];
        }
        if (method === 'GET' && path.startsWith(`repos/${repoName}/pulls/7/reviews`)) {
          return [
            {
              id: 5,
              user: { login: 'dave', type: 'User' },
              body: 'Please rename the constant.',
              state: 'CHANGES_REQUESTED',
              commit_id: head,
            },
          ];
        }
        if (method === 'GET' && path.includes('/git/commits/')) {
          return { tree: { sha: `tree-of-${path.split('/').at(-1)}` } };
        }
        if (path === 'users/alice') return { id: 42, login: 'alice', name: 'Alice Smith' };
        if (path.endsWith('/requested_reviewers')) return {};
        const login = permissionsPath.exec(path)?.[1];
        if (login === undefined) return undefined;
        if (!['carol', 'dave'].includes(login)) throw new GitHubError(404, 'Not a collaborator');
        return { permission: 'write' };
      },
      scenario.graphql ?? (query => (query.includes('reviewThreads') ? threads() : undefined))
    );
    const result = openPullRequest({
      client,
      paths: repo.paths,
      repo: repoName,
      baseBranch: 'dev',
      parentSha: dev,
      pullRequest: 7,
      mergeRequested: scenario.mergeRequested ?? false,
      appLogin,
      coAuthor: 'alice',
      brief: scenario.request,
      runId: '888',
      serverUrl: 'https://github.com',
      log: scenario.log ?? discardLog,
    });
    return { client, result };
  }

  function callsTo(client: ReturnType<typeof fakeGitHub>, method: string, suffix: string) {
    return client.calls.filter(call => call.method === method && call.path.endsWith(suffix));
  }

  function mutations(client: ReturnType<typeof fakeGitHub>, name: string) {
    return client.calls.filter(call => call.method === 'GRAPHQL' && call.path.includes(name));
  }

  function summaryOf(client: ReturnType<typeof fakeGitHub>): string {
    return bodySchema.parse(callsTo(client, 'POST', '/issues/7/comments')[0]?.body).body;
  }

  function wrapLabel() {
    repo.write(conflictingFile, resolved);
    repo.write('apps/extension/fee-row.spec.tsx', 'test("wraps", () => {});\n');
  }

  function resolveConflict() {
    repo.write(conflictingFile, resolved);
  }

  test('commits the revise on top of the branch head without forcing', async () => {
    const { client, result } = revise({ change: wrapLabel });
    await expect(result).resolves.toBe(
      'https://github.com/leather-io/mono/issues/12#issuecomment-1'
    );
    const tree = treeSchema.parse(callsTo(client, 'POST', '/git/trees')[0]?.body);
    expect(tree.base_tree).toBe(`tree-of-${head}`);
    expect([...tree.tree].sort((a, b) => a.path.localeCompare(b.path))).toEqual([
      {
        path: 'apps/extension/fee-row.spec.tsx',
        mode: '100644',
        type: 'blob',
        sha: gitBlobSha(Buffer.from('test("wraps", () => {});\n')),
      },
      {
        path: conflictingFile,
        mode: '100644',
        type: 'blob',
        sha: gitBlobSha(Buffer.from(resolved)),
      },
    ]);
    expect(callsTo(client, 'POST', '/git/commits')[0]?.body).toEqual({
      message: `${reviseStatus.commit}\n\nCo-authored-by: Alice Smith <42+alice@users.noreply.github.com>\n`,
      tree: 'new-tree-sha',
      parents: [head],
    });
    expect(callsTo(client, 'PATCH', `/git/refs/heads/${pullRequestBranch}`)[0]?.body).toEqual({
      sha: 'new-commit-sha',
    });
    expect(callsTo(client, 'POST', '/pulls')).toEqual([]);
    expect(existsSync(repo.paths.applyDir)).toBe(false);
  });

  test('answers the threads the fixer answered and resolves the ones it addressed', async () => {
    const { client, result } = revise({ change: wrapLabel });
    await result;
    expect(mutations(client, 'addPullRequestReviewThreadReply').map(call => call.body)).toEqual([
      { thread: 'PRRT_11', body: 'Wrapped it.' },
      { thread: 'PRRT_21', body: 'Not renamed: the brief settles the name.' },
    ]);
    expect(mutations(client, 'resolveReviewThread').map(call => call.body)).toEqual([
      { thread: 'PRRT_11' },
    ]);
  });

  test('never touches a thread started by someone without write access', async () => {
    const { client, result } = revise({
      change: wrapLabel,
      status: {
        ...reviseStatus,
        feedback: [{ id: 'thread-31', addressed: true, reply: 'Resolved by force.' }],
      },
    });
    await result;
    expect(mutations(client, 'addPullRequestReviewThreadReply')).toEqual([]);
    expect(mutations(client, 'resolveReviewThread')).toEqual([]);
  });

  test('rewrites the description, keeps the screenshots and records the revise in a comment', async () => {
    const { client, result } = revise({
      change: wrapLabel,
      request: 'Wrap the label.\n\nKeep the test.\n',
    });
    await result;
    const body = bodySchema.parse(callsTo(client, 'PATCH', '/pulls/7')[0]?.body).body;
    expect(body).toMatch(/^Closes #12\n\n## Why\n/);
    expect(body).toMatch(
      /## Screenshots\n\n\| State \| Before \| After \|\n\| --- \| --- \| --- \|\n\| Narrow \| — \| !\[After\]\(a\.png\) \|\n\nCaptured before revise 2; what it changed is not shown\.\n$/
    );
    expect(summaryOf(client)).toBe(
      [
        '<!-- fix-issue:revise 2 -->',
        '',
        '**Revise 2 of 5**, asked for by @alice ([run](https://github.com/leather-io/mono/actions/runs/888)).',
        '',
        '> Wrap the label.',
        '>',
        '> Keep the test.',
        '',
        `Committed new-commit-s (\`${reviseStatus.commit}\`).`,
        '',
        '- What was asked: Wrapped the label in fee-row.tsx.',
        '- Review `review-5`: Renamed the constant.',
        '- Review threads: 2 of 2 answered, 1 resolved.',
        '- 1 unresolved review threads were not part of this revise; dispatch another one to have them addressed.',
        '',
      ].join('\n')
    );
    expect(callsTo(client, 'POST', '/pulls/7/requested_reviewers')[0]?.body).toEqual({
      reviewers: ['carol', 'dave'],
    });
    expect(mutations(client, 'convertPullRequestToDraft')).toEqual([]);
  });

  test('commits a resolved merge with the branch head and dev as its parents', async () => {
    const { client, result } = revise({
      conflict: true,
      merged: true,
      status: mergeStatus,
      change: resolveConflict,
    });
    await result;
    const tree = treeSchema.parse(callsTo(client, 'POST', '/git/trees')[0]?.body);
    expect(tree.base_tree).toBe(`tree-of-${dev}`);
    expect(tree.tree).toEqual([
      {
        path: conflictingFile,
        mode: '100644',
        type: 'blob',
        sha: gitBlobSha(Buffer.from(resolved)),
      },
    ]);
    expect(callsTo(client, 'POST', '/git/commits')[0]?.body).toMatchObject({
      parents: [head, dev],
    });
    expect(summaryOf(client)).toContain(
      `Committed new-commit-s (\`${reviseStatus.commit}\`), merging \`dev\` at ${dev.slice(0, 12)}.`
    );
    expect(summaryOf(client)).toContain('- Merge of `dev`: Kept the wrap on top of dev.');
  });

  test('commits a merge that leaves nothing but dev, without asking for an empty tree', async () => {
    const { client, result } = revise({
      conflict: true,
      merged: true,
      status: mergeStatus,
      change() {
        repo.write(conflictingFile, 'export const feeRow = 3;\n');
      },
    });
    await result;
    expect(callsTo(client, 'POST', '/git/trees')).toEqual([]);
    expect(callsTo(client, 'POST', '/git/commits')[0]?.body).toMatchObject({
      tree: `tree-of-${dev}`,
      parents: [head, dev],
    });
    expect(callsTo(client, 'PATCH', `/git/refs/heads/${pullRequestBranch}`)).toHaveLength(1);
  });

  test('commits a requested clean merge from blobs GitHub already has', async () => {
    const { client, result } = revise({ merged: true, mergeRequested: true, status: mergeStatus });
    await result;
    expect(callsTo(client, 'POST', '/git/blobs')).toEqual([]);
    const tree = treeSchema.parse(callsTo(client, 'POST', '/git/trees')[0]?.body);
    expect(tree).toMatchObject({
      base_tree: `tree-of-${dev}`,
      tree: [{ path: conflictingFile, sha: gitBlobSha(Buffer.from('export const feeRow = 2;\n')) }],
    });
    expect(callsTo(client, 'POST', '/git/commits')[0]?.body).toMatchObject({
      parents: [head, dev],
    });
  });

  test('merges on its own account when the tooling on dev moved', async () => {
    const { client, result } = revise({
      merged: true,
      status: mergeStatus,
      moveDev() {
        repo.write('tools/src/fix-issue/revise.ts', 'newer\n');
        repo.git(['add', '-A']);
        repo.git(['commit', '-q', '-m', 'dev changes the tooling']);
      },
    });
    await result;
    expect(callsTo(client, 'POST', '/git/commits')[0]?.body).toMatchObject({
      parents: [head, dev],
    });
  });

  test('commits nothing while a conflict marker remains, and asks instead', async () => {
    const { client, result } = revise({
      conflict: true,
      merged: true,
      status: {
        ...reviseStatus,
        feedback: [
          { id: 'merge', addressed: true, reply: 'Resolved.' },
          { id: 'thread-11', addressed: true, reply: 'Wrapped it.' },
        ],
      },
      change() {
        repo.write('apps/extension/fee-row.spec.tsx', 'test("wraps", () => {});\n');
      },
    });
    await result;
    expect(callsTo(client, 'POST', '/git/commits')).toEqual([]);
    expect(callsTo(client, 'PATCH', `/git/refs/heads/${pullRequestBranch}`)).toEqual([]);
    const body = bodySchema.parse(callsTo(client, 'PATCH', '/pulls/7')[0]?.body).body;
    expect(body).toMatch(
      /^Refs #12\n\n## Blocked\n\n- The merge of dev left conflict markers in `apps\/extension\/fee-row\.tsx`/
    );
    expect(mutations(client, 'convertPullRequestToDraft').map(call => call.body)).toEqual([
      { id: 'PR_node' },
    ]);
    expect(mutations(client, 'addPullRequestReviewThreadReply')).toHaveLength(1);
    expect(mutations(client, 'resolveReviewThread')).toEqual([]);
    expect(summaryOf(client)).toContain('Nothing was committed to the branch.');
    expect(callsTo(client, 'POST', '/pulls/7/requested_reviewers')).toEqual([]);
  });

  test('commits the partial work of a blocked revise and puts the pull request back to draft', async () => {
    const { client, result } = revise({
      change: wrapLabel,
      status: { ...reviseStatus, state: 'blocked', questions: blockedStatus.questions },
    });
    await result;
    expect(callsTo(client, 'POST', '/git/commits')).toHaveLength(1);
    expect(mutations(client, 'convertPullRequestToDraft')).toHaveLength(1);
    expect(summaryOf(client)).toContain(
      `It needs answers before it can go on, so the pull request is a draft:\n\n- ${blockedStatus.questions[0]}`
    );
    expect(callsTo(client, 'POST', '/pulls/7/requested_reviewers')).toEqual([]);
  });

  test('readies a draft once nothing blocks it', async () => {
    const { client, result } = revise({ change: wrapLabel, pull: { draft: true } });
    await result;
    expect(mutations(client, 'markPullRequestReadyForReview').map(call => call.body)).toEqual([
      { id: 'PR_node' },
    ]);
  });

  test('only answers when the revise changed nothing', async () => {
    const { client, result } = revise();
    await result;
    expect(callsTo(client, 'POST', '/git/trees')).toEqual([]);
    expect(mutations(client, 'resolveReviewThread')).toHaveLength(1);
    expect(summaryOf(client)).toContain('Nothing was committed to the branch.');
    expect(callsTo(client, 'POST', '/pulls/7/requested_reviewers')).toEqual([]);
  });

  test('still records the revise when GitHub refuses the thread replies', async () => {
    const lines: string[] = [];
    const { client, result } = revise({
      change: wrapLabel,
      pull: { draft: true },
      graphql() {
        return { errors: [{ message: 'Resource not accessible by integration' }] };
      },
      log(line) {
        lines.push(line);
      },
    });
    await result;
    expect(callsTo(client, 'POST', '/git/commits')).toHaveLength(1);
    expect(summaryOf(client)).toContain('**Revise 2 of 5**');
    expect(lines).toEqual([
      'open-pull-request: could not make #7 ready: GraphQL request failed: Resource not accessible by integration',
      'open-pull-request: could not answer the review threads: GraphQL request failed: Resource not accessible by integration',
    ]);
  });

  test.each<[string, Record<string, unknown>, RegExp]>([
    ['is closed', { state: 'closed' }, /#7 is no longer open/],
    [
      'someone else opened',
      { user: { login: 'alice' } },
      /#7 was not opened by leather-fix-issue\[bot\]/,
    ],
    [
      'moved during the run',
      { head: { ref: pullRequestBranch, sha: 'f'.repeat(40), repo: { full_name: repoName } } },
      /is at f+, not at the commit the fixer revised \(\w+\); dispatch the revise again/,
    ],
    [
      'comes from a fork',
      { head: { ref: pullRequestBranch, sha: 'x', repo: { full_name: 'mallory/mono' } } },
      /#7 is not a pull request of leather-io\/mono into dev/,
    ],
  ])('writes nothing to a pull request that %s', async (_name, pull, error) => {
    const { client, result } = revise({ change: wrapLabel, pull });
    await expect(result).rejects.toThrow(error);
    expect(client.calls.filter(call => call.method !== 'GET')).toEqual([]);
  });

  test('refuses a patch that touches .github/', async () => {
    const { client, result } = revise({
      change() {
        repo.write('.github/workflows/evil.yml', 'on: push\n');
      },
    });
    await expect(result).rejects.toThrow(/refusing to apply the patch[\s\S]*evil\.yml/);
    expect(client.calls.filter(call => call.method !== 'GET')).toEqual([]);
    expect(existsSync(repo.paths.applyDir)).toBe(false);
  });
});

describe('carriedScreenshots', () => {
  test('keeps the table of the description it replaces', () => {
    const body =
      'Closes #12\n\n## Screenshots\n\n| State |\n| --- |\n| Narrow |\n\n## After\n\nmore\n';
    expect(carriedScreenshots(body, 3)).toBe(
      '| State |\n| --- |\n| Narrow |\n\nCaptured before revise 3; what it changed is not shown.'
    );
  });

  test('carries nothing when there is no table', () => {
    expect(carriedScreenshots(null, 1)).toBeNull();
    expect(carriedScreenshots('Closes #12\n\n## Why\n\n- Reason.\n', 1)).toBeNull();
    expect(carriedScreenshots('## Screenshots\n\nnone\n', 1)).toBeNull();
  });
});
