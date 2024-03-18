import type { NetworkModes } from '@leather-wallet/constants';
import { BigNumber } from 'bignumber.js';

export type { LiteralUnion, ValueOf, Entries } from './src/type-utils';
export { createCounter } from './src/counter';
export * from './src/math';
export * from './src/money';
export * from './src/truncate-middle';

export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
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

export function pullContractIdFromIdentity(identifier: string) {
  return identifier.split('::')[0];
}

export function formatContractId(address: string, name: string) {
  return `${address}.${name}`;
}

export function createNullArrayOfLength(length: number) {
  return new Array(length).fill(null);
}
