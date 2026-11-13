import { parse } from 'yaml';
import { z } from 'zod';

export const botBranchGuard = "!startsWith(github.head_ref || github.ref_name, 'bot/')";

const trustedPushBranches = new Set(['dev', 'main']);
const untrustedEvents = new Set(['pull_request', 'pull_request_target']);
const expressionPattern = /\$\{\{([\s\S]*?)\}\}/g;
const secretsContextPattern = /(?<![\w.])secrets\b(?!\s*\.\s*GITHUB_TOKEN\b)/;
const wholeExpressionPattern = /^\$\{\{([\s\S]*)\}\}$/;

const stepSchema = z.looseObject({
  name: z.string().optional(),
  id: z.string().optional(),
  if: z.unknown().optional(),
});

const jobSchema = z.looseObject({
  if: z.unknown().optional(),
  environment: z.unknown().optional(),
  permissions: z.unknown().optional(),
  secrets: z.unknown().optional(),
  uses: z.unknown().optional(),
  steps: z.array(stepSchema).optional(),
});

const workflowSchema = z.looseObject({
  on: z.unknown().optional(),
  permissions: z.unknown().optional(),
  env: z.unknown().optional(),
  jobs: z.record(z.string(), jobSchema),
});

const pushFilterSchema = z.looseObject({
  branches: z.array(z.string()).optional(),
  'branches-ignore': z.unknown().optional(),
  tags: z.unknown().optional(),
  'tags-ignore': z.unknown().optional(),
});

type Job = z.infer<typeof jobSchema>;

type GuardReason = 'environment' | 'secrets' | 'contents-write' | 'id-token-write';

interface JobViolation {
  readonly file: string;
  readonly job: string;
  readonly reasons: readonly string[];
}

interface WorkflowSource {
  readonly file: string;
  readonly content: string;
}

type Baseline = Readonly<Record<string, readonly string[]>>;

interface GuardCheckResult {
  readonly violations: readonly JobViolation[];
  readonly allowed: readonly JobViolation[];
  readonly stale: readonly { readonly file: string; readonly job: string }[];
  readonly parseErrors: readonly string[];
}

function isTrustedPush(filter: unknown): boolean {
  const parsed = pushFilterSchema.safeParse(filter);
  if (!parsed.success) return false;
  const { branches, tags } = parsed.data;
  if (branches === undefined || tags !== undefined) return false;
  if (parsed.data['branches-ignore'] !== undefined || parsed.data['tags-ignore'] !== undefined) {
    return false;
  }
  return branches.every(branch => trustedPushBranches.has(branch));
}

export function untrustedTriggers(on: unknown): string[] {
  if (typeof on === 'string') return on === 'push' || untrustedEvents.has(on) ? [on] : [];
  const eventList = z.array(z.string()).safeParse(on);
  if (eventList.success) {
    return eventList.data.filter(event => event === 'push' || untrustedEvents.has(event));
  }
  const events = z.record(z.string(), z.unknown()).safeParse(on);
  if (!events.success) return [];
  return Object.entries(events.data)
    .filter(([event, filter]) =>
      event === 'push' ? !isTrustedPush(filter) : untrustedEvents.has(event)
    )
    .map(([event]) => event);
}

function splitTopLevel(expression: string, operator: '&&' | '||'): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quoted = false;
  let start = 0;
  for (let index = 0; index < expression.length; index += 1) {
    const char = expression[index];
    if (char === "'") quoted = !quoted;
    if (quoted) continue;
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (depth === 0 && expression.startsWith(operator, index)) {
      parts.push(expression.slice(start, index).trim());
      start = index + operator.length;
      index += operator.length - 1;
    }
  }
  parts.push(expression.slice(start).trim());
  return parts;
}

export function hasBotBranchGuard(condition: unknown): boolean {
  if (typeof condition !== 'string') return false;
  const trimmed = condition.trim();
  const expression = (wholeExpressionPattern.exec(trimmed)?.[1] ?? trimmed)
    .replace(/\s+/g, ' ')
    .trim();
  if (splitTopLevel(expression, '||').length > 1) return false;
  return splitTopLevel(expression, '&&').includes(botBranchGuard);
}

