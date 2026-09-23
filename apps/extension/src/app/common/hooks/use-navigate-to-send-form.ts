import { useNavigate } from 'react-router';

import { assetIdToSendPath } from '@leather.io/features';
import { CryptoAssetProtocols } from '@leather.io/models';
import { type SerializedCryptoAssetId, deserializeAssetId } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { useConfigBitcoinSendEnabled } from '@app/query/common/remote-config/remote-config.query';

export function useNavigateToSendForm() {
  const navigate = useNavigate();
  const isBitcoinSendEnabled = useConfigBitcoinSendEnabled();

  return function navigateToSendForm(assetId: SerializedCryptoAssetId) {
    const { protocol } = deserializeAssetId(assetId);
    if (protocol === CryptoAssetProtocols.nativeBtc && !isBitcoinSendEnabled) {
      return navigate(RouteUrls.SendBtcDisabled);
    }
    return navigate(`${RouteUrls.SendCryptoAsset}/${assetIdToSendPath(assetId)}`);
  };
}
