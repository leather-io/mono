import { CryptoAssetProtocol } from './asset.model';

export interface CryptoAssetId {
  protocol: CryptoAssetProtocol;
  id: string;
  tokenId?: number;
}
