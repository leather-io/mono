import { Box } from 'leather-styles/jsx';
import { Balance } from '~/components/balance/balance';
import { formatCurrency } from '~/utils/currency-formatter';

import type { Money, Vault } from '@leather.io/models';

import { vaultThemeFromName } from '../../multisig-tokens';

interface VaultBalanceHeroProps {
  vault: Vault;
  crypto?: Money;
  fiat?: Money;
}

export function VaultBalanceHero({ vault, crypto, fiat }: VaultBalanceHeroProps) {
  const theme = vaultThemeFromName(vault.theme);
  return (
    <Box
      borderRadius="md"
      overflow="hidden"
      minHeight="220px"
      p="space.05"
      display="flex"
      flexDirection="column"
      justifyContent="flex-end"
      color={theme.dark ? 'white' : 'ink.text-primary'}
      style={{ background: theme.background }}
    >
      <Balance
        balance={crypto}
        formatCurrency={formatCurrency}
        display="block"
        textStyle="heading.02"
      />
      <Balance
        balance={fiat}
        formatCurrency={formatCurrency}
        display="block"
        textStyle="label.01"
        opacity={0.8}
        mt="space.01"
      />
    </Box>
  );
}
