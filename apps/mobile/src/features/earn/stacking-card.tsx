import { Image } from 'react-native';

import { useBrowser } from '@/core/browser-provider';
import { t } from '@lingui/macro';

import { LEATHER_EARN_STACKING_URL } from '@leather.io/constants';

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
          <Image source={require('@/assets/stickers/stacking.png')} width={177} height={228} />
        </>
      }
      onPress={() => linkingRef.current?.openURL(LEATHER_EARN_STACKING_URL)}
    />
  );
}
