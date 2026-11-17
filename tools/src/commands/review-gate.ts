import type { Command } from 'commander';

import * as reviewGate from '../review-gate/steps.js';

export function registerReviewGateCommands(program: Command): void {
  const gate = program
    .command('review-gate')
    .description('The repo:review-gate workflow, configured through the job environment');

  gate
    .command('check')
    .description(
      'Decide how many reviews a pull request needs, then count approvals and report the gate'
    )
    .requiredOption('--pr <number>', 'the pull request to check')
    .option('--requested-by <login>', 'only run when this commenter has write access')
    .action(reviewGate.runCheck);
  gate
    .command('sweep')
    .description('Re-count approvals on every open fork pull request into dev')
    .action(reviewGate.runSweep);
}
