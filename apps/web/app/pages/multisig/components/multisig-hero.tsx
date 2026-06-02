import type { ReactNode } from 'react';

import { Box, styled } from 'leather-styles/jsx';

import { vaultTheme } from '../multisig-tokens';

interface MultisigHeroProps {
  themeId: number;
  primary: ReactNode;
  secondary?: ReactNode;
  children?: ReactNode;
}

// Themed hero surface shared by vault / account / tx detail. The theme texture
// is a saturated mid-tone, so text switches to light on dark themes.
export function MultisigHero({ themeId, primary, secondary, children }: MultisigHeroProps) {
  const theme = vaultTheme(themeId);
  const fg = theme.dark ? 'white' : 'ink.text-primary';
  return (
    <Box
      borderRadius="lg"
      p="space.06"
      mb="space.05"
      color={fg}
      overflow="hidden"
      style={{ background: theme.background }}
    >
      <styled.div textStyle="heading.04">{primary}</styled.div>
      {secondary && (
        <styled.div mt="space.02" textStyle="label.02" opacity={0.85}>
          {secondary}
        </styled.div>
      )}
      {children}
    </Box>
  );
}
