import { ReactNode } from 'react';

import { Flag, ItemLayout, Pressable, Text } from '@leather.io/ui/native';

interface ActivityCellProps {
  ticker: string;
  icon: ReactNode;
  tokenName: string;
  //   availableBalance?: Money;
  chain: string;
  //   fiatBalance: Money;
  onPress?(): void;
}
export function ActivityCell({
  ticker,
  icon,
  tokenName,
  //   availableBalance,
  chain,
  //   fiatBalance,
  onPress,
}: ActivityCellProps) {
  return (
    <Pressable flexDirection="row" disabled={!onPress} onPress={onPress}>
      <Flag key={ticker} img={icon} px="5" py="3">
        <ItemLayout
          titleLeft={tokenName}
          //   titleRight={availableBalance && <Balance balance={availableBalance} variant="label02" />}
          titleRight={<Text>100</Text>}
          captionLeft={chain}
          captionRight={<Text>100</Text>}
          //   captionRight={
          //     <Balance balance={fiatBalance} variant="label02" color="ink.text-subdued" />
          //   }
        />
      </Flag>
    </Pressable>
  );
}
