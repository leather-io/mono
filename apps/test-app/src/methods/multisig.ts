// Multisig (policy account) requests: registering BTC / STX multisig accounts,
// listing them, spending from one — which yields a PROPOSAL for the other
// co-signers instead of a txid — co-signing a vault PSBT or a multisig Stacks
// transaction, and the two commitment signatures a proposal is authorised
// with.
//
// Every vault here is built around the CONNECTED wallet's own XPUB (read from
// getAddresses) plus the co-signers in constants.ts, in the same
// `wsh(sortedmulti(k, xpub/0/i, …))` shape the multisig dApp registers — the
// only shape Ledger policy registration and bond vaults accept.
import { Cl, serializeCV, stringAsciiCV } from '@stacks/transactions';

import {
  cosignerXpubsFor,
  legacyRawPubkeyDescriptor,
  sortedMultiDescriptor,
} from '../builders/descriptors';
import { collectPsbtKeys } from '../builders/keys';
import { buildPsbtScenario } from '../builders/psbt';
import { buildUnsignedMultisigStxTransferHex } from '../builders/stx-tx';
import { MULTISIG_THRESHOLD, STX_COSIGNER_PUBLIC_KEYS, STX_RECIPIENT } from '../constants';
import { networkModeOf } from '../networks';
import { type ParamsOf, type RpcMethodSpec, networkOf } from '../types';
import { verifyProposal, verifySignedPsbt } from '../verifiers/spec-verifiers';
import {
  fetchAccountKeys,
  fetchNativeSegwitPubkey,
  fetchStxAccount,
  resolveOwnBtcRecipient,
} from '../wallet';

// SIP-018 domain the multisig coordinator commits a proposal under. Mirrors
// buildStxProposalDomain in @leather.io/stacks; the tag and version are part
// of the signature, so they cannot be approximated.
const proposalDomainTag = 'leather-multisig-proposal-v1';
const stxMainnetChainId = 1;
const stxTestnetChainId = 2147483648;

function proposalDomain(network: string): string {
  return serializeCV(
    Cl.tuple({
      name: stringAsciiCV(proposalDomainTag),
      version: stringAsciiCV('1'),
      'chain-id': Cl.uint(
        networkModeOf(network) === 'mainnet' ? stxMainnetChainId : stxTestnetChainId
      ),
    })
  );
}

// A plausible 32-byte proposal hash. The coordinator derives the real one from
// the proposal payload; what matters here is the shape the wallet is asked to
// sign over.
const sampleProposalHash = 'a'.repeat(64);

async function vaultDescriptorFor(ctx: Parameters<typeof fetchAccountKeys>[0]): Promise<string> {
  const network = networkOf(ctx);
  const { xpub } = await fetchAccountKeys(ctx);
  return sortedMultiDescriptor({
    ownXpub: xpub,
    cosignerXpubs: cosignerXpubsFor(networkModeOf(network)),
  });
}

