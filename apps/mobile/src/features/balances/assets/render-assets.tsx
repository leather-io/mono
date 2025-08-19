import { TokenDetailsProps } from '@/features/token/types';

import { CryptoAssetProtocols } from '@leather.io/models';
import { RuneBalance, Sip10Balance } from '@leather.io/services';

import { RunesTokenBalance } from '../bitcoin/runes-token-balance';
import { Sip10TokenBalance } from '../stacks/sip10-token-balance';

export function renderAsset({
  item,
  onPress,
}: {
  item: Sip10Balance | RuneBalance;
  onPress?(tokenDetails: TokenDetailsProps): void;
}) {
  switch (item.asset.protocol) {
    case 'sip10':
      return (
        <Sip10TokenBalance
          key={item.asset.contractId}
          item={item as Sip10Balance}
          onPress={() =>
            onPress?.({
              assetProtocol: CryptoAssetProtocols.sip10,
              tokenId: (item as Sip10Balance).asset.assetId,
            })
          }
        />
      );
    case 'rune':
      return <RunesTokenBalance key={item.asset.symbol} item={item as RuneBalance} />;
  }
}
