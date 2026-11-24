import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { z } from 'zod';

export const maxRevises = 5;
const botBranchPattern = /^bot\/fix-issue-([1-9]\d*)-(\d+)$/;

const itemSchema = z.object({
  id: z.string(),
  kind: z.enum(['instructions', 'thread', 'review', 'merge']),
});

const reviseStateSchema = z.object({
  pullRequest: z.number().int().positive(),
  issue: z.number().int().positive(),
  branch: z.string(),
  head: z.string(),
  dev: z.string(),
  ordinal: z.number().int().positive(),
  merge: z.boolean(),
  conflicts: z.array(z.string()),
  items: z.array(itemSchema),
  since: z.string().optional(),
});

export type ReviseItem = z.infer<typeof itemSchema>;
export type ReviseState = z.infer<typeof reviseStateSchema>;

export function readReviseState(file: string): ReviseState | null {
  if (!existsSync(file)) return null;
  return reviseStateSchema.parse(JSON.parse(readFileSync(file, 'utf8')));
}

export function writeReviseState(file: string, state: ReviseState): void {
  writeFileSync(file, `${JSON.stringify(state, null, 2)}\n`);
}

export function issueOfBranch(branch: string): number | null {
  const issue = botBranchPattern.exec(branch)?.[1];
  return issue === undefined ? null : Number(issue);
}

const reviseMarkerPattern = /^<!-- fix-issue:revise \d+ -->/;

export function reviseMarker(ordinal: number): string {
  return `<!-- fix-issue:revise ${ordinal} -->`;
}

export function isReviseSummary(body: string | null): boolean {
  return reviseMarkerPattern.test((body ?? '').trimStart());
}
