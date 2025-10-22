import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router';

import crypto from 'crypto';

import { colorThemes } from '@leather.io/tokens';

import {
  ONRAMPER_API_KEY,
  ONRAMPER_SIGNING_SECRET,
  ONRAMPER_WIDGET_HOST,
} from '@shared/environment';
import { RouteUrls } from '@shared/route-urls';

import { useThemeSwitcher } from '@app/common/theme-provider';
import { Content, Page } from '@app/components/layout';
import { PageHeader } from '@app/features/container/headers/page.header';
import { useCurrentAccountNativeSegwitIndexZeroSignerNullable } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

export function FundPage() {
  const currentStxAccount = useCurrentStacksAccount();
  const bitcoinSigner = useCurrentAccountNativeSegwitIndexZeroSignerNullable();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const btcAddress = bitcoinSigner?.address;
  const stxAddress = currentStxAccount?.address || '';

  const { theme } = useThemeSwitcher();
  const colors = theme === 'dark' ? colorThemes.dark : colorThemes.base;

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) return;

    function sendThemeMessage() {
      iframe?.contentWindow?.postMessage(
        {
          type: 'change-theme',
          id: 'change-theme',
          theme: {
            primaryColor: colors['ink.action-primary-default'],
            secondaryColor: colors['ink.component-background-default'],
            primaryTextColor: colors['ink.text-primary'],
            secondaryTextColor: colors['ink.text-subdued'],
            containerColor: colors['ink.background-primary'],
            cardColor: colors['ink.component-background-hover'],
            primaryBtnTextColor: colors['ink.background-primary'],
            borderRadius: '.25',
            widgetBorderRadius: '0.1',
          },
        },
        '*'
      );
    }

    iframe.addEventListener('load', sendThemeMessage);

    sendThemeMessage();

    return () => {
      iframe.removeEventListener('load', sendThemeMessage);
    };
  }, [theme, colors]);

  const wallets = `btc:${btcAddress},stx_stacks:${stxAddress}`;
  const signContent = `wallets=${wallets}`;

  function generateSignature(data: string): string {
    return crypto.createHmac('sha256', ONRAMPER_SIGNING_SECRET).update(data).digest('hex');
  }

  const params = new URLSearchParams({
    apiKey: ONRAMPER_API_KEY,
    signature: generateSignature(signContent),
    mode: 'buy',
    onlyCryptoNetworks: 'stacks,bitcoin',
    onlyCryptos: 'stx_stacks,btc',
    defaultFiat: 'USD',
    defaultAmount: '25',
    redirectAtCheckout: 'false',
    hideTopBar: 'true',
    wallets,
    darkMode: theme === 'dark' ? 'true' : 'false',
    themeName: theme,
  });

  return (
    <>
      <PageHeader isSettingsVisibleOnSm={false} onBackLocation={RouteUrls.Home} />
      <Content>
        <Page>
          <iframe
            ref={iframeRef}
            src={`${ONRAMPER_WIDGET_HOST}?${params.toString()}`}
            title="Onramper Widget"
            height="585px"
            width="100%"
            allow="popups; accelerometer; autoplay; camera; gyroscope; payment; microphone"
          />
        </Page>
        <Outlet />
      </Content>
    </>
  );
}
