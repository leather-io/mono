import { useMemo, useState } from 'react';

import { Box } from 'leather-styles/jsx';

import { useOnMount } from '@leather.io/ui';

import { useConfigPromoCardEnabled } from '@app/query/common/remote-config/remote-config.query';

import { PromoCard } from './promo-card';
import { usePromos } from './use-promos';

const promoCards = [
  {
    eventName: 'mobile',
    message: 'Mobile app is here for iOS and Android',
    imgSrc: 'assets/illustrations/promo-banner-mobile.svg',
    linkUrl: 'https://leather.io/wallet/mobile',
  },
  {
    eventName: 'stacking',
    message: 'Lock STX, earn BTC',
    imgSrc: 'assets/illustrations/promo-banner-stacking.svg',
    linkUrl: 'https://app.leather.io/stacking',
  },
  {
    eventName: 'sbtc',
    message: 'Grow your sBTC',
    imgSrc: 'assets/illustrations/promo-banner-sbtc.svg',
    linkUrl: 'https://app.leather.io/sbtc',
  },
];

const ANIMATION_DURATION = 500;

export function PromoBanner() {
  const [promoIndexes, setPromoIndexes] = useState<number[]>([]);
  const [dismissingIndex, setDismissingIndex] = useState<number | null>(null);
  const { dismissPromo, dismissedPromoIndexes } = usePromos();
  const shouldDisplayPromoCard = useConfigPromoCardEnabled();

  useOnMount(() => {
    if (promoCards.length > 0 && promoIndexes.length === 0) {
      setPromoIndexes(Array.from({ length: promoCards.length }, (_, i) => i));
    }
  });

  const visibleIndexes = useMemo(
    () => promoIndexes.filter(i => !dismissedPromoIndexes.includes(i)),
    [promoIndexes, dismissedPromoIndexes]
  );

  function handleDismissFrontPromo() {
    const frontPromoIndex = visibleIndexes[0];
    setDismissingIndex(frontPromoIndex);

    setTimeout(() => {
      dismissPromo(frontPromoIndex);
      setDismissingIndex(null);
    }, ANIMATION_DURATION);
  }

  if (!shouldDisplayPromoCard || visibleIndexes.length === 0) return null;

  const stackOffset = 5;
  const topPadding = (visibleIndexes.length - 1) * stackOffset;

  return (
    <Box position="relative" minHeight="78px" mt="space.04" pt={`${topPadding}px`}>
      {visibleIndexes.map((promoIndex, stackPosition) => {
        const promo = promoCards[promoIndex];
        const isDismissing = dismissingIndex === promoIndex;
        const adjustedStackPosition =
          isDismissing || dismissingIndex === null ? stackPosition : Math.max(stackPosition - 1, 0);

        return (
          <PromoCard
            key={promoIndex}
            {...promo}
            stackPosition={adjustedStackPosition}
            totalCards={visibleIndexes.length}
            stackOffset={stackOffset}
            isDismissing={isDismissing}
            onDismissCard={stackPosition === 0 ? handleDismissFrontPromo : undefined}
          />
        );
      })}
    </Box>
  );
}
