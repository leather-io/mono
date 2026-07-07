import type { ReactElement } from 'react';

import { styled } from 'leather-styles/jsx';

import type { BlockchainActivityAvatar } from '@leather.io/features';
import { assertUnreachable } from '@leather.io/utils';

import { CodeIcon } from '../../icons/code-icon.web';
import { NoteTextIcon } from '../../icons/note-text-icon.web';
import { AssetAvatarIcon } from './asset-avatar-icon.web';
import { Avatar } from './avatar.web';

const avatarSize = '36px';
const pairGeometry = { sub: '24px', indicatorSize: '16px' } as const;

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
      return (
        <AssetAvatarIcon
          asset={avatar.asset}
          size="md"
          width={avatarSize}
          height={avatarSize}
          indicator={indicator}
        />
      );
    case 'icon':
      return (
        <Avatar
          size="md"
          width={avatarSize}
          height={avatarSize}
          outlineColor="ink.border-default"
          icon={
            avatar.icon === 'contract-deploy' ? (
              <CodeIcon variant="small" />
            ) : (
              <NoteTextIcon variant="small" />
            )
          }
          indicator={indicator}
        />
      );
    case 'pair': {
      const geometry = pairGeometry;
      return (
        <styled.div position="relative" width={avatarSize} height={avatarSize}>
          <styled.div
            position="absolute"
            top={0}
            left={0}
            zIndex={1}
            opacity={avatar.back.dimmed ? dimmedOpacity : 1}
          >
            <AssetAvatarIcon
              asset={avatar.back.asset}
              size="sm"
              width={geometry.sub}
              height={geometry.sub}
            />
          </styled.div>
          <styled.div
            borderRadius="round"
            border="2px solid"
            borderColor="ink.background-primary"
            position="absolute"
            bottom={0}
            right={0}
            zIndex={2}
            opacity={avatar.front.dimmed ? dimmedOpacity : 1}
          >
            <AssetAvatarIcon
              asset={avatar.front.asset}
              size="sm"
              width={geometry.sub}
              height={geometry.sub}
            />
          </styled.div>
          {indicator ? (
            <styled.div
              position="absolute"
              bottom="-2px"
              right="-2px"
              zIndex={3}
              display="flex"
              alignItems="center"
              justifyContent="center"
              overflow="hidden"
              borderRadius="round"
              bg="ink.background-primary"
              width={geometry.indicatorSize}
              height={geometry.indicatorSize}
            >
              {indicator}
            </styled.div>
          ) : null}
        </styled.div>
      );
    }
    default:
      return assertUnreachable(avatar);
  }
}
