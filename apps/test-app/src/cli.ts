// Terminal access to the catalog and the verifiers, for agents that would
// rather read JSON than a browser.
//
// It does NOT drive a wallet: that needs a browser with the extension loaded,
// which is what the app and `window.__leatherTestApp` are for. What it does do
// is everything that is pure — list the matrix, and analyse a PSBT or a Stacks
// transaction someone already got out of a wallet.
//
// Run it with: pnpm --filter @leather.io/test-app catalog -- <command>
import { builderCombinationSpecs, specBuilders } from './methods/builders';
import { rpcMethods, rpcTags, specsWithTag } from './rpc-methods';
import { scenarios } from './scenarios/scenarios';
import type { NetworkMode, RpcMethodSpec } from './types';
import { decodePsbt } from './verifiers/psbt-decode';
import { verifyPsbtSignatures } from './verifiers/psbt-signatures';
import { verifySighashSemantics } from './verifiers/sighash-semantics';
import { decodeStxTransaction } from './verifiers/stx-decode';

const usage = `Leather RPC test app — catalog and offline verifiers

  list [--tag <tag>] [--category <name>]   every spec, as JSON
  tags                                     every tag in the catalog
  scenarios                                every multi-step flow
  builders                                 request families declared as choices
  builder <id>                             one builder's curated combinations
  verify-psbt <hex>                        per-input signatures + sighash semantics
  decode-psbt <hex> [--mode <mode>]        readable inputs, outputs and fee
  decode-stx <hex>                         sender, nonce, fee, post conditions, payload

  --mode is mainnet | testnet | regtest (default mainnet).

This command never talks to a wallet. To run specs against one, open the app
and use window.__leatherTestApp.run(id) / .runTag(tag).`;

function summarize(spec: RpcMethodSpec) {
  return {
    id: spec.id,
    method: spec.method,
    label: spec.label,
    category: spec.category,
    description: spec.description,
    expect: spec.expect ?? 'manual',
    requires: spec.requires ?? [],
    tags: spec.tags ?? [],
    hasVerifier: !!spec.verify,
  };
}

function flag(argv: string[], name: string): string | undefined {
  const index = argv.indexOf(`--${name}`);
  return index === -1 ? undefined : argv[index + 1];
}

function print(value: unknown): void {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(value, null, 2));
}

function requireHex(argv: string[], command: string): string {
  const value = argv[1];
  if (!value || value.startsWith('--')) throw new Error(`${command} needs a hex argument`);
  return value;
}

function networkMode(argv: string[]): NetworkMode {
  const mode = flag(argv, 'mode') ?? 'mainnet';
  if (mode !== 'mainnet' && mode !== 'testnet' && mode !== 'regtest')
    throw new Error(`Unknown mode ${mode} — expected mainnet, testnet or regtest`);
  return mode;
}

export function run(argv: string[]): void {
  const [command] = argv;

  switch (command) {
    case 'list': {
      const tag = flag(argv, 'tag');
      const category = flag(argv, 'category');
      let specs = tag ? specsWithTag(tag) : rpcMethods;
      if (category) specs = specs.filter(spec => spec.category === category);
      print(specs.map(summarize));
      return;
    }
    case 'tags':
      print(rpcTags().map(tag => ({ tag, count: specsWithTag(tag).length })));
      return;
    case 'builders':
      print(
        specBuilders.map(builder => ({
          id: builder.id,
          label: builder.label,
          description: builder.description,
          category: builder.category,
          combinations: builder.combinations().length,
          fields: builder.fields.map(field => ({
            key: field.key,
            label: field.label,
            options: field.options(builder.defaults).map(option => option.label),
          })),
          defaults: builder.defaults,
        }))
      );
      return;
    case 'builder': {
      const builderId = argv[1];
      if (!builderId || builderId.startsWith('--')) throw new Error('builder needs an id');
      print(builderCombinationSpecs(builderId).map(summarize));
      return;
    }
    case 'scenarios':
      print(
        scenarios.map(scenario => ({
          id: scenario.id,
          label: scenario.label,
          description: scenario.description,
          requires: scenario.requires ?? [],
          steps: scenario.steps.map(step => ({
            id: step.id,
            label: step.label,
            instruction: step.instruction,
          })),
        }))
      );
      return;
    case 'verify-psbt': {
      const psbtHex = requireHex(argv, 'verify-psbt');
      print({
        signatures: verifyPsbtSignatures(psbtHex),
        semantics: verifySighashSemantics(psbtHex),
      });
      return;
    }
    case 'decode-psbt':
      print(decodePsbt(requireHex(argv, 'decode-psbt'), networkMode(argv)));
      return;
    case 'decode-stx':
      print(decodeStxTransaction(requireHex(argv, 'decode-stx')));
      return;
    default:
      // eslint-disable-next-line no-console
      console.log(usage);
      if (command) process.exitCode = 1;
  }
}

run(process.argv.slice(2));
