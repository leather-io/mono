import { Cell, type PressableProps } from '@leather.io/ui/native';

interface AccountListItemProps extends PressableProps {
  accountName: string;
  secondaryAside: React.ReactNode;
  balance: React.ReactNode;
  icon: React.ReactNode;
  iconTestID?: string;
  testID?: string;
  walletName?: React.ReactNode;
  chevron?: React.ReactNode;
}
export function AccountListItem({
  accountName,
  secondaryAside,
  balance,
  icon,
  iconTestID,
  onPress,
  testID,
  walletName,
  chevron,
  ...rest
}: AccountListItemProps) {
  return (
    <Cell.Root pressable={true} disabled={!onPress} onPress={onPress} testID={testID} {...rest}>
      <Cell.Icon testID={iconTestID}>{icon}</Cell.Icon>
      <Cell.Content>
        <Cell.Label variant="primary" numberOfLines={1} ellipsizeMode="tail">
          {accountName}
        </Cell.Label>
        <Cell.Label variant="secondary">{walletName}</Cell.Label>
      </Cell.Content>
      <Cell.Aside>
        <Cell.Label variant="primary">{balance}</Cell.Label>
        <Cell.Label variant="secondary">{secondaryAside}</Cell.Label>
      </Cell.Aside>
      {chevron && <Cell.Icon>{chevron}</Cell.Icon>}
    </Cell.Root>
  );
}
