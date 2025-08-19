import { CryptoAssetProtocol } from '@leather.io/models';

export interface TokenDetailsProps {
  assetProtocol: CryptoAssetProtocol;
  tokenId: string;
}

export interface OnPressTokenDetails {
  onPress?: (tokenDetails: TokenDetailsProps) => void;
}
