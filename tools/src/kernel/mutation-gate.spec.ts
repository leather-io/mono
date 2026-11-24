import { describe, expect, test } from 'vitest';

import { type Mutant, runMutationGate } from './mutation-gate.js';

const source = 'if (value > limit) throw new Error();\nreturn encode(value);\n';

function mutant(name: string, find: string, replace: string): Mutant {
  return { name, file: 'kernel.ts', spec: 'kernel.spec.ts', find, replace };
}

function harness(testsPass: (content: string) => boolean) {
  const files = new Map([['kernel.ts', source]]);
  const written: string[] = [];
  const log: string[] = [];
  return {
    files,
    written,
    log,
    options: {
      readFile(file: string) {
        return files.get(file) ?? '';
      },
      writeFile(file: string, content: string) {
        files.set(file, content);
        written.push(content);
      },
      testsPass() {
        const content = files.get('kernel.ts') ?? '';
        return testsPass(content);
      },
      log(line: string) {
        log.push(line);
      },
    },
  };
}

describe(runMutationGate.name, () => {
  test('reports a change the tests notice as caught and restores the file', () => {
    const { files, options } = harness(content => content === source);
    const result = runMutationGate({
      ...options,
      mutants: [mutant('bound dropped', 'value > limit', 'false')],
    });
    expect(result).toEqual({ caught: ['bound dropped'], survived: [], stale: [] });
    expect(files.get('kernel.ts')).toBe(source);
  });

  test('reports a change the tests do not notice as survived and restores the file', () => {
    const { files, options, log } = harness(() => true);
    const result = runMutationGate({
      ...options,
      mutants: [mutant('bound dropped', 'value > limit', 'false')],
    });
    expect(result).toEqual({ caught: [], survived: ['bound dropped'], stale: [] });
    expect(files.get('kernel.ts')).toBe(source);
    expect(log).toEqual(['SURVIVED  bound dropped']);
  });

  test('runs the tests against the changed file', () => {
    const seen: string[] = [];
    const { options } = harness(content => {
      seen.push(content);
      return content === source;
    });
    runMutationGate({ ...options, mutants: [mutant('bound dropped', 'value > limit', 'false')] });
    expect(seen).toEqual([source, source.replace('value > limit', 'false')]);
  });

  test('reports a change whose target text is missing or repeated as stale, without running it', () => {
    const { options, written } = harness(content => content === source);
    const result = runMutationGate({
      ...options,
      mutants: [mutant('missing', 'no such text', 'x'), mutant('repeated', 'value', 'x')],
    });
    expect(result).toEqual({ caught: [], survived: [], stale: ['missing', 'repeated'] });
    expect(written).toEqual([]);
  });

  test('restores the file even when running the tests throws', () => {
    let calls = 0;
    const { files, options } = harness(() => {
      calls += 1;
      if (calls > 1) throw new Error('runner crashed');
      return true;
    });
    expect(() =>
      runMutationGate({
        ...options,
        mutants: [mutant('bound dropped', 'value > limit', 'false')],
      })
    ).toThrowError('runner crashed');
    expect(files.get('kernel.ts')).toBe(source);
  });

  test('refuses to start when the tests already fail', () => {
    const { options, written } = harness(() => false);
    expect(() =>
      runMutationGate({
        ...options,
        mutants: [mutant('bound dropped', 'value > limit', 'false')],
      })
    ).toThrowError('Tests fail before any change is made: kernel.spec.ts');
    expect(written).toEqual([]);
  });
});
