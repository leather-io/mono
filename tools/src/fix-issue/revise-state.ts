import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { z } from 'zod';

export const maxRevises = 5;
export const botAccountType = 'Bot';
const botBranchPattern = /^bot\/fix-issue-([1-9]\d*)-(\d+)$/;

const reviseStateSchema = z.object({
  head: z.string(),
  merge: z.boolean(),
  conflicts: z.array(z.string()),
  items: z.array(z.string()),
  since: z.string(),
});

export const revisePullSchema = z.object({
  number: z.number(),
  node_id: z.string(),
  state: z.string(),
  draft: z.boolean(),
  title: z.string(),
  body: z.string().nullable(),
  html_url: z.string(),
  user: z.object({ login: z.string(), type: z.string().optional() }).nullable(),
  head: z.object({
    ref: z.string(),
    sha: z.string(),
    repo: z.object({ full_name: z.string() }).nullable(),
  }),
  base: z.object({ ref: z.string() }),
});

export type ReviseState = z.infer<typeof reviseStateSchema>;

export function readReviseState(file: string): ReviseState | null {
  if (!existsSync(file)) return null;
  return reviseStateSchema.parse(JSON.parse(readFileSync(file, 'utf8')));
}

export function writeReviseState(file: string, state: ReviseState): void {
  writeFileSync(file, `${JSON.stringify(state, null, 2)}\n`);
}

interface FixIssueBranch {
  readonly issue: string;
  readonly runId: string;
}

export function fixIssueBranch(branch: string): FixIssueBranch | null {
  const [, issue, runId] = botBranchPattern.exec(branch) ?? [];
  return issue === undefined || runId === undefined ? null : { issue, runId };
}

export function issueOfBranch(branch: string): number | null {
  const issue = fixIssueBranch(branch)?.issue;
  return issue === undefined ? null : Number(issue);
}

const reviseMarkerPattern = /^<!-- fix-issue:revise \d+ -->/;

export function reviseMarker(ordinal: number): string {
  return `<!-- fix-issue:revise ${ordinal} -->`;
}

export function isReviseSummary(body: string | null): boolean {
  return reviseMarkerPattern.test((body ?? '').trimStart());
}
