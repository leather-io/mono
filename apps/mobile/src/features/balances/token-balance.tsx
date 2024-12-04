import { ReactNode } from 'react';

import { Balance } from '@/components/balance/balance';

import { CryptoAssetProtocol, Money } from '@leather.io/models';
import { Flag, ItemLayout, Pressable, type PressableProps } from '@leather.io/ui/native';

export function getChainLayerFromAssetProtocol(protocol: CryptoAssetProtocol) {
  switch (protocol) {
    case 'nativeBtc':
    case 'nativeStx':
      // FIXME: LEA-1780 Re-enable this when Crowdin issues solved
      // return t({ id: 'account_balance.caption_left.native', message: 'Layer 1' });
      // eslint-disable-next-line no-console, lingui/no-unlocalized-strings
      return 'Layer 1';
    case 'sip10':
      // FIXME: LEA-1780 Re-enable this when Crowdin issues solved
      // return t({ id: 'account_balance.caption_left.sip10', message: 'Layer 2 · Stacks' });
      // eslint-disable-next-line no-console, lingui/no-unlocalized-strings
      return 'Layer 2 · Stacks';
    default:
      return '';
  }
}

interface TokenBalanceProps extends PressableProps {
  ticker: string;
  icon: ReactNode;
  tokenName: string;
  availableBalance?: Money;
  protocol: CryptoAssetProtocol;
  fiatBalance: Money;
}
export function TokenBalance({
  ticker,
  icon,
  tokenName,
  availableBalance,
  protocol,
  fiatBalance,
  onPress,
  ...rest
}: TokenBalanceProps) {
  return (
    <Pressable flexDirection="row" disabled={!onPress} onPress={onPress} {...rest}>
      <Flag key={ticker} img={icon}>
        <ItemLayout
          titleLeft={tokenName}
          titleRight={availableBalance && <Balance balance={availableBalance} variant="label02" />}
          captionLeft={getChainLayerFromAssetProtocol(protocol)}
          captionRight={
            <Balance balance={fiatBalance} variant="label02" color="ink.text-subdued" />
          }
        />
      </Flag>
    </Pressable>
  );
}
