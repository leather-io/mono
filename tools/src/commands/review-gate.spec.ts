import { Command } from 'commander';
import {
  chmodSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { z } from 'zod';

import { registerReviewGateCommands } from './review-gate.js';

const apiUrl = 'https://api.github.com';
const repoName = 'leather-io/mono';
const runUrl = 'https://github.com/leather-io/mono/actions/runs/1';
const gateBot = 'review-gate-app[bot]';
const headSha = 'head-sha';
const baseSha = 'base-sha';
const author = 'author';
const reviewer = 'reviewer';
const sensitiveFile = 'packages/crypto/src/derive.ts';
const plainFile = 'apps/web/app/components/footer.tsx';

interface FakeFile {
  readonly filename: string;
  readonly status: string;
  readonly additions: number;
  readonly deletions: number;
  readonly patch?: string;
  readonly previous_filename?: string;
  readonly sha?: string;
}

interface FakePullRequest {
  readonly number: number;
  readonly state: string;
  readonly title: string;
  readonly body: string | null;
  readonly user: { readonly login: string };
  readonly head: { readonly sha: string; readonly repo: { readonly full_name: string } | null };
  readonly base: { readonly sha: string; readonly ref: string };
}

interface FakeReview {
  readonly user: { readonly login: string; readonly type: string } | null;
  readonly state: string;
  readonly commit_id: string | null;
}

interface FakeStatus {
  readonly context: string;
  readonly state: string;
  readonly description: string | null;
  readonly creator: { readonly login: string } | null;
}

interface FakeComment {
  readonly id: number;
  readonly user: { readonly login: string } | null;
  body: string;
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
  readonly files: Map<number, FakeFile[]>;
  readonly reviews: Map<number, FakeReview[]>;
  readonly statuses: Map<string, FakeStatus[]>;
  readonly comments: Map<number, FakeComment[]>;
  readonly commitPullRequests: Map<string, FakeCommitPullRequest[]>;
  readonly permissions: Map<string, string>;
  readonly baseBlobs: Map<string, string>;
  readonly calls: ApiCall[];
  readonly targetUrls: string[];
  override: Override;
}

const newStatusSchema = z.object({
  state: z.string(),
  context: z.string(),
  description: z.string(),
  target_url: z.string(),
});
const commentBodySchema = z.object({ body: z.string() });

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status });
}

function pullRequest(number: number, overrides: Partial<FakePullRequest> = {}): FakePullRequest {
  return {
    number,
    state: 'open',
    title: 'Tweak the footer copy',
    body: 'Shorter footer text.',
    user: { login: author },
    head: { sha: headSha, repo: { full_name: repoName } },
    base: { sha: baseSha, ref: 'dev' },
    ...overrides,
  };
}

function forkPullRequest(number: number, sha: string): FakePullRequest {
  return pullRequest(number, { head: { sha, repo: { full_name: 'someone/mono' } } });
}

function changedFile(filename: string, overrides: Partial<FakeFile> = {}): FakeFile {
  return {
    filename,
    status: 'modified',
    additions: 1,
    deletions: 1,
    patch: '@@ -1 +1 @@\n-old\n+new',
    ...overrides,
  };
}

function approval(login: string, overrides: Partial<FakeReview> = {}): FakeReview {
  return { user: { login, type: 'User' }, state: 'APPROVED', commit_id: headSha, ...overrides };
}

