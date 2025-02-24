import { useAccounts } from '@/store/accounts/accounts.read';
import { useWallets } from '@/store/wallets/wallets.read';

import { EmptyHiddenAccounts } from './components/empty-hidden-accounts';
import { WalletViewVariant } from './types';
import { WalletCard } from './wallet-card';

export function WalletsList({ variant }: { variant: WalletViewVariant }) {
  const { list: walletsList } = useWallets();

  const accounts = useAccounts(variant);
  const hasAccounts = accounts.list.length > 0;

  if (variant === 'hidden' && !hasAccounts) return <EmptyHiddenAccounts />;

  return walletsList.map(wallet => {
    return (
      <WalletCard
        variant={variant}
        name={wallet.name}
        key={wallet.fingerprint}
        fingerprint={wallet.fingerprint}
      />
    );
  });
}
