import { Box, Flex } from 'leather-styles/jsx';

import type { VaultAccount } from '@leather.io/models';
import { AvatarIndicatorBadge, LeatherLettermarkIcon } from '@leather.io/ui';

import { defaultAccountIcon } from '../multisig-tokens';
import { chainFromNetwork } from '../multisig.utils';
import { AvatarSq } from './avatar-sq';

interface AccountWalletAvatarProps {
  account: Pick<VaultAccount, 'network' | 'icon'>;
  themeId: number;
  size?: 'md' | 'lg';
}

export function AccountWalletAvatar({ account, themeId, size = 'lg' }: AccountWalletAvatarProps) {
  return (
    <Box aria-hidden="true" flexShrink={0} position="relative" display="inline-flex">
      <AvatarSq
        chain={chainFromNetwork(account.network)}
        themeId={themeId}
        icon={account.icon ?? defaultAccountIcon}
        withChainBadge={false}
        size={size}
      />
      <AvatarIndicatorBadge size="lg">
        <Flex
          width="sm"
          height="sm"
          alignItems="center"
          justifyContent="center"
          borderRadius="round"
          bg="ink.action-primary-default"
        >
          <LeatherLettermarkIcon width={10} height={10} color="ink.background-primary" />
        </Flex>
      </AvatarIndicatorBadge>
    </Box>
  );
}
