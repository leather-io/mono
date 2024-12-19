import { ReactNode } from 'react';

import { Flag, ItemLayout, Pressable, Text } from '@leather.io/ui/native';

interface ActivityCellProps {
  icon: ReactNode;
  title: string;
  date: string;
  amount: string | number | null;
  fiatAmount: string;
  onPress?(): void;
}
export function ActivityCell({
  icon,
  title,
  date,
  amount,
  fiatAmount,
  onPress,
}: ActivityCellProps) {
  return (
    <Pressable flexDirection="row" disabled={!onPress} onPress={onPress}>
      <Flag img={icon} px="5" py="3">
        <ItemLayout
          titleLeft={title}
          titleRight={<Text>{amount}</Text>}
          captionLeft={date}
          captionRight={<Text>{fiatAmount}</Text>}
        />
      </Flag>
    </Pressable>
  );
}
