import {
  compileWshDescriptor,
  getWshDescriptorThreshold,
  isExtendedPublicKeyExpression,
  stripDescriptorChecksum,
} from './wsh-descriptor';

export const bondTemplateV1 = {
  id: 'bond-exit',
  version: 1,
  script:
    'wsh(and_v(v:or_i(after(<<param:unlock_height>>),and_v(v:sha256(<<param:hash>>),pk(<<param:counterparty_key>>))),<<vault:multi>>))',
} as const;

const maxBlockHeightLocktime = 500_000_000;

const bondDescriptorPattern =
  /^wsh\(and_v\(v:or_i\(after\((\d{1,10})\),and_v\(v:sha256\(([0-9a-fA-F]{64})\),pk\((0[23][0-9a-fA-F]{64})\)\)\),(sortedmulti\([^()]+\))\)\)$/;

function isValidVaultMultiExpression(multiExpression: string): boolean {
  const args = multiExpression.slice('sortedmulti('.length, -1).split(',');
  const [threshold, ...keyExpressions] = args;
  if (!threshold || !/^\d+$/.test(threshold)) return false;
  if (!keyExpressions.length) return false;
  return keyExpressions.every(isExtendedPublicKeyExpression);
}

export interface BondDescriptorParams {
  unlockHeight: number;
  hash: string;
  counterpartyKey: string;
}

export interface BondDescriptorMatch extends BondDescriptorParams {
  multiExpression: string;
}

export function matchBondDescriptor(descriptor: string): BondDescriptorMatch | null {
  const compactDescriptor = stripDescriptorChecksum(descriptor).replace(/\s/g, '');
  const match = bondDescriptorPattern.exec(compactDescriptor);
  if (!match) return null;

  const rawUnlockHeight = match[1];
  const hash = match[2];
  const counterpartyKey = match[3];
  const multiExpression = match[4];
  if (!rawUnlockHeight || !hash || !counterpartyKey || !multiExpression) return null;
  if (!isValidVaultMultiExpression(multiExpression)) return null;

  const unlockHeight = Number(rawUnlockHeight);
  if (!isValidUnlockHeight(unlockHeight)) return null;

  return {
    unlockHeight,
    hash: hash.toLowerCase(),
    counterpartyKey: counterpartyKey.toLowerCase(),
    multiExpression,
  };
}

function isValidUnlockHeight(unlockHeight: number): boolean {
  return (
    Number.isInteger(unlockHeight) && unlockHeight >= 1 && unlockHeight < maxBlockHeightLocktime
  );
}

function assertValidBondParams({
  unlockHeight,
  hash,
  counterpartyKey,
}: BondDescriptorParams): void {
  if (!isValidUnlockHeight(unlockHeight))
    throw new Error('Bond unlock height must be a block height below 500000000');
  if (!/^[0-9a-f]{64}$/.test(hash)) throw new Error('Bond hash must be a 32-byte hex digest');
  if (!/^0[23][0-9a-f]{64}$/.test(counterpartyKey))
    throw new Error('Bond counterparty key must be a compressed public key in lowercase hex');
}

export interface InstantiateBondDescriptorArgs extends BondDescriptorParams {
  threshold: number;
  keyExpressions: string[];
}

export function instantiateBondDescriptor({
  unlockHeight,
  hash,
  counterpartyKey,
  threshold,
  keyExpressions,
}: InstantiateBondDescriptorArgs): string {
  assertValidBondParams({ unlockHeight, hash, counterpartyKey });
  if (!keyExpressions.length)
    throw new Error('Bond descriptor requires at least one vault key expression');
  if (!keyExpressions.every(isExtendedPublicKeyExpression))
    throw new Error('Bond vault keys must be xpub or tpub key expressions');

  const multiExpression = `sortedmulti(${threshold},${keyExpressions.join(',')})`;
  return bondTemplateV1.script
    .replace('<<param:unlock_height>>', String(unlockHeight))
    .replace('<<param:hash>>', hash)
    .replace('<<param:counterparty_key>>', counterpartyKey)
    .replace('<<vault:multi>>', multiExpression);
}

export interface BondVaultKeys {
  threshold: number;
  keyExpressions: string[];
}

export function getBondVaultKeys(policyDescriptor: string): BondVaultKeys {
  const { keys } = compileWshDescriptor(policyDescriptor);
  return {
    threshold: getWshDescriptorThreshold(policyDescriptor),
    keyExpressions: keys.map(key => key.keyExpression),
  };
}
