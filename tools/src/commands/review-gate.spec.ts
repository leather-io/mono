import { Command } from 'commander';
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { z } from 'zod';

import { registerReviewGateCommands } from './review-gate.js';

const apiUrl = 'https://api.github.com';
const repoName = 'leather-io/mono';
const runUrl = 'https://github.com/leather-io/mono/actions/runs/1';
const headSha = 'head-sha';
const author = 'author';
const reviewer = 'reviewer';
const headRef = 'fix/footer-copy';
const fixIssueBot = 'leather-fix-issue[bot]';
const fixIssueRunId = '987';
const dispatcher = 'dispatcher';
const reviewersTeamId = 19686212;

interface FakePullRequest {
  readonly number: number;
  readonly state: string;
  readonly user: { readonly login: string; readonly type: string };
  readonly head: { readonly sha: string; readonly ref: string };
  readonly base: { readonly ref: string };
}

interface FakeReview {
  readonly user: { readonly login: string; readonly type: string } | null;
  readonly state: string;
  readonly commit_id: string | null;
  readonly teams: readonly number[];
}

interface FakeStatus {
  readonly context: string;
  readonly state: string;
  readonly description: string;
  readonly target_url: string;
}

interface FakeCommitPullRequest {
  readonly number: number;
  readonly state: string;
  readonly head: { readonly sha: string };
}

interface ApiCall {
  readonly method: string;
  readonly path: string;
}

type Override = (method: string, path: string) => Response | undefined;

interface FakeGitHub {
  readonly pullRequests: Map<number, FakePullRequest>;
  readonly reviews: Map<number, FakeReview[]>;
  readonly statuses: Map<string, FakeStatus[]>;
  readonly commitPullRequests: Map<string, FakeCommitPullRequest[]>;
  readonly workflowRuns: Map<string, unknown>;
  readonly calls: ApiCall[];
  override: Override;
}

const newStatusSchema = z.object({
  state: z.string(),
  context: z.string(),
  description: z.string(),
  target_url: z.string(),
});

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status });
}

function pullRequest(number: number, overrides: Partial<FakePullRequest> = {}): FakePullRequest {
  return {
    number,
    state: 'open',
    user: { login: author, type: 'User' },
    head: { sha: headSha, ref: headRef },
    base: { ref: 'dev' },
    ...overrides,
  };
}

function fixIssuePullRequest(number: number): FakePullRequest {
  return pullRequest(number, {
    user: { login: fixIssueBot, type: 'Bot' },
    head: { sha: headSha, ref: `bot/fix-issue-12-${fixIssueRunId}` },
  });
}

function fixIssueRun(dispatcher: string) {
  return {
    path: '.github/workflows/repo:fix-issue.yml',
    event: 'workflow_dispatch',
    display_title: 'fix-issue: #12',
    actor: { login: dispatcher },
    triggering_actor: { login: dispatcher },
  };
}

function approval(login: string, overrides: Partial<FakeReview> = {}): FakeReview {
  return {
    user: { login, type: 'User' },
    state: 'APPROVED',
    commit_id: headSha,
    teams: [reviewersTeamId],
    ...overrides,
  };
}

function gateStatus(context: string, state: string, description: string): FakeStatus {
  return { context, state, description, target_url: runUrl };
}

function readBody(init: RequestInit | undefined): unknown {
  return typeof init?.body === 'string' ? JSON.parse(init.body) : undefined;
}

interface RouteRequest {
  readonly url: URL;
  readonly body: unknown;
}

interface FakeRoute {
  readonly method: string;
  readonly pattern: RegExp;
  handle(github: FakeGitHub, param: string, request: RouteRequest): Response;
}

function notFound(): Response {
  return json({ message: 'Not Found' }, 404);
}

function list(url: URL, items: readonly unknown[]): Response {
  return json(Number(url.searchParams.get('page') ?? '1') > 1 ? [] : items);
}

const routes: readonly FakeRoute[] = [
  {
    method: 'GET',
    pattern: /^\/pulls\/(\d+)$/,
    handle(github, number) {
      const found = github.pullRequests.get(Number(number));
      return found ? json(found) : notFound();
    },
  },
  {
    method: 'GET',
    pattern: /^\/commits\/([^/]+)\/pulls$/,
    handle(github, sha, { url }) {
      return list(url, github.commitPullRequests.get(sha) ?? []);
    },
  },
  {
    method: 'POST',
    pattern: /^\/statuses\/([^/]+)$/,
    handle(github, sha, { body }) {
      github.statuses.set(sha, [newStatusSchema.parse(body), ...(github.statuses.get(sha) ?? [])]);
      return json({});
    },
  },
  {
    method: 'GET',
    pattern: /^\/actions\/runs\/(\d+)$/,
    handle(github, id) {
      const found = github.workflowRuns.get(id);
      return found ? json(found) : notFound();
    },
  },
];

