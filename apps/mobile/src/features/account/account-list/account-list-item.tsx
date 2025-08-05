import { t } from '@lingui/macro';

import { Cell, type PressableProps } from '@leather.io/ui/native';

interface AccountListItemProps extends PressableProps {
  accountName: string;
  address: React.ReactNode;
  balance: React.ReactNode;
  icon: React.ReactNode;
  iconTestID?: string;
  testID?: string;
  walletName?: React.ReactNode;
  chevron?: React.ReactNode;
  isReadonly: boolean;
}
export function AccountListItem({
  accountName,
  address,
  balance,
  icon,
  iconTestID,
  onPress,
  testID,
  walletName,
  chevron,
  isReadonly,
  ...rest
}: AccountListItemProps) {
  return (
    <Cell.Root pressable={true} disabled={!onPress} onPress={onPress} testID={testID} {...rest}>
      <Cell.Icon testID={iconTestID}>{icon}</Cell.Icon>
      <Cell.Content>
        <Cell.Label variant="primary" numberOfLines={1} ellipsizeMode="tail">
          {isReadonly ? t`${accountName} (read-only)` : accountName}
        </Cell.Label>
        <Cell.Label variant="secondary">{walletName}</Cell.Label>
      </Cell.Content>
      <Cell.Aside>
        <Cell.Label variant="primary">{balance}</Cell.Label>
        <Cell.Label variant="secondary">{address}</Cell.Label>
      </Cell.Aside>
      {chevron && <Cell.Icon>{chevron}</Cell.Icon>}
    </Cell.Root>
  );
}
