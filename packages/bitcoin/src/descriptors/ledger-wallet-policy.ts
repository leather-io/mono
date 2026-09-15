import type { ExpansionMap, KeyInfo } from '@bitcoinerlab/descriptors';
import { bytesToHex } from '@noble/hashes/utils';

import { makeWshDescriptorInstance } from './wsh-descriptor';

export const ledgerWalletPolicyName = 'Leather';

const maxLedgerWalletPolicyNameLength = 64;
const placeholderKeyPattern = /^@(\d+)$/;
const placeholderTemplatePattern = /@(\d+)/g;
const fixedKeyPathPattern = /^\/[01]\/\d+$/;

export interface LedgerWalletPolicy {
  name: string;
  descriptorTemplate: string;
  keys: string[];
}

interface PlaceholderKey {
  placeholderIndex: number;
  key: KeyInfo;
}

function toPlaceholderKeys(expansionMap: ExpansionMap): PlaceholderKey[] {
  return Object.entries(expansionMap)
    .map(([placeholder, key]) => {
      const match = placeholderKeyPattern.exec(placeholder);
      if (!match?.[1])
        throw new Error(`Unexpected key placeholder ${placeholder} in the expanded descriptor`);
      return { placeholderIndex: Number(match[1]), key };
    })
    .sort((a, b) => a.placeholderIndex - b.placeholderIndex);
}

function isDeviceKey(key: KeyInfo, deviceFingerprintHex: string): boolean {
  if (!key.masterFingerprint) return false;
  return bytesToHex(key.masterFingerprint).toLowerCase() === deviceFingerprintHex.toLowerCase();
}

function toLedgerPolicyKey(key: KeyInfo): string {
  if (!key.xPub) throw new Error('Ledger only allows extended public keys in a wallet policy');
  if (key.masterFingerprint && key.originPath)
    return `[${bytesToHex(key.masterFingerprint)}${key.originPath}]${key.xPub}`;
  return key.xPub;
}

function assertKeysMatchDeviceKey(placeholderKeys: PlaceholderKey[], deviceKey: KeyInfo): void {
  placeholderKeys.forEach(({ key }) => {
    if (key === deviceKey) return;
    if (!key.xPub) throw new Error('Ledger only allows extended public keys in a wallet policy');
    if (key.keyPath !== deviceKey.keyPath)
      throw new Error('All keys in a Ledger wallet policy must use the same key path');
    if (key.originPath && key.originPath !== deviceKey.originPath)
      throw new Error('All keys in a Ledger wallet policy must use the same origin path');
  });
}

function assertPlaceholdersMatchTemplate(
  placeholderKeys: PlaceholderKey[],
  descriptorTemplate: string
): void {
  placeholderKeys.forEach(({ placeholderIndex }, position) => {
    if (placeholderIndex !== position)
      throw new Error('Ledger wallet policy key placeholders must be contiguous');
    if (!descriptorTemplate.includes(`@${placeholderIndex}/**`))
      throw new Error(
        `Ledger wallet policy template is missing key placeholder @${placeholderIndex}`
      );
  });
}

export function buildLedgerWalletPolicy(
  ledgerDescriptor: string,
  deviceFingerprintHex: string,
  index = 0,
  name = ledgerWalletPolicyName
): LedgerWalletPolicy {
  if (name.length > maxLedgerWalletPolicyNameLength)
    throw new Error(
      `Ledger wallet policy name must be at most ${maxLedgerWalletPolicyNameLength} characters`
    );

  const { expandedExpression, expansionMap } = makeWshDescriptorInstance(
    ledgerDescriptor,
    index
  ).expand();
  if (!expandedExpression || !expansionMap)
    throw new Error('Descriptor could not be expanded into a Ledger wallet policy');

  const placeholderKeys = toPlaceholderKeys(expansionMap);
  const deviceKeys = placeholderKeys.filter(({ key }) => isDeviceKey(key, deviceFingerprintHex));
  if (deviceKeys.length === 0)
    throw new Error('The connected Ledger is absent from this descriptor');
  if (deviceKeys.length > 1)
    throw new Error('The connected Ledger appears more than once in this descriptor');

  const [{ key: deviceKey }] = deviceKeys;
  if (!deviceKey.originPath || !deviceKey.xPub)
    throw new Error('The Ledger key must be an extended public key with a key origin');
  if (!deviceKey.keyPath || !fixedKeyPathPattern.test(deviceKey.keyPath))
    throw new Error('Ledger wallet policy keys must use a key path of the form /0/N or /1/N');

  assertKeysMatchDeviceKey(placeholderKeys, deviceKey);

  const descriptorTemplate = expandedExpression.replace(placeholderTemplatePattern, '@$1/**');
  assertPlaceholdersMatchTemplate(placeholderKeys, descriptorTemplate);

  return {
    name,
    descriptorTemplate,
    keys: placeholderKeys.map(({ key }) => toLedgerPolicyKey(key)),
  };
}