function reviews(github: FakeGitHub): Response {
  const nodes = [...github.reviews.values()].flat().map(review => ({
    state: review.state,
    author: review.user && { login: review.user.login, __typename: review.user.type },
    commit: review.commit_id === null ? null : { oid: review.commit_id },
    onBehalfOf: { nodes: review.teams.map(team => ({ databaseId: team })) },
  }));
  return json({
    data: {
      repository: {
        pullRequest: { reviews: { nodes, pageInfo: { hasNextPage: false, endCursor: null } } },
      },
    },
  });
}

function route(github: FakeGitHub, method: string, url: URL, init?: RequestInit): Response {
  if (method === 'POST' && url.pathname === '/graphql') return reviews(github);
  const prefix = `/repos/${repoName}`;
  const repoPath = url.pathname.startsWith(prefix) ? url.pathname.slice(prefix.length) : '';
  for (const fakeRoute of routes) {
    if (fakeRoute.method !== method) continue;
    const param = fakeRoute.pattern.exec(repoPath)?.[1];
    if (param !== undefined) return fakeRoute.handle(github, param, { url, body: readBody(init) });
  }
  return json({ message: `fake GitHub has no route for ${method} ${url.pathname}` }, 404);
}

function stubGitHub(): FakeGitHub {
  const github: FakeGitHub = {
    pullRequests: new Map(),
    reviews: new Map(),
    statuses: new Map(),
    commitPullRequests: new Map(),
    workflowRuns: new Map(),
    calls: [],
    override: () => undefined,
  };
  vi.stubGlobal('fetch', (input: string, init?: RequestInit) => {
    const method = init?.method ?? 'GET';
    const url = new URL(input);
    const repoPath = url.pathname.replace(`/repos/${repoName}`, '');
    github.calls.push({ method, path: repoPath });
    return Promise.resolve(github.override(method, repoPath) ?? route(github, method, url, init));
  });
  return github;
}

function program() {
  const root = new Command().exitOverride();
  registerReviewGateCommands(root);
  return root;
}

function run(args: readonly string[]) {
  return program().parseAsync(['review-gate', ...args], { from: 'user' });
}

