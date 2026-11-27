import { Outlet } from 'react-router';

import { LEATHER_PORTFOLIO_URL } from '@leather.io/constants';
import { getOnramperIframeParams } from '@leather.io/features';

import { ONRAMPER_API_KEY } from '@shared/environment';
import { RouteUrls } from '@shared/route-urls';

import { useThemeSwitcher } from '@app/common/theme-provider';
import { Content, Page } from '@app/components/layout';
import { OnramperWidget } from '@app/components/onramper-widget';
import { PageHeader } from '@app/features/container/headers/page.header';
import { useCurrentAccountNativeSegwitIndexZeroPayerNullable } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

export function SellPage() {
  const currentStxAccount = useCurrentStacksAccount();
  const bitcoinSigner = useCurrentAccountNativeSegwitIndexZeroPayerNullable();
  const btcAddress = bitcoinSigner?.address;
  const stxAddress = currentStxAccount?.address;

  const { theme } = useThemeSwitcher();

  const params = getOnramperIframeParams({
    theme,
    btcAddress,
    stxAddress,
    apiKey: ONRAMPER_API_KEY,
    mode: 'sell',
    successRedirectUrl: LEATHER_PORTFOLIO_URL,
    failureRedirectUrl: LEATHER_PORTFOLIO_URL,
    platform: 'browser-extension',
  });

  return (
    <>
      <PageHeader isSettingsVisibleOnSm={false} onBackLocation={RouteUrls.Home} />
      <Content>
        <Page>
          <OnramperWidget params={params} />
        </Page>
        <Outlet />
      </Content>
    </>
  );
}
