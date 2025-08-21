import { CryptoAssetProtocol } from '@leather.io/models';

export interface TokenDetailsProps {
  assetProtocol: CryptoAssetProtocol;
  assetId: string;
}

export interface OnPressTokenDetails {
  onPress?: (tokenDetails: TokenDetailsProps) => void;
}
