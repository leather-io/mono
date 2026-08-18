import type { ReactElement } from 'react';

import { styled } from 'leather-styles/jsx';

import type { BlockchainActivityAvatar } from '@leather.io/features';
import { assertUnreachable } from '@leather.io/utils';

import { CodeIcon } from '../../icons/code-icon.web';
import { NoteTextIcon } from '../../icons/note-text-icon.web';
import { AssetAvatarIcon } from './asset-avatar-icon.web';
import { Avatar } from './avatar.web';

const defaultAvatarSize = 36;

const dimmedOpacity = 0.6;

interface BlockchainActivityAvatarIconProps {
  avatar: BlockchainActivityAvatar;
  indicator?: ReactElement;
  // Diameter in px. Defaults to the list-row size; larger values (e.g. a
  // detail hero) scale the pair geometry and indicator ring proportionally.
  size?: number;
}

export function BlockchainActivityAvatarIcon({
  avatar,
  indicator,
  size = defaultAvatarSize,
}: BlockchainActivityAvatarIconProps) {
  const scale = size / defaultAvatarSize;
  const avatarSize = `${size}px`;
  // Grow the indicator badge with the box: the size presets carry the badge
  // dimensions (md = 16px, xl = 20px), so a hero-scale avatar uses xl.
  const avatarPreset = size >= 44 ? 'xl' : 'md';
  const iconVariant = size >= 44 ? 'medium' : 'small';
  const pairGeometry = {
    sub: `${Math.round(24 * scale)}px`,
    indicatorSize: `${Math.round(16 * scale)}px`,
  } as const;
  switch (avatar.kind) {
    case 'single':
      return (
        <AssetAvatarIcon
          asset={avatar.asset}
          size={avatarPreset}
          width={avatarSize}
          height={avatarSize}
          indicator={indicator}
        />
      );
    case 'icon':
      return (
        <Avatar
          size={avatarPreset}
          width={avatarSize}
          height={avatarSize}
          outlineColor="ink.border-default"
          icon={
            avatar.icon === 'contract-deploy' ? (
              <CodeIcon variant={iconVariant} />
            ) : (
              <NoteTextIcon variant={iconVariant} />
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
