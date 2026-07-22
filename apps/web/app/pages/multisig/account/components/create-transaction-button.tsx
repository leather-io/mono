import { Box, Flex, styled } from 'leather-styles/jsx';

import { PlusIcon } from '@leather.io/ui';

interface CreateTransactionButtonProps {
  chainLabel: string;
  onClick(): void;
}

export function CreateTransactionButton({ chainLabel, onClick }: CreateTransactionButtonProps) {
  return (
    <styled.button
      type="button"
      onClick={onClick}
      width="100%"
      display="flex"
      alignItems="center"
      gap="space.03"
      p="space.04"
      mb="space.04"
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      bg="transparent"
      cursor="pointer"
      textAlign="left"
      _hover={{ bg: 'ink.component-background-hover' }}
    >
      <Flex
        alignItems="center"
        justifyContent="center"
        width="40px"
        height="40px"
        borderRadius="round"
        bg="ink.text-primary"
        flexShrink={0}
      >
        <PlusIcon variant="small" color="ink.background-primary" />
      </Flex>
      <Box>
        <styled.div textStyle="label.02">Create transaction</styled.div>
        <styled.div textStyle="caption.01" color="ink.text-subdued">
          Propose a new {chainLabel} transfer for this account
        </styled.div>
      </Box>
    </styled.button>
  );
}
