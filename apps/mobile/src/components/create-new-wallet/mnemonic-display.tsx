import { Box } from '@leather.io/ui/native';

import { MnemonicWordBox } from './mnemonic-word-box';

export function MnemonicDisplay({ mnemonic }: { mnemonic: string | null }) {
  if (!mnemonic) return null;

  const mnemonicWords = mnemonic.split(' ');

  return (
    <Box justifyContent="center" flexDirection="row" flexWrap="wrap" gap="2">
      {mnemonicWords.map((word, idx) => (
        <MnemonicWordBox key={word + idx} wordIdx={idx + 1} word={word} />
      ))}
    </Box>
  );
}
