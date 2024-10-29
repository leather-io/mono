import { Avatar, Flag, ItemLayout, Pressable } from '@leather.io/ui/native';

interface AccountListItemProps {
  accountName: string;
  address: string;
  balance: string;
  icon: React.ReactNode;
  iconTestID?: string;
  onPress?(): void;
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
}: AccountListItemProps) {
  return (
    <Pressable flexDirection="row" disabled={!onPress} onPress={onPress} py="3" testID={testID}>
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
