import { BigNumber } from 'bignumber.js';

import { KEBAB_REGEX } from '@leather.io/constants';
import type { NetworkModes } from '@leather.io/models';

export { createCounter } from './counter';
export * from './math';
export * from './money';
export * from './sort-assets';
export * from './truncate-middle';
export { spamFilter } from './spam-filter/spam-filter';
export { extractPhraseFromString } from './extract-phrase-from-string/extract-phrase-from-string';
export { pxStringToNumber } from './px-string-to-number/px-string-to-number';

export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isEmptyString(value: unknown): value is '' {
  return isString(value) && value === '';
}

export function isBigInt(value: unknown): value is bigint {
  return typeof value === 'bigint';
}

export function isUndefined(value: unknown): value is undefined {
  return typeof value === 'undefined';
}

export function isFunction(value: unknown): value is () => void {
  return typeof value === 'function';
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isObject(value: unknown): value is object {
  return typeof value === 'object';
}

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function isEmpty(value: object) {
  return Object.keys(value).length === 0;
}

export function isDefined<T>(argument: T | undefined): argument is T {
  return !isUndefined(argument);
}

export function isTypedArray(val: unknown): val is Uint8Array {
  const TypedArray = Object.getPrototypeOf(Uint8Array);
  return val instanceof TypedArray;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop() {}

export function ensureArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

export function undefinedIfLengthZero<T extends any[]>(arr: T) {
  return arr.length ? arr : undefined;
}

type NetworkMap<T> = Record<NetworkModes, T>;

export function whenNetwork(mode: NetworkModes) {
  return <T extends NetworkMap<unknown>>(networkMap: T) => networkMap[mode] as T[NetworkModes];
}

export function isEmptyArray(data: unknown[]) {
  return data.length === 0;
}

// TODO: extension concept, remove remove from utils
export const defaultWalletKeyId = 'default' as const;

export function reverseBytes(bytes: Buffer): Buffer;
export function reverseBytes(bytes: Uint8Array): Uint8Array;
export function reverseBytes(bytes: Buffer | Uint8Array) {
  if (Buffer.isBuffer(bytes)) return Buffer.from(bytes).reverse();
  return new Uint8Array(bytes.slice().reverse());
}

export function makeNumberRange(num: number) {
  return [...Array(num).keys()];
}

export function createNumArrayOfRange(fromIndex: number, toIndex: number) {
  const result = [];
  for (let i = fromIndex; i <= toIndex; i++) {
    result.push(i);
  }
  return result;
}

export async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function sumNumbers(nums: number[]) {
  return nums.reduce((acc, num) => acc.plus(num), new BigNumber(0));
}

export function isFulfilled<T>(p: PromiseSettledResult<T>): p is PromiseFulfilledResult<T> {
  return p.status === 'fulfilled';
}

export function isRejected<T>(p: PromiseSettledResult<T>): p is PromiseRejectedResult {
  return p.status === 'rejected';
}

// TODO: Move to @leather.io/stacks
export function getPrincipalFromContractId(identifier: string) {
  return identifier.split('::')[0];
}

// TODO: Move to @leather.io/stacks
export function formatContractId(address: string, name: string) {
  return `${address}.${name}`;
}

export function createNullArrayOfLength(length: number) {
  return new Array(length).fill(null);
}

export function safelyFormatHexTxid(id: string) {
  const prefix = '0x';
  if (id.startsWith(prefix)) return id;
  return prefix + id;
}

function kebabCase(str: string) {
  return str.replace(KEBAB_REGEX, match => '-' + match.toLowerCase());
}

function getLetters(string: string, offset = 1) {
  return string.slice(0, offset);
}

export function getTicker(value: string) {
  let name = kebabCase(value);
  if (name.includes('-')) {
    const words = name.split('-');
    if (words.length >= 3) {
      name = `${getLetters(words[0])}${getLetters(words[1])}${getLetters(words[2])}`;
    } else {
      name = `${getLetters(words[0])}${getLetters(words[1], 2)}`;
    }
  } else if (name.length >= 3) {
    name = `${getLetters(name, 3)}`;
  }
  return name.toUpperCase();
}

export function propIfDefined(prop: string, value: any) {
  return isBoolean(value) ? { [prop]: value } : {};
}

export function isHexString(value: string) {
  return /^[0-9a-fA-F]+$/.test(value);
}

export function toHexString(value: number) {
  return value.toString(16);
}

type MapFunction<T, U> = (value: T[keyof T], key: string) => U;

export function mapObject<T extends object, U>(
  obj: T,
  mapFn: MapFunction<T, U>
): { [K in keyof T]: U } {
  const result: Partial<{ [K in keyof T]: U }> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = mapFn(obj[key], key);
    }
  }

  return result as { [K in keyof T]: U };
}

export function assertIsTruthy<T>(val: T): asserts val is NonNullable<T> {
  if (!val) throw new Error(`expected: true, actual: ${val}`);
}
