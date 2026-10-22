import { spawnSync } from 'node:child_process';

export const mnemonicVariableName = 'EXTENSION_INTEGRATION_TEST_MNEMONIC';
export const redactedSecret = '[redacted]';
const mnemonicRepository = 'leather-io/mono';

export interface MnemonicSource {
  fromGh: boolean;
}

function nonEmpty(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (trimmed === undefined || trimmed.length === 0) return undefined;
  return trimmed;
}

export function resolveMnemonic({ fromGh }: MnemonicSource): string | undefined {
  if (!fromGh) return nonEmpty(process.env[mnemonicVariableName]);
  const result = spawnSync(
    'gh',
    ['variable', 'get', mnemonicVariableName, '-R', mnemonicRepository],
    {
      encoding: 'utf8',
    }
  );
  if (result.error !== undefined || result.status !== 0) return undefined;
  return nonEmpty(result.stdout);
}

export function describeMissingMnemonic(): string {
  return `--onboard needs the test mnemonic: export ${mnemonicVariableName} in the environment, or pass --mnemonic-from-gh to read the ${mnemonicRepository} repository variable with gh`;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function createRedactor(secrets: readonly string[]): (text: string) => string {
  const patterns = secrets.flatMap(secret => {
    const words = secret
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0);
    if (words.length === 0) return [];
    return [new RegExp(words.map(escapeRegExp).join('\\s+'), 'g')];
  });
  return text =>
    patterns.reduce((redacted, pattern) => redacted.replace(pattern, redactedSecret), text);
}
