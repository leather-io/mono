import { Box } from 'leather-styles/jsx';

import alien from '@leather.io/ui/assets/icons/account-avatars/alien-24-24.svg?url';
import bank from '@leather.io/ui/assets/icons/account-avatars/bank-24-24.svg?url';
import box from '@leather.io/ui/assets/icons/account-avatars/box-24-24.svg?url';
import car from '@leather.io/ui/assets/icons/account-avatars/car-24-24.svg?url';
import code from '@leather.io/ui/assets/icons/account-avatars/code-24-24.svg?url';
import colorPalette from '@leather.io/ui/assets/icons/account-avatars/color-palette-24-24.svg?url';
import flag from '@leather.io/ui/assets/icons/account-avatars/flag-24-24.svg?url';
import folder from '@leather.io/ui/assets/icons/account-avatars/folder-24-24.svg?url';
import gift from '@leather.io/ui/assets/icons/account-avatars/gift-24-24.svg?url';
import heart from '@leather.io/ui/assets/icons/account-avatars/heart-24-24.svg?url';
import home from '@leather.io/ui/assets/icons/account-avatars/home-24-24.svg?url';
import orange from '@leather.io/ui/assets/icons/account-avatars/orange-24-24.svg?url';
import piggyBank from '@leather.io/ui/assets/icons/account-avatars/piggybank-24-24.svg?url';
import pizza from '@leather.io/ui/assets/icons/account-avatars/pizza-24-24.svg?url';
import rocket from '@leather.io/ui/assets/icons/account-avatars/rocket-24-24.svg?url';
import saturn from '@leather.io/ui/assets/icons/account-avatars/saturn-24-24.svg?url';
import smile from '@leather.io/ui/assets/icons/account-avatars/smile-24-24.svg?url';
import space from '@leather.io/ui/assets/icons/account-avatars/space-24-24.svg?url';
import sparkles from '@leather.io/ui/assets/icons/account-avatars/sparkles-24-24.svg?url';
import zap from '@leather.io/ui/assets/icons/account-avatars/zap-24-24.svg?url';

const accountIconUrls = {
  pizza,
  sparkles,
  piggyBank,
  orange,
  car,
  alien,
  saturn,
  bank,
  rocket,
  folder,
  smile,
  code,
  zap,
  gift,
  colorPalette,
  home,
  space,
  box,
  heart,
  flag,
};

export type ApprovalAccountIconName = keyof typeof accountIconUrls;

interface ApprovalAccountIconProps {
  icon: ApprovalAccountIconName;
  size: number;
}

export function ApprovalAccountIcon({ icon, size }: ApprovalAccountIconProps) {
  const mask = `url(${JSON.stringify(accountIconUrls[icon])}) center / contain no-repeat`;
  return (
    <Box
      flexShrink={0}
      bg="ink.text-primary"
      style={{ width: size, height: size, mask, WebkitMask: mask }}
    />
  );
}
