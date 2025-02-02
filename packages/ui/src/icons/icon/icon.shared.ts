export type IconSize = 'small' | 'medium' | 'large';

export const iconSizeMap: Record<IconSize, number> = {
  small: 16,
  medium: 24,
  large: 32,
} as const;
