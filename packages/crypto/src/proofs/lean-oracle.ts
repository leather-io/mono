import fc from 'fast-check';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect } from 'vitest';

const leanOracleBinary =
  process.env.LEAN_CRYPTO_ORACLE_BIN ??
  fileURLToPath(new URL('../../.lake/build/bin/crypto-oracle', import.meta.url));

export const leanOracleAvailable = existsSync(leanOracleBinary);
export const leanOracleRequired = process.env.REQUIRE_LEAN_ORACLE === '1';

const unsupportedAnswer = 'unsupported';
const batchSize = 32;
const defaultRuns = 60;
const defaultMinimumSupportedShare = 0.5;

interface LeanOracleCase {
  call: string;
  observed: string;
}

export function encodeText(text: string): string {
  return Array.from(text, character => (character.codePointAt(0) ?? 0).toString(16)).join(',');
}

export function leanCall(name: string, ...args: string[]): string {
  return [name, ...args].join(' ');
}

export function askLeanOracle(calls: string[]): string[] {
  const stdout = execFileSync(leanOracleBinary, {
    input: calls.join('\n') + '\n',
    encoding: 'utf8',
  });
  return stdout.replace(/\n$/, '').split('\n');
}

export function observeText(run: () => string | undefined): string {
  try {
    const value = run();
    return value === undefined ? 'undefined' : `ok ${encodeText(value)}`;
  } catch {
    return 'throws';
  }
}

export function observeValue(run: () => number | boolean): string {
  try {
    return `ok ${String(run())}`;
  } catch {
    return 'throws';
  }
}

interface AgreementOptions {
  minimumSupportedShare?: number;
  numRuns?: number;
}

export function expectAgreementWithLeanModel<T>(
  arbitrary: fc.Arbitrary<T>,
  toCase: (input: T) => LeanOracleCase,
  {
    minimumSupportedShare = defaultMinimumSupportedShare,
    numRuns = defaultRuns,
  }: AgreementOptions = {}
): void {
  const tally = { total: 0, supported: 0 };
  fc.assert(
    fc.property(fc.array(arbitrary, { minLength: 1, maxLength: batchSize }), inputs => {
      const cases = inputs.map(toCase);
      const answers = askLeanOracle(cases.map(({ call }) => call));
      expect(answers).toHaveLength(cases.length);
      cases.forEach(({ call, observed }, index) => {
        const answer = answers[index];
        tally.total += 1;
        if (answer === unsupportedAnswer) return;
        tally.supported += 1;
        expect({ call, typescript: observed }).toEqual({ call, typescript: answer });
      });
    }),
    { numRuns }
  );
  expect(tally.supported / tally.total).toBeGreaterThanOrEqual(minimumSupportedShare);
}
