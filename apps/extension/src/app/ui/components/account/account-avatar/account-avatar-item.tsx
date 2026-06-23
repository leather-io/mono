import { ReactElement, memo } from 'react';

import { AccountAvatar } from '@app/ui/components/account/account-avatar/account-avatar';

interface AccountAvatarItemProps {
  publicKey: string;
  index: number;
  indicator?: ReactElement;
}
export const AccountAvatarItem = memo(function AccountAvatarItem({
  publicKey,
  index,
  indicator,
}: AccountAvatarItemProps) {
  return <AccountAvatar index={index} publicKey={publicKey} indicator={indicator} />;
});
