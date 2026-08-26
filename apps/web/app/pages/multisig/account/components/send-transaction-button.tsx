import { Box, Flex, styled } from 'leather-styles/jsx';

import { PaperPlaneIcon } from '@leather.io/ui';

import type { Chain } from '../../data/multisig-types';

const captions: Record<Chain, string> = {
  btc: 'Transfer BTC from this account',
  stx: 'Transfer STX or a token from this account',
};

interface SendTransactionButtonProps {
  chain: Chain;
  onClick(): void;
}

export function SendTransactionButton({ chain, onClick }: SendTransactionButtonProps) {
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
        <PaperPlaneIcon variant="small" color="ink.background-primary" />
      </Flex>
      <Box>
        <styled.div textStyle="label.02">Send</styled.div>
        <styled.div textStyle="caption.01" color="ink.text-subdued">
          {captions[chain]}
        </styled.div>
      </Box>
    </styled.button>
  );
}
