import { useNavigate } from 'react-router';

import { assetIdToSendPath } from '@leather.io/features';
import { CryptoAssetProtocols } from '@leather.io/models';
import { type SerializedCryptoAssetId, deserializeAssetId } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { useWalletType } from '@app/common/use-wallet-type';
import { useHasCurrentBitcoinAccount } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';

function useIsBitcoinSendEnabled() {
  const { whenWallet } = useWalletType();
  const hasBitcoinAccount = useHasCurrentBitcoinAccount();
  return whenWallet({ ledger: hasBitcoinAccount, software: true });
}

export function useNavigateToSendForm() {
  const navigate = useNavigate();
  const isBitcoinSendEnabled = useIsBitcoinSendEnabled();

  return function navigateToSendForm(assetId: SerializedCryptoAssetId) {
    const { protocol } = deserializeAssetId(assetId);
    if (protocol === CryptoAssetProtocols.nativeBtc && !isBitcoinSendEnabled) {
      return navigate(RouteUrls.SendBtcDisabled);
    }
    return navigate(`${RouteUrls.SendCryptoAsset}/${assetIdToSendPath(assetId)}`);
  };
}
