// ---------------------------------------------------------------------------
// Fixtures shared by the catalog.
//
// Anything that belongs to the CONNECTED wallet — its addresses, public keys,
// xpubs, PSBT inputs, the descriptors it co-signs — is NOT a fixture: it is
// read from `getAddresses` at click time (see ./wallet.ts and ./builders/), so
// every button works on any Leather install. BTC transfers default to sending
// the wallet's own funds back to itself, so approving one on mainnet costs
// only the fee.
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
import { readListOverride, readNumberOverride, readOverride } from './env';

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
export const SIP9_ASSET_ID = readNumberOverride('SIP9_ASSET_ID', 647);

// ── Multisig co-signers ─────────────────────────────────────────────────────

// Threshold of the 2-of-N accounts registered by `btc_addAccount` /
// `stx_addAccount` and of the co-sign descriptor.
export const MULTISIG_THRESHOLD = 2;

// Dummy co-signer BTC keys. The multisig dApp registers descriptors made of
// EXTENDED keys (`xpub/0/accountIndex`, see its getMultisigDescriptor), which
// is also the only shape bond vaults accept and what Ledger policy
// registration derives from, so these are xpubs — not raw public keys.
// Combined with the connected wallet's own xpub they form a 2-of-3 the wallet
// is a signer of. Override with your teammates' xpubs to test a real multisig.
//
// Derived from two fixed all-0x11 / all-0x22 seeds at m/48'/0'/0'/2'. Nobody
// controls these keys in any meaningful sense; they exist to make a valid,
// checksummable descriptor.
export const BTC_COSIGNER_XPUBS = readListOverride('BTC_COSIGNER_XPUBS', [
  'xpub6ExB1kZYquka4AHMBsA16K5QDEDQuaCgp4Scqenr1y8kmkc4mgEJtPqAYHrywBM8tZAgpbs5vgnnyvospAJCAamEaBBF8RhqhrEtCQVbgpW',
  'xpub6EJrJUabyEuwV6bwVton15y57rSH27Mnv4h1gKVhYs7md8P9i1QWxhdGpHF4KtCSLYoEMvu7uNXhkM1287XhCrwi2VCjpqwH3HADqzaLqPW',
]);

// Testnet-flavoured equivalents (m/48'/1'/0'/2' from the same seeds). A
// descriptor may not mix key networks, so a non-mainnet run uses these.
export const BTC_COSIGNER_TPUBS = readListOverride('BTC_COSIGNER_TPUBS', [
  'tpubDFTzn6rwwGpdPMT51dRhcN8CCip7RXbU1naGrpH6v2ChchjumQkrQzMYpRxC7kRx6Sa3vnLeHz738zzxagz9VQgFPGnFXFVVbSDPEAZDWYJ',
  'tpubDFWs9PViyGsvJRVzQ76kdwhXDhfXnrM4zmKSzWKeXPJBbg25XN5PtYHKar3WzH3BpruntiMUFFFbmvR3bDhgcBvQ67SDMygjJ6FtApfLjrF',
]);

// Dummy co-signer STX keys: ORDERED compressed secp256k1 pubkeys. `stx_addAccount`
// takes raw keys (not xpubs), and key order defines the multisig address.
export const STX_COSIGNER_PUBLIC_KEYS = readListOverride('STX_COSIGNER_PUBLIC_KEYS', [
  '02e50bdeee4839821db5258002f5035f29d9ae908dc363052ddd1bb1399fd65a18',
  '021a1fdf4bd7dd52d5e672c123e35936def2b7e9f5ff454d3e3f658406a0b39c1e',
]);

// Legacy raw-pubkey co-signers, kept for the one button that still sends a
// descriptor of bare public keys — the shape no production dApp sends.
export const BTC_COSIGNER_PUBLIC_KEYS = readListOverride('BTC_COSIGNER_PUBLIC_KEYS', [
  '02e50bdeee4839821db5258002f5035f29d9ae908dc363052ddd1bb1399fd65a18',
  '021a1fdf4bd7dd52d5e672c123e35936def2b7e9f5ff454d3e3f658406a0b39c1e',
]);

// ── Bonds ───────────────────────────────────────────────────────────────────

// Counterparty of the bond hashlock branch and the sha256 digest it must
// present a preimage for. The preimage is what a real counterparty keeps
// secret; here it is public so the hashlock exit can be exercised end to end.
export const BOND_COUNTERPARTY_PUBLIC_KEY =
  readOverride('BOND_COUNTERPARTY_PUBLIC_KEY') ??
  '0337816e411caf87114afe7be6fd155387e24ea318a55ac16955fd2df226f3355f';
export const BOND_PREIMAGE = readOverride('BOND_PREIMAGE') ?? '00'.repeat(31) + '2a';
export const BOND_UNLOCK_HEIGHT = readNumberOverride('BOND_UNLOCK_HEIGHT', 200);

// ── Bitcoin ─────────────────────────────────────────────────────────────────

// BIP-143 sighash flags (mirrors Leather's `signatureHash` enum). When signing,
// the wallet reads each input's PSBT_IN_SIGHASH_TYPE; whether it also honours
// the request's `allowedSighash` differs by platform — see methods/sighash.ts.
export const SIGHASH = {
  DEFAULT: 0x00,
  ALL: 0x01,
  NONE: 0x02,
  SINGLE: 0x03,
  ALL_ANYONECANPAY: 0x81,
  NONE_ANYONECANPAY: 0x82,
  SINGLE_ANYONECANPAY: 0x83,
} as const;

export type SighashFlag = (typeof SIGHASH)[keyof typeof SIGHASH];

export const SIGHASH_NAMES: Record<number, string> = {
  0x00: 'DEFAULT',
  0x01: 'ALL',
  0x02: 'NONE',
  0x03: 'SINGLE',
  0x81: 'ALL|ANYONECANPAY',
  0x82: 'NONE|ANYONECANPAY',
  0x83: 'SINGLE|ANYONECANPAY',
};

// ── Misc ────────────────────────────────────────────────────────────────────

// Base URL of an Esplora API, enabling the buttons that spend REAL utxos and
// broadcast. Point it at a local regtest Esplora or a public testnet4 one.
export const ESPLORA_URL = readOverride('ESPLORA_URL');

// Shared message for the signMessage buttons.
export const TEST_MESSAGE = 'Hello from the Leather RPC test app';
