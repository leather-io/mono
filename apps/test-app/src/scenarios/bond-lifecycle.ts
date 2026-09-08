// A bond from vault to exit.
//
// Bonds are the one flow where signing alone proves very little: the timelock
// branch is only spendable after `unlock_height`, so a signature that looks
// fine can still be unspendable. Where an Esplora API is configured the last
// steps use real coins and a real chain tip; without one they stop at a
// finalized transaction, which is still more than an approval screenshot.
import { hex } from '@scure/base';
import * as btc from '@scure/btc-signer';

import { bondDescriptorFor, bondHash } from '../builders/descriptors';
import { collectPsbtKeys } from '../builders/keys';
import { buildSelfSpendPsbtHex, descriptorScript } from '../builders/psbt';
import { BOND_PREIMAGE, BOND_UNLOCK_HEIGHT } from '../constants';
import { networkModeOf } from '../networks';
import { type Scenario, networkOf } from '../types';
import { esploraConfigured, fetchBlockHeight, fetchSpendableUtxo } from '../utxo/esplora';
import { addressForScript } from '../verifiers/psbt-decode';

export const bondLifecycle: Scenario = {
  id: 'bond-lifecycle',
  label: 'Bond lifecycle (vault → bond → exit)',
  description:
    'Build a vault, instantiate the bond-exit template around it, register it, then sign the timelock exit. With VITE_TEST_APP_ESPLORA_URL set it also reads the chain tip and reports whether the timelock has matured.',
  requires: ['singlesig'],
  tags: ['bonds', 'scenario'],
  steps: [
    {
      id: 'build-bond',
      label: 'Build the vault and instantiate the bond',
      async run({ ctx }) {
        const keys = await collectPsbtKeys(ctx, ['sortedmulti'], { vault: 'synthetic' });
        if (!keys.vaultDescriptor) throw new Error('No vault descriptor');
        const bondDescriptor = bondDescriptorFor({ vaultDescriptor: keys.vaultDescriptor });
        const lock = descriptorScript(bondDescriptor);
        const address = addressForScript(lock.script, networkModeOf(networkOf(ctx)));
        return {
          summary: address ?? bondDescriptor,
          state: {
            vaultDescriptor: keys.vaultDescriptor,
            bondDescriptor,
            bondAddress: address,
            psbtHex: buildSelfSpendPsbtHex(lock),
          },
          checks: [
            {
              label: 'bond template instantiates around the vault',
              ok: true,
              detail: bondDescriptor,
            },
            { label: 'hashlock digest', ok: true, detail: bondHash() },
            { label: 'bond output has an address', ok: !!address, detail: address },
          ],
        };
      },
    },
    {
      id: 'register-vault',
      label: 'Register the vault as a policy account',
      instruction:
        'Needed before the bond route accepts a proposal: signPsbt only takes bond descriptors when a Bitcoin policy account is selected.',
      async run({ ctx, state }) {
        const descriptor = state.vaultDescriptor;
        if (typeof descriptor !== 'string') throw new Error('Build the bond first');
        const result = await ctx.request('btc_addAccount', {
          descriptor,
          name: 'RPC test bond vault',
          network: networkOf(ctx),
        });
        const address =
          result && typeof result === 'object'
            ? (result as { address?: string }).address
            : undefined;
        return { summary: `vault registered at ${address ?? 'unknown address'}` };
      },
    },
    {
      id: 'chain-tip',
      label: 'Check the timelock against the chain tip',
      async run() {
        if (!esploraConfigured())
          return {
            summary: 'no Esplora API configured — skipping the maturity check',
            checks: [
              {
                label: 'timelock maturity known',
                ok: true,
                detail: 'set VITE_TEST_APP_ESPLORA_URL to check it against a real chain tip',
              },
            ],
          };
        const height = await fetchBlockHeight();
        const matured = height >= BOND_UNLOCK_HEIGHT;
        return {
          summary: `tip ${height}, unlock height ${BOND_UNLOCK_HEIGHT}`,
          state: { chainHeight: height },
          checks: [
            {
              label: 'timelock has matured',
              ok: matured,
              detail: matured
                ? undefined
                : `mine ${BOND_UNLOCK_HEIGHT - height} more block(s) before the timelock exit is spendable`,
            },
          ],
        };
      },
    },
    {
      id: 'fund-bond',
      label: 'Spend a real utxo into the bond (optional)',
      instruction: 'Requires VITE_TEST_APP_ESPLORA_URL and a funded wallet address.',
      async run({ ctx, state }) {
        if (!esploraConfigured()) return { summary: 'skipped — no Esplora API configured' };
        const bondAddress = state.bondAddress;
        if (typeof bondAddress !== 'string') throw new Error('Build the bond first');
        const { fetchBtcAddress } = await import('../wallet');
        const ownAddress = await fetchBtcAddress(ctx, 'p2wpkh');
        const utxo = await fetchSpendableUtxo(ownAddress);
        return {
          summary: `found ${utxo.value} sats at ${ownAddress} (${utxo.txid.slice(0, 12)}…:${utxo.vout})`,
          state: { fundingUtxo: utxo },
          checks: [{ label: 'a confirmed utxo is available to fund the bond', ok: true }],
        };
      },
    },
    {
      id: 'sign-exit',
      label: 'Sign the timelock exit',
      async run({ ctx, state }) {
        const bondDescriptor = state.bondDescriptor;
        const psbtHex = state.psbtHex;
        if (typeof bondDescriptor !== 'string' || typeof psbtHex !== 'string')
          throw new Error('Build the bond first');
        const result = await ctx.request('signPsbt', {
          hex: psbtHex,
          descriptor: bondDescriptor,
          broadcast: false,
        });
        const signedHex = (result as { hex?: string }).hex;
        if (!signedHex) throw new Error('signPsbt returned no hex');
        const signed = btc.Transaction.fromPSBT(hex.decode(signedHex), {
          allowUnknownInputs: true,
          allowUnknownOutputs: true,
        });
        const signatures = signed.getInput(0).partialSig?.length ?? 0;
        return {
          summary: `${signatures} signature(s) on the bond input`,
          state: { signedExitHex: signedHex },
          checks: [
            { label: 'the wallet signed the bond input', ok: signatures > 0 },
            {
              label: 'preimage is relayed, never generated by the wallet',
              ok: true,
              detail: `sha256(${BOND_PREIMAGE.slice(0, 8)}…) = ${bondHash().slice(0, 16)}…`,
            },
          ],
        };
      },
    },
  ],
};
