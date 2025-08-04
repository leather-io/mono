import { Image } from 'react-native';

import { t } from '@lingui/core/macro';

import { LEATHER_EARN_SBTC_URL } from '@leather.io/constants';

import { useOpenURL } from '../browser/browser/use-open-url';
import { EarnCard } from './earn-card';

export function SbtcCard() {
  const { openURL } = useOpenURL();

  return (
    <EarnCard
      title={t`Earn with SBTC`}
      minYield={t`6`}
      maxYield={t`8%`}
      description={t`Bridge your BTC to Bitcoin’s leading L2 to earn yield from holding or pooling`}
      image={
        <>
          <Image source={require('@/assets/stickers/sbtc.png')} width={117} height={228} />
        </>
      }
      onPress={() => openURL(LEATHER_EARN_SBTC_URL)}
    />
  );
}
