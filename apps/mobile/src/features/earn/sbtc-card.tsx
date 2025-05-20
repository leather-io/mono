import { Image, Linking } from 'react-native';

import { t } from '@lingui/macro';

import { EarnCard } from './earn-card';

export function SbtcCard() {
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
          <Image
            source={require('@/assets/sbtc_gold.png')}
            width={396}
            height={396}
            style={{ position: 'absolute', top: 14, right: 30, bottom: 38 }}
          />
          <Image
            source={require('@/assets/sbtc.png')}
            width={396}
            height={396}
            style={{ position: 'absolute', top: 10, left: 35 }}
          />
        </>
      }
      // FIXME LEA-2525: ask design this is not perfect and needs to be fixed
      // this button cannot be clicked due to positioning of the stacking card images
      onPress={() =>
        void Linking.openURL(
          t({
            id: 'earn.sbtc.on-press-url',
            message: 'https://earn.leather.io/',
          })
        )
      }
    />
  );
}
