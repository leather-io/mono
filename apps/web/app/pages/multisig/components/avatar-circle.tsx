import { Avatar } from '@leather.io/ui';

type AvatarCircleSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarCircleProps {
  name: string;
  size?: AvatarCircleSize;
}

// Thin wrapper over @leather.io/ui Avatar that derives an initial from a member
// name. Extracted because member avatars recur across the members section,
// invite-accept modal, and create-vault preview (3+ consumers).
export function AvatarCircle({ name, size = 'sm' }: AvatarCircleProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return <Avatar variant="circle" size={size} fallback={initial} />;
}
