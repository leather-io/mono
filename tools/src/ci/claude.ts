import { z } from 'zod';

import { type CommandRunner, runCommand } from './exec.js';

export const claudeModel = 'claude-opus-5-5';
const claudeEffort = 'high';
const claudeTimeoutMs = 10 * 60 * 1000;
const jobCredentialPattern = /^(?:GITHUB_TOKEN$|AWS_|ACTIONS_)/;

function withoutJobCredentials(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  return Object.fromEntries(
    Object.entries(env).filter(([name]) => !jobCredentialPattern.test(name))
  );
}

const resultSchema = z.object({
  is_error: z.unknown().optional(),
  structured_output: z.unknown().optional(),
});

interface ClaudeArgsOptions {
  readonly systemPromptPath: string;
  readonly schema: Record<string, unknown>;
}

export function buildClaudeArgs({ systemPromptPath, schema }: ClaudeArgsOptions): string[] {
  return [
    '--print',
    '--output-format',
    'json',
    '--model',
    claudeModel,
    '--effort',
    claudeEffort,
    '--tools',
    '',
    '--setting-sources',
    '',
    '--strict-mcp-config',
    '--no-session-persistence',
    '--system-prompt-file',
    systemPromptPath,
    '--json-schema',
    JSON.stringify(schema),
  ];
}

export function parseClaudeOutput(text: string): unknown {
  try {
    const parsed = resultSchema.safeParse(JSON.parse(text));
    if (!parsed.success || parsed.data.is_error || parsed.data.structured_output === undefined) {
      return null;
    }
    return parsed.data.structured_output;
  } catch {
    return null;
  }
}

interface RunClaudeOptions {
  readonly args: readonly string[];
  readonly prompt: string;
  readonly cwd: string;
}

export function runClaude(
  { args, prompt, cwd }: RunClaudeOptions,
  run: CommandRunner = runCommand
): unknown {
  const result = run(process.env.CLAUDE_BIN || 'claude', args, {
    cwd,
    input: prompt,
    env: withoutJobCredentials(process.env),
    timeoutMs: claudeTimeoutMs,
  });
  process.stderr.write(result.stderr);
  const output = parseClaudeOutput(result.stdout);
  if (result.status !== 0 || output === null) {
    throw new Error(`Claude exited with ${result.status} and no structured output`);
  }
  return output;
}
