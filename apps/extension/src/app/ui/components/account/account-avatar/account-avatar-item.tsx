import { memo } from 'react';

import { AccountAvatar } from '@app/ui/components/account/account-avatar/account-avatar';

interface AccountAvatarItemProps {
  publicKey: string;
  index: number;
}
export const AccountAvatarItem = memo(function AccountAvatarItem({
  publicKey,
  index,
}: AccountAvatarItemProps) {
  return <AccountAvatar index={index} publicKey={publicKey} />;
});
