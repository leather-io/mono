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
  PiggybankIcon,
  PizzaIcon,
  RocketIcon,
  SaturnIcon,
  SmileIcon,
  SpaceIcon,
  SparklesIcon,
  ZapIcon,
} from '@leather.io/ui/native';

export const iconNames = [
  'alien',
  'bank',
  'box',
  'car',
  'code',
  'color-palette',
  'flag',
  'folder',
  'gift',
  'heart',
  'home',
  'piggybank',
  'pizza',
  'rocket',
  'saturn',
  'smile',
  'space',
  'sparkles',
  'zap',
] as const;

export type AvatarIconName = (typeof iconNames)[number];

interface AvatarIconProps extends IconProps {
  icon: AvatarIconName;
}
export function AvatarIcon({ icon, ...props }: AvatarIconProps) {
  switch (icon) {
    case 'alien':
      return <AlienIcon {...props} />;
    case 'bank':
      return <BankIcon {...props} />;
    case 'box':
      return <BoxIcon {...props} />;
    case 'car':
      return <CarIcon {...props} />;
    case 'code':
      return <CodeIcon {...props} />;
    case 'color-palette':
      return <ColorPaletteIcon {...props} />;
    case 'flag':
      return <FlagIcon {...props} />;
    case 'folder':
      return <FolderIcon {...props} />;
    case 'gift':
      return <GiftIcon {...props} />;
    case 'heart':
      return <HeartIcon {...props} />;
    case 'home':
      return <HomeIcon {...props} />;
    case 'piggybank':
      return <PiggybankIcon {...props} />;
    case 'pizza':
      return <PizzaIcon {...props} />;
    case 'rocket':
      return <RocketIcon {...props} />;
    case 'saturn':
      return <SaturnIcon {...props} />;
    case 'smile':
      return <SmileIcon {...props} />;
    case 'space':
      return <SpaceIcon {...props} />;
    case 'sparkles':
      return <SparklesIcon {...props} />;
    case 'zap':
      return <ZapIcon {...props} />;
    default:
      return <SparklesIcon {...props} />;
  }
}