export const multisigMethods: RpcMethodSpec[] = [
  {
    id: 'getAddresses-policy-accounts',
    method: 'getAddresses',
    label: 'getAddresses (policy accounts)',
    category: 'Multisig',
    description:
      'Shares addresses INCLUDING policy accounts (multisig) by passing allowPolicyAccounts: true. A p2wsh PolicyAddress carries its `descriptor`.',
    params(ctx) {
      return {
        network: networkOf(ctx),
        allowPolicyAccounts: true,
      } satisfies ParamsOf<'getAddresses'>;
    },
    expect: 'success',
    tags: ['ci', 'multisig'],
  },

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
    id: 'btc_addAccount-raw-pubkeys',
    method: 'btc_addAccount',
    label: 'btc_addAccount (raw pubkeys, legacy)',
    category: 'Multisig',
    description:
      'The pre-xpub descriptor shape: bare 33-byte public keys. No dApp sends this any more, but the wallet still accepts it and it takes a different signing branch — so it stays covered.',
    async params(ctx) {
      return {
        descriptor: legacyRawPubkeyDescriptor(await fetchNativeSegwitPubkey(ctx)),
        name: 'RPC test multisig (raw)',
        network: networkOf(ctx),
      } satisfies ParamsOf<'btc_addAccount'>;
    },
    expect: 'manual',
    requires: ['singlesig'],
    tags: ['multisig', 'legacy'],
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

  // ── Proposal commitments ─────────────────────────────────────────────────
  {
    id: 'multisig-commitment-btc',
    method: 'signMessage',
    label: 'proposal commitment (BTC)',
    category: 'Multisig',
    description:
      'BIP-322 signature over a proposal hash — how a co-signer authorises a BTC proposal to the coordinator. The message is the hash itself, not a sentence.',
    params(ctx) {
      return {
        message: sampleProposalHash,
        paymentType: 'p2wpkh',
        network: networkOf(ctx),
      } satisfies ParamsOf<'signMessage'>;
    },
    expect: 'success',
    tags: ['ci', 'multisig'],
  },
  {
    id: 'multisig-commitment-stx',
    method: 'stx_signMessage',
    label: 'proposal commitment (STX)',
    category: 'Multisig',
    description:
      'SIP-018 structured signature over a proposal hash under the leather-multisig-proposal-v1 domain — the STX half of the same authorisation.',
    params(ctx) {
      const network = networkOf(ctx);
      return {
        messageType: 'structured',
        domain: proposalDomain(network),
        message: serializeCV(stringAsciiCV(sampleProposalHash)),
        network,
      } satisfies ParamsOf<'stx_signMessage'>;
    },
    expect: 'success',
    tags: ['ci', 'multisig'],
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
  {
    id: 'stx_callContract-multisig',
    method: 'stx_callContract',
    label: 'stx_callContract (from STX policy → proposal)',
    category: 'Multisig',
    description:
      'A contract call from a selected STX multisig account. Like sendTransfer, it should come back proposed rather than broadcast.',
    async params(ctx) {
      const { address } = await fetchStxAccount(ctx);
      return {
        contract: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc',
        functionName: 'transfer',
        functionArgs: [
          Cl.uint(1_000_000),
          Cl.standardPrincipal(address),
          Cl.standardPrincipal(STX_RECIPIENT),
          Cl.none(),
        ].map(argument => serializeCV(argument)),
        network: networkOf(ctx),
      } satisfies ParamsOf<'stx_callContract'>;
    },
    expect: 'manual',
    requires: ['stx-policy'],
    tags: ['multisig'],
    verify: verifyProposal(),
  },
  {
    id: 'stx_transferStx-multisig-no-propose',
    method: 'stx_transferStx',
    label: 'stx_transferStx (from STX policy → NOT proposed)',
    category: 'Multisig',
    description:
      'Deliberate negative: only stx_callContract and sendTransfer route to a proposal. A plain STX transfer from a policy account falls through on purpose — if this ever comes back `proposed`, the scope changed.',
    params(ctx) {
      return {
        recipient: STX_RECIPIENT,
        amount: 1_000_000,
        network: networkOf(ctx),
      } satisfies ParamsOf<'stx_transferStx'>;
    },
    expect: 'manual',
    requires: ['stx-policy'],
    tags: ['multisig', 'negative'],
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
  {
    id: 'signPsbt-multisig-cosign-account',
    method: 'signPsbt',
    label: 'signPsbt (co-sign, account: 1)',
    category: 'Multisig',
    description:
      'The same vault PSBT targeted at account 1 with the `account` param — how the multisig dApp asks a specific derivation to co-sign. Account 1 is NOT in this vault, so nothing should be signed.',
    async params(ctx) {
      const keys = await collectPsbtKeys(ctx, ['sortedmulti']);
      const { psbtHex, descriptor } = buildPsbtScenario(
        { inputs: [{ kind: 'sortedmulti' }] },
        keys
      );
      return {
        hex: psbtHex,
        descriptor,
        account: 1,
        broadcast: false,
      } satisfies ParamsOf<'signPsbt'>;
    },
    expect: 'manual',
    requires: ['singlesig'],
    tags: ['multisig', 'psbt', 'negative'],
    verify: verifySignedPsbt({ expectUnsigned: true }),
  },
  {
    id: 'stx_signTransaction-multisig-cosign',
    method: 'stx_signTransaction',
    label: 'stx_signTransaction (multisig co-sign)',
    category: 'Multisig',
    description:
      'The STACKS half of co-signing: an unsigned 2-of-3 multisig transfer whose spending condition lists your key. The wallet must ADD its signature to the existing condition rather than replace it with a single-sig one.',
    async params(ctx) {
      const network = networkOf(ctx);
      const { publicKey } = await fetchStxAccount(ctx);
      return {
        txHex: await buildUnsignedMultisigStxTransferHex({
          publicKeys: [publicKey, ...STX_COSIGNER_PUBLIC_KEYS],
          numSignatures: MULTISIG_THRESHOLD,
          recipient: STX_RECIPIENT,
          mode: networkModeOf(network),
        }),
        network,
      } satisfies ParamsOf<'stx_signTransaction'>;
    },
    expect: 'manual',
    requires: ['singlesig'],
    tags: ['multisig'],
  },

  // ── Vault inspection ──────────────────────────────────────────────────────
  {
    id: 'multisig-vault-address',
    method: 'btc_addAccount',
    label: 'btc_addAccount (re-register = verify)',
    category: 'Multisig',
    description:
      'Registering the same descriptor twice must not create a second account: the wallet answers { added: false } with the address it already holds, which is how a dApp verifies a vault it did not create.',
    async params(ctx) {
      return {
        descriptor: await vaultDescriptorFor(ctx),
        name: 'RPC test multisig',
        network: networkOf(ctx),
      } satisfies ParamsOf<'btc_addAccount'>;
    },
    expect: 'manual',
    requires: ['singlesig'],
    tags: ['multisig'],
  },
];
