import { Image } from 'react-native';

import { t } from '@lingui/macro';

import { LEATHER_EARN_SBTC_URL } from '@leather.io/constants';

import { useOpenURL } from '../browser/browser/use-open-url';
import { EarnCard } from './earn-card';

export function SbtcCard() {
  const { openURL } = useOpenURL();

  return (
    <EarnCard
      title={t({
        id: 'earn.sbtc.title',
        message: 'Earn with SBTC',
      })}
      minYield={t({
        id: 'earn.sbtc.yield-description-min',
        message: '6',
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
      onPress={() => openURL(LEATHER_EARN_SBTC_URL)}
    />
  );
}
