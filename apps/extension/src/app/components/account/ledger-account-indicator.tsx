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
      position="absolute"
      bottom="-2px"
      right="-4px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      lineHeight={0}
      width="22px"
      height="22px"
      borderRadius="5px"
      overflow="hidden"
      bg="ink.text-primary"
      borderWidth="2px"
      borderStyle="solid"
      borderColor="ink.background-primary"
      role="img"
      aria-label={ledgerAccountIndicatorLabel}
      data-testid={dataTestId}
    >
      <LedgerIcon
        variant="small"
        color="ink.background-primary"
        style={{ transform: 'translateX(0.5px)' }}
      />
    </styled.span>
  );
}
