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
import { isString, match } from '@leather.io/utils';

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

type AccountAvatarVariant = 'sm' | 'md';

interface AccountAvatarProps extends SquircleBoxProps {
  icon: AccountIcon | ComponentType;
  variant?: AccountAvatarVariant;
}

export function AccountAvatar({ variant = 'md', ...props }: AccountAvatarProps) {
  const Icon = isString(props.icon) ? accountIconMap[props.icon] : props.icon;
  const variantMatcher = match<AccountAvatarVariant>();
  const size = variantMatcher(variant, {
    sm: 40,
    md: 48,
  });
  const borderRadius = variantMatcher(variant, {
    sm: 16,
    md: 18,
  });
  return (
    <SquircleBox
      width={size}
      height={size}
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius={borderRadius}
      cornerSmoothing={100}
      preserveSmoothing={true}
      justifyContent="center"
      alignItems="center"
      {...props}
    >
      {Icon && <Icon />}
    </SquircleBox>
  );
}
