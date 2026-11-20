import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

import * as derivationPathUtils from './derivation-path-utils';
import * as keychain from './keychain';
import * as proposalHash from './multisig/proposal-hash';
import { leanOracleAvailable, leanOracleRequired } from './proofs/lean-oracle';
import * as walletAccountCount from './wallet-account-count';

interface Proved {
  status: 'proved';
  theorems: string[];
}

interface NotProved {
  status: 'not-proved';
  reason: string;
}

const wrapsBip32 =
  'Wraps BIP-32 derivation in @scure/bip32 (HMAC-SHA512 and secp256k1). A proof would have to model those primitives; none of the logic is ours.';
const wrapsBip39 =
  'Wraps @scure/bip39 (PBKDF2-HMAC-SHA512, SHA-256 checksum, wordlist). A proof would have to model those primitives; none of the logic is ours.';
const pathSegmentTheorems = [
  'DerivationPathUtils.extractSection_of_decimal',
  'DerivationPathUtils.extractSection_of_hardened',
];

const coverage: Record<string, Proved | NotProved> = {
  computeProposalHash: {
    status: 'proved',
    theorems: [
      'ProposalPreimage.encode_injective',
      'ProposalPreimage.encode?_injective',
      'ProposalPreimage.encodeFields_injective',
      'ProposalPreimage.encode_not_injective_without_timestamp_bound',
      'ProposalPreimage.u32be_wraps',
      'ProposalPreimage.encode_domain_separated',
      'ProposalPreimage.encode_length',
    ],
  },
  decodeProposalPayload: {
    status: 'not-proved',
    reason:
      'One-line dispatch to the base64 and hex decoders in @scure/base. Any property would be about that library.',
  },
  extractPurposeFromPath: { status: 'proved', theorems: pathSegmentTheorems },
  extractAccountIndexFromPath: { status: 'proved', theorems: pathSegmentTheorems },
  extractChangeIndexFromPath: {
    status: 'proved',
    theorems: [...pathSegmentTheorems, 'DerivationPathUtils.extract_appendAddressIndexToPath'],
  },
  extractAddressIndexFromPath: {
    status: 'proved',
    theorems: [...pathSegmentTheorems, 'DerivationPathUtils.extract_appendAddressIndexToPath'],
  },
  appendAddressIndexToPath: {
    status: 'proved',
    theorems: ['DerivationPathUtils.extract_appendAddressIndexToPath'],
  },
  extractFingerprintFromKeyOriginPath: {
    status: 'proved',
    theorems: ['DerivationPathUtils.extractFingerprint_createKeyOriginPath'],
  },
  createKeyOriginPath: {
    status: 'proved',
    theorems: [
      'DerivationPathUtils.keyOriginToDerivationPath_createKeyOriginPath',
      'DerivationPathUtils.extractFingerprint_createKeyOriginPath',
    ],
  },
  validateKeyOriginPath: {
    status: 'proved',
    theorems: ['DerivationPathUtils.no_brackets_of_validateKeyOriginPath'],
  },
  createDescriptor: {
    status: 'proved',
    theorems: [
      'DerivationPathUtils.extractKeyOriginPath_createDescriptor',
      'DerivationPathUtils.extractKey_createDescriptor',
    ],
  },
  extractKeyOriginPathFromDescriptor: {
    status: 'proved',
    theorems: ['DerivationPathUtils.extractKeyOriginPath_createDescriptor'],
  },
  extractDerivationPathFromDescriptor: {
    status: 'proved',
    theorems: ['DerivationPathUtils.extractDerivationPath_createDescriptor'],
  },
  extractFingerprintFromDescriptor: {
    status: 'proved',
    theorems: ['DerivationPathUtils.extractFingerprint_createDescriptor'],
  },
  extractAccountIndexFromDescriptor: {
    status: 'proved',
    theorems: ['DerivationPathUtils.extractAccountIndex_createDescriptor'],
  },
  extractKeyFromDescriptor: {
    status: 'proved',
    theorems: ['DerivationPathUtils.extractKey_createDescriptor'],
  },
  extractAccountPathFromFullPath: {
    status: 'proved',
    theorems: ['DerivationPathUtils.extractAccountPathFromFullPath_idempotent'],
  },
  keyOriginToDerivationPath: {
    status: 'proved',
    theorems: ['DerivationPathUtils.keyOriginToDerivationPath_createKeyOriginPath'],
  },
  decomposeDescriptor: {
    status: 'not-proved',
    reason:
      'Returns four values, each from a function with its own theorem. It adds no logic of its own.',
  },
  fingerprintAsNumberToHex: {
    status: 'proved',
    theorems: [
      'Keychain.unitLength_fingerprintAsNumberToHex',
      'Keychain.fingerprintAsNumberToHex_injective',
    ],
  },
  safelyReadPaddedFingerprint: {
    status: 'proved',
    theorems: [
      'Keychain.parseHex_safelyReadPaddedFingerprint',
      'Keychain.safelyReadPaddedFingerprint_idempotent',
    ],
  },
  unpadHex: {
    status: 'proved',
    theorems: ['Keychain.parseHex_unpadHex', 'Keychain.unpadHex_idempotent'],
  },
  makeAccountIdentifer: {
    status: 'proved',
    theorems: ['Keychain.makeAccountIdentifer_injective'],
  },
  isValidAccountIndex: {
    status: 'not-proved',
    reason:
      'A type check on a JavaScript number. Its model is its own specification, so a theorem would restate the definition. The differential test covers it.',
  },
  softwareAccountCountFromHighestIndex: {
    status: 'proved',
    theorems: ['WalletAccountCount.softwareAccountCountFromHighestIndex_pos'],
  },
  countWalletAccounts: {
    status: 'proved',
    theorems: [
      'WalletAccountCount.countWalletAccounts_software_pos',
      'WalletAccountCount.countWalletAccounts_le_length',
    ],
  },
  generateMnemonic: {
    status: 'not-proved',
    reason:
      'Draws randomness through @scure/bip39. There is no deterministic property of our own code to state.',
  },
  deriveBip39SeedFromMnemonic: { status: 'not-proved', reason: wrapsBip39 },
  deriveBip39SeedFromMnemonicSync: { status: 'not-proved', reason: wrapsBip39 },
  isValidMnemonic: { status: 'not-proved', reason: wrapsBip39 },
  isValidMnemonicWord: { status: 'not-proved', reason: wrapsBip39 },
  deriveRootBip32Keychain: { status: 'not-proved', reason: wrapsBip32 },
  deriveRootKeychainFromMnemonic: { status: 'not-proved', reason: wrapsBip32 },
  deriveRootKeychainFromMnemonicSync: { status: 'not-proved', reason: wrapsBip32 },
  deriveChildKeychainFromMnemnonic: { status: 'not-proved', reason: wrapsBip32 },
  deriveKeychainFromXpub: { status: 'not-proved', reason: wrapsBip32 },
  getMnemonicRootKeyFingerprint: { status: 'not-proved', reason: wrapsBip32 },
  deriveKeychainExtendedPublicKeyDescriptor: { status: 'not-proved', reason: wrapsBip32 },
};

