import { Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

import { useCurrentAccount } from '@/hooks/use-current-account';
import { useOnramperWidgetSignatureQuery } from '@/queries/onramper/onramper-widget-signature.query';
import { getOnramperEnv } from '@/shared/environment';
import { useBitcoinPayerAddressFromAccountIndex } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/core/macro';

import { LEATHER_PORTFOLIO_URL } from '@leather.io/constants';
import { type OnramperMode, getOnramperIframeParams } from '@leather.io/features';
import type { FungibleCryptoAsset } from '@leather.io/models';
import { Box, Button, Callout, SkeletonLoader, useTheme } from '@leather.io/ui/native';

const { height } = Dimensions.get('window');

interface RampProps {
  mode: OnramperMode;
  asset: FungibleCryptoAsset | null;
}

export function Ramp({ mode, asset }: RampProps) {
  const { themeDerivedFromThemePreference } = useSettings();
  const currentAccount = useCurrentAccount();

  const { nativeSegwitPayerAddress } = useBitcoinPayerAddressFromAccountIndex(
    currentAccount.fingerprint,
    currentAccount.accountIndex
  );
  const stxAddress = useStacksSignerAddressFromAccountIndex(
    currentAccount.fingerprint,
    currentAccount.accountIndex
  );
  const { apiKey, widgetHost } = getOnramperEnv();
  const iframeParams = getOnramperIframeParams({
    theme: themeDerivedFromThemePreference,
    btcAddress: !asset || asset.chain === 'bitcoin' ? nativeSegwitPayerAddress : undefined,
    stxAddress: !asset || asset.chain === 'stacks' ? stxAddress : undefined,
    mode,
    apiKey,
    successRedirectUrl: LEATHER_PORTFOLIO_URL,
    failureRedirectUrl: LEATHER_PORTFOLIO_URL,
    redirectAtCheckout: true,
    platform: Platform.OS === 'ios' ? 'webview-ios' : 'webview-android',
  });
  const {
    data: signature,
    isError,
    isFetching,
    refetch,
  } = useOnramperWidgetSignatureQuery(iframeParams);
  const { bottom, top } = useSafeAreaInsets();
  const { colors } = useTheme();
  const containerStyle = {
    backgroundColor: colors['ink.background-primary'],
    marginTop: top + 44,
    marginBottom: bottom,
    height: height - bottom - top,
  };

  if (isError) {
    return (
      <Box style={containerStyle} gap="5">
        <Callout variant="error" title={t`Couldn't load checkout`}>
          {t`Something went wrong while preparing the checkout. Try again in a moment.`}
        </Callout>
        <Box px="5">
          <Button disabled={isFetching} onPress={() => void refetch()}>
            {t`Try again`}
          </Button>
        </Box>
      </Box>
    );
  }

  if (!signature) {
    return (
      <Box style={containerStyle}>
        <SkeletonLoader isLoading height="100%" width="100%" />
      </Box>
    );
  }

  const link = `${widgetHost}?${new URLSearchParams({ ...iframeParams, ...signature }).toString()}`;

  return (
    <WebView
      source={{ uri: link }}
      style={containerStyle}
      nestedScrollEnabled
      allowsInlineMediaPlayback
    />
  );
}
