import { Box, styled } from 'leather-styles/jsx';

import { analytics } from '@shared/utils/analytics';

import { useThemeSwitcher } from '@app/common/theme-provider';
import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { whenTheme } from '@app/common/utils/when-theme';

import { PromoCardLayout } from './promo-card.layout';

interface PromoCardProps {
  eventName: string;
  message: string;
  imgSrc: string;
  linkUrl: string;
  stackPosition: number;
  totalCards: number;
  stackOffset: number;
  isDismissing: boolean;
  onDismissCard?(): void;
}
export function PromoCard({
  eventName,
  message,
  imgSrc,
  linkUrl,
  stackPosition,
  totalCards,
  stackOffset,
  isDismissing,
  onDismissCard,
}: PromoCardProps) {
  const { theme } = useThemeSwitcher();
  const invertFilter = whenTheme(theme)({ light: 'none', dark: 'invert()' });

  const scale = 1 - stackPosition * 0.05;
  const translateY = -stackPosition * stackOffset;
  const zIndex = totalCards - stackPosition;
  const tintOpacity = stackPosition * 0.35;
  const opacity = isDismissing ? 0 : 1;

  function openPromoCardLink() {
    if (stackPosition === 0 && !isDismissing) {
      analytics.untypedTrack('promo_banner_clicked', { banner_name: eventName });
      openInNewTab(linkUrl);
    }
  }

  return (
    <Box
      position="absolute"
      transition="all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
      width="100%"
      transform={`scale(${scale}) translateY(${translateY}px)`}
      transformOrigin="top center"
      zIndex={zIndex}
      opacity={opacity}
    >
      <Box position="relative">
        <PromoCardLayout
          img={
            <styled.img
              alt={message}
              src={imgSrc}
              height={70}
              width={100}
              filter={invertFilter}
            />
          }
          message={message}
          onClickCard={openPromoCardLink}
          onDismissCard={onDismissCard}
          isInteractive={stackPosition === 0 && !isDismissing}
          isDismissing={isDismissing}
        />
        {stackPosition > 0 && (
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            borderRadius="md"
            pointerEvents="none"
            bg={whenTheme(theme)({
              light: `rgba(255, 255, 255, ${tintOpacity})`,
              dark: `rgba(0, 0, 0, ${tintOpacity})`,
            })}
          />
        )}
      </Box>
    </Box>
  );
}
