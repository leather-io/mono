import { describe, expect, test } from 'vitest';

import { fakeGitHub } from '../fix-issue/test/fake-github.js';
import { checkBotPrApprovals } from './check.js';

const repo = 'leather-io/mono';
const number = 345;
const issue = 12;
const headSha = '0123456789abcdef0123456789abcdef01234567';
const botLogin = 'github-actions[bot]';
const pageSize = 100;
const pullPath = `repos/${repo}/pulls/${number}`;
const runsPath = `repos/${repo}/actions/workflows/repo:fix-issues.yml/runs?event=workflow_dispatch&per_page=${pageSize}`;
const reviewsPath = `${pullPath}/reviews?per_page=${pageSize}`;
const filesPath = `${pullPath}/files?per_page=${pageSize}`;
const noRunReason =
  "no workflow_dispatch run of repo:fix-issues.yml titled 'fix-issues: #12' was found; a bot pull request nobody dispatched is blocked";

interface PullOptions {
  readonly author?: string;
  readonly headRef?: string;
}

interface RunOptions {
  readonly id: number;
  readonly actor?: string;
  readonly triggeringActor?: string;
  readonly title?: string;
}

interface ReviewOptions {
  readonly id: number;
  readonly login: string | null;
  readonly state: string;
  readonly commit?: string;
}

interface ChangedFile {
  readonly filename: string;
  readonly previous_filename?: string;
}

interface Fixtures {
  readonly pull?: unknown;
  readonly runs?: readonly unknown[];
  readonly reviews?: readonly unknown[];
  readonly files?: readonly ChangedFile[];
  readonly omit?: readonly string[];
  readonly requiredApprovals?: number;
}

function pullRequest({ author = botLogin, headRef = `bot/fix-${issue}` }: PullOptions = {}) {
  return { user: { login: author }, head: { ref: headRef, sha: headSha }, draft: false };
}

function runUrl(id: number) {
  return `https://github.com/${repo}/actions/runs/${id}`;
}

function workflowRun({
  id,
  actor = 'alice',
  triggeringActor = actor,
  title = `fix-issues: #${issue}`,
}: RunOptions) {
  return {
    id,
    display_title: title,
    html_url: runUrl(id),
    actor: { login: actor },
    triggering_actor: { login: triggeringActor },
  };
}

function review({ id, login, state, commit = headSha }: ReviewOptions) {
  return { id, state, commit_id: commit, user: login === null ? null : { login } };
}

function approvedBy(...logins: readonly string[]) {
  return logins.map((login, index) => review({ id: 10 + index, login, state: 'APPROVED' }));
}

function pages(items: readonly unknown[]): unknown[][] {
  const result: unknown[][] = [];
  for (let start = 0; start <= items.length; start += pageSize) {
    result.push(items.slice(start, start + pageSize));
  }
  return result;
}

function shortfall(have: number, need = 1) {
  return `${have} of ${need} required approvals of ${headSha} from reviewers who did not dispatch #${issue}`;
}

function passMessage(have: number, need = 1) {
  return `${have} of ${need} required approvals from reviewers who did not dispatch #${issue}, and none by a dispatcher`;
}

function notAllowed(login: string, id: number) {
  return `approval by ${login} is not allowed: dispatched ${runUrl(id)}`;
}

async function check({
  pull = pullRequest(),
  runs = [],
  reviews = [],
  files = [{ filename: 'apps/extension/src/fee-row.tsx' }],
  omit = [],
  requiredApprovals = 1,
}: Fixtures = {}) {
  const responses = new Map<string, unknown>([[pullPath, pull]]);
  pages(runs).forEach((page, index) =>
    responses.set(`${runsPath}&page=${index + 1}`, { workflow_runs: page })
  );
  pages(reviews).forEach((page, index) => responses.set(`${reviewsPath}&page=${index + 1}`, page));
  pages(files).forEach((page, index) => responses.set(`${filesPath}&page=${index + 1}`, page));
  omit.forEach(path => responses.delete(path));
  const client = fakeGitHub((method, path) => (method === 'GET' ? responses.get(path) : undefined));
  const verdict = await checkBotPrApprovals({ client, repo, number, requiredApprovals }).catch(
    (error: unknown) => (error instanceof Error ? error : new Error(String(error)))
  );
  return {
    verdict,
    summary: verdict instanceof Error ? [] : verdict.summary,
    calls: client.calls.map(call => call.path),
  };
}

