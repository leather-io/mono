import { Header } from '@/components/headers/header';
import { Screen } from '@/components/screen/screen';
import { WalletsList } from '@/features/settings/wallet-and-accounts/wallets-list';
import { t } from '@lingui/macro';

export default function HiddenAccountsScreen() {
  return (
    <Screen>
      <Header />
      <Screen.ScrollView>
        <Screen.Title>
          {t({
            id: 'hidden_accounts.header_title',
            message: 'Hidden accounts',
          })}
        </Screen.Title>
        <WalletsList variant="hidden" />
      </Screen.ScrollView>
    </Screen>
  );
}
