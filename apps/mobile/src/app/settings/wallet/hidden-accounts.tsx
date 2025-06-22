import SettingsLayout from '@/features/settings/settings-layout';
import { WalletsList } from '@/features/settings/wallet-and-accounts/wallets-list';
import { t } from '@lingui/macro';

export default function HiddenAccountsScreen() {
  return (
    <SettingsLayout
      title={t({
        id: 'hidden_accounts.header_title',
        message: 'Hidden accounts',
      })}
    >
      <WalletsList variant="hidden" />
    </SettingsLayout>
  );
}
