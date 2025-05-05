import {
  ComponentPropsWithoutRef,
  ElementRef,
  ReactElement,
  cloneElement,
  forwardRef,
} from 'react';

import { styled } from 'leather-styles/jsx';
import { Avatar as RadixAvatar } from 'radix-ui';

import { isDefined } from '@leather.io/utils';

import { IconProps } from '../../icons/icon/create-icon.web';
import { AvatarSize, AvatarVariant, defaultFallbackDelay, iconSizeMap } from './avatar.shared';

type AvatarElement = ElementRef<typeof AvatarRoot>;

export interface AvatarProps extends ComponentPropsWithoutRef<typeof AvatarRoot> {
  size?: AvatarSize;
  variant?: AvatarVariant;
  icon?: ReactElement;
  indicator?: ReactElement;
  image?: string;
  imageAlt?: string;
  fallback?: string;
  fallbackDelayMs?: number;
}

export const Avatar = forwardRef<AvatarElement, AvatarProps>((props, ref) => {
  const {
    // TODO: The default size is temporarily set to 'lg' to look correct with current design.
    //       Set to 'xl', once LEA-2111 is ready.
    size = 'lg',
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
      {indicator ? (
        <styled.div
          bg="ink.background-primary"
          borderRadius="round"
          position="absolute"
          bottom={-4}
          right={-4}
          padding={3}
        >
          {indicator}
        </styled.div>
      ) : null}
    </AvatarRoot>
  );
});

Avatar.displayName = 'Avatar';

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
      square: { borderRadius: '10px' },
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
    {
      size: 'xs',
      variant: 'square',
      css: {
        borderRadius: 'xs',
      },
    },
  ],
  defaultVariants: {
    size: 'lg',
    variant: 'circle',
  },
});

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
