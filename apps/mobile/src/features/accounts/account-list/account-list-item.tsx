import { Avatar, Flag, ItemLayout, Pressable, PressableProps } from '@leather.io/ui/native';

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
    <Pressable flexDirection="row" disabled={!onPress} onPress={onPress} testID={testID} {...rest}>
      <Flag
        img={
          <Avatar bg="ink.text-primary" testID={iconTestID}>
            {icon}
          </Avatar>
        }
      >
        <ItemLayout
          titleLeft={accountName}
          captionLeft={walletName}
          titleRight={balance}
          captionRight={address}
        />
      </Flag>
    </Pressable>
  );
}
