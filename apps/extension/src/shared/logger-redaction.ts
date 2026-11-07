import { wordlist } from '@scure/bip39/wordlists/english';
import BigNumber from 'bignumber.js';

const redactedValue = '[redacted]';

const circularValue = '[circular]';

const minimumMnemonicWordCount = 12;

const sensitiveKeyTerms = new Set([
  'address',
  'addresses',
  'txid',
  'txids',
  'tx',
  'txs',
  'hex',
  'psbt',
  'psbts',
  'descriptor',
  'descriptors',
  'policy',
  'policies',
  'xpub',
  'xpubs',
  'xprv',
  'tpub',
  'tprv',
  'publickey',
  'publickeys',
  'pubkey',
  'pubkeys',
  'fingerprint',
  'fingerprints',
  'keyorigin',
  'keyorigins',
  'keychainid',
  'keychainids',
  'mnemonic',
  'phrase',
  'secret',
  'secretkey',
  'privatekey',
  'privatekeys',
  'wif',
  'password',
  'passphrase',
  'seed',
  'outpoint',
  'outpoints',
  'utxo',
  'utxos',
  'witness',
  'script',
  'signature',
  'signatures',
  'tapinternalkey',
  'inputs',
  'outputs',
  'vin',
]);

const bip39Words = new Set(wordlist);

const derivationPathFingerprintPattern = /\b[0-9a-f]{8}(?=(?:\/\d+['hH]?)+)/gi;

const fingerprintContextPattern = /fingerprint/i;

const eightHexPattern = /\b[0-9a-f]{8}\b/gi;

const legacyAddressPattern = /\b[123mn][a-km-zA-HJ-NP-Z1-9]{25,34}\b/g;

const wifPattern = /\b[5KLc9][1-9A-HJ-NP-Za-km-z]{50,51}\b/g;

const wordPattern = /[a-z]+/gi;

const mnemonicSeparatorPattern = /^[\s,]+$/;

const valuePatterns = [
  /\bcHNidP8[A-Za-z0-9+/=]+/g,
  /\b[xyztuvYZUV](?:pub|prv)[1-9A-HJ-NP-Za-km-z]{100,108}\b/g,
  /\b(?:bc|tb|bcrt)1[ac-hj-np-z02-9]{8,87}\b/gi,
  /\bS[PMTN][0-9A-HJKMNP-TV-Z]{28,41}\b/g,
  /\b(?:0x)?[0-9a-f]{64}:\d+\b/gi,
  /\b(?:0x)?[0-9a-f]{32,}\b/gi,
];

function splitKeyWords(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[^a-zA-Z0-9]+/)
    .filter(word => word.length > 0)
    .map(word => word.toLowerCase());
}

function isSensitiveKey(key: string) {
  const words = splitKeyWords(key);
  return words.some((_word, index) => sensitiveKeyTerms.has(words.slice(index).join('')));
}

function looksLikeBase58Identifier(candidate: string) {
  return /\d/.test(candidate) && /[A-Z]/.test(candidate) && /[a-z]/.test(candidate);
}

function redactBase58Candidates(value: string, pattern: RegExp) {
  return value.replace(pattern, candidate =>
    looksLikeBase58Identifier(candidate) ? redactedValue : candidate
  );
}

interface WordMatch {
  start: number;
  end: number;
  isMnemonicWord: boolean;
}

function findMnemonicRuns(value: string) {
  const words: WordMatch[] = [...value.matchAll(wordPattern)].map(match => ({
    start: match.index,
    end: match.index + match[0].length,
    isMnemonicWord: bip39Words.has(match[0].toLowerCase()),
  }));
  const runs: WordMatch[][] = [];
  let currentRun: WordMatch[] = [];
  for (const word of words) {
    const previous = currentRun.at(-1);
    const continuesRun =
      word.isMnemonicWord &&
      previous !== undefined &&
      mnemonicSeparatorPattern.test(value.slice(previous.end, word.start));
    if (continuesRun) {
      currentRun.push(word);
      continue;
    }
    runs.push(currentRun);
    currentRun = word.isMnemonicWord ? [word] : [];
  }
  runs.push(currentRun);
  return runs.filter(run => run.length >= minimumMnemonicWordCount);
}

function redactMnemonics(value: string) {
  return findMnemonicRuns(value)
    .reverse()
    .reduce((result, run) => {
      const first = run[0];
      const last = run.at(-1);
      if (!first || !last) return result;
      return result.slice(0, first.start) + redactedValue + result.slice(last.end);
    }, value);
}

function redactString(value: string) {
  const withoutMnemonics = redactMnemonics(value);
  const withoutKeyOrigins = withoutMnemonics.replace(
    derivationPathFingerprintPattern,
    redactedValue
  );
  const withoutFingerprints = fingerprintContextPattern.test(withoutKeyOrigins)
    ? withoutKeyOrigins.replace(eightHexPattern, redactedValue)
    : withoutKeyOrigins;
  const withoutPatterns = valuePatterns.reduce(
    (result, pattern) => result.replace(pattern, redactedValue),
    withoutFingerprints
  );
  return redactBase58Candidates(
    redactBase58Candidates(withoutPatterns, wifPattern),
    legacyAddressPattern
  );
}

function redactSensitiveKeyValue(value: unknown) {
  if (Array.isArray(value)) return `[${value.length} items]`;
  if (value === null || value === undefined) return value;
  return redactedValue;
}

function redactEntries(entries: [string, unknown][], ancestors: Set<object>) {
  const result: Record<string, unknown> = {};
  for (const [key, entryValue] of entries) {
    result[key] = isSensitiveKey(key)
      ? redactSensitiveKeyValue(entryValue)
      : redactValue(entryValue, ancestors);
  }
  return result;
}

function getErrorEntries(error: Error): [string, unknown][] {
  const causeEntries: [string, unknown][] = 'cause' in error ? [['cause', error.cause]] : [];
  return [
    ['name', error.name],
    ['message', error.message],
    ['stack', error.stack],
    ...causeEntries,
    ...Object.entries(error),
  ];
}

function redactObject(value: object, ancestors: Set<object>): unknown {
  if (value instanceof Error) return redactEntries(getErrorEntries(value), ancestors);
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return redactedValue;
  if (Array.isArray(value)) return value.map(item => redactValue(item, ancestors));
  if (value instanceof Date) return value.toISOString();
  if (BigNumber.isBigNumber(value)) return value.toString();
  return redactEntries(Object.entries(value), ancestors);
}

function redactValue(value: unknown, ancestors: Set<object>): unknown {
  if (typeof value === 'string') return redactString(value);
  if (typeof value !== 'object' || value === null) return value;
  if (ancestors.has(value)) return circularValue;
  ancestors.add(value);
  try {
    return redactObject(value, ancestors);
  } finally {
    ancestors.delete(value);
  }
}

function redactSafely(value: unknown) {
  try {
    return redactValue(value, new Set());
  } catch {
    return redactedValue;
  }
}

export function redactLogMessage(message: unknown) {
  if (typeof message === 'string') {
    const redacted = redactSafely(message);
    return typeof redacted === 'string' ? redacted : redactedValue;
  }
  try {
    return JSON.stringify(redactSafely(message)) ?? redactedValue;
  } catch {
    return redactedValue;
  }
}

export function redactLogArgs(args: unknown[]) {
  return args.map(arg => redactSafely(arg));
}
