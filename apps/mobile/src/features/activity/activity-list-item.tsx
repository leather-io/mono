import { Flag, ItemLayout, Pressable } from '@leather.io/ui/native';

export interface ActivityListItemProps {
  txid: string;
  avatar: React.ReactNode;
  title: React.ReactNode;
  caption: React.ReactNode;
  fiatBalance?: React.ReactNode;
  cryptoBalance?: React.ReactNode;
  onPress: () => void;
}

export function ActivityListItem({
  txid,
  avatar,
  title,
  caption,
  fiatBalance,
  cryptoBalance,
  onPress,
}: ActivityListItemProps) {
  return (
    <Pressable flexDirection="row" disabled={!txid} onPress={onPress}>
      <Flag img={avatar} px="5" py="3">
        <ItemLayout
          gap="0"
          titleLeft={title}
          titleRight={fiatBalance}
          captionLeft={caption}
          captionRight={cryptoBalance}
        />
      </Flag>
    </Pressable>
  );
}
