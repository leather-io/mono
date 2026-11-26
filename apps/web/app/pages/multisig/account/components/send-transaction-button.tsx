import { Box, Flex } from 'leather-styles/jsx';

import { PaperPlaneIcon } from '@leather.io/ui';

import type { Chain } from '../../data/multisig-types';
import { AccountActionCard } from './account-action-card';

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
    <Box mb="space.04">
      <AccountActionCard
        title="Send"
        description={captions[chain]}
        icon={
          <Flex
            alignItems="center"
            justifyContent="center"
            width="xxl"
            height="xxl"
            borderRadius="round"
            bg="ink.text-primary"
            flexShrink={0}
          >
            <PaperPlaneIcon variant="small" color="ink.background-primary" />
          </Flex>
        }
        onClick={onClick}
      />
    </Box>
  );
}