describe('review-gate commands', () => {
  let scratch: string;
  let summaryFile: string;
  let logs: string[];
  let github: FakeGitHub;

  beforeEach(() => {
    scratch = mkdtempSync(path.join(tmpdir(), 'review-gate-cli-'));
    summaryFile = path.join(scratch, 'summary.md');
    logs = [];
    vi.spyOn(console, 'log').mockImplementation((line: string) => logs.push(line));
    vi.stubEnv('GITHUB_API_URL', apiUrl);
    vi.stubEnv('GITHUB_TOKEN', 'ghs_gate_token');
    vi.stubEnv('GITHUB_REPOSITORY', repoName);
    vi.stubEnv('GITHUB_STEP_SUMMARY', summaryFile);
    vi.stubEnv('RUN_URL', runUrl);
    github = stubGitHub();
  });

  afterEach(() => {
    rmSync(scratch, { recursive: true, force: true });
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  function latestStatus(sha: string, context: string): FakeStatus | undefined {
    return github.statuses.get(sha)?.find(status => status.context === context);
  }

  function summary(): string {
    return readFileSync(summaryFile, 'utf8');
  }

  test('registers the check and app token steps', () => {
    const gate = program().commands.find(command => command.name() === 'review-gate');
    expect(gate?.commands.map(command => command.name())).toEqual(['check', 'app-token']);
    const appToken = gate?.commands.find(command => command.name() === 'app-token');
    expect(appToken?.commands.map(command => command.name())).toEqual(['create', 'revoke']);
  });

  describe('check', () => {
    test('refuses a pull request number that is not a positive integer', async () => {
      await expect(run(['check', '--pr', 'seven'])).rejects.toThrow(
        'seven is not a pull request number.'
      );
      await expect(run(['check', '--pr', '0'])).rejects.toThrow('0 is not a pull request number.');
      expect(github.calls).toEqual([]);
    });

    test('skips a closed pull request and one that does not target dev', async () => {
      github.pullRequests.set(7, pullRequest(7, { state: 'closed' }));
      github.pullRequests.set(8, pullRequest(8, { base: { ref: 'main' } }));

      await run(['check', '--pr', '7']);
      await run(['check', '--pr', '8']);

      expect(github.statuses.size).toBe(0);
      expect(summary()).toContain('#7: skipped, it is closed and targets dev.');
      expect(summary()).toContain('#8: skipped, it is open and targets main.');
    });

    test('counts only the latest approvals of reviewers on the head who are not the author', async () => {
      github.pullRequests.set(7, pullRequest(7));
      github.reviews.set(7, [
        approval(author),
        approval('stale', { commit_id: 'old-sha' }),
        approval('helper-bot[bot]', { user: { login: 'helper-bot[bot]', type: 'Bot' } }),
        approval('reader', { teams: [] }),
        approval('changed-mind'),
        approval('changed-mind', { state: 'CHANGES_REQUESTED' }),
        approval(reviewer),
        approval(reviewer, { state: 'COMMENTED' }),
      ]);

      await run(['check', '--pr', '7']);
      expect(latestStatus(headSha, 'review-gate')).toEqual(
        gateStatus('review-gate', 'failure', '1 of 2 required approvals')
      );

      github.reviews.set(7, [...(github.reviews.get(7) ?? []), approval('second-writer')]);
      await run(['check', '--pr', '7']);
      expect(latestStatus(headSha, 'review-gate')).toEqual(
        gateStatus('review-gate', 'success', '2 of 2 required approvals')
      );
    });

    test('fails while another open pull request shares the head commit', async () => {
      github.pullRequests.set(7, pullRequest(7));
      github.reviews.set(7, [approval(reviewer)]);
      github.commitPullRequests.set(headSha, [
        { number: 7, state: 'open', head: { sha: headSha } },
        { number: 9, state: 'open', head: { sha: headSha } },
        { number: 10, state: 'closed', head: { sha: headSha } },
      ]);

      await run(['check', '--pr', '7']);

      expect(latestStatus(headSha, 'review-gate')).toEqual(
        gateStatus(
          'review-gate',
          'failure',
          'Head commit is also the head of #9. Push a commit unique to this pull request.'
        )
      );
    });

    describe('a fix-issue bot pull request', () => {
      beforeEach(() => {
        github.pullRequests.set(7, fixIssuePullRequest(7));
        github.workflowRuns.set(fixIssueRunId, fixIssueRun(dispatcher));
      });

      test('never counts the approval of whoever dispatched the fix', async () => {
        github.reviews.set(7, [approval(dispatcher)]);

        await run(['check', '--pr', '7']);

        expect(latestStatus(headSha, 'review-gate')).toEqual(
          gateStatus(
            'review-gate',
            'failure',
            '0 of 2 required approvals; dispatcher dispatched the fix, so cannot approve it'
          )
        );
        expect(summary()).toContain('Dispatched by dispatcher.');
      });

      test('passes on the approvals of two other people', async () => {
        github.reviews.set(7, [
          approval(dispatcher),
          approval(reviewer),
          approval('second-writer'),
        ]);

        await run(['check', '--pr', '7']);

        expect(latestStatus(headSha, 'review-gate')?.state).toBe('success');
      });

      test('fails when its branch names no fix-issue run a person dispatched', async () => {
        github.workflowRuns.delete(fixIssueRunId);
        github.reviews.set(7, [approval(reviewer)]);

        await run(['check', '--pr', '7']);

        expect(latestStatus(headSha, 'review-gate')).toEqual(
          gateStatus(
            'review-gate',
            'failure',
            'No fix-issue run dispatched by a person was found for this bot pull request.'
          )
        );
      });
    });

    test('counts only approvals GitHub credits to the reviewers team', async () => {
      github.pullRequests.set(7, pullRequest(7));
      github.reviews.set(7, [
        approval(reviewer),
        approval('writer-outside-team', { teams: [] }),
        approval('other-team-member', { teams: [reviewersTeamId + 1] }),
      ]);

      await run(['check', '--pr', '7']);

      expect(latestStatus(headSha, 'review-gate')).toEqual(
        gateStatus('review-gate', 'failure', '1 of 2 required approvals')
      );
    });

    test('reports an error status and fails when GitHub refuses a read', async () => {
      github.pullRequests.set(7, pullRequest(7));
      github.override = (method, requestPath) =>
        method === 'POST' && requestPath === '/graphql'
          ? json({ message: 'Server Error' }, 500)
          : undefined;

      await expect(run(['check', '--pr', '7'])).rejects.toThrow(/failed with 500/);

      expect(latestStatus(headSha, 'review-gate')).toEqual(
        gateStatus(
          'review-gate',
          'error',
          'Could not count approvals. Re-run repo:review-gate to retry.'
        )
      );
    });
  });

  describe('app-token', () => {
    const signature = Buffer.from('signature').toString('base64');
    let outputFile: string;

    function fakeAws(script: string) {
      const bin = mkdtempSync(path.join(scratch, 'bin-'));
      writeFileSync(path.join(bin, 'aws'), `#!/usr/bin/env node\n${script}\n`);
      chmodSync(path.join(bin, 'aws'), 0o755);
      vi.stubEnv('PATH', `${bin}${path.delimiter}${process.env.PATH ?? ''}`);
    }

    function routeInstallation(granted: Record<string, string>) {
      github.override = (method, requestPath) => {
        if (method === 'GET' && requestPath === '/installation') return json({ id: 42 });
        if (method === 'POST' && requestPath === '/app/installations/42/access_tokens') {
          return json({ token: 'ghs_gate_installation', permissions: granted });
        }
        if (method === 'DELETE' && requestPath === '/installation/token') {
          return new Response(null, { status: 204 });
        }
        return undefined;
      };
    }

    beforeEach(() => {
      outputFile = path.join(scratch, 'github-output');
      vi.stubEnv('GITHUB_OUTPUT', outputFile);
    });

    test('create signs with KMS and asks only for the gate permissions', async () => {
      fakeAws(`process.stdout.write('${signature}')`);
      routeInstallation({
        actions: 'read',
        members: 'read',
        pull_requests: 'read',
        statuses: 'write',
        metadata: 'read',
      });
      const bodies: unknown[] = [];
      vi.stubGlobal('fetch', (input: string, init?: RequestInit) => {
        const url = new URL(input);
        const requestPath = url.pathname.replace(`/repos/${repoName}`, '');
        github.calls.push({ method: init?.method ?? 'GET', path: requestPath });
        if (typeof init?.body === 'string') bodies.push(JSON.parse(init.body));
        return Promise.resolve(
          github.override(init?.method ?? 'GET', requestPath) ?? json({}, 404)
        );
      });

      await run(['app-token', 'create', '--client-id', 'Iv23gate', '--kms-key-id', 'alias/gate']);

      expect(bodies).toEqual([
        {
          repositories: ['mono'],
          permissions: {
            actions: 'read',
            members: 'read',
            pull_requests: 'read',
            statuses: 'write',
          },
        },
      ]);
      expect(logs).toContain('::add-mask::ghs_gate_installation');
      expect(readFileSync(outputFile, 'utf8')).toBe('token=ghs_gate_installation\n');
    });

    test('create revokes and refuses a token with more permissions than the gate asked for', async () => {
      fakeAws(`process.stdout.write('${signature}')`);
      routeInstallation({ pull_requests: 'write', contents: 'write', statuses: 'write' });

      await expect(
        run(['app-token', 'create', '--client-id', 'Iv23gate', '--kms-key-id', 'alias/gate'])
      ).rejects.toThrow('permissions it was not asked for: contents; it was revoked');

      expect(github.calls).toContainEqual({ method: 'DELETE', path: '/installation/token' });
    });

    test('create fails before calling GitHub when KMS refuses to sign', async () => {
      fakeAws("process.stderr.write('AccessDenied'); process.exit(254)");

      await expect(
        run(['app-token', 'create', '--client-id', 'Iv23gate', '--kms-key-id', 'alias/gate'])
      ).rejects.toThrow('aws kms sign failed: AccessDenied');

      expect(github.calls).toEqual([]);
    });

    test('revoke deletes the token the job holds', async () => {
      routeInstallation({});

      await run(['app-token', 'revoke']);

      expect(github.calls).toEqual([{ method: 'DELETE', path: '/installation/token' }]);
      expect(logs).toContain('app-token: revoked the installation token');
    });
  });
});
