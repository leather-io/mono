import type { Command } from 'commander';

import {
  appBotLogin,
  appJwt,
  createInstallationToken,
  kmsSigner,
  revokeInstallationToken,
} from '../fix-issue/app-token.js';
import { briefIssues, dispatch, dispatchRevise } from '../fix-issue/dispatch.js';
import { repoRoot } from '../fix-issue/git.js';
import { createGhCliClient, createGitHubClient } from '../fix-issue/github.js';
import { fetchIssue } from '../fix-issue/issue.js';
import { writeStepOutputs } from '../fix-issue/outputs.js';
import { fixIssuePaths } from '../fix-issue/paths.js';
import { openPullRequest } from '../fix-issue/pull-request.js';
import { gateRevise } from '../fix-issue/revise-gate.js';
import { startRevise } from '../fix-issue/revise.js';
import {
  checkReview,
  endRound,
  finishRounds,
  parseRound,
  verifyRound,
} from '../fix-issue/rounds.js';
import { anyRunFailed, fetchRunStatuses, formatRunStatuses } from '../fix-issue/run-status.js';
import { captureScreenshots, previewScreenshots } from '../fix-issue/screenshots.js';
import { decideStop, guardedOutputSchema } from '../fix-issue/stop-guard.js';
import { stripForbiddenPaths } from '../fix-issue/strip.js';
import { reviseCheck, verifyFix } from '../fix-issue/verify.js';

interface RoundOptions {
  readonly round: string;
}

interface IssueOptions {
  readonly issue: string;
}

interface OpenPullRequestFlags {
  readonly issue: string;
  readonly branch: string;
  readonly base: string;
  readonly parentSha: string;
  readonly coAuthor?: string;
  readonly pullRequest: string;
  readonly merge: string;
  readonly appLogin: string;
}

interface AppTokenFlags {
  readonly clientId: string;
  readonly kmsKeyId: string;
}

interface DispatchFlags {
  readonly runDir?: string;
  readonly issue?: string;
  readonly pullRequest?: string;
  readonly notesFile?: string;
  readonly merge?: boolean;
  readonly repo: string;
}

interface PrepareReviseFlags {
  readonly pullRequest: string;
  readonly devSha: string;
  readonly base: string;
  readonly merge: string;
  readonly requestedBy: string;
  readonly workflowAppClientId?: string;
}

interface StatusFlags {
  readonly runDir?: string;
  readonly repo: string;
}

const defaultRepo = 'leather-io/mono';

function issuesOfRunDir(runDir: string | undefined): number[] {
  if (!runDir) throw new Error('pass issue numbers or --run-dir');
  return briefIssues(runDir);
}

