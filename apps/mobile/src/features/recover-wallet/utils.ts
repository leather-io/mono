import { isValidMnemonicWord } from '@leather.io/crypto';

export function getInvalidMnemonicWords(recoveryMnemonic: string) {
  return recoveryMnemonic
    .trim()
    .split(/\s+/g)
    .filter(word => !isValidMnemonicWord(word));
}
