import { existsSync, readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { GitHubError } from '../ci/github.js';
import { gateRevise } from './revise-gate.js';
import { readReviseState } from './revise-state.js';
import { fakeGitHub } from './test/fake-github.js';
import {
  type TestRepo,
  conflictingFile,
  createPullRequestBranch,
  createTestRepo,
  pullRequestBranch,
} from './test/test-repo.js';

const repoName = 'leather-io/mono';
const appClientId = 'Iv23-fix-issue';
const permissionsPath = /^repos\/leather-io\/mono\/collaborators\/([^/]+)\/permission$/;

interface Scenario {
  readonly notes?: string;
  readonly merge?: boolean;
  readonly pull?: Record<string, unknown>;
  readonly comments?: readonly unknown[];
  readonly clientId?: string;
}

function appComment(body: string) {
  return {
    body,
    created_at: '2026-11-12T08:00:00Z',
    user: { login: 'leather-fix-issue[bot]', type: 'Bot' },
    performed_via_github_app: { client_id: appClientId },
  };
}

function reviseSummary(ordinal: number) {
  return appComment(`<!-- fix-issue:revise ${ordinal} -->\n**Revise ${ordinal} of 5**`);
}

const briefComment = appComment(
  [
    '<!-- fix-issue:brief -->',
    '<details>',
    '<summary>The brief this pull request was written from</summary>',
    '',
    '- Settled: wrap the label',
    '',
    '</details>',
  ].join('\n')
);

describe('gateRevise', () => {
  let repo: TestRepo;
  let head: string;
  let dev: string;

  function branch(conflict: boolean) {
    ({ head, dev } = createPullRequestBranch(repo, { conflict }));
  }

  beforeEach(() => {
    repo = createTestRepo();
  });
  afterEach(() => repo.cleanup());

  function gate(scenario: Scenario = {}) {
    const client = fakeGitHub((_method, path) => {
      if (path === `repos/${repoName}/pulls/7`) {
        return {
          number: 7,
          node_id: 'PR_node',
          state: 'open',
          draft: false,
          title: 'fix(extension): keep the fee row visible',
          body: 'Closes #12\n\n## Why\n\n- It wrapped.\n',
          html_url: 'https://github.com/leather-io/mono/pull/7',
          user: { login: 'leather-fix-issue[bot]', type: 'Bot' },
          head: { ref: pullRequestBranch, sha: head, repo: { full_name: repoName } },
          base: { ref: 'dev' },
          ...scenario.pull,
        };
      }
      if (path.startsWith(`repos/${repoName}/issues/7/comments`)) return scenario.comments ?? [];
      if (path === `repos/${repoName}/issues/12`) {
        return {
          title: 'Fee row overflows',
          html_url: 'https://github.com/leather-io/mono/issues/12',
          state: 'open',
          body: 'It wraps out of view.',
          created_at: '2026-11-01T10:00:00Z',
          user: { login: 'alice' },
          labels: [],
        };
      }
      if (path.startsWith(`repos/${repoName}/issues/12/comments`)) return [];
      const login = permissionsPath.exec(path)?.[1];
      if (login === undefined) return undefined;
      if (!['alice', 'carol'].includes(login)) throw new GitHubError(404, 'Not a collaborator');
      return { permission: 'write' };
    });
    const result = gateRevise({
      client,
      repo: repoName,
      paths: repo.paths,
      pullRequest: 7,
      devSha: dev,
      baseBranch: 'dev',
      mergeRequested: scenario.merge ?? false,
      instructions: scenario.notes ?? '',
      requestedBy: 'alice',
      workflowAppClientId: scenario.clientId ?? appClientId,
    });
    return { client, result };
  }

  test.each<[string, Record<string, unknown>, string]>([
    ['a closed pull request', { state: 'closed' }, '#7 cannot be revised: it is not open'],
    [
      'a pull request from a fork',
      { head: { ref: pullRequestBranch, sha: 'x', repo: { full_name: 'mallory/mono' } } },
      '#7 cannot be revised: it comes from another repository',
    ],
    [
      'a branch no fix-issue run made',
      { head: { ref: 'feat/fee-row', sha: 'x', repo: { full_name: repoName } } },
      '#7 cannot be revised: feat/fee-row is not a fix-issue branch',
    ],
    [
      'a pull request into another branch',
      { base: { ref: 'main' } },
      '#7 cannot be revised: it does not target dev',
    ],
    [
      'a pull request a person opened',
      { user: { login: 'alice', type: 'User' } },
      '#7 cannot be revised: it was not opened by the fix-issue App',
    ],
  ])('refuses %s', async (_name, pull, reason) => {
    branch(false);
    const { result } = gate({ notes: 'wrap it', pull });
    await expect(result).rejects.toThrow(reason);
    expect(existsSync(repo.paths.reviseFile)).toBe(false);
  });

  test('refuses, and asks GitHub nothing, without the client ID of the App', async () => {
    branch(false);
    const { client, result } = gate({ clientId: '' });
    await expect(result).rejects.toThrow('the client ID of the fix-issue App is not set');
    expect(client.calls).toEqual([]);
  });

  test('gathers the feedback, the issue, the brief and the pull request for a revise', async () => {
    branch(false);
    const { result } = gate({
      notes: ' truncate the label instead\n',
      comments: [briefComment, reviseSummary(1)],
    });
    const state = { head, merge: false, conflicts: [], since: repo.head };
    await expect(result).resolves.toEqual({ ...state, ordinal: 2 });
    expect(repo.git(['rev-parse', 'HEAD'])).toBe(head);
    expect(readReviseState(repo.paths.reviseFile)).toEqual(state);
    const diff = readFileSync(repo.paths.pullRequestDiff, 'utf8');
    expect(diff).toContain('-export const feeRow = 1;\n+export const feeRow = 2;');
    expect(diff).not.toContain('newer readme');
    expect(readFileSync(repo.paths.notesFile, 'utf8')).toBe('- Settled: wrap the label\n');
    expect(readFileSync(repo.paths.issueFile, 'utf8')).toContain('# Fee row overflows');
    expect(readFileSync(repo.paths.pullRequestFile, 'utf8')).toBe(
      [
        '# fix(extension): keep the fee row visible',
        '',
        `https://github.com/leather-io/mono/pull/7 · branch \`${pullRequestBranch}\` at \`${head}\` · ready for review`,
        '',
        '## Description',
        '',
        'Closes #12\n\n## Why\n\n- It wrapped.',
        '',
      ].join('\n')
    );
    expect(readFileSync(repo.paths.feedbackFile, 'utf8')).toBe(
      [
        '# Feedback on pull request #7',
        '',
        'Revise 2 of 5, asked for by @alice. The status file needs one line under `answers` per thing asked for below.',
        '',
        '## What @alice asked for',
        '',
        'truncate the label instead',
        '',
      ].join('\n')
    );
  });

  test('writes an empty brief when none was stored, and ignores one a person posted', async () => {
    branch(false);
    const forged = { ...briefComment, user: { login: 'mallory', type: 'User' } };
    const { result } = gate({ comments: [forged], notes: 'wrap it' });
    await expect(result).resolves.toMatchObject({ ordinal: 1 });
    expect(readFileSync(repo.paths.notesFile, 'utf8')).toBe('\n');
  });

  test('refuses a sixth revise', async () => {
    branch(false);
    const { result } = gate({ notes: 'wrap it', comments: [1, 2, 3, 4, 5].map(reviseSummary) });
    await expect(result).rejects.toThrow('#7 has already been revised 5 times');
  });

  test('does not count revise markers a person posted', async () => {
    branch(false);
    const forged = [1, 2, 3, 4, 5].map(ordinal => ({
      ...reviseSummary(ordinal),
      user: { login: 'mallory', type: 'User' },
    }));
    const { result } = gate({ notes: 'wrap it', comments: forged });
    await expect(result).resolves.toMatchObject({ ordinal: 1 });
  });

  test('refuses when there is nothing to revise', async () => {
    branch(false);
    const { result } = gate();
    await expect(result).rejects.toThrow('there is nothing to revise on #7');
    expect(existsSync(repo.paths.reviseFile)).toBe(false);
  });

  test('only resolves the conflicts when a conflicting pull request gets no notes', async () => {
    branch(true);
    const { result } = gate();
    await expect(result).resolves.toMatchObject({
      merge: true,
      conflicts: [conflictingFile],
      since: dev,
    });
    expect(repo.git(['rev-parse', 'HEAD^1', 'HEAD^2']).split('\n')).toEqual([head, dev]);
    expect(repo.git(['status', '--porcelain'])).toBe('');
    expect(readFileSync(repo.paths.pullRequestDiff, 'utf8')).toContain('+<<<<<<< HEAD');
    const feedback = readFileSync(repo.paths.feedbackFile, 'utf8');
    expect(feedback).toContain(
      `## \`dev\` was merged into the branch and conflicts\n\nThe workflow merged \`dev\` at \`${dev}\` into the pull request branch before you started. These files conflict; resolve every one:\n\n- \`${conflictingFile}\`\n`
    );
    expect(feedback).not.toContain('asked for\n');
  });

  test('merges on its own when the tooling on dev moved, but only for a revise with notes', async () => {
    branch(false);
    repo.write('tools/src/fix-issue/revise.ts', 'newer\n');
    repo.git(['add', '-A']);
    repo.git(['commit', '-q', '-m', 'dev changes the tooling']);
    dev = repo.git(['rev-parse', 'HEAD']);
    const { result } = gate({ notes: 'wrap it' });
    await expect(result).resolves.toMatchObject({ merge: true, conflicts: [] });
    expect(readFileSync(repo.paths.feedbackFile, 'utf8')).toContain(
      '## `dev` was merged into the branch\n\nThe workflow merged'
    );
    await expect(gate().result).rejects.toThrow('there is nothing to revise on #7');
  });

  test('refuses a conflict in a file fix-issue may never change', async () => {
    repo.git(['checkout', '-q', '-b', pullRequestBranch]);
    repo.write('README.md', 'a person edited this on the branch\n');
    repo.git(['commit', '-q', '-a', '-m', 'docs']);
    head = repo.git(['rev-parse', 'HEAD']);
    repo.git(['checkout', '-q', 'dev']);
    repo.write('README.md', 'newer readme\n');
    repo.git(['commit', '-q', '-a', '-m', 'dev moves on']);
    dev = repo.git(['rev-parse', 'HEAD']);
    await expect(gate({ notes: 'wrap it' }).result).rejects.toThrow(
      `dev conflicts with ${pullRequestBranch} in \`README.md\`, which fix-issue may never change`
    );
  });
});