const dispatchedByAlice = [workflowRun({ id: 1 })];

describe('a pull request that is not a fix-issues bot pull request', () => {
  test('passes a pull request opened by a person after reading only the pull request', async () => {
    const line =
      '#345 by edgar-stacks from fix/fees is not a fix-issues bot pull request; nothing to check.';
    const { verdict, calls } = await check({
      pull: pullRequest({ author: 'edgar-stacks', headRef: 'fix/fees' }),
    });
    expect(verdict).toEqual({
      passed: true,
      messages: [line],
      summary: ['## bot-pr-approvals', '', line],
    });
    expect(calls).toEqual([pullPath]);
  });

  test('passes a person on a bot/fix branch', async () => {
    const { verdict, calls } = await check({ pull: pullRequest({ author: 'edgar-stacks' }) });
    expect(verdict).toMatchObject({ passed: true });
    expect(calls).toEqual([pullPath]);
  });

  test.each(['bot/audit-fix', 'bot/feature-map-fix'])(
    'passes the scheduled bot branch %s without looking for a dispatcher',
    async headRef => {
      const { verdict, calls } = await check({ pull: pullRequest({ headRef }) });
      expect(verdict).toMatchObject({
        passed: true,
        messages: [
          `#345 by ${botLogin} from ${headRef} is not a fix-issues bot pull request; nothing to check.`,
        ],
      });
      expect(calls).toEqual([pullPath]);
    }
  );
});

describe('a fix-issues pull request nobody dispatched', () => {
  test('fails without reading the reviews', async () => {
    const { verdict, summary, calls } = await check({
      runs: [
        workflowRun({ id: 1, title: 'fix-issues: #120' }),
        workflowRun({ id: 2, title: 'repo:fix-issues' }),
      ],
      reviews: approvedBy('alice'),
    });
    expect(verdict).toMatchObject({ passed: false, messages: [noRunReason] });
    expect(summary).toContain('None found.');
    expect(summary).toContain(`❌ ${noRunReason}`);
    expect(calls).toEqual([pullPath, `${runsPath}&page=1`]);
  });

  test('fails the same way when there are no runs at all', async () => {
    const { verdict } = await check();
    expect(verdict).toMatchObject({ passed: false, messages: [noRunReason] });
  });
});

describe('an approval by the dispatcher', () => {
  test('fails naming the approver and the run', async () => {
    const { verdict, calls } = await check({
      runs: dispatchedByAlice,
      reviews: approvedBy('alice'),
    });
    expect(verdict).toEqual({
      passed: false,
      messages: [notAllowed('alice', 1), shortfall(0)],
      summary: [
        '## bot-pr-approvals',
        '',
        `Fix-issues pull request #345 for issue #12 (\`bot/fix-12\` at \`${headSha}\`, draft: false).`,
        '',
        '### Dispatched by',
        '',
        `- \`alice\`: ${runUrl(1)}`,
        '',
        '### Current approvers',
        '',
        '- `alice`',
        '',
        '### Verdict',
        '',
        `❌ ${notAllowed('alice', 1)}`,
        `❌ ${shortfall(0)}`,
      ],
    });
    expect(calls).toEqual([
      pullPath,
      `${runsPath}&page=1`,
      `${reviewsPath}&page=1`,
      `${filesPath}&page=1`,
    ]);
  });

  test('names every run the approver dispatched', async () => {
    const { verdict } = await check({
      runs: [workflowRun({ id: 1 }), workflowRun({ id: 3 })],
      reviews: approvedBy('alice'),
    });
    expect(verdict).toMatchObject({
      messages: [notAllowed('alice', 1), notAllowed('alice', 3), shortfall(0)],
    });
  });

  test('matches logins regardless of case', async () => {
    const { verdict } = await check({
      runs: [workflowRun({ id: 1, actor: 'Alice' })],
      reviews: approvedBy('alice'),
    });
    expect(verdict).toMatchObject({ messages: [notAllowed('Alice', 1), shortfall(0)] });
  });

  test('keeps the approval when a comment follows it', async () => {
    const { verdict } = await check({
      runs: dispatchedByAlice,
      reviews: [
        review({ id: 1, login: 'alice', state: 'APPROVED' }),
        review({ id: 2, login: 'alice', state: 'COMMENTED' }),
      ],
    });
    expect(verdict).toMatchObject({ passed: false });
  });

  test('counts the actor of a re-run as a dispatcher', async () => {
    const { verdict, summary } = await check({
      runs: [workflowRun({ id: 7, actor: 'bob', triggeringActor: 'alice' })],
      reviews: approvedBy('alice'),
    });
    expect(verdict).toMatchObject({ messages: [notAllowed('alice', 7), shortfall(0)] });
    expect(summary).toContain(`- \`alice\`: ${runUrl(7)}`);
    expect(summary).toContain(`- \`bob\`: ${runUrl(7)}`);
  });
});

