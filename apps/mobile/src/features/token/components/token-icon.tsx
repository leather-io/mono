import { FungibleCryptoAsset } from '@leather.io/models';
import {
  BtcAvatarIcon,
  PlaceholderIcon,
  Sip10AvatarIcon,
  StxAvatarIcon,
} from '@leather.io/ui/native';

interface TokenIconProps {
  ticker: string;
  showIndicator?: boolean;
  asset?: FungibleCryptoAsset;
}

export function TokenIcon({ ticker, showIndicator = false, asset }: TokenIconProps) {
  if (ticker === 'STX') {
    return <StxAvatarIcon indicator={showIndicator} />;
  }
  if (ticker === 'BTC') {
    return <BtcAvatarIcon indicator={showIndicator} />;
  }
  if (asset?.protocol === 'sip10') {
    return (
      <Sip10AvatarIcon
        contractId={asset.contractId}
        imageCanonicalUri={asset.imageCanonicalUri}
        name={asset.name}
      />
    );
  }
  return <PlaceholderIcon />;
}
