// A complete 2-of-2 multisig round trip using ONE wallet.
//
// Testing multisig normally needs teammates. It does not: accounts 0 and 1 of
// the same wallet are two independent keys, so the developer can play both
// co-signers by switching account between steps. That turns multisig from
// "look at the approval screen" into a transaction that either finalizes or
// does not.
//
// The steps stop short of broadcasting unless an Esplora API is configured —
// the inputs are fictitious, so finalization is the last checkable step.
import { hex } from '@scure/base';
import * as btc from '@scure/btc-signer';

import { sortedMultiDescriptor } from '../builders/descriptors';
import { buildSelfSpendPsbtHex, descriptorScript } from '../builders/psbt';
import { MULTISIG_THRESHOLD } from '../constants';
import { type Scenario, type ScenarioState, networkOf } from '../types';
import { fetchAccountKeys } from '../wallet';

interface RoundTripState extends ScenarioState {
  xpubs?: string[];
  descriptor?: string;
  psbtHex?: string;
  signedHexes?: string[];
}

function readState(state: ScenarioState): RoundTripState {
  return state;
}

function requireVault(state: ScenarioState): { descriptor: string; psbtHex: string } {
  const { descriptor, psbtHex } = readState(state);
  if (!descriptor || !psbtHex) throw new Error('Run the earlier steps first');
  return { descriptor, psbtHex };
}

export const multisigRoundTrip: Scenario = {
  id: 'multisig-roundtrip',
  label: '2-of-2 round trip (one wallet, two accounts)',
  description:
    'Collect a key from account 0 and account 1, build a 2-of-2 vault from them, co-sign a PSBT with each account in turn, then finalize it locally. No teammates and no funds required.',
  requires: ['singlesig'],
  tags: ['multisig', 'scenario'],
  steps: [
    {
      id: 'collect-account-0',
      label: 'Collect the key of account 0',
      instruction: 'Select ACCOUNT 1 (index 0) in the wallet, then run this step.',
      async run({ ctx, state }) {
        const { xpub, address } = await fetchAccountKeys(ctx);
        const existing = readState(state).xpubs ?? [];
        return {
          summary: `account 0 → ${address}`,
          state: { xpubs: [...existing.filter(key => key !== xpub), xpub] },
        };
      },
    },
    {
      id: 'collect-account-1',
      label: 'Collect the key of account 1',
      instruction: 'Now switch the wallet to ACCOUNT 2 (index 1) and run this step.',
      async run({ ctx, state }) {
        const { xpub, address } = await fetchAccountKeys(ctx);
        const existing = readState(state).xpubs ?? [];
        if (existing.includes(xpub))
          return {
            summary: 'same key as account 0 — switch account in the wallet and run again',
            checks: [{ label: 'two distinct keys collected', ok: false }],
          };
        return {
          summary: `account 1 → ${address}`,
          state: { xpubs: [...existing, xpub] },
          checks: [{ label: 'two distinct keys collected', ok: true }],
        };
      },
    },
    {
      id: 'build-vault',
      label: 'Build the 2-of-2 vault',
      run({ state }) {
        const xpubs = readState(state).xpubs ?? [];
        if (xpubs.length < 2) throw new Error('Collect both account keys first');
        const [ownXpub, ...cosignerXpubs] = xpubs;
        const descriptor = sortedMultiDescriptor({
          ownXpub,
          cosignerXpubs,
          threshold: MULTISIG_THRESHOLD,
        });
        const lock = descriptorScript(descriptor);
        return {
          summary: descriptor,
          state: { descriptor, psbtHex: buildSelfSpendPsbtHex(lock) },
          checks: [{ label: 'vault descriptor compiles to a script', ok: !!lock.script.length }],
        };
      },
    },
    {
      id: 'register',
      label: 'Register the vault in the wallet',
      instruction: 'Optional — makes the vault visible as a policy account.',
      async run({ ctx, state }) {
        const { descriptor } = requireVault(state);
        const result = await ctx.request('btc_addAccount', {
          descriptor,
          name: 'RPC test 2-of-2',
          network: networkOf(ctx),
        });
        const address =
          result && typeof result === 'object'
            ? (result as { address?: string }).address
            : undefined;
        return { summary: `registered at ${address ?? 'unknown address'}` };
      },
    },
    {
      id: 'cosign-account-0',
      label: 'Co-sign with account 0',
      instruction: 'Switch the wallet back to ACCOUNT 1 (index 0), a SINGLESIG account.',
      async run({ ctx, state }) {
        const { descriptor, psbtHex } = requireVault(state);
        const result = await ctx.request('signPsbt', {
          hex: psbtHex,
          descriptor,
          broadcast: false,
        });
        const signed = (result as { hex?: string }).hex;
        if (!signed) throw new Error('signPsbt returned no hex');
        return {
          summary: 'first signature collected',
          state: { signedHexes: [signed] },
          checks: [{ label: 'wallet returned a signed PSBT', ok: true }],
        };
      },
    },
    {
      id: 'cosign-account-1',
      label: 'Co-sign with account 1',
      instruction: 'Switch the wallet to ACCOUNT 2 (index 1) and run this step.',
      async run({ ctx, state }) {
        const { descriptor, psbtHex } = requireVault(state);
        const result = await ctx.request('signPsbt', {
          hex: psbtHex,
          descriptor,
          broadcast: false,
        });
        const signed = (result as { hex?: string }).hex;
        if (!signed) throw new Error('signPsbt returned no hex');
        const existing = readState(state).signedHexes ?? [];
        return {
          summary: 'second signature collected',
          state: { signedHexes: [...existing, signed] },
          checks: [{ label: 'wallet returned a signed PSBT', ok: true }],
        };
      },
    },
    {
      id: 'combine-and-finalize',
      label: 'Combine both signatures and finalize',
      run({ state }) {
        const hexes = readState(state).signedHexes ?? [];
        if (hexes.length < 2) throw new Error('Collect both signatures first');
        const [first, ...rest] = hexes;
        const combined = btc.Transaction.fromPSBT(hex.decode(first), {
          allowUnknownInputs: true,
          allowUnknownOutputs: true,
        });
        rest.forEach(other => {
          combined.combine(
            btc.Transaction.fromPSBT(hex.decode(other), {
              allowUnknownInputs: true,
              allowUnknownOutputs: true,
            })
          );
        });
        const signatures = combined.getInput(0).partialSig?.length ?? 0;
        try {
          combined.finalize();
        } catch (error) {
          return {
            summary: 'could not finalize',
            checks: [
              {
                label: `${MULTISIG_THRESHOLD} signatures satisfy the vault`,
                ok: false,
                detail: error instanceof Error ? error.message : String(error),
              },
            ],
          };
        }
        return {
          summary: `finalized with ${signatures} signatures`,
          state: { finalTxHex: hex.encode(combined.extract()) },
          checks: [
            { label: 'both signatures landed on the input', ok: signatures >= MULTISIG_THRESHOLD },
            { label: 'transaction finalizes', ok: true },
          ],
        };
      },
    },
  ],
};
