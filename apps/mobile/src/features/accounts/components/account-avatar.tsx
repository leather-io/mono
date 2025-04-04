import { ComponentType, ForwardRefExoticComponent } from 'react';

import { TestId } from '@/shared/test-id';

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

export const accountIconMap: Record<string, ForwardRefExoticComponent<any>> = {
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

export type AccountIcon = keyof typeof accountIconMap;

interface AccountAvatarProps extends SquircleBoxProps {
  icon: AccountIcon | ComponentType;
}

export function AccountAvatar(props: AccountAvatarProps) {
  const testID = isString(props.icon) ? `${TestId.defaultAccountIcon}_${props.icon}` : undefined;
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
      testID={testID}
      {...props}
    >
      {Icon && <Icon />}
    </SquircleBox>
  );
}
