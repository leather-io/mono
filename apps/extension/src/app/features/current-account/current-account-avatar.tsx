import { CircleProps } from 'leather-styles/jsx';

import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { AccountAvatar } from '@app/ui/components/account/account-avatar/account-avatar';

interface CurrentAccountAvatar extends CircleProps {
  toggleSwitchAccount(): void;
}
export function CurrentAccountAvatar() {
  const stacksAccount = useCurrentStacksAccount();
  if (!stacksAccount) return <AccountAvatar index={0} publicKey="" />;

  return (
    <AccountAvatar index={stacksAccount.accountIndex} publicKey={stacksAccount.stxPublicKey} />
  );
}
