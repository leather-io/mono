import { ElementRef, ReactElement, cloneElement, forwardRef, useEffect, useState } from 'react';

import { ResponsiveValue } from '@shopify/restyle';
import { Image, ImageProps } from 'expo-image';

import { isDefined } from '@leather.io/utils';

import { IconProps } from '../../icons/icon/create-icon.native';
import { Theme } from '../../theme-native';
import { Box, BoxProps } from '../box/box.native';
import { Text } from '../text/text.native';
import { AvatarSize, AvatarVariant, defaultFallbackDelay, iconSizeMap } from './avatar.shared';

type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

const variantStyles: Record<AvatarVariant, BoxProps> = {
  circle: {
    borderRadius: 'round',
  },
  square: {
    borderRadius: 'sm',
  },
};

const sizeStyles: Record<AvatarSize, BoxProps> = {
  xs: { width: 16, height: 16 },
  sm: { width: 24, height: 24 },
  md: { width: 32, height: 32 },
  lg: { width: 40, height: 40 },
  xl: { width: 48, height: 48 },
};

type AvatarElement = ElementRef<typeof Box>;

interface AvatarProps extends BoxProps {
  size?: AvatarSize;
  variant?: AvatarVariant;
  icon?: ReactElement;
  indicator?: ReactElement;
  image?: ImageProps['source'];
  imageAlt?: string;
  fallback?: string;
  fallbackDelayMs?: number;
  outlineColor?: ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']>;
}

export const Avatar = forwardRef<AvatarElement, AvatarProps>((props, ref) => {
  const {
    size = 'xl',
    variant = 'circle',
    image,
    imageAlt,
    icon,
    indicator,
    fallback,
    fallbackDelayMs = defaultFallbackDelay,
    outlineColor,
    ...rest
  } = props;
  const [imageLoadingStatus, setImageLoadingStatus] = useState<ImageLoadingStatus>('idle');

  return (
    <Box
      ref={ref}
      alignItems="center"
      justifyContent="center"
      bg="ink.background-secondary"
      {...variantStyles[variant]}
      {...sizeStyles[size]}
      {...rest}
    >
      <Box
        position="absolute"
        top={0}
        right={0}
        bottom={0}
        left={0}
        {...variantStyles[variant]}
        overflow="hidden"
      >
        <Image
          source={image}
          alt={imageAlt ?? fallback}
          onLoadStart={() => setImageLoadingStatus('loading')}
          onLoad={() => setImageLoadingStatus('loaded')}
          onError={() => setImageLoadingStatus('error')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>

      <AvatarIcon icon={icon} avatarSize={size} />

      {fallback ? (
        <AvatarFallback
          content={fallback}
          imageLoadingStatus={imageLoadingStatus}
          delayMs={fallbackDelayMs}
        />
      ) : null}

      <AvatarFauxBorder
        outlineColor={
          outlineColor ??
          (isDefined(image) ? 'ink.border-transparent' : 'ink.component-background-hover')
        }
        variant={variant}
      />

      {indicator ? (
        <Box
          bg="ink.background-primary"
          borderRadius="round"
          position="absolute"
          bottom={-4}
          right={-4}
          style={{ padding: 3 }}
        >
          {indicator}
        </Box>
      ) : null}
    </Box>
  );
});

Avatar.displayName = 'Avatar';

interface AvatarIconProps {
  icon?: ReactElement;
  avatarSize: AvatarSize;
}
function AvatarIcon({ icon, avatarSize }: AvatarIconProps) {
  if (icon) {
    const iconProps = icon.props.variant
      ? { variant: icon.props.variant }
      : iconSizeMap[avatarSize];
    return cloneElement<IconProps>(icon, iconProps);
  }

  return null;
}

interface AvatarFallbackProps {
  content: string;
  imageLoadingStatus: ImageLoadingStatus;
  delayMs?: number;
}

function AvatarFallback({ content, delayMs, imageLoadingStatus }: AvatarFallbackProps) {
  const [canRender, setCanRender] = useState(delayMs === undefined);

  useEffect(() => {
    if (delayMs === undefined) return;
    const timerId = window.setTimeout(() => setCanRender(true), delayMs);
    return () => window.clearTimeout(timerId);
  }, [delayMs]);

  return canRender && imageLoadingStatus !== 'loaded' ? (
    <Text variant="label02">{content}</Text>
  ) : null;
}

interface AvatarFauxBorderProps {
  variant: NonNullable<AvatarProps['variant']>;
  outlineColor: ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']>;
}

// Simulate CSS outline behavior, with "border" overlaid on top of content.
function AvatarFauxBorder({ variant, outlineColor }: AvatarFauxBorderProps) {
  return (
    <Box
      position="absolute"
      top={0}
      right={0}
      bottom={0}
      left={0}
      borderColor={outlineColor}
      borderWidth={1}
      borderStyle="solid"
      {...variantStyles[variant]}
    />
  );
}
