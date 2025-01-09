import { Cell, type PressableProps } from '@leather.io/ui/native';

interface AccountListItemProps extends PressableProps {
  accountName: string;
  address: React.ReactNode;
  balance: React.ReactNode;
  icon: React.ReactNode;
  iconTestID?: string;
  testID?: string;
  walletName?: string;
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
  ...rest
}: AccountListItemProps) {
  return (
    <Cell.Root pressable={true} disabled={!onPress} onPress={onPress} testID={testID} {...rest}>
      <Cell.Icon testID={iconTestID}>{icon}</Cell.Icon>
      <Cell.Content>
        <Cell.Label variant="primary">{accountName}</Cell.Label>
        <Cell.Label variant="secondary">{walletName}</Cell.Label>
      </Cell.Content>
      <Cell.Aside>
        <Cell.Label variant="primary">{balance}</Cell.Label>
        <Cell.Label variant="secondary">{address}</Cell.Label>
      </Cell.Aside>
    </Cell.Root>
  );
}
