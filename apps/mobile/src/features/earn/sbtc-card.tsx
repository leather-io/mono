import { Image } from 'react-native';

import { useBrowser } from '@/core/browser-provider';
import { t } from '@lingui/macro';

import { LEATHER_EARN_SBTC_URL } from '@leather.io/constants';

import { EarnCard } from './earn-card';

export function SbtcCard() {
  const { linkingRef } = useBrowser();
  return (
    <EarnCard
      title={t({
        id: 'earn.sbtc.title',
        message: 'Earn with SBTC',
      })}
      minYield={t({
        id: 'earn.sbtc.yield-description-min',
        message: '5',
      })}
      maxYield={t({
        id: 'earn.sbtc.yield-description-max',
        message: '8%',
      })}
      description={t({
        id: 'earn.sbtc.description',
        message: 'Bridge your BTC to Bitcoin’s leading L2 to earn yield from holding or pooling',
      })}
      image={
        <>
          <Image source={require('@/assets/stickers/sbtc.png')} width={117} height={228} />
        </>
      }
      onPress={() => linkingRef.current?.openURL(LEATHER_EARN_SBTC_URL)}
    />
  );
}
