import { spawnSync } from 'node:child_process';

interface CommandResult {
  readonly status: number;
  readonly stdout: string;
  readonly stderr: string;
}

interface RunOptions {
  readonly cwd: string;
  readonly input?: string;
  readonly env?: NodeJS.ProcessEnv;
}

export type CommandRunner = (
  command: string,
  args: readonly string[],
  options: RunOptions
) => CommandResult;

const maxOutputBytes = 512 * 1024 * 1024;

export function runCommand(
  command: string,
  args: readonly string[],
  { cwd, input, env }: RunOptions
): CommandResult {
  const result = spawnSync(command, args, {
    cwd,
    input,
    env: env ?? process.env,
    encoding: 'utf8',
    maxBuffer: maxOutputBytes,
  });
  const errorText = result.error ? result.error.message : '';
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? errorText,
  };
}

export function runOrThrow(command: string, args: readonly string[], options: RunOptions): string {
  const result = runCommand(command, args, options);
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed: ${result.stderr.trim()}`);
  }
  return result.stdout;
}

export function runAndEcho(
  command: string,
  args: readonly string[],
  options: RunOptions
): CommandResult {
  const result = runCommand(command, args, options);
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  return result;
}
