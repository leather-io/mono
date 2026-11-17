import type { Command } from 'commander';
import { appendFileSync } from 'node:fs';

import { checkBotPrApprovals } from '../bot-pr-approvals/check.js';
import { createGitHubClient } from '../fix-issue/github.js';

interface CheckFlags {
  readonly pr: string;
  readonly requiredApprovals: string;
}

const defaultRequiredApprovals = '2';
const positiveNumberPattern = /^[1-9]\d*$/;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

function parsePositive(value: string, description: string): number {
  if (!positiveNumberPattern.test(value)) throw new Error(`'${value}' is not ${description}`);
  return Number(value);
}

async function check({ pr, requiredApprovals }: CheckFlags): Promise<void> {
  const required = parsePositive(
    requiredApprovals || defaultRequiredApprovals,
    'a positive number of required approvals'
  );
  const number = parsePositive(pr, 'a pull request number');
  const verdict = await checkBotPrApprovals({
    client: createGitHubClient({
      token: requireEnv('GH_TOKEN'),
      apiUrl: process.env.GITHUB_API_URL,
    }),
    repo: requireEnv('GITHUB_REPOSITORY'),
    number,
    requiredApprovals: required,
  });
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (summaryFile) appendFileSync(summaryFile, `${verdict.summary.join('\n')}\n`);
  if (verdict.passed) {
    console.log(verdict.messages.join('\n'));
    return;
  }
  console.error(verdict.messages.join('\n'));
  process.exitCode = 1;
}

export function registerBotPrApprovalsCommands(program: Command): void {
  program
    .command('bot-pr-approvals')
    .description('The repo:bot-pr-approvals workflow check')
    .command('check')
    .description(
      'Fail a fix-issues bot pull request that changes .github/, is approved by whoever dispatched it, or lacks enough approvals from other reviewers'
    )
    .requiredOption('--pr <number>', 'Pull request number')
    .option(
      '--required-approvals <count>',
      'Approvals needed from reviewers who did not dispatch the fix',
      defaultRequiredApprovals
    )
    .action(async (flags: CheckFlags) => {
      try {
        await check(flags);
      } catch (error) {
        console.error(
          `bot-pr-approvals: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exitCode = 1;
      }
    });
}
