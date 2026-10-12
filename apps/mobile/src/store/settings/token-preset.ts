import {
  SBTC_ASSET_ID_MAINNET,
  SBTC_ASSET_ID_TESTNET,
  USDCX_ASSET_ID_MAINNET,
  USDCX_ASSET_ID_TESTNET,
} from '@leather.io/constants';
import { DefaultAssetVisibilityPolicy } from '@leather.io/services';
import { assertUnreachable, serializeAssetId } from '@leather.io/utils';

import { TokenPreset } from './utils';

const mainTokenAssetIds = [
  SBTC_ASSET_ID_MAINNET,
  SBTC_ASSET_ID_TESTNET,
  USDCX_ASSET_ID_MAINNET,
  USDCX_ASSET_ID_TESTNET,
].map(id => serializeAssetId({ protocol: 'sip10', id }));

export function getDefaultAssetVisibilityPolicy(preset: TokenPreset): DefaultAssetVisibilityPolicy {
  switch (preset) {
    case 'gasOnly':
      return { type: 'allowlist', assets: [] };
    case 'mainTokens':
      return { type: 'allowlist', assets: mainTokenAssetIds };
    case 'allPricedTokens':
      return { type: 'appConfig' };
    default:
      return assertUnreachable(preset);
  }
}
