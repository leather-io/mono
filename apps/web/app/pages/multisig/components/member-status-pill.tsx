import type { InviteStatus } from '../data/multisig-types';
import { Badge } from './badge';

interface MemberStatusPillProps {
  status: InviteStatus;
  isCreator?: boolean;
  joinedAt?: string | null;
}

export function MemberStatusPill({ status, isCreator, joinedAt }: MemberStatusPillProps) {
  if (isCreator) return <Badge variant="info" label="Creator" />;
  if (status === 'joined') {
    return <Badge variant="success" label={joinedAt ? `Joined ${joinedAt}` : 'Joined'} />;
  }
  if (status === 'declined') return <Badge variant="error" label="Declined" />;
  return <Badge variant="default" label="Invited" />;
}
