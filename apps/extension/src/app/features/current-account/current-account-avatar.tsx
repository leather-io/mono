import { ReactElement } from 'react';

import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { AccountAvatar } from '@app/ui/components/account/account-avatar/account-avatar';

interface CurrentAccountAvatarProps {
  indicator?: ReactElement;
}
export function CurrentAccountAvatar({ indicator }: CurrentAccountAvatarProps) {
  const stacksAccount = useCurrentStacksAccount();
  if (!stacksAccount) return <AccountAvatar index={0} publicKey="" indicator={indicator} />;

  return (
    <AccountAvatar
      index={stacksAccount.accountIndex}
      publicKey={stacksAccount.stxPublicKey}
      indicator={indicator}
    />
  );
}
