import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const leanOracleBinary =
  process.env.LEAN_KERNEL_ORACLE_BIN ??
  fileURLToPath(new URL('../.lake/build/bin/kernel-oracle', import.meta.url));

export const leanOracleAvailable = existsSync(leanOracleBinary);
export const leanOracleRequired = process.env.REQUIRE_LEAN_ORACLE === '1';

const linesPerCall = 4000;
const maxOracleOutputBytes = 256 * 1024 * 1024;
const oracleTimeoutMilliseconds = 60_000;

function askOnce(lines: string[]): string[] {
  const stdout = execFileSync(leanOracleBinary, {
    input: lines.join('\n') + '\n',
    encoding: 'utf8',
    maxBuffer: maxOracleOutputBytes,
    timeout: oracleTimeoutMilliseconds,
  });
  return stdout.replace(/\n$/, '').split('\n');
}

export function askLeanOracle(lines: string[]): string[] {
  const answers: string[] = [];
  for (let start = 0; start < lines.length; start += linesPerCall) {
    answers.push(...askOnce(lines.slice(start, start + linesPerCall)));
  }
  return answers;
}

export function readKernelSource(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

export function typeScriptKinds(source: string, typeName: string): string[] {
  const start = source.indexOf(`type ${typeName} =`);
  if (start < 0) throw new Error(`No type ${typeName} in the TypeScript source`);
  const declaration = source.slice(start, source.indexOf(';\n\n', start));
  const tagged = Array.from(declaration.matchAll(/kind: '(\w+)'/g), match => match[1]);
  if (tagged.length > 0) return tagged;
  return Array.from(declaration.matchAll(/'(\w+)'/g), match => match[1]);
}

export function leanConstructors(source: string, typeName: string): string[] {
  const start = source.indexOf(`inductive ${typeName} where`);
  if (start < 0) throw new Error(`No inductive ${typeName} in the Lean source`);
  const rest = source.slice(start);
  const end = rest.search(/\n\n(?=\S)/);
  const body = end < 0 ? rest : rest.slice(0, end);
  return Array.from(body.matchAll(/^\s+\| (\w+)/gm), match => match[1]);
}
