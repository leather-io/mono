import { SIGN_IN_MESSAGE_FIRST_LINE } from '@leather.io/constants';

export function shouldRefuseSignInMessageSigning(
  message: string,
  origin: string | undefined
): boolean {
  const lines = message.split(/\r?\n/);
  if (lines[0] !== SIGN_IN_MESSAGE_FIRST_LINE) return false;
  if (!origin) return true;
  return lines[1] !== `Domain: ${origin}`;
}
