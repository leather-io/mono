import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { z } from 'zod';

import { refusedPaths } from './git.js';

const subjectPattern =
  /^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)\([a-z0-9][a-z0-9-]*\)!?: \S/;
const issueNumberPattern = /#\d/;
const maxSubjectLength = 100;
const maxScreenshots = 12;
const maxHandoffs = 20;
export const maxFollowUps = 20;
const screenshotIdPattern = /^[a-z0-9][a-z0-9-]{0,62}$/;
const maxFeedback = 200;
const feedbackIdPattern = /^[a-z]+(-\d+)?$/;

const lineSchema = z
  .string()
  .trim()
  .min(1, 'is empty')
  .refine(value => !value.includes('\n'), 'must be a single line');

const screenshotSchema = z.object({
  id: z.string().regex(screenshotIdPattern, 'must be lowercase and hyphenated'),
  caption: lineSchema,
});

export function subjectProblem(subject: string): string | null {
  if (subject === '') return 'commit: is empty';
  if (!subjectPattern.test(subject)) {
    return `commit: '${subject}' is not a conventional subject with a scope, like fix(extension): keep the fee row visible`;
  }
  if (issueNumberPattern.test(subject)) {
    return `commit: '${subject}' names an issue number; the pull request body closes the issue`;
  }
  if (subject.length > maxSubjectLength) {
    return `commit: '${subject}' is longer than ${maxSubjectLength} characters`;
  }
  return null;
}

const handoffSchema = z.object({
  path: lineSchema
    .refine(
      value => !value.startsWith('/') && !value.split('/').includes('..'),
      'must be a repo-relative path'
    )
    .refine(
      value => refusedPaths([value]).length === 1,
      'is a path this run may change; change it yourself instead of handing it off'
    ),
  change: lineSchema,
});

const feedbackSchema = z.object({
  id: z.string().regex(feedbackIdPattern, 'must be an id from the feedback file'),
  addressed: z.boolean(),
  reply: lineSchema,
});

type ListKey = 'why' | 'how' | 'tested';
const requiredWhenDone: readonly ListKey[] = ['why', 'how', 'tested'];

const fixStatusSchema = z
  .object({
    state: z.enum(['done', 'blocked']),
    commit: z.string().trim(),
    closes: z.array(z.number().int().positive()).default([]),
    why: z.array(lineSchema).default([]),
    how: z.array(lineSchema).default([]),
    tested: z.array(lineSchema).default([]),
    questions: z.array(lineSchema).default([]),
    screenshots: z.array(screenshotSchema).max(maxScreenshots).default([]),
    handoff: z.array(handoffSchema).max(maxHandoffs).default([]),
    followUps: z.array(lineSchema).max(maxFollowUps).default([]),
    feedback: z.array(feedbackSchema).max(maxFeedback).default([]),
  })
  .superRefine((status, context) => {
    const subject = subjectProblem(status.commit);
    if (subject) context.addIssue({ code: 'custom', message: subject });
    if (status.state === 'done') {
      for (const key of requiredWhenDone) {
        if (status[key].length === 0)
          context.addIssue({ code: 'custom', message: `${key}: has no entries` });
      }
    } else if (status.questions.length === 0 && status.handoff.length === 0) {
      context.addIssue({ code: 'custom', message: 'questions: has no entries' });
    }
  });

export type FixStatus = z.infer<typeof fixStatusSchema>;
type FixState = FixStatus['state'];

type StatusResult =
  | { readonly ok: true; readonly status: FixStatus }
  | { readonly ok: false; readonly problems: readonly string[] };

function describeIssue(issue: z.core.$ZodIssue): string {
  const where = issue.path.map(String).join('.');
  return where ? `${where}: ${issue.message}` : issue.message;
}

export function parseStatus(raw: unknown): StatusResult {
  const result = fixStatusSchema.safeParse(raw);
  if (result.success) return { ok: true, status: result.data };
  return { ok: false, problems: result.error.issues.map(describeIssue) };
}

type RawFile =
  | { readonly ok: true; readonly raw: unknown }
  | { readonly ok: false; readonly problem: string };

function readJson(file: string): RawFile {
  if (!existsSync(file)) return { ok: false, problem: `${file} does not exist` };
  try {
    return { ok: true, raw: JSON.parse(readFileSync(file, 'utf8')) };
  } catch (error) {
    return { ok: false, problem: `${file} is not valid JSON: ${String(error)}` };
  }
}

export function readStatus(file: string): StatusResult {
  const json = readJson(file);
  return json.ok ? parseStatus(json.raw) : { ok: false, problems: [json.problem] };
}

const stateOnlySchema = z.object({ state: z.enum(['done', 'blocked']) });

export function readState(file: string): FixState | null {
  const json = readJson(file);
  if (!json.ok) return null;
  const state = stateOnlySchema.safeParse(json.raw);
  return state.success ? state.data.state : null;
}

export function writeStatus(file: string, status: FixStatus): void {
  writeFileSync(file, `${JSON.stringify(status, null, 2)}\n`);
}

export function closesNumbers(status: FixStatus, issue: number): number[] {
  return [...new Set([issue, ...status.closes])];
}
