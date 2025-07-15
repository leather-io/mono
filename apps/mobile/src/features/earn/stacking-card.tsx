import { Image } from 'react-native';

import { t } from '@lingui/macro';

import { LEATHER_EARN_STACKING_URL } from '@leather.io/constants';

import { useOpenURL } from '../browser/browser/use-open-url';
import { EarnCard } from './earn-card';

export function StackingCard() {
  const { openURL } = useOpenURL();
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
      onPress={() => openURL(LEATHER_EARN_STACKING_URL)}
    />
  );
}