function paths() {
  return fixIssuePaths(repoRoot(process.cwd()));
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

function parseNumber(value: string, what: string): number {
  if (!/^[1-9]\d*$/.test(value)) throw new Error(`'${value}' is not ${what}`);
  return Number(value);
}

function parseIssue(value: string): number {
  return parseNumber(value, 'an issue number');
}

function parsePullRequest(value: string): number {
  return parseNumber(value, 'a pull request number');
}

function required(value: string | undefined, flag: string): string {
  if (!value) throw new Error(`${flag} is required`);
  return value;
}

function notes(): string | undefined {
  return process.env.FIX_ISSUE_NOTES;
}

function github() {
  return createGitHubClient({ token: requireEnv('GH_TOKEN'), apiUrl: process.env.GITHUB_API_URL });
}

async function guard(step: string, action: () => Promise<void> | void): Promise<void> {
  try {
    await action();
  } catch (error) {
    console.error(`${step}: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

export function registerFixIssueCommands(program: Command): void {
  const fixIssue = program
    .command('fix-issue')
    .description(
      'Steps of the repo:fix-issue workflow: fetch, rounds, verify, screenshots, pull request'
    );

  fixIssue
    .command('fetch-issue')
    .description('Render the issue and its comments to tmp/fix-issue/issue.md')
    .requiredOption('--issue <number>', 'Issue number')
    .option(
      '--workflow-app-client-id <id>',
      'Client ID of the fix-issue App, whose own comments on the issue are kept'
    )
    .action(
      ({ issue, workflowAppClientId }: IssueOptions & { readonly workflowAppClientId?: string }) =>
        guard('fetch-issue', async () => {
          const target = paths();
          const fetched = await fetchIssue({
            client: github(),
            repo: requireEnv('GITHUB_REPOSITORY'),
            issue: parseIssue(issue),
            outFile: target.issueFile,
            workflowAppClientId,
          });
          console.log(
            `fetch-issue: wrote ${target.issueFile} with ${fetched.comments} comments; omitted ${fetched.omittedComments} comments${fetched.issueOmitted ? ' and the issue text' : ''} from people without write access`
          );
        })
    );

  fixIssue
    .command('dispatch')
    .description(
      'Dispatch repo:fix-issue on dev through the gh login: for one brief of a run directory, or with --pull-request to revise an open bot pull request'
    )
    .option('--run-dir <dir>', 'Run directory holding briefs/bot/fix-issue-<n>.md')
    .option('--issue <number>', 'Issue number; for a group, the first issue of the brief')
    .option('--pull-request <number>', 'Bot pull request to revise instead of fixing an issue')
    .option('--notes-file <file>', 'With --pull-request: what the revise should change')
    .option('--merge', 'With --pull-request: merge dev into the branch first')
    .option('--repo <owner/name>', 'Repository to dispatch in', defaultRepo)
    .action(({ runDir, issue, pullRequest, notesFile, merge, repo }: DispatchFlags) =>
      guard('fix-issue-dispatch', () => {
        if (pullRequest !== undefined) {
          console.log(
            dispatchRevise({
              pullRequest: parsePullRequest(pullRequest),
              notesFile,
              merge: merge === true,
              repo,
              cwd: process.cwd(),
            })
          );
          return;
        }
        console.log(
          dispatch({
            runDir: required(runDir, '--run-dir'),
            issue: parseIssue(required(issue, '--issue')),
            repo,
          })
        );
      })
    );

  fixIssue
    .command('status')
    .description(
      'Show the latest repo:fix-issue run of each issue, its pull request and the questions of every draft, through the gh login'
    )
    .argument('[issues...]', 'Issue numbers; default: the briefs in --run-dir')
    .option('--run-dir <dir>', 'Run directory whose briefs name the issues')
    .option('--repo <owner/name>', 'Repository the runs ran in', defaultRepo)
    .action((issues: readonly string[], { runDir, repo }: StatusFlags) =>
      guard('fix-issue-status', async () => {
        const numbers = issues.length > 0 ? issues.map(parseIssue) : issuesOfRunDir(runDir);
        const statuses = await fetchRunStatuses(createGhCliClient(process.cwd()), repo, numbers);
        console.log(formatRunStatuses(statuses));
        if (anyRunFailed(statuses)) process.exitCode = 1;
      })
    );

  fixIssue
    .command('verify')
    .description('Run the verification gate on the fixer status and change')
    .option('--report', 'Write a failure report to tmp/fix-issue/verify.md instead of only failing')
    .action(({ report }: { readonly report?: boolean }) =>
      guard('verify-fix', () => {
        const target = paths();
        const result = verifyFix({
          root: target.root,
          statusFile: target.statusFile,
          reportFile: report ? target.verifyReport : undefined,
          revise: reviseCheck(target.reviseFile),
        });
        if (!result.passed) process.exitCode = 1;
      })
    );

  const round = fixIssue.command('round').description('One fix → verify → review round');

  round
    .command('verify')
    .requiredOption('--round <n>', 'Round number')
    .action(({ round: value }: RoundOptions) =>
      guard('fix-issue-round', () => {
        writeStepOutputs({ verified: verifyRound(paths(), parseRound(value)) });
      })
    );

  round
    .command('check-review')
    .requiredOption('--round <n>', 'Round number')
    .action(({ round: value }: RoundOptions) =>
      guard('fix-issue-round', () => {
        parseRound(value);
        const blocking = checkReview(paths());
        console.log(
          blocking === null
            ? `fix-issue-round: round ${value} review left no valid review file; the round fails`
            : `fix-issue-round: round ${value} review found ${blocking} blocking findings`
        );
      })
    );

  round
    .command('end')
    .requiredOption('--round <n>', 'Round number')
    .action(({ round: value }: RoundOptions) =>
      guard('fix-issue-round', () => {
        const end = endRound(paths(), parseRound(value));
        writeStepOutputs({ continue: end.continue });
        console.log(`fix-issue-round: ${end.summary}`);
      })
    );

  round.command('finish').action(() =>
    guard('fix-issue-round', () => {
      const outcome = finishRounds(paths());
      console.log(`fix-issue-round: finished with outcome ${outcome}`);
    })
  );

  fixIssue
    .command('stop-guard')
    .description(
      'Claude Code Stop hook: keep the agent working until its output file is written and valid'
    )
    .requiredOption('--output <output>', 'The file the agent must write: status or review')
    .action(({ output }: { readonly output: string }) => {
      const block = decideStop(paths(), guardedOutputSchema.parse(output));
      if (block) console.log(JSON.stringify(block));
    });

  fixIssue
    .command('strip-forbidden')
    .description(
      'Remove changes outside the allowed paths and block the status with a question naming them'
    )
    .action(() =>
      guard('strip-forbidden', () => {
        const stripped = stripForbiddenPaths(paths());
        console.log(
          stripped.length === 0
            ? 'strip-forbidden: every change is under the allowed paths'
            : `strip-forbidden: removed ${stripped.length} changes outside the allowed paths:\n  ${stripped.join('\n  ')}`
        );
      })
    );

  const screenshots = fixIssue
    .command('screenshots')
    .description('Before and after screenshots of changed screens');
  screenshots
    .command('preview')
    .description('Run the screenshot specs against the current build')
    .action(() => guard('fix-issue-screenshots', () => previewScreenshots({ paths: paths() })));
  screenshots
    .command('capture')
    .description('Build and capture the fix, then dev, and restore the fix')
    .action(() => guard('fix-issue-screenshots', () => captureScreenshots({ paths: paths() })));

  const appToken = fixIssue
    .command('app-token')
    .description('Installation token of the fix-issue App, whose private key stays in AWS KMS');
  appToken
    .command('create')
    .description(
      'Sign the App JWT with KMS, then write a token limited to this repository and contents, pull requests and issues to the step output'
    )
    .requiredOption('--client-id <id>', 'Client ID of the fix-issue App')
    .requiredOption('--kms-key-id <id>', 'KMS key ID, ARN or alias holding the App private key')
    .action(({ clientId, kmsKeyId }: AppTokenFlags) =>
      guard('app-token', async () => {
        const repo = requireEnv('GITHUB_REPOSITORY');
        const apiUrl = process.env.GITHUB_API_URL;
        const jwt = appJwt(clientId, kmsSigner(kmsKeyId), Date.now());
        const appClient = createGitHubClient({ token: jwt, apiUrl });
        const token = await createInstallationToken({
          appClient,
          tokenClient(installationToken) {
            return createGitHubClient({ token: installationToken, apiUrl });
          },
          repo,
        });
        console.log(`::add-mask::${token}`);
        writeStepOutputs({ token, 'app-login': await appBotLogin(appClient) });
        console.log('app-token: created an installation token that expires within an hour');
      })
    );
  appToken
    .command('revoke')
    .description('Revoke the installation token in GH_TOKEN')
    .action(() =>
      guard('app-token', async () => {
        await revokeInstallationToken(github());
        console.log('app-token: revoked the installation token');
      })
    );

  fixIssue
    .command('open-pull-request')
    .description(
      'Commit the patch and open the pull request of a first run, or with --pull-request commit it on top of that pull request and answer its reviewers'
    )
    .requiredOption('--base <branch>', 'Base branch')
    .requiredOption('--parent-sha <sha>', 'Tip of the base branch the run started from')
    .option('--issue <number>', 'Issue number of a first run', '')
    .option('--branch <branch>', 'Pull request branch of a first run', '')
    .option('--co-author <login>', 'GitHub login to credit with a Co-authored-by trailer')
    .option('--pull-request <number>', 'Pull request a revise run changes', '')
    .option('--merge <boolean>', 'true when the revise was asked to merge the base branch', 'false')
    .option('--app-login <login>', 'Login of the fix-issue App bot, for a revise', '')
    .action((flags: OpenPullRequestFlags) =>
      guard('open-pull-request', async () => {
        const shared = {
          client: github(),
          paths: paths(),
          repo: requireEnv('GITHUB_REPOSITORY'),
          baseBranch: flags.base,
          parentSha: flags.parentSha,
          coAuthor: flags.coAuthor,
          brief: notes(),
          runId: process.env.GITHUB_RUN_ID,
          runAttempt: process.env.GITHUB_RUN_ATTEMPT,
          serverUrl: process.env.GITHUB_SERVER_URL,
        };
        const url =
          flags.pullRequest === ''
            ? await openPullRequest({
                ...shared,
                issue: parseIssue(flags.issue),
                branch: required(flags.branch, '--branch'),
              })
            : await openPullRequest({
                ...shared,
                pullRequest: parsePullRequest(flags.pullRequest),
                mergeRequested: flags.merge === 'true',
                appLogin: required(flags.appLogin, '--app-login'),
              });
        console.log(url);
      })
    );

  fixIssue
    .command('revise')
    .description('Steps only a run that revises an open bot pull request takes')
    .command('prepare')
    .description(
      'Check that the pull request may be revised, gather the feedback, the issue and the brief into tmp/fix-issue/, then check out its head and merge dev when that is needed'
    )
    .requiredOption('--pull-request <number>', 'Pull request to revise')
    .requiredOption('--dev-sha <sha>', 'Tip of the base branch the run started from')
    .requiredOption('--base <branch>', 'Base branch')
    .requiredOption('--requested-by <login>', 'Who dispatched the revise')
    .option('--merge <boolean>', 'true when the dispatch asked to merge the base branch', 'false')
    .option('--workflow-app-client-id <id>', 'Client ID of the fix-issue App')
    .action((flags: PrepareReviseFlags) =>
      guard('revise-prepare', async () => {
        const target = paths();
        await gateRevise({
          client: github(),
          repo: requireEnv('GITHUB_REPOSITORY'),
          paths: target,
          pullRequest: parsePullRequest(flags.pullRequest),
          devSha: flags.devSha,
          baseBranch: flags.base,
          mergeRequested: flags.merge === 'true',
          instructions: notes() ?? '',
          requestedBy: flags.requestedBy,
          workflowAppClientId: flags.workflowAppClientId,
        });
        const state = startRevise(target);
        writeStepOutputs({ merged: state.merge });
        console.log(
          `revise-prepare: revise ${state.ordinal} of #${state.pullRequest} at ${state.head} with ${state.items.length} feedback items${state.merge ? `, on a merge of ${state.dev} with ${state.conflicts.length} conflicting files` : ''}`
        );
      })
    );
}
