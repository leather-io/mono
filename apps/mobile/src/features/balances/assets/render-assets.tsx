import { TokenDetailsProps } from '@/features/token/types';

import { CryptoAssetProtocols } from '@leather.io/models';
import { RuneBalance, Sip10Balance } from '@leather.io/services';

import { RunesTokenBalance } from '../bitcoin/runes-token-balance';
import { Sip10TokenBalance } from '../stacks/sip10-token-balance';

function isSip10Balance(item: Sip10Balance | RuneBalance): item is Sip10Balance {
  return item.asset.protocol === CryptoAssetProtocols.sip10;
}

function isRuneBalance(item: Sip10Balance | RuneBalance): item is RuneBalance {
  return item.asset.protocol === CryptoAssetProtocols.rune;
}

export function renderAsset({
  item,
  onPress,
}: {
  item: Sip10Balance | RuneBalance;
  onPress?(tokenDetails: TokenDetailsProps): void;
}) {
  if (isSip10Balance(item)) {
    return (
      <Sip10TokenBalance
        key={item.asset.contractId}
        item={item}
        onPress={() =>
          onPress?.({
            assetId: item.asset.assetId,
            assetProtocol: item.asset.protocol,
          })
        }
      />
    );
  }
  if (isRuneBalance(item)) {
    return (
      <RunesTokenBalance
        key={item.asset.symbol}
        item={item}
        onPress={() =>
          onPress?.({
            assetId: item.asset.runeName,
            assetProtocol: item.asset.protocol,
          })
        }
      />
    );
  }
  return null;
}
