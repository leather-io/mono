import type { Command } from 'commander';

import {
  appJwt,
  createInstallationToken,
  kmsSigner,
  revokeInstallationToken,
} from '../fix-issue/app-token.js';
import { briefIssues, dispatch } from '../fix-issue/dispatch.js';
import { repoRoot } from '../fix-issue/git.js';
import { createGhCliClient, createGitHubClient } from '../fix-issue/github.js';
import { fetchIssue } from '../fix-issue/issue.js';
import { writeStepOutputs } from '../fix-issue/outputs.js';
import { fixIssuePaths } from '../fix-issue/paths.js';
import { openPullRequest } from '../fix-issue/pull-request.js';
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
import { verifyFix } from '../fix-issue/verify.js';

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
}

interface AppTokenFlags {
  readonly clientId: string;
  readonly kmsKeyId: string;
}

interface DispatchFlags {
  readonly runDir: string;
  readonly issue: string;
  readonly repo: string;
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

function parseIssue(value: string): number {
  if (!/^[1-9]\d*$/.test(value)) throw new Error(`'${value}' is not an issue number`);
  return Number(value);
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
      'Dispatch repo:fix-issue on dev for one brief of a run directory, through the gh login'
    )
    .requiredOption('--run-dir <dir>', 'Run directory holding briefs/bot/fix-issue-<n>.md')
    .requiredOption('--issue <number>', 'Issue number; for a group, the first issue of the brief')
    .option('--repo <owner/name>', 'Repository to dispatch in', defaultRepo)
    .action(({ runDir, issue, repo }: DispatchFlags) =>
      guard('fix-issue-dispatch', () => {
        console.log(dispatch({ runDir, issue: parseIssue(issue), repo }));
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
        const token = await createInstallationToken({
          appClient: createGitHubClient({ token: jwt, apiUrl }),
          tokenClient(installationToken) {
            return createGitHubClient({ token: installationToken, apiUrl });
          },
          repo,
        });
        console.log(`::add-mask::${token}`);
        writeStepOutputs({ token });
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
    .description('Commit the patch to the branch and open or update its pull request')
    .requiredOption('--issue <number>', 'Issue number')
    .requiredOption('--branch <branch>', 'Pull request branch')
    .requiredOption('--base <branch>', 'Base branch')
    .requiredOption('--parent-sha <sha>', 'Commit the patch was made against')
    .option('--co-author <login>', 'GitHub login to credit with a Co-authored-by trailer')
    .action(({ issue, branch, base, parentSha, coAuthor }: OpenPullRequestFlags) =>
      guard('open-pull-request', async () => {
        const url = await openPullRequest({
          client: github(),
          paths: paths(),
          repo: requireEnv('GITHUB_REPOSITORY'),
          issue: parseIssue(issue),
          branch,
          baseBranch: base,
          parentSha,
          coAuthor,
          runId: process.env.GITHUB_RUN_ID,
          runAttempt: process.env.GITHUB_RUN_ATTEMPT,
          serverUrl: process.env.GITHUB_SERVER_URL,
        });
        console.log(url);
      })
    );
}
