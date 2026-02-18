import { LEATHER_EARN_URL } from '@leather.io/constants';
import { getOnramperIframeParams } from '@leather.io/features';

import {
  ONRAMPER_API_KEY,
  ONRAMPER_SIGNING_SECRET,
  ONRAMPER_WIDGET_HOST,
} from '@shared/environment';
import { RouteUrls } from '@shared/route-urls';

import { useThemeSwitcher } from '@app/common/theme-provider';
import { Content, Page } from '@app/components/layout';
import { PageHeader } from '@app/features/container/headers/page.header';
import { Outlet } from '@app/routes/compat';
import { useCurrentAccountNativeSegwitIndexZeroSignerNullable } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

export function SellPage() {
  const currentStxAccount = useCurrentStacksAccount();
  const bitcoinSigner = useCurrentAccountNativeSegwitIndexZeroSignerNullable();
  const btcAddress = bitcoinSigner?.address;
  const stxAddress = currentStxAccount?.address;

  const { theme } = useThemeSwitcher();

  const params = getOnramperIframeParams({
    theme,
    btcAddress,
    stxAddress,
    apiKey: ONRAMPER_API_KEY,
    signingSecret: ONRAMPER_SIGNING_SECRET,
    mode: 'sell',
    successRedirectUrl: LEATHER_EARN_URL,
    failureRedirectUrl: LEATHER_EARN_URL,
  });

  return (
    <>
      <PageHeader isSettingsVisibleOnSm={false} onBackLocation={RouteUrls.Home} />
      <Content>
        <Page>
          <iframe
            title="Onramper Widget"
            height="585px"
            width="100%"
            allow="popups; accelerometer; autoplay; camera; gyroscope; payment; microphone"
            src={`${ONRAMPER_WIDGET_HOST}?${params.toString()}`}
          />
        </Page>
        <Outlet />
      </Content>
    </>
  );
}
