import { ReactNode } from 'react';

import { SettingsSelectors } from '@tests/selectors/settings.selectors';

import type { AccountId } from '@leather.io/models';
import { ChevronRightIcon, Flag, ItemLayout, Pressable, Spinner } from '@leather.io/ui';

import { useWindowMinWidth } from '@app/common/hooks/use-media-query';

interface AccountListItemLayoutProps extends AccountId {
  accountAddresses: ReactNode;
  accountName: ReactNode;
  avatar: ReactNode;
  balanceLabel: ReactNode;
  withChevron?: boolean;
  isLoading: boolean;
  isSelected: boolean;
  onSelectAccount(accountId: AccountId): void;
}
export function AccountListItemLayout(props: AccountListItemLayoutProps) {
  const {
    accountAddresses,
    accountName,
    avatar,
    balanceLabel,
    fingerprint,
    accountIndex,
    isLoading,
    isSelected,
    withChevron,
    onSelectAccount,
  } = props;

  const isGreaterThanTinyWidth = useWindowMinWidth(320);

  const content = (
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

  return (
    <Pressable
      data-testid={SettingsSelectors.SwitchAccountItemIndex.replace('[index]', `${accountIndex}`)}
      key={`account-${accountIndex}`}
      onClick={() => onSelectAccount({ fingerprint, accountIndex })}
    >
      {withChevron ? (
        <Flag reverse img={<ChevronRightIcon variant="small" />} width="100%">
          {content}
        </Flag>
      ) : (
        content
      )}
    </Pressable>
  );
}
