import { useSelector } from 'react-redux';

import { AccountSelectors } from '@tests/selectors/account.selectors';
import { ConnectAccountSelectors } from '@tests/selectors/requests.selectors';
import { Box, HStack } from 'leather-styles/jsx';

import { BulletSeparator, Caption } from '@leather.io/ui';

import { useAccountDisplayName } from '@app/common/hooks/account/use-account-names';
import { AccountTotalBalance } from '@app/components/account-total-balance';
import { AccountAddresses } from '@app/components/account/account-addresses';
import { AccountListItemLayout } from '@app/components/account/account-list-item.layout';
import { AccountNameLayout } from '@app/components/account/account-name';
import { getLedgerAccountIndicator } from '@app/components/account/ledger-account-indicator';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { useStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { selectCurrentAccount } from '@app/store/software-keys/software-key.selectors';
import { useWalletEntities } from '@app/store/wallets/wallet.selectors';
import { AccountAvatarItem } from '@app/ui/components/account/account-avatar/account-avatar-item';

interface CurrentAccountDisplayerProps {
  onSelectAccount(): void;
}
export function CurrentAccountDisplayer({ onSelectAccount }: CurrentAccountDisplayerProps) {
  const current = useCurrentAccountId();

  const currentAccount = useSelector(selectCurrentAccount);
  const stacksAccount = useStacksAccount(currentAccount);
  const walletEntities = useWalletEntities();
  const walletName = walletEntities[current.fingerprint]?.name;
  const walletType = walletEntities[current.fingerprint]?.type;
  const { data: name } = useAccountDisplayName({
    address: stacksAccount?.address,
    index: current.accountIndex,
    fingerprint: current.fingerprint,
  });
  return (
    <AccountListItemLayout
      fingerprint={currentAccount.fingerprint}
      accountIndex={current.accountIndex}
      accountAddresses={
        <HStack alignItems="center" color="ink.text-subdued" gap="space.02" whiteSpace="nowrap">
          <BulletSeparator>
            {walletName ? (
              <Caption data-testid={ConnectAccountSelectors.WalletName}>{walletName}</Caption>
            ) : null}
            <AccountAddresses accountId={current} />
          </BulletSeparator>
        </HStack>
      }
      accountName={<AccountNameLayout isLoading={false}>{name}</AccountNameLayout>}
      avatar={
        <AccountAvatarItem
          index={current.accountIndex}
          publicKey={stacksAccount?.stxPublicKey || ''}
          indicator={getLedgerAccountIndicator(walletType, AccountSelectors.LedgerIndicator)}
        />
      }
      balanceLabel={
        // Hack to center element without adjusting AccountListItemLayout
        <Box pos="relative" top={12}>
          <AccountTotalBalance accountId={current} />
        </Box>
      }
      isLoading={false}
      isSelected={false}
      onSelectAccount={() => onSelectAccount()}
    />
  );
}