describe('an approval by the dispatcher that no longer stands', () => {
  test('passes once someone else approves after a dismissal', async () => {
    const { verdict } = await check({
      runs: dispatchedByAlice,
      reviews: [
        review({ id: 1, login: 'alice', state: 'DISMISSED' }),
        review({ id: 2, login: 'carol', state: 'APPROVED' }),
      ],
    });
    expect(verdict).toMatchObject({ passed: true, messages: [passMessage(1)] });
  });

  test('fails with no approval left', async () => {
    const { verdict, summary } = await check({
      runs: dispatchedByAlice,
      reviews: [review({ id: 1, login: 'alice', state: 'DISMISSED' })],
    });
    expect(verdict).toMatchObject({ passed: false, messages: [shortfall(0)] });
    expect(summary).toContain('None.');
  });

  test('passes when the dispatcher requested changes after approving', async () => {
    const { verdict } = await check({
      runs: dispatchedByAlice,
      reviews: [
        review({ id: 1, login: 'alice', state: 'APPROVED' }),
        review({ id: 2, login: 'alice', state: 'CHANGES_REQUESTED' }),
        review({ id: 3, login: 'carol', state: 'APPROVED' }),
      ],
    });
    expect(verdict).toMatchObject({ passed: true });
  });
});

describe('an approval by someone else', () => {
  test('passes and lists the approver', async () => {
    const { verdict, summary } = await check({
      runs: dispatchedByAlice,
      reviews: [
        review({ id: 1, login: 'carol', state: 'APPROVED' }),
        review({ id: 2, login: 'alice', state: 'COMMENTED' }),
      ],
    });
    expect(verdict).toMatchObject({ passed: true, messages: [passMessage(1)] });
    expect(summary).toContain('- `carol`');
    expect(summary).toContain(`✅ ${passMessage(1)}.`);
  });

  test('ignores a review whose user no longer exists', async () => {
    const { verdict } = await check({
      runs: dispatchedByAlice,
      reviews: [review({ id: 1, login: null, state: 'APPROVED' })],
    });
    expect(verdict).toMatchObject({ passed: false, messages: [shortfall(0)] });
  });
});

describe('runs and reviews spanning two pages', () => {
  test('finds the run and the approval on the second page and stops at the first short page', async () => {
    const otherRuns = Array.from({ length: pageSize }, (_, index) =>
      workflowRun({ id: 1000 + index, title: `fix-issues: #${500 + index}`, actor: 'dave' })
    );
    const otherReviews = Array.from({ length: pageSize }, (_, index) =>
      review({ id: 100 + index, login: `reviewer-${index}`, state: 'COMMENTED' })
    );
    const { verdict, calls } = await check({
      runs: [...otherRuns, workflowRun({ id: 2 })],
      reviews: [...otherReviews, review({ id: 300, login: 'alice', state: 'APPROVED' })],
    });
    expect(verdict).toMatchObject({ messages: [notAllowed('alice', 2), shortfall(0)] });
    expect(calls).toEqual([
      pullPath,
      `${runsPath}&page=1`,
      `${runsPath}&page=2`,
      `${reviewsPath}&page=1`,
      `${reviewsPath}&page=2`,
      `${filesPath}&page=1`,
    ]);
  });
});

