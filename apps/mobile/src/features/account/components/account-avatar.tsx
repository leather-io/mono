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

export const accountIconMap: Record<
  AccountIcon,
  (props: { width?: number; height?: number }) => React.JSX.Element
> = {
  pizza: props => <PizzaIcon {...props} />,
  sparkles: props => <SparklesIcon {...props} />,
  piggyBank: props => <PiggybankIcon {...props} />,
  orange: props => <OrangeIcon {...props} />,
  car: props => <CarIcon {...props} />,
  alien: props => <AlienIcon {...props} />,
  saturn: props => <SaturnIcon {...props} />,
  bank: props => <BankIcon {...props} />,
  rocket: props => <RocketIcon {...props} />,
  folder: props => <FolderIcon {...props} />,
  smile: props => <SmileIcon {...props} />,
  code: props => <CodeIcon {...props} />,
  zap: props => <ZapIcon {...props} />,
  gift: props => <GiftIcon {...props} />,
  colorPalette: props => <ColorPaletteIcon {...props} />,
  home: props => <HomeIcon {...props} />,
  space: props => <SpaceIcon {...props} />,
  box: props => <BoxIcon {...props} />,
  heart: props => <HeartIcon {...props} />,
  flag: props => <FlagIcon {...props} />,
} as const;

interface AccountAvatarProps extends SquircleBoxProps {
  icon: AccountIcon | ComponentType;
  size?: number;
}

export function AccountAvatar(props: AccountAvatarProps) {
  const Icon = isString(props.icon) ? accountIconMap[props.icon] : props.icon;
  return (
    <SquircleBox
      width={props.size ?? 48}
      height={props.size ?? 48}
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius={18}
      cornerSmoothing={100}
      preserveSmoothing={true}
      justifyContent="center"
      alignItems="center"
      {...props}
    >
      {Icon && <Icon width={props.size ?? 24} height={props.size ?? 24} />}
    </SquircleBox>
  );
}
