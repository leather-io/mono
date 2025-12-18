import { HStack, HstackProps, styled } from 'leather-styles/jsx';

import { AssetAvatarIcon } from '@leather.io/ui';

import { isValidUrl } from '@shared/utils/urls';

interface TxAssetItemProps extends HstackProps {
  iconString: string;
  amount: string | number;
  ticker: string;
}
export function TxAssetItem(props: TxAssetItemProps) {
  const { iconString, amount, ticker, ...rest } = props;
  const imageCanonicalUri = isValidUrl(iconString) ? iconString : undefined;
  const isStx = iconString === 'STX';

  return (
    <HStack alignItems="center" flexGrow={1} justifyContent="space-between" width="100%" {...rest}>
      <HStack>
        <AssetAvatarIcon
          asset={
            isStx
              ? { protocol: 'nativeStx' }
              : {
                  protocol: 'sip10',
                  contractId: iconString,
                  imageCanonicalUri: imageCanonicalUri ?? '',
                  name: ticker,
                }
          }
          size="md"
        />
        <styled.span textStyle="heading.04">{ticker}</styled.span>
      </HStack>
      <styled.span textStyle="heading.04">{amount}</styled.span>
    </HStack>
  );
}
