import { Command } from 'commander';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { treeSnapshot } from '../fix-issue/git.js';
import {
  type TestRepo,
  blockedStatus,
  createTestRepo,
  doneStatus,
} from '../fix-issue/test/test-repo.js';
import { registerFixIssueCommands } from './fix-issue.js';

interface ApiCall {
  readonly method: string;
  readonly url: string;
  readonly authorization: string | null;
  readonly body: string | null;
}

const apiUrl = 'https://api.github.com';
const repoName = 'leather-io/mono';

function program() {
  const root = new Command().exitOverride();
  registerFixIssueCommands(root);
  return root;
}

function run(args: readonly string[]) {
  return program().parseAsync(['fix-issue', ...args], { from: 'user' });
}

function json(value: unknown): Response {
  return new Response(JSON.stringify(value));
}

function stubGitHubApi(route: (method: string, url: string) => Response): ApiCall[] {
  const calls: ApiCall[] = [];
  vi.stubGlobal('fetch', (url: string, init?: RequestInit) => {
    const method = init?.method ?? 'GET';
    calls.push({
      method,
      url,
      authorization: new Headers(init?.headers).get('authorization'),
      body: typeof init?.body === 'string' ? init.body : null,
    });
    return Promise.resolve(route(method, url));
  });
  return calls;
}

describe('fix-issue commands', () => {
  let runDir: string;
  let errors: string[];
  beforeEach(() => {
    runDir = mkdtempSync(path.join(tmpdir(), 'fix-issue-cli-'));
    errors = [];
    vi.spyOn(console, 'error').mockImplementation((line: string) => errors.push(line));
  });
  afterEach(() => {
    rmSync(runDir, { recursive: true, force: true });
    vi.restoreAllMocks();
    process.exitCode = undefined;
  });

  test('registers every workflow step and the local commands', () => {
    const fixIssue = program().commands.find(command => command.name() === 'fix-issue');
    expect(fixIssue?.commands.map(command => command.name())).toEqual([
      'fetch-issue',
      'dispatch',
      'status',
      'verify',
      'round',
      'stop-guard',
      'strip-forbidden',
      'screenshots',
      'app-token',
      'open-pull-request',
      'revise',
    ]);
    const revise = fixIssue?.commands.find(command => command.name() === 'revise');
    expect(revise?.commands.map(command => command.name())).toEqual(['prepare']);
    const appToken = fixIssue?.commands.find(command => command.name() === 'app-token');
    expect(appToken?.commands.map(command => command.name())).toEqual(['create', 'revoke']);
    const round = fixIssue?.commands.find(command => command.name() === 'round');
    expect(round?.commands.map(command => command.name())).toEqual([
      'verify',
      'check-review',
      'end',
      'finish',
    ]);
  });

  test('a step that fails reports its error and sets a failing exit code', async () => {
    await program().parseAsync(
      ['fix-issue', 'dispatch', '--run-dir', runDir, '--issue', 'twelve'],
      { from: 'user' }
    );
    expect(errors).toEqual(["fix-issue-dispatch: 'twelve' is not an issue number"]);
    expect(process.exitCode).toBe(1);
  });

  test('status needs issue numbers or a run directory', async () => {
    await program().parseAsync(['fix-issue', 'status'], { from: 'user' });
    expect(errors).toEqual(['fix-issue-status: pass issue numbers or --run-dir']);
    expect(process.exitCode).toBe(1);
  });

  test('a round number outside 1 to 9 is refused', async () => {
    await program().parseAsync(['fix-issue', 'round', 'end', '--round', '0'], { from: 'user' });
    expect(errors).toEqual(["fix-issue-round: '0' is not a round number from 1 to 9"]);
  });
});

