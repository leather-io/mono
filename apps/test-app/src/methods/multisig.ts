// Multisig (policy account) requests: registering BTC / STX multisig accounts,
// spending from one — which yields a PROPOSAL for the other co-signers instead
// of a txid — and co-signing a vault PSBT.
//
// Every vault here is built around the CONNECTED wallet's own XPUB (read from
// getAddresses) plus the co-signers in constants.ts, in the same
// `wsh(sortedmulti(k, xpub/0/i, …))` shape the multisig dApp registers — the
// only shape Ledger policy registration and bond vaults accept.
import { cosignerXpubsFor, sortedMultiDescriptor } from '../builders/descriptors';
import { collectPsbtKeys } from '../builders/keys';
import { buildPsbtScenario } from '../builders/psbt';
import { MULTISIG_THRESHOLD, STX_COSIGNER_PUBLIC_KEYS } from '../constants';
import { networkModeOf } from '../networks';
import { type ParamsOf, type RpcMethodSpec, networkOf } from '../types';
import { verifyProposal, verifySignedPsbt } from '../verifiers/spec-verifiers';
import { fetchAccountKeys, fetchStxAccount, resolveOwnBtcRecipient } from '../wallet';

async function vaultDescriptorFor(ctx: Parameters<typeof fetchAccountKeys>[0]): Promise<string> {
  const network = networkOf(ctx);
  const { xpub } = await fetchAccountKeys(ctx);
  return sortedMultiDescriptor({
    ownXpub: xpub,
    cosignerXpubs: cosignerXpubsFor(networkModeOf(network)),
  });
}

export const multisigMethods: RpcMethodSpec[] = [
  // ── Registering ───────────────────────────────────────────────────────────
  {
    id: 'btc_addAccount',
    method: 'btc_addAccount',
    label: 'btc_addAccount (2-of-3, xpubs)',
    category: 'Multisig',
    description:
      'Reads your account xpub (getAddresses prompt) and registers a 2-of-3 BTC policy account from wsh(sortedmulti(2, yourXpub/0/0, cosigner…)) — the exact descriptor shape the multisig dApp sends. Your wallet is a signer of the result, so sendTransfer-multisig can propose from it.',
    async params(ctx) {
      return {
        descriptor: await vaultDescriptorFor(ctx),
        name: 'RPC test multisig',
        network: networkOf(ctx),
      } satisfies ParamsOf<'btc_addAccount'>;
    },
    expect: 'success',
    requires: ['singlesig'],
    tags: ['multisig'],
  },
  {
    id: 'stx_addAccount',
    method: 'stx_addAccount',
    label: 'stx_addAccount (2-of-3)',
    category: 'Multisig',
    description:
      'Reads your STX key (getAddresses prompt) and registers a 2-of-3 STX multisig from ORDERED pubkeys — yours first, then the co-signers in constants.ts. Order defines the address.',
    async params(ctx) {
      const { publicKey } = await fetchStxAccount(ctx);
      return {
        publicKeys: [publicKey, ...STX_COSIGNER_PUBLIC_KEYS],
        threshold: MULTISIG_THRESHOLD,
        name: 'RPC test multisig',
        network: networkOf(ctx),
      } satisfies ParamsOf<'stx_addAccount'>;
    },
    expect: 'success',
    requires: ['singlesig'],
    tags: ['multisig'],
  },

  // ── Spending from a policy account ───────────────────────────────────────
  {
    id: 'sendTransfer-multisig',
    method: 'sendTransfer',
    label: 'sendTransfer (from multisig → proposal)',
    category: 'Multisig',
    description:
      "Select a multisig (policy) account in the wallet first, then fire. Instead of { txid } the wallet answers { proposalId, status: 'proposed', transaction } — the UNSIGNED tx — for co-signers to approve in the multisig dApp.",
    async params(ctx) {
      return {
        recipients: [{ address: await resolveOwnBtcRecipient(ctx), amount: '10000' }],
        network: networkOf(ctx),
      } satisfies ParamsOf<'sendTransfer'>;
    },
    expect: 'manual',
    requires: ['btc-policy'],
    tags: ['multisig'],
    verify: verifyProposal(),
  },

  // ── Co-signing ────────────────────────────────────────────────────────────
  {
    id: 'signPsbt-multisig-cosign',
    method: 'signPsbt',
    label: 'signPsbt (multisig co-sign)',
    category: 'Multisig',
    description:
      'What a co-signer does. Builds the same 2-of-3 vault as btc_addAccount and sends a PSBT spending a fictitious outpoint at it, together with the descriptor. Fire it from a SINGLESIG account: the wallet adds its partial signature and returns the PSBT for the coordinator. (With a Bitcoin policy account selected, signPsbt only accepts bond-template descriptors.)',
    async params(ctx) {
      const keys = await collectPsbtKeys(ctx, ['sortedmulti']);
      const { psbtHex, descriptor } = buildPsbtScenario(
        { inputs: [{ kind: 'sortedmulti' }] },
        keys
      );
      return { hex: psbtHex, descriptor, broadcast: false } satisfies ParamsOf<'signPsbt'>;
    },
    expect: 'success',
    requires: ['singlesig'],
    tags: ['ci', 'multisig', 'psbt'],
    verify: verifySignedPsbt({ signedIndexes: [0] }),
  },
];
