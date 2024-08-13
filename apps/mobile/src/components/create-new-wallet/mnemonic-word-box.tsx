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
        alignItems="center"
        borderWidth={1}
        borderColor="ink.border-default"
        borderRadius="xs"
        height={32}
        minWidth={100}
      >
        <Box width={24} justifyContent="center" alignItems="center">
          <Text variant="label03" color="ink.text-subdued">
            {wordIdx}
          </Text>
        </Box>
        <Box justifyContent="center" alignItems="flex-start">
          <Text variant="label02" color="ink.text-primary">
            {word}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
