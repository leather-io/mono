import { IconSize } from '../../icons/icon/icon.shared';

export type AvatarVariant = 'circle' | 'square';
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export const defaultFallbackDelay = 600;
export const iconSizeMap: Record<
  AvatarSize,
  { width: number; height: number } | { variant: IconSize }
> = {
  xs: { width: 7, height: 7 },
  sm: { variant: 'small' },
  md: { variant: 'medium' },
  lg: { variant: 'medium' },
  xl: { variant: 'medium' },
};
