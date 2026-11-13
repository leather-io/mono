import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import { type CommandRunner, runCommand } from '../ci/exec.js';

const workflowFile = 'repo:fix-issue.yml';
const maxBriefBytes = 60_000;
const briefFilePattern = /^fix-issue-([1-9]\d*)\.md$/;

interface DispatchOptions {
  readonly runDir: string;
  readonly issue: number;
  readonly repo: string;
  readonly run?: CommandRunner;
}

function briefsDir(runDir: string): string {
  return path.join(runDir, 'briefs', 'bot');
}

function briefPath(runDir: string, issue: number): string {
  return path.join(briefsDir(runDir), `fix-issue-${issue}.md`);
}

export function briefIssues(runDir: string): number[] {
  const dir = briefsDir(runDir);
  if (!existsSync(dir)) throw new Error(`${dir} does not exist`);
  const issues = readdirSync(dir)
    .map(file => briefFilePattern.exec(file)?.[1])
    .filter(issue => issue !== undefined)
    .map(Number)
    .sort((a, b) => a - b);
  if (issues.length === 0) throw new Error(`${dir} holds no fix-issue-<n>.md briefs`);
  return issues;
}

export function dispatch({ runDir, issue, repo, run = runCommand }: DispatchOptions): string {
  const brief = briefPath(runDir, issue);
  if (!existsSync(brief)) throw new Error(`no brief at ${brief}`);
  const bytes = statSync(brief).size;
  if (bytes > maxBriefBytes) {
    throw new Error(`${brief} is ${bytes} bytes, over the ${maxBriefBytes} byte limit; trim it`);
  }
  const args = [
    'workflow',
    'run',
    workflowFile,
    '--repo',
    repo,
    '--ref',
    'dev',
    '-f',
    `issue=${issue}`,
    '-F',
    `notes=@${brief}`,
  ];
  const result = run('gh', args, { cwd: runDir });
  if (result.status !== 0) {
    throw new Error(
      `GitHub refused the dispatch: ${result.stderr.trim()}\nSomeone with write access to ${repo} can run:\ngh ${args.join(' ')}`
    );
  }
  return `${result.stdout}${result.stderr}`.trim();
}
