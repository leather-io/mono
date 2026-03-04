import { SIP10_TOKEN_NAME_OVERRIDES } from '@leather.io/constants';

export function getSip10TokenNameWithOverrides(
  contractPrincipal: string,
  fallbackName: string
): string {
  return SIP10_TOKEN_NAME_OVERRIDES[contractPrincipal] ?? fallbackName;
}
