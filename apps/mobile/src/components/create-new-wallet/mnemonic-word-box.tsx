import { Box, Text } from '@leather.io/ui/native';

interface MnemonicWordBoxProps {
  wordIdx: number;
  word: string;
}

export function MnemonicWordBox({ wordIdx, word }: MnemonicWordBoxProps) {
  return (
    <Box flexGrow={1}>
      <Box
        flexDirection="row"
        borderWidth={1}
        borderColor="base.ink.border-default"
        borderRadius="xs"
      >
        <Box width={32} height={24} justifyContent="center" alignItems="center">
          <Text variant="label03" color="base.ink.text-subdued">
            {wordIdx}
          </Text>
        </Box>
        <Box
          minWidth={70}
          justifyContent="center"
          alignItems="center"
          borderLeftWidth={1}
          borderColor="base.ink.border-default"
        >
          <Text variant="label03">{word}</Text>
        </Box>
      </Box>
    </Box>
  );
}