const exportedModules: Record<string, object> = {
  './derivation-path-utils': derivationPathUtils,
  './keychain': keychain,
  './multisig/proposal-hash': proposalHash,
  './signer/signer': {},
  './wallet-account-count': walletAccountCount,
};

const indexSource = readFileSync(new URL('./index.ts', import.meta.url), 'utf8');
const auditSource = readFileSync(new URL('./proofs/Audit.lean', import.meta.url), 'utf8');
const auditedSection = auditSource.slice(auditSource.indexOf('let audited'));
const auditedTheorems = Array.from(auditedSection.matchAll(/``([\w.?]+)/g), match => match[1]);
const citedTheorems = Object.values(coverage).flatMap(entry =>
  entry.status === 'proved' ? entry.theorems : []
);

function sorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}

describe('proof coverage of the crypto package', () => {
  test('every exported function has a theorem or a reason for having none', () => {
    const exportedFunctions = Object.values(exportedModules)
      .flatMap(module => Object.entries(module))
      .filter(([, value]) => typeof value === 'function')
      .map(([name]) => name);
    expect(sorted(Object.keys(coverage))).toEqual(sorted(exportedFunctions));
  });

  test('covers every module the package index exports', () => {
    const indexedModules = Array.from(
      indexSource.matchAll(/^export \* from '(.+)';$/gm),
      match => match[1]
    );
    expect(indexSource.trim().split('\n')).toHaveLength(indexedModules.length);
    expect(sorted(Object.keys(exportedModules))).toEqual(sorted(indexedModules));
  });

  test('every cited theorem is checked by the axiom audit, and nothing audited is uncited', () => {
    expect(sorted(citedTheorems)).toEqual(sorted(auditedTheorems));
  });

  test('every function without a theorem states why', () => {
    for (const entry of Object.values(coverage)) {
      if (entry.status === 'not-proved') expect(entry.reason.length).toBeGreaterThan(0);
      if (entry.status === 'proved') expect(entry.theorems.length).toBeGreaterThan(0);
    }
  });

  test.runIf(leanOracleRequired)('has the Lean oracle built when it is required', () => {
    expect(leanOracleAvailable).toBe(true);
  });
});
