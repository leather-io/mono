import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { WalletsList } from '@/features/settings/wallet-and-accounts/wallets-list';
import { t } from '@lingui/macro';

export default function HiddenAccountsScreen() {
  const pageTitle = t({
    id: 'hidden_accounts.header_title',
    message: 'Hidden accounts',
  });
  return (
    <AnimatedHeaderScreenLayout title={pageTitle} contentTitle={pageTitle}>
      <WalletsList variant="hidden" />
    </AnimatedHeaderScreenLayout>
  );
}
