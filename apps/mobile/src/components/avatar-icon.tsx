import AlienIcon from '@/assets/avatar-icons/alien.svg';
import BankIcon from '@/assets/avatar-icons/bank.svg';
import CarIcon from '@/assets/avatar-icons/car.svg';
import CodeIcon from '@/assets/avatar-icons/code.svg';
import FlagIcon from '@/assets/avatar-icons/flag.svg';
import FolderIcon from '@/assets/avatar-icons/folder.svg';
import GiftIcon from '@/assets/avatar-icons/gift.svg';
import HeartIcon from '@/assets/avatar-icons/heart.svg';
import HomeIcon from '@/assets/avatar-icons/home.svg';
import InboxIcon from '@/assets/avatar-icons/inbox.svg';
import PaletteIcon from '@/assets/avatar-icons/palette.svg';
import PiggybankIcon from '@/assets/avatar-icons/piggybank.svg';
import PizzaIcon from '@/assets/avatar-icons/pizza.svg';
import RocketIcon from '@/assets/avatar-icons/rocket.svg';
import SaturnIcon from '@/assets/avatar-icons/saturn.svg';
import SmileIcon from '@/assets/avatar-icons/smile.svg';
import SpaceIcon from '@/assets/avatar-icons/space.svg';
import SparklesIcon from '@/assets/avatar-icons/sparkles.svg';
import ZapIcon from '@/assets/avatar-icons/zap.svg';

import { IconProps } from '@leather.io/ui/native';

export const iconNames = [
  'alien',
  'bank',
  'car',
  'code',
  'flag',
  'folder',
  'gift',
  'heart',
  'home',
  'inbox',
  'palette',
  'piggybank',
  'pizza',
  'rocket',
  'saturn',
  'smile',
  'space',
  'sparkles',
  'zap',
] as const;

export type AvatarIcon = (typeof iconNames)[number];

export function getAvatarIcon(icon: AvatarIcon | string): React.FC<IconProps> {
  switch (icon) {
    case 'alien':
      return AlienIcon;
    case 'bank':
      return BankIcon;
    case 'car':
      return CarIcon;
    case 'code':
      return CodeIcon;
    case 'flag':
      return FlagIcon;
    case 'folder':
      return FolderIcon;
    case 'gift':
      return GiftIcon;
    case 'heart':
      return HeartIcon;
    case 'home':
      return HomeIcon;
    case 'inbox':
      return InboxIcon;
    case 'palette':
      return PaletteIcon;
    case 'piggybank':
      return PiggybankIcon;
    case 'pizza':
      return PizzaIcon;
    case 'rocket':
      return RocketIcon;
    case 'saturn':
      return SaturnIcon;
    case 'smile':
      return SmileIcon;
    case 'space':
      return SpaceIcon;
    case 'sparkles':
      return SparklesIcon;
    case 'zap':
      return ZapIcon;
    default:
      // TODO: think of default icon here.
      return SparklesIcon;
  }
}
