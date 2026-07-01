import { Balance } from '~/components/balance/balance';
import { formatCurrency } from '~/utils/currency-formatter';

import type { Money, Vault } from '@leather.io/models';

import { MultisigHero } from '../../components/multisig-hero';
import { vaultThemeFromName } from '../../multisig-tokens';

interface VaultBalanceHeroProps {
  vault: Vault;
  crypto?: Money;
  fiat?: Money;
}

export function VaultBalanceHero({ vault, crypto, fiat }: VaultBalanceHeroProps) {
  return (
    <MultisigHero
      variant="balance"
      themeId={vaultThemeFromName(vault.theme).id}
      primary={<Balance balance={crypto} formatCurrency={formatCurrency} display="block" />}
      secondary={<Balance balance={fiat} formatCurrency={formatCurrency} display="block" />}
    />
  );
}
