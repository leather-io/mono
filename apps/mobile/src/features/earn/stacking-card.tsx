import { Image } from 'react-native';

import { t } from '@lingui/core/macro';

import { LEATHER_EARN_STACKING_URL } from '@leather.io/constants';

import { useOpenURL } from '../browser/browser/use-open-url';
import { EarnCard } from './earn-card';

export function StackingCard() {
  const { openURL } = useOpenURL();
  return (
    <EarnCard
      title={t`Stacking rewards`}
      minYield={t`6`}
      maxYield={t`10%`}
      description={t`Acquire Stacks (STX) on to Bitcoin’s leading L2 to earn yield from staking`}
      image={
        <>
          <Image source={require('@/assets/stickers/stacking.png')} width={177} height={228} />
        </>
      }
      onPress={() => openURL(LEATHER_EARN_STACKING_URL)}
    />
  );
}
