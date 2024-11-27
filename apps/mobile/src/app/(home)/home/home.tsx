import { PageLayout } from '@/components/page/page.layout';
import { AccountsWidget } from '@/components/widgets/accounts/accounts-widget';
import { AllAccountBalances, TokensWidget } from '@/components/widgets/tokens/tokens-widget';
import { useWallets } from '@/store/wallets/wallets.read';
import { useLingui } from '@lingui/react';

export function Home() {
  useLingui();
  const { hasWallets } = useWallets();
  return (
    <PageLayout>
      <AccountsWidget />
      {hasWallets && (
        <TokensWidget>
          <AllAccountBalances />
        </TokensWidget>
      )}
    </PageLayout>
  );
}
