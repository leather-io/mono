import { Box } from 'leather-styles/jsx';

import type { Chain } from '../data/multisig-types';
import { accountIconUrl, avatarSquircleRadius, vaultTheme } from '../multisig-tokens';
import { ChainAvatar } from './chain-avatar';

type AvatarSqSize = 'sm' | 'md' | 'lg';

interface AvatarSqProps {
  chain: Chain;
  // Account-glyph id (e.g. 'piggybank', 'vault'); omit for a plain themed tile.
  icon?: string;
  themeId?: number;
  size?: AvatarSqSize;
  withChainBadge?: boolean;
}

const tileSize: Record<AvatarSqSize, number> = { sm: 32, md: 40, lg: 56 };
const glyphSize: Record<AvatarSqSize, number> = { sm: 16, md: 22, lg: 30 };

// Squircle account/vault avatar: a theme-textured tile with a recolorable
// account glyph (CSS mask) and an optional chain badge. Built locally rather
// than wrapping @leather.io/ui Avatar: Avatar's square variant carries an image
// or icon-component + a round indicator, but not a texture background paired
// with a mask-image glyph that recolors to the theme — the combination here.
export function AvatarSq({
  chain,
  icon,
  themeId = 0,
  size = 'md',
  withChainBadge = true,
}: AvatarSqProps) {
  const theme = vaultTheme(themeId);
  const px = tileSize[size];
  const glyphPx = glyphSize[size];
  const maskUrl = icon ? `url(${accountIconUrl(icon)})` : undefined;
  return (
    <Box position="relative" width={`${px}px`} height={`${px}px`} flexShrink={0}>
      <Box
        width="100%"
        height="100%"
        borderRadius={avatarSquircleRadius}
        display="flex"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
        style={{ background: theme.background }}
      >
        {icon && (
          <Box
            width={`${glyphPx}px`}
            height={`${glyphPx}px`}
            bg={theme.dark ? 'white' : 'ink.text-primary'}
            style={{
              WebkitMaskImage: maskUrl,
              maskImage: maskUrl,
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
            }}
          />
        )}
      </Box>
      {withChainBadge && (
        <Box
          position="absolute"
          bottom="-2px"
          right="-2px"
          borderRadius="round"
          borderWidth="2px"
          borderStyle="solid"
          borderColor="ink.background-primary"
          display="flex"
          lineHeight="0"
        >
          <ChainAvatar chain={chain} boxSize="16px" />
        </Box>
      )}
    </Box>
  );
}
