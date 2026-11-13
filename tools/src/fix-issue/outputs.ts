import { appendFileSync } from 'node:fs';

type StepOutputs = Readonly<Record<string, string | number | boolean>>;

export function writeStepOutputs(outputs: StepOutputs, file = process.env.GITHUB_OUTPUT): void {
  if (!file) return;
  const lines = Object.entries(outputs).map(([key, value]) => `${key}=${String(value)}\n`);
  appendFileSync(file, lines.join(''));
}
