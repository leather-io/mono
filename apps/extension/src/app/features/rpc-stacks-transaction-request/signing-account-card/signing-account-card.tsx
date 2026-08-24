import { AccountSelectors } from '@tests/selectors/account.selectors';
import { Box, styled } from 'leather-styles/jsx';

import type { Money } from '@leather.io/models';
import { Approver, Caption, ItemLayout, SkeletonLoader } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { useAccountDisplayName } from '@app/common/hooks/account/use-account-names';
import { AccountNameLayout } from '@app/components/account/account-name';
import { getLedgerAccountIndicator } from '@app/components/account/ledger-account-indicator';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { parsePolicyParent } from '@app/store/policy/policy-store.utils';
import { useCurrentPolicy, usePolicyDisplayName } from '@app/store/policy/policy.selectors';
import { useWalletEntities } from '@app/store/wallets/wallet.selectors';
import { AccountAvatarItem } from '@app/ui/components/account/account-avatar/account-avatar-item';

interface AccountApproverSectionProps {
  subheader: string;
  avatar: React.ReactNode;
  name: React.ReactNode;
  isLoadingName?: boolean;
  caption: React.ReactNode;
  titleRight?: React.ReactNode;
  captionRight?: React.ReactNode;
}
export function AccountApproverSection({
  subheader,
  avatar,
  name,
  isLoadingName,
  caption,
  titleRight,
  captionRight,
}: AccountApproverSectionProps) {
  return (
    <Approver.Section>
      <Approver.Subheader>{subheader}</Approver.Subheader>
      <Box mb="space.03">
        <ItemLayout
          img={avatar}
          titleLeft={<AccountNameLayout isLoading={isLoadingName}>{name}</AccountNameLayout>}
          captionLeft={caption}
          titleRight={titleRight}
          captionRight={captionRight}
        />
      </Box>
    </Approver.Section>
  );
}

interface SigningAccountCardProps {
  address: React.ReactNode;
  availableBalance: Money;
  fiatBalance: Money;
  isLoadingBalance: boolean;
  showPolicyAccount?: boolean;
}
export function SigningAccountCard({
  address,
  availableBalance,
  fiatBalance,
  isLoadingBalance,
  showPolicyAccount = false,
}: SigningAccountCardProps) {
  const account = useCurrentStacksAccount();
  const policy = useCurrentPolicy();
  const walletEntities = useWalletEntities();
  const walletType = walletEntities[account?.fingerprint ?? '']?.type;

  const stxAddress = account?.address || '';
  const { data: accountName = '', isLoading: isLoadingAccountName } = useAccountDisplayName({
    address: stxAddress,
    // TODO: We shouldn't just set it to empty strings here, rethink
    index: account?.accountIndex ?? 0,
    fingerprint: account?.fingerprint ?? '',
  });
  const policyName = usePolicyDisplayName(policy);

  const policyParent = policy ? parsePolicyParent(policy.parentAccountId) : null;

  const signerAvatar = (
    <AccountAvatarItem
      index={account?.accountIndex ?? 0}
      publicKey={account?.stxPublicKey ?? ''}
      indicator={getLedgerAccountIndicator(walletType, AccountSelectors.LedgerIndicator)}
    />
  );

  const balanceTitleRight = (
    <SkeletonLoader isLoading={isLoadingBalance} width="96px">
      <styled.span textStyle="label.02">
        {formatCurrency(availableBalance, { preset: 'pad-decimals' })}
      </styled.span>
    </SkeletonLoader>
  );

  const balanceCaptionRight = (
    <SkeletonLoader isLoading={isLoadingBalance} width="48px">
      <Caption>{formatCurrency(fiatBalance)}</Caption>
    </SkeletonLoader>
  );

  if (showPolicyAccount && policy && policyParent) {
    return (
      <>
        <AccountApproverSection
          subheader="Transacting with account"
          avatar={
            <AccountAvatarItem index={policyParent.accountIndex} publicKey={policy.address} />
          }
          name={policyName ?? ''}
          caption={<Caption>{truncateMiddle(policy.address, 4)}</Caption>}
          titleRight={balanceTitleRight}
          captionRight={balanceCaptionRight}
        />
        <AccountApproverSection
          subheader="Signing with account"
          avatar={signerAvatar}
          name={accountName}
          isLoadingName={isLoadingAccountName}
          caption={address}
        />
      </>
    );
  }

  return (
    <AccountApproverSection
      subheader="With account"
      avatar={signerAvatar}
      name={accountName}
      isLoadingName={isLoadingAccountName}
      caption={address}
      titleRight={balanceTitleRight}
      captionRight={balanceCaptionRight}
    />
  );
}