function gateStatus(context: string, state: string, description: string): FakeStatus {
  return { context, state, description, creator: { login: gateBot } };
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
    pattern: /^\/(pulls)$/,
    handle(github, _param, { url }) {
      const base = url.searchParams.get('base');
      return list(
        url,
        [...github.pullRequests.values()].filter(
          item => item.state === 'open' && item.base.ref === base
        )
      );
    },
  },
  {
    method: 'GET',
    pattern: /^\/pulls\/(\d+)\/files$/,
    handle(github, number, { url }) {
      return list(url, github.files.get(Number(number)) ?? []);
    },
  },
  {
    method: 'GET',
    pattern: /^\/pulls\/(\d+)\/reviews$/,
    handle(github, number, { url }) {
      return list(url, github.reviews.get(Number(number)) ?? []);
    },
  },
  {
    method: 'GET',
    pattern: /^\/commits\/([^/]+)\/statuses$/,
    handle(github, sha, { url }) {
      return list(url, github.statuses.get(sha) ?? []);
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
      const { context, state, description, target_url } = newStatusSchema.parse(body);
      github.targetUrls.push(target_url);
      github.statuses.set(sha, [
        { context, state, description, creator: { login: gateBot } },
        ...(github.statuses.get(sha) ?? []),
      ]);
      return json({});
    },
  },
  {
    method: 'GET',
    pattern: /^\/issues\/(\d+)\/comments$/,
    handle(github, number, { url }) {
      return list(url, github.comments.get(Number(number)) ?? []);
    },
  },
  {
    method: 'POST',
    pattern: /^\/issues\/(\d+)\/comments$/,
    handle(github, number, { body }) {
      const existing = github.comments.get(Number(number)) ?? [];
      const comment = commentBodySchema.parse(body);
      github.comments.set(Number(number), [
        ...existing,
        { id: 1000 + existing.length, user: { login: gateBot }, body: comment.body },
      ]);
      return json({});
    },
  },
  {
    method: 'PATCH',
    pattern: /^\/issues\/comments\/(\d+)$/,
    handle(github, id, { body }) {
      const comment = [...github.comments.values()].flat().find(item => item.id === Number(id));
      if (!comment) return notFound();
      comment.body = commentBodySchema.parse(body).body;
      return json({});
    },
  },
  {
    method: 'GET',
    pattern: /^\/collaborators\/([^/]+)\/permission$/,
    handle(github, login) {
      return json({ permission: github.permissions.get(decodeURIComponent(login)) ?? 'read' });
    },
  },
  {
    method: 'GET',
    pattern: /^\/git\/trees\/([^/]+)$/,
    handle(github, sha) {
      if (sha !== baseSha) return notFound();
      return json({
        truncated: false,
        tree: [...github.baseBlobs].map(([blobPath, blobSha]) => ({
          path: blobPath,
          type: 'blob',
          sha: blobSha,
        })),
      });
    },
  },
];

