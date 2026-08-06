import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { Flex, styled } from 'leather-styles/jsx';

import { LEATHER_GITBOOK_DEVS, LEATHER_GUIDES_URL } from '@leather.io/constants';
import {
  BellAlarmIcon,
  BellIcon,
  CodeIcon,
  GlobeTiltedIcon,
  KeyIcon,
  LockIcon,
  MegaphoneIcon,
  SunInCloudIcon,
  SupportIcon,
} from '@leather.io/ui';

import { TARGET_BROWSER } from '@shared/environment';
import { RouteUrls } from '@shared/route-urls';
import { analytics, openFeedbackSheet } from '@shared/utils/analytics';

import { useHasKeys } from '@app/common/hooks/auth/use-has-keys';
import { useWalletType } from '@app/common/use-wallet-type';
import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { canUsePlatformAuthenticator } from '@app/common/wallet-authentication/platform-authenticator';
import { AppVersion } from '@app/components/app-version';
import { useToast } from '@app/features/toasts/use-toast';
import { useToggleNotificationsEnabled } from '@app/store/settings/settings.actions';
import { useIsNotificationsEnabled } from '@app/store/settings/settings.selectors';
import {
  selectSoftwareKeys,
  selectWalletAuthenticationCapabilities,
} from '@app/store/software-keys/software-key.selectors';

import {
  getBiometricUnlockSettingsLabel,
  getBiometricUnlockSettingsState,
} from './biometric-unlock/biometric-unlock-settings-state';
import { SettingsButton } from './components/settings-button';

export function MenuButtons() {
  const navigate = useNavigate();
  const { hasKeys } = useHasKeys();
  const { walletType } = useWalletType();
  const isNotificationsEnabled = useIsNotificationsEnabled();
  const toggleNotificationsEnabled = useToggleNotificationsEnabled();
  const toast = useToast();
  const softwareKeys = useSelector(selectSoftwareKeys);
  const authenticationCapabilities = useSelector(selectWalletAuthenticationCapabilities);
  const biometricUnlockState = getBiometricUnlockSettingsState({
    biometrics: authenticationCapabilities.biometrics,
    hasSoftwareKeys: softwareKeys.length > 0,
    platformAuthenticatorAvailable: canUsePlatformAuthenticator(),
    targetBrowser: TARGET_BROWSER,
    valid: authenticationCapabilities.valid,
  });
  const showBiometricUnlock = biometricUnlockState !== 'hidden';
  const biometricUnlockAvailable = biometricUnlockState !== 'unavailable';
  const biometricUnlockUnavailableMessage = authenticationCapabilities.valid
    ? "Biometric unlock isn't available in this browser context."
    : 'Biometric unlock settings are unavailable for this wallet state.';

  return (
    <Flex direction="column" gap="space.01" data-testid={SettingsSelectors.SettingsPage}>
      {hasKeys && walletType === 'software' && (
        <SettingsButton
          variant="chevron"
          title="Secret Key"
          data-testid={SettingsSelectors.ViewSecretKeyListItem}
          onClick={() =>
            navigate(RouteUrls.ViewSecretKey, { state: { startWalletAuthentication: true } })
          }
          icon={<KeyIcon />}
        />
      )}

      {showBiometricUnlock && (
        <SettingsButton
          variant="chevron"
          title="Biometric unlock"
          data-testid={SettingsSelectors.BiometricUnlockListItem}
          onClick={() => navigate(RouteUrls.BiometricUnlockSettings)}
          icon={<LockIcon />}
          status={getBiometricUnlockSettingsLabel(biometricUnlockState)}
          isDisabled={!biometricUnlockAvailable}
          disabledTooltipText={biometricUnlockUnavailableMessage}
        />
      )}

      <SettingsButton
        data-testid={SettingsSelectors.ToggleTheme}
        variant="chevron"
        title="Theme"
        onClick={() => {
          analytics.track('click_change_theme_menu_item');
          void navigate(RouteUrls.SelectTheme);
        }}
        icon={<SunInCloudIcon />}
      />

      <SettingsButton
        data-testid={SettingsSelectors.ChangeNetworkAction}
        variant="chevron"
        title="Network"
        onClick={() => {
          analytics.track('click_change_network_menu_item');
          void navigate(RouteUrls.SelectNetwork);
        }}
        icon={<GlobeTiltedIcon />}
      />

      <SettingsButton
        data-testid={SettingsSelectors.ToggleNotifications}
        variant="switch"
        title="Notification"
        tooltipText="Available for Bitcoin sends and receives"
        isEnabled={isNotificationsEnabled}
        onClick={() => {
          toggleNotificationsEnabled();
          toast.info(isNotificationsEnabled ? 'Notifications disabled' : 'Notifications enabled');
        }}
        icon={isNotificationsEnabled ? <BellAlarmIcon /> : <BellIcon />}
      />

      <SettingsButton
        data-testid={SettingsSelectors.GetSupportMenuItem}
        variant="external"
        title="Help"
        onClick={() => {
          openInNewTab(LEATHER_GUIDES_URL);
        }}
        icon={<SupportIcon />}
      />

      <SettingsButton
        variant="external"
        title="Dev docs"
        onClick={() => {
          openInNewTab(LEATHER_GITBOOK_DEVS);
        }}
        icon={<CodeIcon />}
      />

      <SettingsButton
        data-testid={SettingsSelectors.FeedbackMenuItem}
        variant="external"
        title="Feedback"
        onClick={() => openFeedbackSheet()}
        icon={<MegaphoneIcon />}
      />

      <Flex pt="space.03" pb="space.05" direction="column" gap="space.01">
        <styled.p textStyle="label.02">Version</styled.p>
        <AppVersion />
      </Flex>
    </Flex>
  );
}
