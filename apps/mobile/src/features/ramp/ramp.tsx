import { Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

import { useCurrentAccount } from '@/hooks/use-current-account';
import { getOnramperEnv } from '@/shared/environment';
import { useBitcoinPayerAddressFromAccountIndex } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';
import { useSettings } from '@/store/settings/settings';

import { LEATHER_EARN_URL } from '@leather.io/constants';
import { type OnramperMode, getOnramperIframeParams } from '@leather.io/features/native';
import type { FungibleCryptoAsset } from '@leather.io/models';
import { useTheme } from '@leather.io/ui/native';

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
  const { apiKey, signingSecret, widgetHost } = getOnramperEnv();
  const iframeParams = getOnramperIframeParams({
    theme: themeDerivedFromThemePreference,
    btcAddress: !asset || asset.chain === 'bitcoin' ? nativeSegwitPayerAddress : undefined,
    stxAddress: !asset || asset.chain === 'stacks' ? stxAddress : undefined,
    mode,
    apiKey,
    signingSecret,
    successRedirectUrl: LEATHER_EARN_URL,
    failureRedirectUrl: LEATHER_EARN_URL,
    redirectAtCheckout: true,
  });
  const link = `${widgetHost}?${iframeParams.toString()}`;
  const { bottom, top } = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <WebView
      source={{ uri: link }}
      style={{
        backgroundColor: colors['ink.background-primary'],
        marginTop: top + 44,
        marginBottom: bottom,
        height: height - bottom - top,
      }}
      nestedScrollEnabled
      allowsInlineMediaPlayback
    />
  );
}
