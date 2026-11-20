import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

const proofFiles: Record<string, string> = {
  Codec: './codec/CodecProofs.lean',
  Format: './format/FormatProofs.lean',
};

function readSource(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

function auditedTheorems(): string[] {
  const audit = readSource('./Audit.lean');
  const auditedSection = audit.slice(audit.indexOf('let audited'));
  return Array.from(auditedSection.matchAll(/``([\w.?]+)/g), match => match[1]);
}

function statementOf(qualifiedName: string): string {
  const [namespace, name] = qualifiedName.split('.');
  const source = readSource(proofFiles[namespace]);
  const start = source.indexOf(`theorem ${name} `);
  if (start < 0) throw new Error(`No theorem named ${qualifiedName} in ${proofFiles[namespace]}`);
  const end = source.indexOf(':=', start);
  return source.slice(start, end).replace(/\s+/g, ' ').trim();
}

const pinnedStatements = readSource('./theorem-statements.txt');

describe('theorem statements', () => {
  test('match the pinned statements, so a weakened theorem shows up as a diff to that file', () => {
    const current = auditedTheorems()
      .map(name => `${name}\n  ${statementOf(name)}\n`)
      .join('\n');
    expect(current).toBe(pinnedStatements);
  });
});
