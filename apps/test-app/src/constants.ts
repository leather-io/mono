// ---------------------------------------------------------------------------
// Fixtures shared by the catalog.
//
// Anything that belongs to the CONNECTED wallet — its addresses, public keys,
// PSBT inputs, the descriptors it co-signs — is NOT a fixture: it is read from
// `getAddresses` at click time (see ./wallet.ts and ./wallet-psbt.ts), so every
// button works on any Leather install. BTC transfers default to sending the
// wallet's own funds back to itself, so approving one on mainnet costs only
// the fee.
//
// What is left here is what the wallet cannot tell us: which tokens / NFTs the
// developer holds, who their co-signers are, and a Stacks recipient (Stacks
// rejects transfers to self). Each has a mainnet default the connected wallet
// almost certainly does not own — realistic approval screens, but the transfer
// fails after approval — and a `VITE_TEST_APP_*` override in `.env` (see
// .env.example) to make it real.
//
// Nothing in this file is secret. Never add a mnemonic or private key here.
// ---------------------------------------------------------------------------
import { readListOverride, readOverride } from './env';

// ── Recipients ──────────────────────────────────────────────────────────────

// BTC recipients: unset → the connected wallet's own address for that network.
export const BTC_RECIPIENT_OVERRIDE = readOverride('BTC_RECIPIENT');
export const BTC_RECIPIENT_REGTEST_OVERRIDE = readOverride('BTC_RECIPIENT_REGTEST');

// Valid, checksummed mainnet Stacks address (verified with c32check). Stacks
// rejects a transfer to the sender's own address, so this stays a fixture.
export const STX_RECIPIENT =
  readOverride('STX_RECIPIENT') ?? 'SPXH3HNBPM5YP15VH16ZXZ9AX6CK289K3MCXRKCB';

// ── Stacks assets ───────────────────────────────────────────────────────────

// Mainnet SIP-10 / SIP-9 assets used by the transfer buttons. `SIP10_CONTRACT`
// is the contract behind `SIP10_ASSET` — what `stx_callContract` calls.
export const SIP10_ASSET =
  readOverride('SIP10_ASSET') ?? 'SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token::leo';
export const SIP10_CONTRACT = SIP10_ASSET.split('::')[0] ?? SIP10_ASSET;
export const SIP9_ASSET =
  readOverride('SIP9_ASSET') ??
  'SP2XMGYYTA1KRBKBYJHTW8CFWB2QYZKZE4BMHG3PJ.living-leather::living-leather';
export const SIP9_ASSET_ID = Number(readOverride('SIP9_ASSET_ID') ?? '647');

// ── Multisig co-signers ─────────────────────────────────────────────────────

// Threshold of the 2-of-N accounts registered by `btc_addAccount` /
// `stx_addAccount` and of the co-sign descriptor.
export const MULTISIG_THRESHOLD = 2;

// Dummy co-signer pubkeys (compressed secp256k1). Combined with the CONNECTED
// wallet's own key they form a 2-of-3 the wallet is a signer of: BTC as
// `wsh(sortedmulti(2, own, …))`, STX as ORDERED keys with the own key first.
// Override with your teammates' keys to test a real multisig end to end.
export const BTC_COSIGNER_PUBLIC_KEYS = readListOverride('BTC_COSIGNER_PUBLIC_KEYS', [
  '02e50bdeee4839821db5258002f5035f29d9ae908dc363052ddd1bb1399fd65a18',
  '021a1fdf4bd7dd52d5e672c123e35936def2b7e9f5ff454d3e3f658406a0b39c1e',
]);
export const STX_COSIGNER_PUBLIC_KEYS = readListOverride('STX_COSIGNER_PUBLIC_KEYS', [
  '02e50bdeee4839821db5258002f5035f29d9ae908dc363052ddd1bb1399fd65a18',
  '021a1fdf4bd7dd52d5e672c123e35936def2b7e9f5ff454d3e3f658406a0b39c1e',
]);

// ── Bitcoin ─────────────────────────────────────────────────────────────────

// BIP-143 sighash flags (mirrors Leather's `signatureHash` enum). When signing,
// the wallet reads each input's PSBT_IN_SIGHASH_TYPE and refuses if it isn't in
// the request's `allowedSighash` — so a custom sighash needs both.
export const SIGHASH = {
  DEFAULT: 0x00,
  ALL: 0x01,
  NONE: 0x02,
  SINGLE: 0x03,
  ALL_ANYONECANPAY: 0x81,
  NONE_ANYONECANPAY: 0x82,
  SINGLE_ANYONECANPAY: 0x83,
} as const;

// Shared message for the signMessage buttons.
export const TEST_MESSAGE = 'Hello from the Leather RPC test app';
