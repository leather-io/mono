import { ReactNode } from 'react';

import { SettingsSelectors } from '@tests/selectors/settings.selectors';

import type { AccountId } from '@leather.io/models';
import { Flag, ItemLayout, LedgerIcon, Pressable, Spinner } from '@leather.io/ui';

import { useWindowMinWidth } from '@app/common/hooks/use-media-query';
import { WalletType } from '@app/store/common/wallet-type.selectors';

interface AccountListItemLayoutProps extends AccountId {
  accountAddresses: ReactNode;
  accountName: ReactNode;
  avatar: ReactNode;
  balanceLabel: ReactNode;
  nonInteractive?: boolean;
  isLoading: boolean;
  isSelected: boolean;
  onSelectAccount(accountId: AccountId): void;
  walletType?: WalletType;
}
export function AccountListItemLayout(props: AccountListItemLayoutProps) {
  const {
    accountAddresses,
    accountName,
    avatar,
    balanceLabel,
    nonInteractive,
    fingerprint,
    accountIndex,
    isLoading,
    isSelected,
    onSelectAccount,
    walletType,
  } = props;

  const isGreaterThanTinyWidth = useWindowMinWidth(320);

  const itemContent = (
    <ItemLayout
      isSelected={isSelected}
      img={isGreaterThanTinyWidth ? avatar : null}
      titleLeft={accountName}
      titleRight={
        isLoading ? (
          <Spinner color="ink.text-subdued" position="absolute" right={0} top="calc(50% - 8px)" />
        ) : (
          balanceLabel
        )
      }
      captionLeft={accountAddresses}
    />
  );

  const content =
    walletType === 'ledger' ? (
      <Flag img={<LedgerIcon variant="small" />} width="100%">
        {itemContent}
      </Flag>
    ) : (
      itemContent
    );

  return (
    <Pressable
      data-testid={SettingsSelectors.SwitchAccountItemIndex.replace('[index]', `${accountIndex}`)}
      key={`account-${accountIndex}`}
      aria-disabled={nonInteractive || undefined}
      onClick={nonInteractive ? undefined : () => onSelectAccount({ fingerprint, accountIndex })}
    >
      {content}
    </Pressable>
  );
}
