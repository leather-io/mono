import { ReactNode } from 'react';

import { SettingsSelectors } from '@tests/selectors/settings.selectors';

import type { AccountId } from '@leather.io/models';
import { ItemLayout, Pressable, Spinner } from '@leather.io/ui';

import { useWindowMinWidth } from '@app/common/hooks/use-media-query';

interface AccountListItemLayoutProps extends AccountId {
  accountAddresses: ReactNode;
  accountName: ReactNode;
  avatar: ReactNode;
  balanceLabel: ReactNode;
  nonInteractive?: boolean;
  isLoading: boolean;
  isSelected: boolean;
  onSelectAccount(accountId: AccountId): void;
  showChevron?: boolean;
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
    showChevron,
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
      showChevron={showChevron}
      chevronDirection="right"
    />
  );

  return (
    <Pressable
      data-testid={SettingsSelectors.SwitchAccountItemIndex.replace('[index]', `${accountIndex}`)}
      key={`account-${accountIndex}`}
      aria-disabled={nonInteractive || undefined}
      onClick={nonInteractive ? undefined : () => onSelectAccount({ fingerprint, accountIndex })}
    >
      {itemContent}
    </Pressable>
  );
}
