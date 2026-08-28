// Multisig (policy account) requests: registering BTC / STX multisig accounts,
// listing them, spending from one — which yields a PROPOSAL for the other
// co-signers instead of a txid — and co-signing a vault PSBT.
//
// Every account here is built around the CONNECTED wallet's own key (read from
// getAddresses) plus the co-signers in constants.ts, so the wallet is a real
// signer of what it registers and co-signs — on any Leather install.
import {
  BTC_COSIGNER_PUBLIC_KEYS,
  MULTISIG_THRESHOLD,
  STX_COSIGNER_PUBLIC_KEYS,
} from '../constants';
import type { ParamsOf, RpcMethodSpec } from '../types';
import { fetchNativeSegwitPubkey, fetchStxAccount, resolveRegtestBtcRecipient } from '../wallet';
import {
  buildSelfSpendPsbtHex,
  sortedMultiCosignDescriptor,
  sortedMultiScript,
} from '../wallet-psbt';

const btcMultisigLabel = `${MULTISIG_THRESHOLD}-of-${BTC_COSIGNER_PUBLIC_KEYS.length + 1}`;
const stxMultisigLabel = `${MULTISIG_THRESHOLD}-of-${STX_COSIGNER_PUBLIC_KEYS.length + 1}`;

export const multisigMethods: RpcMethodSpec[] = [
  {
    id: 'getAddresses-policy-accounts',
    method: 'getAddresses',
    label: 'getAddresses (policy accounts)',
    category: 'Multisig',
    description:
      'Shares addresses INCLUDING policy accounts (multisig) by passing allowPolicyAccounts: true. A p2wsh PolicyAddress carries its `descriptor`.',
    params: { allowPolicyAccounts: true } satisfies ParamsOf<'getAddresses'>,
  },

  // ── Registering ───────────────────────────────────────────────────────────
  {
    id: 'btc_addAccount',
    method: 'btc_addAccount',
    label: `btc_addAccount (${btcMultisigLabel})`,
    category: 'Multisig',
    description: `Reads your native-segwit key (getAddresses prompt) and registers a ${btcMultisigLabel} BTC policy account from a wsh(sortedmulti) of it + the co-signers in constants.ts (override with VITE_TEST_APP_BTC_COSIGNER_PUBLIC_KEYS) on mainnet; returns the derived address. Your wallet is a signer of the result, so sendTransfer-multisig can propose from it.`,
    async params(ctx) {
      return {
        descriptor: sortedMultiCosignDescriptor(await fetchNativeSegwitPubkey(ctx)),
        name: 'RPC test multisig',
        network: 'mainnet',
      } satisfies ParamsOf<'btc_addAccount'>;
    },
  },
  {
    id: 'stx_addAccount',
    method: 'stx_addAccount',
    label: `stx_addAccount (${stxMultisigLabel})`,
    category: 'Multisig',
    description: `Reads your STX key (getAddresses prompt) and registers a ${stxMultisigLabel} STX multisig account from ORDERED pubkeys — yours first, then the co-signers in constants.ts (override with VITE_TEST_APP_STX_COSIGNER_PUBLIC_KEYS) — on mainnet; returns the SM… address.`,
    async params(ctx) {
      const { publicKey } = await fetchStxAccount(ctx);
      return {
        publicKeys: [publicKey, ...STX_COSIGNER_PUBLIC_KEYS],
        threshold: MULTISIG_THRESHOLD,
        name: 'RPC test multisig',
        network: 'mainnet',
      } satisfies ParamsOf<'stx_addAccount'>;
    },
  },

  // ── Spending from a policy account ───────────────────────────────────────
  {
    id: 'sendTransfer-multisig',
    method: 'sendTransfer',
    label: 'sendTransfer (from multisig → proposal)',
    category: 'Multisig',
    description:
      "Select a multisig (policy) account in the wallet first, then fire. Sends 10,000 sats on the private network to the selected account's own regtest address (getAddresses prompt; or VITE_TEST_APP_BTC_RECIPIENT_REGTEST). Instead of { txid } the wallet answers { proposalId, status: 'proposed', transaction } — the UNSIGNED tx — for co-signers to approve in the multisig dApp.",
    async params(ctx) {
      return {
        recipients: [{ address: await resolveRegtestBtcRecipient(ctx), amount: '10000' }],
        network: 'private',
      } satisfies ParamsOf<'sendTransfer'>;
    },
  },

  // ── Co-signing a vault PSBT ──────────────────────────────────────────────
  {
    id: 'signPsbt-multisig-cosign',
    method: 'signPsbt',
    label: 'signPsbt (multisig co-sign)',
    category: 'Multisig',
    description: `What a co-signer does. Reads your native-segwit key (getAddresses prompt), builds the same ${btcMultisigLabel} wsh(sortedmulti) as btc_addAccount, and sends a PSBT spending a fictitious outpoint at that vault together with the descriptor. Fire it from a SINGLESIG account: the wallet adds its partial signature and returns the PSBT for the coordinator. (With a Bitcoin policy account selected, signPsbt only accepts bond-template descriptors.)`,
    async params(ctx) {
      const descriptor = sortedMultiCosignDescriptor(await fetchNativeSegwitPubkey(ctx));
      return {
        hex: buildSelfSpendPsbtHex(sortedMultiScript(descriptor)),
        descriptor,
        broadcast: false,
      } satisfies ParamsOf<'signPsbt'>;
    },
  },
];
