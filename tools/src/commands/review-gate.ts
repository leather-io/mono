import type { Command } from 'commander';

import * as reviewGate from '../review-gate/steps.js';

export function registerReviewGateCommands(program: Command): void {
  const gate = program
    .command('review-gate')
    .description('The repo:review-gate workflow, configured through the job environment');

  gate
    .command('check')
    .description('Count independent approvals on a pull request and report the gate')
    .requiredOption('--pr <number>', 'the pull request to check')
    .action(reviewGate.runCheck);

  const appToken = gate
    .command('app-token')
    .description('Installation token of the review gate App, whose private key stays in AWS KMS');
  appToken
    .command('create')
    .description(
      'Sign the App JWT with KMS, then write a token limited to this repository and the gate permissions to the step output'
    )
    .requiredOption('--client-id <id>', 'Client ID of the review gate App')
    .requiredOption('--kms-key-id <id>', 'KMS key ID, ARN or alias holding the App private key')
    .action(reviewGate.createAppToken);
  appToken
    .command('revoke')
    .description('Revoke the installation token in GITHUB_TOKEN')
    .action(reviewGate.revokeAppToken);
}
