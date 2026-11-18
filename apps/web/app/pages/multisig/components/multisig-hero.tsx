import type { ReactNode } from 'react';

import { Box, styled } from 'leather-styles/jsx';

import { vaultTheme } from '../multisig-tokens';

interface MultisigHeroProps {
  themeId: number;
  primary: ReactNode;
  secondary?: ReactNode;
  variant?: 'standard' | 'balance';
  media?: ReactNode;
  children?: ReactNode;
}

// Themed hero surface shared by vault / account / tx detail. The theme texture
// is a saturated mid-tone, so text switches to light on dark themes.
export function MultisigHero({
  themeId,
  primary,
  secondary,
  variant = 'standard',
  media,
  children,
}: MultisigHeroProps) {
  const theme = vaultTheme(themeId);
  const fg = theme.dark ? 'white' : 'ink.text-primary';
  const bold = variant === 'balance';
  return (
    <Box
      borderRadius={bold ? 'md' : 'lg'}
      px={bold ? '28px' : 'space.06'}
      py={bold ? 'space.05' : 'space.06'}
      mb="space.05"
      minHeight={bold ? '220px' : undefined}
      display={bold ? 'flex' : undefined}
      flexDirection={bold ? 'column' : undefined}
      justifyContent={bold ? 'flex-end' : undefined}
      color={fg}
      overflow="hidden"
      style={{ background: theme.background }}
    >
      {media && <Box mb="space.03">{media}</Box>}
      <styled.div textStyle={bold ? 'heading.02' : 'heading.04'}>{primary}</styled.div>
      {secondary && (
        <styled.div
          mt={bold ? 'space.01' : 'space.02'}
          textStyle={bold ? 'label.01' : 'label.02'}
          opacity={bold ? 0.8 : 0.85}
        >
          {secondary}
        </styled.div>
      )}
      {children}
    </Box>
  );
}
