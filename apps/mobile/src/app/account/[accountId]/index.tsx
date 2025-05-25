import { Account } from '@/features/account/account';
import { AccountLoader, deserializeAccountId } from '@/store/accounts/accounts';
import { WalletLoader } from '@/store/wallets/wallets.read';
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

export const configureAccountParamsSchema = z.object({
  accountId: z.string(),
  accountName: z.string().optional(),
});

export default function AccountScreen() {
  const params = useLocalSearchParams();
  const { accountId } = configureAccountParamsSchema.parse(params);
  const { fingerprint, accountIndex } = deserializeAccountId(accountId);
  return (
    <WalletLoader fingerprint={fingerprint}>
      {wallet => (
        <AccountLoader fingerprint={fingerprint} accountIndex={accountIndex}>
          {account => (
            <Account
              walletName={wallet.name}
              account={account}
              fingerprint={fingerprint}
              accountIndex={accountIndex}
            />
          )}
        </AccountLoader>
      )}
    </WalletLoader>
  );
}