describe('fix-issue command actions', () => {
  let repo: TestRepo;
  let scratch: string;
  let outputFile: string;
  let logs: string[];
  let errors: string[];

  beforeEach(() => {
    repo = createTestRepo();
    scratch = mkdtempSync(path.join(tmpdir(), 'fix-issue-cli-'));
    outputFile = path.join(scratch, 'github-output');
    logs = [];
    errors = [];
    vi.spyOn(process, 'cwd').mockReturnValue(repo.root);
    vi.spyOn(console, 'log').mockImplementation((line: string) => logs.push(line));
    vi.spyOn(console, 'error').mockImplementation((line: string) => errors.push(line));
    vi.stubEnv('GITHUB_OUTPUT', outputFile);
    vi.stubEnv('GITHUB_REPOSITORY', repoName);
    vi.stubEnv('GITHUB_API_URL', apiUrl);
    vi.stubEnv('GH_TOKEN', 'ghs_job_token');
  });
  afterEach(() => {
    repo.cleanup();
    rmSync(scratch, { recursive: true, force: true });
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    process.exitCode = undefined;
  });

  function stepOutputs(): string[] {
    return existsSync(outputFile) ? readFileSync(outputFile, 'utf8').trim().split('\n') : [];
  }

  function fakeBinary(name: string, script: string): void {
    const bin = path.join(scratch, 'bin');
    mkdirSync(bin, { recursive: true });
    writeFileSync(path.join(bin, name), `#!/bin/sh\n${script}\n`);
    chmodSync(path.join(bin, name), 0o755);
    vi.stubEnv('PATH', `${bin}${path.delimiter}${process.env.PATH ?? ''}`);
  }

  describe('round', () => {
    test('a fixer blocked before changing anything skips the gate and ends the rounds', async () => {
      repo.writeStatus(blockedStatus);
      await run(['round', 'verify', '--round', '1']);
      await run(['round', 'end', '--round', '1']);
      await run(['round', 'finish']);
      expect(stepOutputs()).toEqual(['verified=false', 'continue=false']);
      expect(logs).toContain('fix-issue-round: Round 1: the fixer stopped as blocked');
      expect(logs).toContain('fix-issue-round: finished with outcome blocked');
      expect(errors).toEqual([]);
      expect(process.exitCode).toBeUndefined();
    });

    test('a round that fails the gate asks the workflow for another round', async () => {
      repo.writeStatus(doneStatus);
      await run(['round', 'verify', '--round', '1']);
      await run(['round', 'end', '--round', '1']);
      expect(stepOutputs()).toEqual(['verified=false', 'continue=true']);
      expect(logs).toContain('fix-issue-round: Round 1: state is done but nothing changed');
    });

    test('check-review reports a missing review, then the number of blocking findings', async () => {
      repo.writeStatus(doneStatus);
      writeFileSync(repo.paths.reviewSnapshot, treeSnapshot(repo.root));
      await run(['round', 'check-review', '--round', '1']);
      writeFileSync(repo.paths.reviewFile, JSON.stringify({ blocking: [], minor: [] }));
      await run(['round', 'check-review', '--round', '1']);
      expect(logs).toEqual([
        'fix-issue-round: round 1 review left no valid review file; the round fails',
        'fix-issue-round: round 1 review found 0 blocking findings',
      ]);
    });
  });

  test('verify fails and writes the report when the change does not pass', async () => {
    repo.writeStatus(doneStatus);
    await run(['verify', '--report']);
    expect(process.exitCode).toBe(1);
    expect(readFileSync(repo.paths.verifyReport, 'utf8')).toBe(
      'FAILED: state is done but nothing changed\n'
    );
  });

  test('stop-guard blocks the agent until its output file is valid', async () => {
    await run(['stop-guard', '--output', 'status']);
    expect(logs).toHaveLength(1);
    expect(logs[0]).toContain('"decision":"block"');
    expect(logs[0]).toContain('tmp/fix-issue/status.json does not exist yet');
    repo.writeStatus(doneStatus);
    await run(['stop-guard', '--output', 'status']);
    expect(logs).toHaveLength(1);
  });

  test('strip-forbidden removes changes outside the allowed paths and names them', async () => {
    repo.writeStatus(doneStatus);
    await run(['strip-forbidden']);
    repo.write('.github/workflows/evil.yml', 'on: push\n');
    await run(['strip-forbidden']);
    expect(logs).toEqual([
      'strip-forbidden: every change is under the allowed paths',
      'strip-forbidden: removed 1 changes outside the allowed paths:\n  .github/workflows/evil.yml',
    ]);
    expect(existsSync(path.join(repo.root, '.github/workflows/evil.yml'))).toBe(false);
  });

  test('screenshots preview fails when the fixer wrote no specs', async () => {
    await run(['screenshots', 'preview']);
    expect(errors).toEqual([`fix-issue-screenshots: no specs in ${repo.paths.screenshotSpecsDir}`]);
    expect(process.exitCode).toBe(1);
  });

  test('fetch-issue renders the issue with the job token', async () => {
    const calls = stubGitHubApi((_method, url) => {
      if (url.endsWith('/issues/12')) {
        return json({
          title: 'Fee row wraps out of view',
          html_url: 'https://github.com/leather-io/mono/issues/12',
          state: 'open',
          body: 'The fee row wraps below 360px.',
          created_at: '2026-11-01T00:00:00Z',
          user: { login: 'maintainer' },
          labels: [],
        });
      }
      if (url.includes('/issues/12/comments')) return json([]);
      return json({ permission: 'write' });
    });
    await run(['fetch-issue', '--issue', '12']);
    expect(calls.map(call => call.authorization)).toEqual(calls.map(() => 'Bearer ghs_job_token'));
    expect(calls[0]?.url).toBe(`${apiUrl}/repos/${repoName}/issues/12`);
    expect(readFileSync(repo.paths.issueFile, 'utf8')).toContain(
      '# Fee row wraps out of view\n\nhttps://github.com/leather-io/mono/issues/12'
    );
    expect(logs).toEqual([
      `fetch-issue: wrote ${repo.paths.issueFile} with 0 comments; omitted 0 comments from people without write access`,
    ]);
  });

  describe('app-token', () => {
    test('create masks the token before writing it to the step output', async () => {
      fakeBinary('aws', `echo ${Buffer.from('signature').toString('base64')}`);
      const calls = stubGitHubApi((method, url) => {
        if (method === 'GET' && url.endsWith('/app')) return json({ slug: 'leather-fix-issue' });
        return method === 'GET' && url.endsWith(`/repos/${repoName}/installation`)
          ? json({ id: 42 })
          : json({
              token: 'ghs_installation_token',
              permissions: {
                contents: 'write',
                pull_requests: 'write',
                issues: 'write',
                metadata: 'read',
              },
            });
      });
      await run(['app-token', 'create', '--client-id', 'Iv23client', '--kms-key-id', 'alias/app']);
      expect(errors).toEqual([]);
      expect(logs).toEqual([
        '::add-mask::ghs_installation_token',
        'app-token: created an installation token that expires within an hour',
      ]);
      expect(stepOutputs()).toEqual([
        'token=ghs_installation_token',
        'app-login=leather-fix-issue[bot]',
      ]);
      expect(calls.map(call => `${call.method} ${call.url}`)).toEqual([
        `GET ${apiUrl}/repos/${repoName}/installation`,
        `POST ${apiUrl}/app/installations/42/access_tokens`,
        `GET ${apiUrl}/app`,
      ]);
      const signature = Buffer.from('signature').toString('base64url');
      for (const call of calls) {
        expect(call.authorization).toMatch(new RegExp(`^Bearer [\\w-]+\\.[\\w-]+\\.${signature}$`));
      }
    });

    test('create fails without a token when KMS refuses to sign', async () => {
      fakeBinary('aws', 'echo AccessDenied >&2\nexit 254');
      const calls = stubGitHubApi(() => json({}));
      await run(['app-token', 'create', '--client-id', 'Iv23client', '--kms-key-id', 'alias/app']);
      expect(errors).toEqual(['app-token: aws kms sign failed: AccessDenied']);
      expect(process.exitCode).toBe(1);
      expect(stepOutputs()).toEqual([]);
      expect(calls).toEqual([]);
    });

    test('revoke deletes the installation token in GH_TOKEN', async () => {
      const calls = stubGitHubApi(() => new Response(null, { status: 204 }));
      await run(['app-token', 'revoke']);
      expect(calls).toEqual([
        {
          method: 'DELETE',
          url: `${apiUrl}/installation/token`,
          authorization: 'Bearer ghs_job_token',
          body: null,
        },
      ]);
      expect(logs).toEqual(['app-token: revoked the installation token']);
    });
  });

  describe('open-pull-request', () => {
    function openPullRequest() {
      return run([
        'open-pull-request',
        '--issue',
        '12',
        '--branch',
        'bot/fix-issue-12-777',
        '--base',
        'dev',
        '--parent-sha',
        repo.head,
      ]);
    }

    test('comments on the issue with the run it came from and prints the link', async () => {
      vi.stubEnv('GITHUB_RUN_ID', '777');
      vi.stubEnv('GITHUB_SERVER_URL', 'https://github.example');
      repo.writeStatus(blockedStatus);
      const comment = 'https://github.example/leather-io/mono/issues/12#issuecomment-1';
      const calls = stubGitHubApi(() => json({ html_url: comment }));
      await openPullRequest();
      expect(errors).toEqual([]);
      expect(logs).toEqual([comment]);
      expect(calls).toHaveLength(1);
      expect(calls[0]).toMatchObject({
        method: 'POST',
        url: `${apiUrl}/repos/${repoName}/issues/12/comments`,
        authorization: 'Bearer ghs_job_token',
      });
      expect(calls[0]?.body).toContain('https://github.example/leather-io/mono/actions/runs/777');
    });

    test('fails without a token', async () => {
      vi.stubEnv('GH_TOKEN', '');
      repo.writeStatus(blockedStatus);
      await openPullRequest();
      expect(errors).toEqual(['open-pull-request: GH_TOKEN is not set']);
      expect(process.exitCode).toBe(1);
    });
  });

  describe('revise', () => {
    const pullRequestHead = 'bot/fix-issue-12-777';

    function prepare(clientId: string) {
      return run([
        'revise',
        'prepare',
        '--pull-request',
        '7',
        '--dev-sha',
        repo.head,
        '--base',
        'dev',
        '--merge',
        'false',
        '--requested-by',
        'alice',
        '--workflow-app-client-id',
        clientId,
      ]);
    }

    function branchHead(): string {
      repo.git(['checkout', '-q', '-b', pullRequestHead]);
      repo.write('apps/extension/fee-row.tsx', 'export const feeRow = 2;\n');
      repo.git(['commit', '-q', '-a', '-m', 'fix']);
      const head = repo.git(['rev-parse', 'HEAD']);
      repo.git(['checkout', '-q', 'dev']);
      return head;
    }

    test('prepare gathers the feedback and leaves the tree on the pull request head', async () => {
      const head = branchHead();
      vi.stubEnv('FIX_ISSUE_NOTES', 'wrap the label');
      const calls = stubGitHubApi((_method, url) => {
        if (url.endsWith('/pulls/7')) {
          return json({
            state: 'open',
            draft: false,
            title: 'fix(extension): keep the fee row visible',
            body: 'Closes #12',
            html_url: 'https://github.com/leather-io/mono/pull/7',
            user: { login: 'leather-fix-issue[bot]', type: 'Bot' },
            head: { ref: pullRequestHead, sha: head, repo: { full_name: repoName } },
            base: { ref: 'dev' },
          });
        }
        if (url.endsWith('/issues/12')) {
          return json({
            title: 'Fee row wraps out of view',
            html_url: 'https://github.com/leather-io/mono/issues/12',
            state: 'open',
            body: 'The fee row wraps below 360px.',
            created_at: '2026-11-01T00:00:00Z',
            user: { login: 'alice' },
            labels: [],
          });
        }
        if (url.endsWith('/graphql')) {
          return json({
            data: {
              repository: {
                pullRequest: {
                  reviewThreads: { pageInfo: { hasNextPage: false, endCursor: null }, nodes: [] },
                },
              },
            },
          });
        }
        if (url.includes('/comments') || url.includes('/reviews')) return json([]);
        return json({ permission: 'write' });
      });
      await prepare('Iv23client');
      expect(errors).toEqual([]);
      expect(stepOutputs()).toEqual(['merged=false']);
      expect(logs).toEqual([`revise-prepare: revise 1 of #7 at ${head} with 1 feedback items`]);
      expect(calls.map(call => call.authorization)).toEqual(
        calls.map(() => 'Bearer ghs_job_token')
      );
      expect(readFileSync(repo.paths.feedbackFile, 'utf8')).toContain('wrap the label');
      expect(repo.git(['rev-parse', 'HEAD'])).toBe(head);
      expect(existsSync(repo.paths.pullRequestDiff)).toBe(true);
    });

    test('prepare fails the run, with the reason, when the pull request may not be revised', async () => {
      const calls = stubGitHubApi(() => json({}));
      await prepare('');
      expect(errors).toEqual(['revise-prepare: the client ID of the fix-issue App is not set']);
      expect(stepOutputs()).toEqual([]);
      expect(calls).toEqual([]);
      expect(process.exitCode).toBe(1);
      expect(repo.git(['rev-parse', 'HEAD'])).toBe(repo.head);
    });

    test('open-pull-request revises a pull request when it is given one', async () => {
      repo.writeStatus(doneStatus);
      const calls = stubGitHubApi(() => json({}));
      await run([
        'open-pull-request',
        '--issue',
        '',
        '--branch',
        'bot/fix-issue--777',
        '--base',
        'dev',
        '--parent-sha',
        repo.head,
        '--pull-request',
        '7',
        '--merge',
        'false',
        '--app-login',
        'leather-fix-issue[bot]',
      ]);
      expect(calls.map(call => `${call.method} ${call.url}`)).toEqual([
        `GET ${apiUrl}/repos/${repoName}/pulls/7`,
      ]);
      expect(errors).toHaveLength(1);
      expect(process.exitCode).toBe(1);
    });

    test('open-pull-request needs the login of the App to revise', async () => {
      repo.writeStatus(doneStatus);
      const calls = stubGitHubApi(() => json({}));
      await run([
        'open-pull-request',
        '--base',
        'dev',
        '--parent-sha',
        repo.head,
        '--pull-request',
        '7',
      ]);
      expect(errors).toEqual(['open-pull-request: --app-login is required']);
      expect(calls).toEqual([]);
    });
  });

  describe('through the gh login', () => {
    test('dispatch sends the brief to the workflow on dev and prints what gh printed', async () => {
      const argsFile = path.join(scratch, 'gh-args');
      const brief = path.join(scratch, 'briefs/bot/fix-issue-12.md');
      mkdirSync(path.dirname(brief), { recursive: true });
      writeFileSync(brief, '# #12: Fee row wraps\n');
      fakeBinary(
        'gh',
        `echo "$@" > "${argsFile}"\necho https://github.com/leather-io/mono/actions/runs/777`
      );
      await run(['dispatch', '--run-dir', scratch, '--issue', '12']);
      expect(logs).toEqual(['https://github.com/leather-io/mono/actions/runs/777']);
      expect(readFileSync(argsFile, 'utf8').trim()).toBe(
        `workflow run repo:fix-issue.yml --repo ${repoName} --ref dev -f issue=12 -F notes=@${brief}`
      );
    });

    test('dispatch with a pull request starts a revise of it', async () => {
      const argsFile = path.join(scratch, 'gh-args');
      const notesFile = path.join(scratch, 'notes.md');
      writeFileSync(notesFile, 'Wrap the label.\n');
      fakeBinary(
        'gh',
        `echo "$@" > "${argsFile}"\necho https://github.com/leather-io/mono/actions/runs/888`
      );
      await run(['dispatch', '--pull-request', '7', '--merge', '--notes-file', notesFile]);
      expect(logs).toEqual(['https://github.com/leather-io/mono/actions/runs/888']);
      expect(readFileSync(argsFile, 'utf8').trim()).toBe(
        `workflow run repo:fix-issue.yml --repo ${repoName} --ref dev -f pull_request=7 -f merge=true -F notes=@${notesFile}`
      );
    });

    test('dispatch needs a run directory and an issue when it is not a revise', async () => {
      await run(['dispatch', '--issue', '12']);
      expect(errors).toEqual(['fix-issue-dispatch: --run-dir is required']);
      expect(process.exitCode).toBe(1);
    });

    test('status prints the latest run of each issue and fails when one failed', async () => {
      const runsFile = path.join(scratch, 'runs.json');
      writeFileSync(
        runsFile,
        JSON.stringify({
          workflow_runs: [
            {
              id: 5,
              display_title: 'fix-issue: #12',
              status: 'completed',
              conclusion: 'failure',
              html_url: 'https://github.com/leather-io/mono/actions/runs/5',
              created_at: '2026-11-12T10:00:00Z',
            },
          ],
        })
      );
      fakeBinary(
        'gh',
        `case "$*" in\n*actions/workflows*) cat "${runsFile}" ;;\n*) echo "[]" ;;\nesac`
      );
      await run(['status', '12']);
      expect(logs).toEqual([
        '#12  completed  failure  -  https://github.com/leather-io/mono/actions/runs/5',
      ]);
      expect(process.exitCode).toBe(1);
    });
  });
});
