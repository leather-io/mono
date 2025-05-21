import { Image } from 'react-native';

import { useBrowser } from '@/core/browser-provider';
import { t } from '@lingui/macro';

import { LEATHER_EARN_URL } from '@leather.io/constants';

import { EarnCard } from './earn-card';

export function StackingCard() {
  const { linkingRef } = useBrowser();
  return (
    <EarnCard
      title={t({
        id: 'earn.stacking.title',
        message: 'Stacking rewards',
      })}
      minYield={t({
        id: 'earn.stacking.yield-description-min',
        message: '6',
      })}
      maxYield={t({
        id: 'earn.stacking.yield-description-max',
        message: '10%',
      })}
      description={t({
        id: 'earn.stacking.description',
        message: 'Acquire Stacks (STX) on to Bitcoin’s leading L2 to earn yield from staking',
      })}
      image={
        <>
          <Image
            source={require('@/assets/stx.png')}
            width={396}
            height={396}
            style={{
              position: 'absolute',
              top: 24,
              right: 110,
              bottom: 38,
              transform: [{ rotate: '5.069deg' }],
              // FIXME LEA-2525: this is not perfect and needs to be fixed
              //   aspectRatio: 412.73 / 412.73,
              overflow: 'hidden',
            }}
          />
          <Image
            source={require('@/assets/stx.png')}
            width={396}
            height={396}
            style={{
              position: 'absolute',
              top: 10,
              left: 0,
              // FIXME LEA-2525: ask design this is not perfect and needs to be fixed
              //   transform: [{ rotate: '10.544deg' }],
              //   aspectRatio: 462.24 / 462.24,
              overflow: 'hidden',
            }}
          />
        </>
      }
      onPress={() => linkingRef.current?.openURL(LEATHER_EARN_URL)}
    />
  );
}
