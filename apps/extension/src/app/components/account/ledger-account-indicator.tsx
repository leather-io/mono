import { ReactElement } from 'react';

import { styled } from 'leather-styles/jsx';

import { LedgerIcon } from '@leather.io/ui';

import { WalletType } from '@app/store/common/wallet-type.selectors';

const ledgerAccountIndicatorLabel = 'Ledger hardware wallet account';

export function getLedgerAccountIndicator(
  walletType: WalletType | undefined,
  dataTestId: string
): ReactElement | undefined {
  if (walletType !== 'ledger') return undefined;

  return (
    <styled.span
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
      role="img"
      aria-label={ledgerAccountIndicatorLabel}
      data-testid={dataTestId}
    >
      <LedgerIcon variant="small" />
    </styled.span>
  );
}