describe('when GitHub cannot be read', () => {
  const fixtures = { runs: dispatchedByAlice, reviews: approvedBy('carol') };

  test.each([
    ['the pull request', pullPath],
    ['the runs', `${runsPath}&page=1`],
    ['the reviews', `${reviewsPath}&page=1`],
    ['the changed files', `${filesPath}&page=1`],
  ])('fails closed when %s cannot be read', async (_, path) => {
    const { verdict, calls } = await check({ ...fixtures, omit: [path] });
    expect(verdict).toBeInstanceOf(Error);
    expect(calls.at(-1)).toBe(path);
  });
});

describe('the required number of independent approvals', () => {
  test('fails with one of two', async () => {
    const { verdict } = await check({
      runs: dispatchedByAlice,
      reviews: approvedBy('carol'),
      requiredApprovals: 2,
    });
    expect(verdict).toMatchObject({ passed: false, messages: [shortfall(1, 2)] });
  });

  test('passes with two of two', async () => {
    const { verdict } = await check({
      runs: dispatchedByAlice,
      reviews: approvedBy('carol', 'dave'),
      requiredApprovals: 2,
    });
    expect(verdict).toMatchObject({ passed: true, messages: [passMessage(2, 2)] });
  });

  test('never counts the dispatcher, even as the approval that reaches the count', async () => {
    const { verdict } = await check({
      runs: dispatchedByAlice,
      reviews: approvedBy('carol', 'alice'),
      requiredApprovals: 2,
    });
    expect(verdict).toMatchObject({
      passed: false,
      messages: [notAllowed('alice', 1), shortfall(1, 2)],
    });
  });

  test('still fails when two others approved and the dispatcher approves too', async () => {
    const { verdict } = await check({
      runs: dispatchedByAlice,
      reviews: approvedBy('carol', 'dave', 'alice'),
      requiredApprovals: 2,
    });
    expect(verdict).toMatchObject({ passed: false, messages: [notAllowed('alice', 1)] });
  });

  test('does not count an approval of an older commit', async () => {
    const { verdict } = await check({
      runs: dispatchedByAlice,
      reviews: [
        review({ id: 1, login: 'carol', state: 'APPROVED', commit: 'f'.repeat(40) }),
        review({ id: 2, login: 'dave', state: 'APPROVED' }),
      ],
      requiredApprovals: 2,
    });
    expect(verdict).toMatchObject({ passed: false, messages: [shortfall(1, 2)] });
  });

  test('does not count a reviewer whose later review requested changes', async () => {
    const { verdict } = await check({
      runs: dispatchedByAlice,
      reviews: [
        review({ id: 1, login: 'carol', state: 'APPROVED' }),
        review({ id: 2, login: 'carol', state: 'CHANGES_REQUESTED' }),
      ],
    });
    expect(verdict).toMatchObject({ passed: false, messages: [shortfall(0)] });
  });
});

describe('a fix-issues pull request that changes .github/', () => {
  const approved = {
    runs: dispatchedByAlice,
    reviews: approvedBy('carol', 'dave'),
    requiredApprovals: 2,
  };

  test('fails even with enough independent approvals', async () => {
    const { verdict } = await check({
      ...approved,
      files: [
        { filename: 'apps/extension/src/fee-row.tsx' },
        { filename: '.github/workflows/repo:bot-pr-approvals.yml' },
      ],
    });
    expect(verdict).toMatchObject({
      passed: false,
      messages: [
        '.github/workflows/repo:bot-pr-approvals.yml is changed; a fix-issues pull request may never change .github/',
      ],
    });
  });

  test('catches a file renamed out of .github/', async () => {
    const { verdict } = await check({
      ...approved,
      files: [{ filename: 'apps/x.yml', previous_filename: '.github/workflows/repo:x.yml' }],
    });
    expect(verdict).toMatchObject({
      passed: false,
      messages: [
        '.github/workflows/repo:x.yml is changed; a fix-issues pull request may never change .github/',
      ],
    });
  });
});
