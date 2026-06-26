import { AccountSelectors } from '@tests/selectors/account.selectors';
import { Box, styled } from 'leather-styles/jsx';

import type { Money } from '@leather.io/models';
import { Approver, Caption, ItemLayout, SkeletonLoader } from '@leather.io/ui';

import { formatCurrency } from '@app/common/currency-formatter';
import { useAccountDisplayName } from '@app/common/hooks/account/use-account-names';
import { AccountNameLayout } from '@app/components/account/account-name';
import { getLedgerAccountIndicator } from '@app/components/account/ledger-account-indicator';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useWalletEntities } from '@app/store/wallets/wallet.selectors';
import { AccountAvatarItem } from '@app/ui/components/account/account-avatar/account-avatar-item';

interface SigningAccountCardProps {
  address: React.ReactNode;
  availableBalance: Money;
  fiatBalance: Money;
  isLoadingBalance: boolean;
}
export function SigningAccountCard({
  address,
  availableBalance,
  fiatBalance,
  isLoadingBalance,
}: SigningAccountCardProps) {
  const account = useCurrentStacksAccount();
  const walletEntities = useWalletEntities();
  const walletType = walletEntities[account?.fingerprint ?? '']?.type;

  const stxAddress = account?.address || '';
  const { data: name = '', isLoading: isLoadingName } = useAccountDisplayName({
    address: stxAddress,
    // TODO: We shouldn't just set it to empty strings here, rethink
    index: account?.accountIndex ?? 0,
    fingerprint: account?.fingerprint ?? '',
  });

  const titleRight = (
    <SkeletonLoader isLoading={isLoadingBalance} width="96px">
      <styled.span textStyle="label.02">
        {formatCurrency(availableBalance, { preset: 'pad-decimals' })}
      </styled.span>
    </SkeletonLoader>
  );

  const captionRight = (
    <SkeletonLoader isLoading={isLoadingBalance} width="48px">
      <Caption>{formatCurrency(fiatBalance)}</Caption>
    </SkeletonLoader>
  );

  return (
    <Approver.Section>
      <Approver.Subheader>With account</Approver.Subheader>
      <Box mb="space.03">
        <ItemLayout
          img={
            <AccountAvatarItem
              index={account?.accountIndex ?? 0}
              publicKey={account?.stxPublicKey ?? ''}
              indicator={getLedgerAccountIndicator(walletType, AccountSelectors.LedgerIndicator)}
            />
          }
          titleLeft={<AccountNameLayout isLoading={isLoadingName}>{name}</AccountNameLayout>}
          captionLeft={address}
          titleRight={titleRight}
          captionRight={captionRight}
        />
      </Box>
    </Approver.Section>
  );
}
