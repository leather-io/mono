import { Outlet, useSearchParams } from 'react-router';

import { RouteUrls } from '@shared/route-urls';

import { Content, Page } from '@app/components/layout';
import { FullPageLoadingSpinner } from '@app/components/loading-spinner';
import { PageHeader } from '@app/features/container/headers/page.header';
import { useCurrentAccountNativeSegwitIndexZeroSignerNullable } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

import { FiatProvidersList } from './fiat-providers-list';
import { FundLayout } from './components/fund.layout';

export function FundPage() {
  const currentStxAccount = useCurrentStacksAccount();
  const bitcoinSigner = useCurrentAccountNativeSegwitIndexZeroSignerNullable();
  const [searchParams] = useSearchParams();

  const currencyParam = searchParams.get('currency');
  const symbol = currencyParam === 'BTC' ? 'BTC' : 'STX';

  const address = symbol === 'BTC' ? bitcoinSigner?.address : currentStxAccount?.address;

  if (!address) return <FullPageLoadingSpinner />;

  return (
    <>
      <PageHeader isSettingsVisibleOnSm={false} onBackLocation={RouteUrls.Home} />
      <Content>
        <Page>
          <FundLayout symbol={symbol}>
            <FiatProvidersList address={address} symbol={symbol} />
          </FundLayout>
        </Page>
        <Outlet />
      </Content>
    </>
  );
}
