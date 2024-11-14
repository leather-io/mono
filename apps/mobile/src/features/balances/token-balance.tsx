import { ReactNode } from 'react';

import { Balance } from '@/components/balance/balance';
import { t } from '@lingui/macro';

import { CryptoAssetProtocol, Money } from '@leather.io/models';
import { Flag, ItemLayout, Pressable } from '@leather.io/ui/native';

export function getChainLayerFromAssetProtocol(protocol: CryptoAssetProtocol) {
  switch (protocol) {
    case 'nativeBtc':
    case 'nativeStx':
      return t({ id: 'account_balance.caption_left.native', message: 'Layer 1' });
    case 'sip10':
      return t({ id: 'account_balance.caption_left.sip10', message: 'Layer 2 · Stacks' });
    default:
      return '';
  }
}

interface TokenBalanceProps {
  ticker: string;
  icon: ReactNode;
  tokenName: string;
  availableBalance?: Money;
  protocol: CryptoAssetProtocol;
  fiatBalance: Money;
  onPress?(): void;
}
export function TokenBalance({
  ticker,
  icon,
  tokenName,
  availableBalance,
  protocol,
  fiatBalance,
  onPress,
}: TokenBalanceProps) {
  return (
    <Pressable flexDirection="row" disabled={!onPress} onPress={onPress}>
      <Flag key={ticker} img={icon} px="5" py="3">
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
