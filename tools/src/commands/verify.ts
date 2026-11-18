import type { Command } from 'commander';

import { type VerifyCliOptions, runVerify } from '../verify/run.js';
import { verifyExitCodes } from '../verify/verify-contract.js';

export function registerVerifyCommands(program: Command): void {
  program
    .command('verify')
    .description(
      'Open one mapped screen under its feature-map preconditions, capture screenshot, console, network, background errors, state and accessibility artifacts, and give a verdict'
    )
    .argument('<app>', 'App (extension)')
    .option('--feature <id>', 'Feature id from apps/extension/tests/feature-map/*.features.ts')
    .option('--route <path>', 'Route to open instead of a feature, e.g. /send/btc')
    .option('--signed-in', 'Seed the test wallet and stay unlocked (default for routes)')
    .option('--signed-out', 'Start with no wallet')
    .option('--locked', 'Seed the test wallet, then lock it')
    .option(
      '--account-type <type>',
      "Wallet to seed: software, ledger, mixed or policy (default: the entry's accountType, else software)"
    )
    .option(
      '--network <id>',
      "Wallet network id to activate, e.g. testnet4 (default: the entry's network, else mainnet)"
    )
    .option('--connect-test-app', 'Seed localhost:3000 as a connected dApp (default for rpc runs)')
    .option('--no-connect-test-app', 'Do not seed the test app permission')
    .option(
      '--flags <list>',
      'LaunchDarkly overrides, e.g. releaseOnramperBuy=true,swapSbtcBridging=false'
    )
    .option(
      '--mocks <set>',
      "'default' (the entry's mocks), 'none' (no mocks, real network) or a comma-separated list of mock functions",
      'default'
    )
    .option('--ready <testId>', 'data-testid that marks the screen as ready')
    .option(
      '--rpc <method>',
      'Drive the screen through an RPC request from the test app; catalog:<id> takes the params from the test-app catalog'
    )
    .option('--params <file>', 'JSON file with the RPC params')
    .option(
      '--state <slices>',
      "Persisted slices to write to state.json: a comma-separated list or 'all' (default active,networks,wallets)"
    )
    .option(
      '--allow-console-errors',
      'Downgrade console, page, background and real-request errors from blocking to reported'
    )
    .option(
      '--out <dir>',
      'Artifact directory (default apps/extension/verify-results/<slug>-<timestamp>)'
    )
    .option('--timeout <ms>', 'How long to wait for the ready selector (default 30000)')
    .option('--build', 'Run the extension test build first')
    .exitOverride(error => process.exit(error.exitCode === 0 ? 0 : verifyExitCodes.usage))
    .action((app: string, options: VerifyCliOptions) => {
      process.exitCode = runVerify(app, options);
    });
}
