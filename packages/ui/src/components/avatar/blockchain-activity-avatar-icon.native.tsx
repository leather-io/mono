import type { ReactElement } from 'react';

import type { BlockchainActivityAvatar } from '@leather.io/features';
import { assertUnreachable } from '@leather.io/utils';

import { CodeIcon } from '../../icons/code-icon.native';
import { NoteTextIcon } from '../../icons/note-text-icon.native';
import { Box } from '../box/box.native';
import { AssetAvatarIcon } from './asset-avatar-icon.native';
import { Avatar } from './avatar.native';

const dimmedOpacity = 0.6;

interface BlockchainActivityAvatarIconProps {
  avatar: BlockchainActivityAvatar;
  indicator?: ReactElement;
}

export function BlockchainActivityAvatarIcon({
  avatar,
  indicator,
}: BlockchainActivityAvatarIconProps) {
  switch (avatar.kind) {
    case 'single':
      return <AssetAvatarIcon asset={avatar.asset} indicator={indicator} />;
    case 'icon':
      return (
        <Avatar
          size="xl"
          outlineColor="ink.border-default"
          icon={avatar.icon === 'contract-deploy' ? <CodeIcon /> : <NoteTextIcon />}
          indicator={indicator}
        />
      );
    case 'pair':
      return (
        <Box flexDirection="row" alignItems="center">
          <AssetAvatarIcon
            asset={avatar.back.asset}
            size="lg"
            opacity={avatar.back.dimmed ? dimmedOpacity : 1}
          />
          <Box
            borderWidth={3}
            borderColor="ink.background-primary"
            borderRadius="round"
            ml="-3"
            opacity={avatar.front.dimmed ? dimmedOpacity : 1}
          >
            <AssetAvatarIcon asset={avatar.front.asset} indicator={indicator} size="xl" />
          </Box>
        </Box>
      );
    default:
      return assertUnreachable(avatar);
  }
}
