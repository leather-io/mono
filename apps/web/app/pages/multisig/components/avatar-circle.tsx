import { css, cx } from 'leather-styles/css';

import { Avatar } from '@leather.io/ui';

type AvatarCircleSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarCircleProps {
  name: string;
  size?: AvatarCircleSize;
}

const toneClass = {
  blue: css({ bg: 'blue.action-primary-default', color: 'white' }),
  orange: css({ bg: 'orange.action-primary-default', color: 'white' }),
  green: css({ bg: 'green.action-primary-default', color: 'white' }),
  stacks: css({ bg: 'stacks', color: 'white' }),
};

const tones = ['blue', 'orange', 'green', 'stacks'] as const;

const fallbackFontClass: Partial<Record<AvatarCircleSize, string>> = {
  xs: css({ '& > span': { fontSize: '10px' } }),
  sm: css({ '& > span': { fontSize: '12px' } }),
};

function toneForName(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return tones[Math.abs(hash) % tones.length];
}

// Thin wrapper over @leather.io/ui Avatar that derives an initial from a member
// name. Extracted because member avatars recur across the members section,
// invite-accept modal, and create-vault preview (3+ consumers).
export function AvatarCircle({ name, size = 'sm' }: AvatarCircleProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <Avatar
      variant="circle"
      size={size}
      fallback={initial}
      className={cx(toneClass[toneForName(name)], fallbackFontClass[size])}
    />
  );
}
