// Turning wallet responses into something a person — and a Playwright
// selector — can read.
import type { Outcome } from '../types';

export function safeStringify(value: unknown): string {
  if (value === undefined) return 'undefined';
  // Track only the current ancestor path so genuine cycles are flagged while
  // shared-but-acyclic sibling references are still serialized in full.
  const ancestors: object[] = [];
  function normalize(val: unknown): unknown {
    if (val instanceof Error) return { name: val.name, message: val.message };
    if (typeof val === 'bigint') return val.toString();
    if (val instanceof Uint8Array) return `0x${Buffer.from(val).toString('hex')}`;
    if (val === null || typeof val !== 'object') return val;
    if (ancestors.includes(val)) return '[Circular]';
    ancestors.push(val);
    const out = Array.isArray(val)
      ? val.map(normalize)
      : Object.fromEntries(Object.entries(val).map(([key, child]) => [key, normalize(child)]));
    ancestors.pop();
    return out;
  }
  return JSON.stringify(normalize(value), null, 2);
}

export function describeOutcome(outcome: Outcome): string {
  if (outcome === 'success') return 'expects success';
  if (outcome === 'manual') return 'depends on wallet state';
  return `expects error ${outcome.error}`;
}

export function shortenMiddle(value: string, keep = 8): string {
  return value.length <= keep * 2 + 1 ? value : `${value.slice(0, keep)}…${value.slice(-keep)}`;
}
