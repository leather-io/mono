import type { Command } from 'commander';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import { checkBotBranchSecrets, formatGuardReport } from '../bot-branch-secret-guard/check.js';
import { getMonorepoRoot } from '../utils/paths.js';

const workflowsDirectory = '.github/workflows';
const defaultBaseline = '.github/bot-branch-secret-guard-baseline.json';

const baselineSchema = z.record(z.string(), z.array(z.string()));

interface CheckOptions {
  readonly baseline: string;
}

function check({ baseline }: CheckOptions): void {
  const root = getMonorepoRoot();
  const directory = path.join(root, workflowsDirectory);
  const sources = readdirSync(directory)
    .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
    .sort()
    .map(file => ({ file, content: readFileSync(path.join(directory, file), 'utf8') }));
  const allowed = baselineSchema.parse(JSON.parse(readFileSync(path.join(root, baseline), 'utf8')));
  const result = checkBotBranchSecrets(sources, allowed);
  const report = formatGuardReport(result);
  if (result.parseErrors.length + result.violations.length + result.stale.length > 0) {
    console.error(report);
    process.exitCode = 1;
    return;
  }
  console.log(report);
}

export function registerBotBranchSecretGuardCommands(program: Command): void {
  program
    .command('bot-branch-secret-guard')
    .description(
      'Checks on what workflows hand to code from branches anyone with write access can push'
    )
    .command('check')
    .description(
      'Fail when a job that runs on pull requests or on pushes to any branch gets secrets, an environment, or contents or id-token write without skipping bot/ branches'
    )
    .option(
      '--baseline <path>',
      'Jobs allowed to break the rule, relative to the repo root',
      defaultBaseline
    )
    .action(check);
}
