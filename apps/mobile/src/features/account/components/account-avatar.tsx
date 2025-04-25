import { ComponentType, ForwardRefExoticComponent } from 'react';

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

export const accountIconMap: Record<AccountIcon, ForwardRefExoticComponent<any>> = {
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

interface AccountAvatarProps extends SquircleBoxProps {
  icon: AccountIcon | ComponentType;
}

export function AccountAvatar(props: AccountAvatarProps) {
  const Icon = isString(props.icon) ? accountIconMap[props.icon] : props.icon;
  return (
    <SquircleBox
      width={48}
      height={48}
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius={18}
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
