import {
  ComponentPropsWithoutRef,
  ComponentRef,
  ReactElement,
  cloneElement,
  forwardRef,
} from 'react';

import { styled } from 'leather-styles/jsx';
import { Avatar as RadixAvatar } from 'radix-ui';

import { isDefined } from '@leather.io/utils';

import { IconProps } from '../../icons/icon/create-icon.web';
import { AvatarSize, AvatarVariant, defaultFallbackDelay, iconSizeMap } from './avatar.shared';

type AvatarElement = ComponentRef<typeof AvatarRoot>;

export interface AvatarProps extends ComponentPropsWithoutRef<typeof AvatarRoot> {
  size?: AvatarSize;
  variant?: AvatarVariant;
  icon?: ReactElement<IconProps>;
  indicator?: ReactElement;
  image?: string;
  imageAlt?: string;
  fallback?: string;
  fallbackDelayMs?: number;
}

export const Avatar = forwardRef<AvatarElement, AvatarProps>((props, ref) => {
  const {
    size = 'xl',
    variant = 'circle',
    icon,
    indicator,
    image,
    imageAlt,
    fallback,
    outlineColor,
    fallbackDelayMs = defaultFallbackDelay,
    ...rest
  } = props;
  return (
    <AvatarRoot
      ref={ref}
      size={size}
      variant={variant}
      outlineColor={
        outlineColor ??
        (isDefined(image) ? 'ink.border-transparent' : 'ink.component-background-hover')
      }
      {...rest}
    >
      <AvatarImage src={image} alt={imageAlt ?? fallback} />
      <AvatarIcon avatarSize={size} icon={icon} />
      {fallback ? <AvatarFallback delayMs={fallbackDelayMs}>{fallback}</AvatarFallback> : null}
      {indicator ? <AvatarIndicatorBadge size={size}>{indicator}</AvatarIndicatorBadge> : null}
    </AvatarRoot>
  );
});

Avatar.displayName = 'Avatar';

const AvatarIndicatorBadge = styled('div', {
  base: {
    bg: 'ink.background-primary',
    borderRadius: 'round',
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  variants: {
    size: {
      xs: { width: '8px', height: '8px', bottom: '-1px', right: '-1px' },
      sm: { width: '12px', height: '12px', bottom: '-1px', right: '-1px' },
      md: { width: '16px', height: '16px', bottom: '-2px', right: '-2px' },
      lg: { width: '20px', height: '20px', bottom: '-2px', right: '-2px' },
      xl: { width: '20px', height: '20px', bottom: '-2px', right: '-2px' },
    },
  },
  defaultVariants: { size: 'xl' },
});

const AvatarRoot = styled(RadixAvatar.Root, {
  base: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bg: 'ink.background-secondary',
    userSelect: 'none',
    outlineWidth: 1,
    outlineStyle: 'solid',
    outlineColor: 'ink.component-background-hover',
    outlineOffset: -1,
  },
  variants: {
    outlineType: {
      image: {
        outlineColor: 'ink.border-transparent',
      },
      icon: {
        outlineColor: 'ink.component-background-hover',
      },
    },
    variant: {
      circle: { borderRadius: 'round' },
      square: { borderRadius: 'md' },
    },
    size: {
      xs: { width: 16, height: 16 },
      sm: { width: 24, height: 24 },
      md: { width: 32, height: 32 },
      lg: { width: 40, height: 40 },
      xl: { width: 48, height: 48 },
    },
  },
  compoundVariants: [
    { size: 'xs', variant: 'square', css: { borderRadius: '3px' } },
    { size: 'sm', variant: 'square', css: { borderRadius: '5px' } },
    { size: 'md', variant: 'square', css: { borderRadius: '6px' } },
    { size: 'lg', variant: 'square', css: { borderRadius: '8px' } },
    { size: 'xl', variant: 'square', css: { borderRadius: '10px' } },
  ],
  defaultVariants: {
    size: 'xl',
    variant: 'circle',
  },
});

interface AvatarIconProps {
  icon?: ReactElement<IconProps>;
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

const AvatarFallback = styled(RadixAvatar.Fallback, {
  base: {
    textStyle: 'label.02',
  },
});

const AvatarImage = styled(RadixAvatar.Image, {
  base: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 'inherit',
  },
});
