import { z } from 'zod';

export const minSupportedExtensionVersion = '6.112.0';

interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
}

// Non-release extension builds append a random fourth segment ("6.111.0.512"),
// so only the leading major.minor.patch is read.
const versionPattern = /^(\d+)\.(\d+)\.(\d+)/;

export function parseExtensionVersion(version: string): ParsedVersion | null {
  const match = versionPattern.exec(version.trim());
  if (!match) return null;
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}

function compareVersions(a: ParsedVersion, b: ParsedVersion): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
}

// Unparsable versions are treated as supported: only a version that is
// demonstrably older than the minimum is refused.
export function isExtensionVersionSupported(version: string): boolean {
  const installed = parseExtensionVersion(version);
  const minimum = parseExtensionVersion(minSupportedExtensionVersion);
  if (!installed || !minimum) return true;
  return compareVersions(installed, minimum) >= 0;
}

interface ProductInfoProvider {
  getProductInfo(): unknown;
}

const productInfoProviderSchema = z.custom<ProductInfoProvider>(
  provider =>
    typeof provider === 'object' &&
    provider !== null &&
    'getProductInfo' in provider &&
    typeof provider.getProductInfo === 'function'
);

export function readExtensionVersion(provider: unknown): string | null {
  const parsedProvider = productInfoProviderSchema.safeParse(provider);
  if (!parsedProvider.success) return null;
  try {
    const info = parsedProvider.data.getProductInfo();
    if (!info || typeof info !== 'object' || !('version' in info)) return null;
    return typeof info.version === 'string' ? info.version : null;
  } catch {
    return null;
  }
}
