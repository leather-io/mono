import { PageLayout } from '@/components/page/page.layout';
import { AccountsWidget } from '@/components/widgets/accounts/accounts-widget';
import { AllAccountBalances, TokensWidget } from '@/components/widgets/tokens/tokens-widget';
import { useLingui } from '@lingui/react';

export function Home() {
  useLingui();
  return (
    <PageLayout>
      <AccountsWidget />
      <TokensWidget>
        <AllAccountBalances />
      </TokensWidget>
    </PageLayout>
  );
}