function referencesSecrets(value: unknown): boolean {
  if (value === undefined) return false;
  const text = JSON.stringify(value);
  return Array.from(text.matchAll(expressionPattern)).some(
    ([, expression]) => expression !== undefined && secretsContextPattern.test(expression)
  );
}

function writeScopes(permissions: unknown): GuardReason[] {
  if (permissions === 'write-all') return ['contents-write', 'id-token-write'];
  const scopes = z.record(z.string(), z.unknown()).safeParse(permissions);
  if (!scopes.success) return [];
  const reasons: GuardReason[] = [];
  if (scopes.data['contents'] === 'write') reasons.push('contents-write');
  if (scopes.data['id-token'] === 'write') reasons.push('id-token-write');
  return reasons;
}

function stepLabel(step: z.infer<typeof stepSchema>, index: number): string {
  return step.name ?? step.id ?? `step ${index + 1}`;
}

function jobReasons(job: Job, workflowPermissions: unknown, workflowEnv: unknown): string[] {
  if (hasBotBranchGuard(job.if)) return [];
  const reasons: string[] = [];
  if (job.environment !== undefined) reasons.push('environment');
  if (job.uses !== undefined) reasons.push('reusable workflow');
  const { steps, ...jobWithoutSteps } = job;
  if (
    referencesSecrets(workflowEnv) ||
    referencesSecrets(jobWithoutSteps) ||
    job.secrets !== undefined
  ) {
    reasons.push('secrets');
  }
  for (const [index, step] of (steps ?? []).entries()) {
    if (referencesSecrets(step) && !hasBotBranchGuard(step.if)) {
      reasons.push(`secrets in ${stepLabel(step, index)}`);
    }
  }
  reasons.push(...writeScopes(job.permissions ?? workflowPermissions));
  return reasons;
}

export function findWorkflowViolations(source: WorkflowSource): JobViolation[] {
  const workflow = workflowSchema.parse(parse(source.content));
  if (untrustedTriggers(workflow.on).length === 0) return [];
  return Object.entries(workflow.jobs)
    .map(([job, definition]) => ({
      file: source.file,
      job,
      reasons: jobReasons(definition, workflow.permissions, workflow.env),
    }))
    .filter(violation => violation.reasons.length > 0);
}

function inBaseline(baseline: Baseline, violation: JobViolation): boolean {
  return baseline[violation.file]?.includes(violation.job) ?? false;
}

export function checkBotBranchSecrets(
  sources: readonly WorkflowSource[],
  baseline: Baseline
): GuardCheckResult {
  const parseErrors: string[] = [];
  const found: JobViolation[] = [];
  for (const source of sources) {
    try {
      found.push(...findWorkflowViolations(source));
    } catch (error) {
      parseErrors.push(`${source.file}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  const stale = Object.entries(baseline).flatMap(([file, jobs]) =>
    jobs
      .filter(job => !found.some(violation => violation.file === file && violation.job === job))
      .map(job => ({ file, job }))
  );
  return {
    violations: found.filter(violation => !inBaseline(baseline, violation)),
    allowed: found.filter(violation => inBaseline(baseline, violation)),
    stale,
    parseErrors,
  };
}

export function formatGuardReport(result: GuardCheckResult): string {
  const lines: string[] = [];
  for (const error of result.parseErrors) lines.push(`error: ${error}`);
  for (const { file, job, reasons } of result.violations) {
    lines.push(
      `error: ${file} job "${job}" runs code from any branch and gets ${reasons.join(', ')}. ` +
        `Add \`if: \${{ ${botBranchGuard} }}\` to the job, or to each step that uses a secret.`
    );
  }
  for (const { file, job } of result.stale) {
    lines.push(
      `error: ${file} job "${job}" is in the baseline but no longer needs to be; remove it.`
    );
  }
  for (const { file, job, reasons } of result.allowed) {
    lines.push(`baseline: ${file} job "${job}" (${reasons.join(', ')})`);
  }
  const failed = result.parseErrors.length + result.violations.length + result.stale.length > 0;
  lines.push(
    failed
      ? 'bot-branch-secret-guard: failed'
      : `bot-branch-secret-guard: ok (${result.allowed.length} baseline job${result.allowed.length === 1 ? '' : 's'})`
  );
  return lines.join('\n');
}
