import { ComponentType } from 'react';

import { AccountIcon } from '@/store/accounts/utils';

import {
  AlienIcon,
  BankIcon,
  BoxIcon,
  CarIcon,
  CodeIcon,
  ColorPaletteIcon,
  FlagIcon,
  FolderIcon,
  GiftIcon,
  HeartIcon,
  HomeIcon,
  IconProps,
  OrangeIcon,
  PiggybankIcon,
  PizzaIcon,
  RocketIcon,
  SaturnIcon,
  SmileIcon,
  SpaceIcon,
  SparklesIcon,
  SquircleBox,
  type SquircleBoxProps,
  ZapIcon,
} from '@leather.io/ui/native';
import { isString } from '@leather.io/utils';

export const accountIconMap: Record<AccountIcon, ComponentType<IconProps>> = {
  pizza: PizzaIcon,
  sparkles: SparklesIcon,
  piggyBank: PiggybankIcon,
  orange: OrangeIcon,
  car: CarIcon,
  alien: AlienIcon,
  saturn: SaturnIcon,
  bank: BankIcon,
  rocket: RocketIcon,
  folder: FolderIcon,
  smile: SmileIcon,
  code: CodeIcon,
  zap: ZapIcon,
  gift: GiftIcon,
  colorPalette: ColorPaletteIcon,
  home: HomeIcon,
  space: SpaceIcon,
  box: BoxIcon,
  heart: HeartIcon,
  flag: FlagIcon,
} as const;

export type AccountAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AccountAvatarProps extends SquircleBoxProps {
  icon: AccountIcon | ComponentType;
  size?: AccountAvatarSize;
}

// Squircle icons are manually customized per variant for best optical alignment
const sizeStyles: Record<AccountAvatarSize, SquircleBoxProps> = {
  xs: { width: 16, height: 16 },
  sm: { width: 24, height: 24, borderRadius: 8 },
  md: { width: 32, height: 32, borderRadius: 13 },
  lg: { width: 40, height: 40, borderRadius: 16 },
  xl: { width: 48, height: 48, borderRadius: 18 },
};

export const iconSizes: Record<
  AccountAvatarSize,
  { width?: number; height?: number; variant?: 'small' | 'medium' }
> = {
  xs: { width: 7, height: 7 },
  sm: { width: 14, height: 14 },
  md: { variant: 'small' },
  lg: { variant: 'medium' },
  xl: { variant: 'medium' },
};

export function AccountAvatar({ size = 'xl', ...props }: AccountAvatarProps) {
  const Icon = isString(props.icon) ? accountIconMap[props.icon] : props.icon;
  const iconProps = iconSizes[size];

  return (
    <SquircleBox
      {...sizeStyles[size]}
      borderWidth={1}
      borderColor="ink.border-default"
      cornerSmoothing={100}
      preserveSmoothing={true}
      justifyContent="center"
      alignItems="center"
      {...props}
    >
      {Icon && <Icon {...iconProps} />}
    </SquircleBox>
  );
}
