import SettingsLayout from '@/features/settings/settings-layout';
import { WalletsList } from '@/features/settings/wallet-and-accounts/wallets-list';
import { t } from '@lingui/core/macro';

export default function HiddenAccountsScreen() {
  return (
    <SettingsLayout title={t`Hidden accounts`}>
      <WalletsList variant="hidden" />
    </SettingsLayout>
  );
}