function route(github: FakeGitHub, method: string, url: URL, init?: RequestInit): Response {
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
    files: new Map(),
    reviews: new Map(),
    statuses: new Map(),
    comments: new Map(),
    commitPullRequests: new Map(),
    permissions: new Map([[reviewer, 'write']]),
    baseBlobs: new Map(),
    calls: [],
    targetUrls: [],
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

const fakeClaudeScript = `#!/usr/bin/env node
const fs = require('node:fs');
let prompt = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { prompt += chunk; });
process.stdin.on('end', () => {
  fs.writeFileSync(process.env.FAKE_CLAUDE_LOG, JSON.stringify({ args: process.argv.slice(2), prompt, cwd: process.cwd() }));
  process.stdout.write(process.env.FAKE_CLAUDE_OUTPUT ?? '');
  process.exit(Number(process.env.FAKE_CLAUDE_EXIT ?? '0'));
});
`;

const claudeCallSchema = z.object({
  args: z.array(z.string()),
  prompt: z.string(),
  cwd: z.string(),
});

function claudeAnswers(answer: unknown) {
  vi.stubEnv('FAKE_CLAUDE_OUTPUT', JSON.stringify({ is_error: false, structured_output: answer }));
}

describe('review-gate commands', () => {
  let scratch: string;
  let claudeLog: string;
  let summaryFile: string;
  let logs: string[];
  let github: FakeGitHub;

  beforeEach(() => {
    scratch = mkdtempSync(path.join(tmpdir(), 'review-gate-cli-'));
    claudeLog = path.join(scratch, 'claude-call.json');
    summaryFile = path.join(scratch, 'summary.md');
    const claudeBin = path.join(scratch, 'claude');
    writeFileSync(claudeBin, fakeClaudeScript);
    chmodSync(claudeBin, 0o755);
    logs = [];
    vi.spyOn(console, 'log').mockImplementation((line: string) => logs.push(line));
    vi.stubEnv('GITHUB_API_URL', apiUrl);
    vi.stubEnv('GITHUB_TOKEN', 'ghs_gate_token');
    vi.stubEnv('GITHUB_REPOSITORY', repoName);
    vi.stubEnv('GITHUB_STEP_SUMMARY', summaryFile);
    vi.stubEnv('GATE_APP_SLUG', 'review-gate-app');
    vi.stubEnv('RUN_URL', runUrl);
    vi.stubEnv('RUNNER_TEMP', scratch);
    vi.stubEnv('CLAUDE_BIN', claudeBin);
    vi.stubEnv('FAKE_CLAUDE_LOG', claudeLog);
    vi.stubEnv('FAKE_CLAUDE_EXIT', '0');
    claudeAnswers({
      reviews: 1,
      confidence: 'high',
      reason: 'Copy change in the web footer.',
      summary: 'Footer copy',
    });
    github = stubGitHub();
  });

  afterEach(() => {
    rmSync(scratch, { recursive: true, force: true });
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  function statusesOn(sha: string, context: string): FakeStatus[] {
    return (github.statuses.get(sha) ?? []).filter(status => status.context === context);
  }

  function latestStatus(sha: string, context: string): FakeStatus | undefined {
    return statusesOn(sha, context)[0];
  }

  function readClaudeCall() {
    return claudeCallSchema.parse(JSON.parse(readFileSync(claudeLog, 'utf8')));
  }

  function summary(): string {
    return readFileSync(summaryFile, 'utf8');
  }

  test('registers the check and sweep steps', () => {
    const gate = program().commands.find(command => command.name() === 'review-gate');
    expect(gate?.commands.map(command => command.name())).toEqual(['check', 'sweep']);
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
      github.pullRequests.set(8, pullRequest(8, { base: { sha: baseSha, ref: 'main' } }));

      await run(['check', '--pr', '7']);
      await run(['check', '--pr', '8']);

      expect(github.statuses.size).toBe(0);
      expect(summary()).toContain('#7: skipped, it is closed and targets dev.');
      expect(summary()).toContain('#8: skipped, it is open and targets main.');
    });

    test('lets Claude decide a small change, then passes with one approval from a writer', async () => {
      github.pullRequests.set(7, pullRequest(7));
      github.files.set(7, [changedFile(plainFile)]);
      github.reviews.set(7, [approval(reviewer)]);

      await run(['check', '--pr', '7']);

      const call = readClaudeCall();
      expect(call.prompt).toContain('Tweak the footer copy');
      expect(call.prompt).toContain(plainFile);
      expect(call.args).toContain('--system-prompt-file');
      expect(call.cwd.startsWith(realpathSync(scratch))).toBe(true);
      expect(latestStatus(headSha, 'review-gate/decision')).toEqual(
        gateStatus('review-gate/decision', 'success', '1 review required: Footer copy')
      );
      expect(statusesOn(headSha, 'review-gate').map(status => status.state)).toEqual([
        'success',
        'pending',
      ]);
      expect(latestStatus(headSha, 'review-gate')?.description).toBe('1 of 1 required approvals');
      expect(github.comments.get(7)?.map(comment => comment.body)).toEqual([
        expect.stringMatching(
          /^### Review gate: 1 review required\n\nCopy change in the web footer\./
        ),
      ]);
      expect(github.comments.get(7)?.[0]?.body).toContain(`for ${headSha}. [Run](${runUrl})`);
      expect(new Set(github.targetUrls)).toEqual(new Set([runUrl]));
    });

    test('requires two reviews by path rule for a sensitive file without asking Claude', async () => {
      github.pullRequests.set(7, pullRequest(7));
      github.files.set(7, [changedFile(sensitiveFile)]);
      github.reviews.set(7, [approval(reviewer)]);

      await run(['check', '--pr', '7']);

      expect(existsSync(claudeLog)).toBe(false);
      expect(latestStatus(headSha, 'review-gate/decision')?.description).toBe(
        `2 reviews required: Touches sensitive paths: ${sensitiveFile}.`
      );
      expect(latestStatus(headSha, 'review-gate')).toEqual(
        gateStatus('review-gate', 'failure', '1 of 2 required approvals')
      );
      expect(github.comments.get(7)?.[0]?.body).toContain('Decided by path rules');
    });

    test('looks up the base tree when a rename hides its diff', async () => {
      github.pullRequests.set(7, pullRequest(7));
      github.files.set(7, [
        changedFile('apps/web/app/components/new-footer.tsx', {
          status: 'renamed',
          previous_filename: plainFile,
          additions: 0,
          deletions: 0,
          patch: undefined,
          sha: 'renamed-blob',
        }),
      ]);
      github.baseBlobs.set(plainFile, 'different-blob');

      await run(['check', '--pr', '7']);

      expect(github.calls).toContainEqual({ method: 'GET', path: `/git/trees/${baseSha}` });
      expect(existsSync(claudeLog)).toBe(false);
      expect(latestStatus(headSha, 'review-gate/decision')?.description).toBe(
        '2 reviews required: GitHub omits the diff for apps/web/app/components/new-footer.tsx.'
      );
    });

    test('fails closed to two reviews when Claude exits without an answer', async () => {
      vi.stubEnv('FAKE_CLAUDE_EXIT', '1');
      vi.stubEnv('FAKE_CLAUDE_OUTPUT', 'not json');
      github.pullRequests.set(7, pullRequest(7));
      github.files.set(7, [changedFile(plainFile)]);

      await run(['check', '--pr', '7']);

      expect(logs).toContainEqual(expect.stringMatching(/^::warning::Claude did not answer/));
      expect(latestStatus(headSha, 'review-gate/decision')?.description).toBe(
        '2 reviews required (fallback): Claude returned no answer, so 2 reviews are required.'
      );
      expect(latestStatus(headSha, 'review-gate')?.description).toBe('0 of 2 required approvals');
    });

    test('fails closed to two reviews when Claude answers outside the schema', async () => {
      claudeAnswers({ reviews: 0, confidence: 'high', reason: 'none', summary: 'none' });
      github.pullRequests.set(7, pullRequest(7));
      github.files.set(7, [changedFile(plainFile)]);

      await run(['check', '--pr', '7']);

      expect(latestStatus(headSha, 'review-gate/decision')?.description).toMatch(
        /^2 reviews required \(fallback\): Claude's answer was invalid/
      );
    });

    test('requires two reviews when the head moves during classification', async () => {
      github.pullRequests.set(7, pullRequest(7));
      github.files.set(7, [changedFile(plainFile)]);
      let reads = 0;
      github.override = (method, requestPath) => {
        if (method !== 'GET' || requestPath !== '/pulls/7') return undefined;
        reads += 1;
        return reads > 1
          ? json(pullRequest(7, { head: { sha: 'newer-sha', repo: { full_name: repoName } } }))
          : undefined;
      };

      await run(['check', '--pr', '7']);

      expect(existsSync(claudeLog)).toBe(false);
      expect(latestStatus(headSha, 'review-gate/decision')?.description).toBe(
        `2 reviews required: The head moved from ${headSha} to newer-sha during classification.`
      );
    });

    test('reuses an answered decision on the head instead of classifying again', async () => {
      github.pullRequests.set(7, pullRequest(7));
      github.statuses.set(headSha, [
        gateStatus('review-gate/decision', 'success', '1 review required: Footer copy'),
      ]);
      github.reviews.set(7, [approval(reviewer)]);

      await run(['check', '--pr', '7']);

      expect(github.calls).not.toContainEqual({ method: 'GET', path: '/pulls/7/files' });
      expect(existsSync(claudeLog)).toBe(false);
      expect(statusesOn(headSha, 'review-gate/decision')).toHaveLength(1);
      expect(latestStatus(headSha, 'review-gate')?.description).toBe('1 of 1 required approvals');
    });

    test('classifies again when the earlier decision was a fallback', async () => {
      github.pullRequests.set(7, pullRequest(7));
      github.files.set(7, [changedFile(plainFile)]);
      github.statuses.set(headSha, [
        gateStatus(
          'review-gate/decision',
          'success',
          '2 reviews required (fallback): Claude returned no answer, so 2 reviews are required.'
        ),
      ]);

      await run(['check', '--pr', '7']);

      expect(existsSync(claudeLog)).toBe(true);
      expect(latestStatus(headSha, 'review-gate/decision')?.description).toBe(
        '1 review required: Footer copy'
      );
    });

    test('ignores a one-review decision that someone other than the gate app posted', async () => {
      github.pullRequests.set(7, pullRequest(7));
      github.files.set(7, [changedFile(sensitiveFile)]);
      github.statuses.set(headSha, [
        {
          context: 'review-gate/decision',
          state: 'success',
          description: '1 review required: trust me',
          creator: { login: 'mallory' },
        },
      ]);
      github.reviews.set(7, [approval(reviewer)]);

      await run(['check', '--pr', '7']);

      expect(latestStatus(headSha, 'review-gate/decision')?.description).toMatch(
        /^2 reviews required: Touches sensitive paths/
      );
      expect(latestStatus(headSha, 'review-gate')?.description).toBe('1 of 2 required approvals');
    });

    test('updates its own decision comment and leaves look-alikes from others alone', async () => {
      github.pullRequests.set(7, pullRequest(7));
      github.files.set(7, [changedFile(plainFile)]);
      github.comments.set(7, [
        { id: 1, user: { login: 'mallory' }, body: '### Review gate: 1 review required' },
        { id: 2, user: { login: gateBot }, body: '### Review gate: 2 reviews required\n\nold' },
      ]);

      await run(['check', '--pr', '7']);

      expect(github.calls).toContainEqual({ method: 'PATCH', path: '/issues/comments/2' });
      expect(github.calls).not.toContainEqual({ method: 'POST', path: '/issues/7/comments' });
      expect(github.comments.get(7)?.map(comment => comment.body)).toEqual([
        '### Review gate: 1 review required',
        expect.stringMatching(/^### Review gate: 1 review required\n\nCopy change/),
      ]);
    });

    test('still counts approvals when the decision comment cannot be written', async () => {
      github.pullRequests.set(7, pullRequest(7));
      github.files.set(7, [changedFile(plainFile)]);
      github.reviews.set(7, [approval(reviewer)]);
      github.override = (method, requestPath) =>
        method === 'POST' && requestPath === '/issues/7/comments'
          ? json({ message: 'Forbidden' }, 403)
          : undefined;

      await run(['check', '--pr', '7']);

      expect(logs).toContainEqual(
        expect.stringMatching(/^::warning::Could not update the review gate comment/)
      );
      expect(latestStatus(headSha, 'review-gate')?.state).toBe('success');
    });

    test('counts only the latest approvals of human writers on the head who are not the author', async () => {
      github.pullRequests.set(7, pullRequest(7));
      github.statuses.set(headSha, [
        gateStatus('review-gate/decision', 'success', '2 reviews required: Big change'),
      ]);
      github.permissions.set('second-writer', 'admin');
      github.permissions.set('reader', 'read');
      github.reviews.set(7, [
        approval(author),
        approval('stale', { commit_id: 'old-sha' }),
        approval('helper-bot[bot]', { user: { login: 'helper-bot[bot]', type: 'Bot' } }),
        approval('reader'),
        approval('changed-mind'),
        approval('changed-mind', { state: 'CHANGES_REQUESTED' }),
        approval(reviewer),
        approval(reviewer, { state: 'COMMENTED' }),
      ]);
      github.permissions.set('stale', 'write');
      github.permissions.set('changed-mind', 'write');

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
      github.statuses.set(headSha, [
        gateStatus('review-gate/decision', 'success', '1 review required: Footer copy'),
      ]);
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

    test('never classifies a fork pull request and always requires two approvals', async () => {
      github.pullRequests.set(7, forkPullRequest(7, headSha));
      github.files.set(7, [changedFile(plainFile)]);
      github.reviews.set(7, [approval(reviewer)]);

      await run(['check', '--pr', '7']);

      expect(existsSync(claudeLog)).toBe(false);
      expect(statusesOn(headSha, 'review-gate/decision')).toEqual([]);
      expect(latestStatus(headSha, 'review-gate')?.description).toBe(
        '1 of 2 required approvals (fork pull request)'
      );
    });

    test('reports an error status and fails when GitHub refuses a read', async () => {
      github.pullRequests.set(7, pullRequest(7));
      github.statuses.set(headSha, [
        gateStatus('review-gate/decision', 'success', '1 review required: Footer copy'),
      ]);
      github.override = (method, requestPath) =>
        method === 'GET' && requestPath === '/pulls/7/reviews'
          ? json({ message: 'Server Error' }, 500)
          : undefined;

      await expect(run(['check', '--pr', '7'])).rejects.toThrow(/failed with 500/);

      expect(latestStatus(headSha, 'review-gate')).toEqual(
        gateStatus(
          'review-gate',
          'error',
          'Could not decide or count approvals. Comment /review-gate to retry.'
        )
      );
    });

    test('ignores a /review-gate comment from someone without write access', async () => {
      github.pullRequests.set(7, pullRequest(7));
      github.permissions.set('outsider', 'read');

      await run(['check', '--pr', '7', '--requested-by', 'outsider']);

      expect(github.statuses.size).toBe(0);
      expect(github.calls).toEqual([{ method: 'GET', path: '/collaborators/outsider/permission' }]);
      expect(summary()).toContain(
        'Ignored: outsider has no write access, so cannot run the review gate.'
      );
    });

    test('runs for a /review-gate comment from a writer', async () => {
      github.pullRequests.set(7, pullRequest(7));
      github.files.set(7, [changedFile(plainFile)]);
      github.reviews.set(7, [approval(reviewer)]);

      await run(['check', '--pr', '7', '--requested-by', reviewer]);

      expect(latestStatus(headSha, 'review-gate')?.state).toBe('success');
    });
  });

  describe('sweep', () => {
    test('re-counts approvals on fork pull requests only, without a pending status', async () => {
      github.pullRequests.set(7, pullRequest(7));
      github.pullRequests.set(8, forkPullRequest(8, 'fork-sha'));
      github.pullRequests.set(9, { ...forkPullRequest(9, 'closed-fork-sha'), state: 'closed' });
      github.reviews.set(8, [
        approval(reviewer, { commit_id: 'fork-sha' }),
        approval('second-writer', { commit_id: 'fork-sha' }),
      ]);
      github.permissions.set('second-writer', 'write');

      await run(['sweep']);

      expect(github.statuses.get(headSha)).toBeUndefined();
      expect(github.statuses.get('closed-fork-sha')).toBeUndefined();
      expect(statusesOn('fork-sha', 'review-gate')).toEqual([
        gateStatus('review-gate', 'success', '2 of 2 required approvals (fork pull request)'),
      ]);
      expect(existsSync(claudeLog)).toBe(false);
      expect(summary()).toContain('Checked 1 fork pull requests into dev.');
    });

    test('leaves an unchanged gate status alone', async () => {
      github.pullRequests.set(8, forkPullRequest(8, 'fork-sha'));
      github.statuses.set('fork-sha', [
        gateStatus('review-gate', 'failure', '0 of 2 required approvals (fork pull request)'),
      ]);

      await run(['sweep']);

      expect(github.calls).not.toContainEqual({ method: 'POST', path: '/statuses/fork-sha' });
    });

    test('rewrites a matching status that someone other than the gate app posted', async () => {
      github.pullRequests.set(8, forkPullRequest(8, 'fork-sha'));
      github.statuses.set('fork-sha', [
        {
          context: 'review-gate',
          state: 'success',
          description: '0 of 2 required approvals (fork pull request)',
          creator: { login: 'mallory' },
        },
      ]);

      await run(['sweep']);

      expect(latestStatus('fork-sha', 'review-gate')).toEqual(
        gateStatus('review-gate', 'failure', '0 of 2 required approvals (fork pull request)')
      );
    });

    test('keeps going past a failing pull request and fails at the end naming it', async () => {
      github.pullRequests.set(8, forkPullRequest(8, 'broken-sha'));
      github.pullRequests.set(9, forkPullRequest(9, 'fork-sha'));
      github.override = (method, requestPath) =>
        method === 'GET' && requestPath === '/pulls/8/reviews'
          ? json({ message: 'Server Error' }, 500)
          : undefined;

      await expect(run(['sweep'])).rejects.toThrow('The gate failed for #8.');

      expect(logs).toContainEqual(expect.stringMatching(/^::error::#8: /));
      expect(latestStatus('broken-sha', 'review-gate')?.state).toBe('error');
      expect(latestStatus('fork-sha', 'review-gate')?.description).toBe(
        '0 of 2 required approvals (fork pull request)'
      );
    });
  });
});
