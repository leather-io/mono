import { useWallets } from '@/store/wallets/wallets.read';

import { WalletViewVariant } from './types';
import { WalletCard } from './wallet-card';

export function WalletsList({ variant }: { variant: WalletViewVariant }) {
  const { list: walletsList } = useWallets();

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
