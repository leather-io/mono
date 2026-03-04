import { colorThemes } from '@leather.io/tokens';

import { OnramperMode } from './types';
import { formatColorHexForParams, generateSignature, matchAddresses } from './utils';

interface GetIframeProps {
  theme: 'dark' | 'light';
  btcAddress: string | undefined;
  stxAddress: string | undefined;
  apiKey: string;
  signingSecret: string;
  mode: OnramperMode;
  successRedirectUrl: string | undefined;
  failureRedirectUrl: string | undefined;
  redirectAtCheckout?: boolean;
}

export function getOnramperIframeParams({
  theme,
  btcAddress,
  stxAddress,
  apiKey,
  signingSecret,
  mode,
  successRedirectUrl,
  failureRedirectUrl,
  redirectAtCheckout = false,
}: GetIframeProps) {
  const redirectUrls: Record<string, string> = {};
  if (successRedirectUrl) redirectUrls['successRedirectUrl'] = successRedirectUrl;
  if (failureRedirectUrl) redirectUrls['failureRedirectUrl'] = failureRedirectUrl;
  const wallets = matchAddresses({
    btcAddress,
    stxAddress,
    resultMap: {
      bothAvailable: `btc:${btcAddress},stx_stacks:${stxAddress}`,
      onlyBtc: `btc:${btcAddress}`,
      onlyStx: `stx_stacks:${stxAddress}`,
      none: '',
    },
  });
  const onlyCryptoNetworks = matchAddresses({
    btcAddress,
    stxAddress,
    resultMap: {
      bothAvailable: `stacks,bitcoin`,
      onlyBtc: `bitcoin`,
      onlyStx: `stacks`,
      none: '',
    },
  });
  const onlyCryptos = matchAddresses({
    btcAddress,
    stxAddress,
    resultMap: {
      bothAvailable: `stx_stacks,btc`,
      onlyBtc: `btc`,
      onlyStx: `stx_stacks`,
      none: '',
    },
  });
  const signContent = `wallets=${wallets}`;

  const colors = theme === 'dark' ? colorThemes.dark : colorThemes.base;
  const params = new URLSearchParams({
    darkMode: theme === 'dark' ? 'true' : 'false',
    themeName: theme,
    primaryColor: formatColorHexForParams(colors['ink.action-primary-default']),
    secondaryColor: formatColorHexForParams(colors['ink.component-background-default']),
    primaryTextColor: formatColorHexForParams(colors['ink.text-primary']),
    secondaryTextColor: formatColorHexForParams(colors['ink.text-subdued-secondary']),
    containerColor: formatColorHexForParams(colors['ink.background-primary']),
    cardColor: formatColorHexForParams(colors['ink.component-background-hover']),
    primaryBtnTextColor: formatColorHexForParams(colors['ink.background-primary']),
    borderRadius: '0.25',
    widgetBorderRadius: '0.1',
    apiKey,
    signature: generateSignature(signContent, signingSecret),
    mode,
    onlyCryptoNetworks,
    sell_onlyCryptoNetworks: onlyCryptoNetworks,
    onlyCryptos,
    sell_onlyCryptos: onlyCryptos,
    defaultFiat: 'USD',
    sell_defaultFiat: 'USD',
    defaultAmount: '25',
    sell_defaultCrypto: 'BTC',
    sell_defaultAmount: '0.0005',
    redirectAtCheckout: redirectAtCheckout.toString(),
    hideTopBar: 'true',
    wallets,
    ...redirectUrls,
  });
  return params;
}
