export interface Mutant {
  readonly name: string;
  readonly file: string;
  readonly spec: string;
  readonly find: string;
  readonly replace: string;
}

interface MutationGateOptions {
  readonly mutants: readonly Mutant[];
  readFile(file: string): string;
  writeFile(file: string, content: string): void;
  testsPass(spec: string): boolean;
  log(line: string): void;
}

interface MutationGateResult {
  readonly caught: string[];
  readonly survived: string[];
  readonly stale: string[];
}

function occurrences(source: string, text: string): number {
  return source.split(text).length - 1;
}

export function runMutationGate({
  mutants,
  readFile,
  writeFile,
  testsPass,
  log,
}: MutationGateOptions): MutationGateResult {
  const specs = [...new Set(mutants.map(mutant => mutant.spec))];
  const failingBefore = specs.filter(spec => !testsPass(spec));
  if (failingBefore.length > 0)
    throw new Error(`Tests fail before any change is made: ${failingBefore.join(', ')}`);

  const result: MutationGateResult = { caught: [], survived: [], stale: [] };
  for (const mutant of mutants) {
    const original = readFile(mutant.file);
    if (occurrences(original, mutant.find) !== 1) {
      result.stale.push(mutant.name);
      log(`stale     ${mutant.name}`);
      continue;
    }
    writeFile(mutant.file, original.replace(mutant.find, mutant.replace));
    try {
      const outcome = testsPass(mutant.spec) ? result.survived : result.caught;
      outcome.push(mutant.name);
      log(`${outcome === result.caught ? 'caught   ' : 'SURVIVED '} ${mutant.name}`);
    } finally {
      writeFile(mutant.file, original);
    }
  }
  return result;
}
