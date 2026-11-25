import { z } from 'zod';

import { type CommandRunner, runCommand } from './exec.js';
import { readRequiredEnv } from './github.js';

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

function buildClaudeArgs({ systemPromptPath, schema }: ClaudeArgsOptions): string[] {
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

function parseClaudeOutput(text: string): unknown {
  try {
    const parsed = resultSchema.safeParse(JSON.parse(text));
    if (!parsed.success || parsed.data.is_error || parsed.data.structured_output === undefined) {
      return undefined;
    }
    return parsed.data.structured_output;
  } catch {
    return undefined;
  }
}

interface RunClaudeOptions extends ClaudeArgsOptions {
  readonly prompt: string;
  readonly cwd: string;
}

export function runClaude(
  { prompt, cwd, ...argsOptions }: RunClaudeOptions,
  run: CommandRunner = runCommand
): unknown {
  const result = run(readRequiredEnv('CLAUDE_BIN'), buildClaudeArgs(argsOptions), {
    cwd,
    input: prompt,
    env: withoutJobCredentials(process.env),
    timeoutMs: claudeTimeoutMs,
  });
  process.stderr.write(result.stderr);
  const output = result.status === 0 ? parseClaudeOutput(result.stdout) : undefined;
  if (output === undefined) {
    console.log(`::warning::Claude exited with ${result.status} and no structured output`);
  }
  return output;
}
