import { useState } from 'react';
import { useNavigate } from 'react-router';

import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { Flex, styled } from 'leather-styles/jsx';

import {
  BellAlarmIcon,
  BellIcon,
  CodeIcon,
  GlobeTiltedIcon,
  KeyIcon,
  MegaphoneIcon,
  SunInCloudIcon,
  SupportIcon,
} from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';
import { analytics, openFeedbackSheet } from '@shared/utils/analytics';

import { useHasKeys } from '@app/common/hooks/auth/use-has-keys';
import { useWalletType } from '@app/common/use-wallet-type';
import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { AppVersion } from '@app/components/app-version';
import { NetworkSheet } from '@app/features/settings/network/network';
import { ThemeSheet } from '@app/features/settings/theme/theme-dialog';
import { useToast } from '@app/features/toasts/use-toast';
import { useToggleNotificationsEnabled } from '@app/store/settings/settings.actions';
import { useIsNotificationsEnabled } from '@app/store/settings/settings.selectors';

import { SettingsButton } from './components/settings-button';

export function MenuButtons() {
  const navigate = useNavigate();
  const { hasKeys } = useHasKeys();
  const { walletType } = useWalletType();
  const [showChangeTheme, setShowChangeTheme] = useState(false);
  const [showChangeNetwork, setShowChangeNetwork] = useState(false);
  const isNotificationsEnabled = useIsNotificationsEnabled();
  const toggleNotificationsEnabled = useToggleNotificationsEnabled();
  const toast = useToast();

  return (
    <Flex direction="column" gap="space.01">
      {hasKeys && walletType === 'software' && (
        <SettingsButton
          variant="chevron"
          title="Secret Key"
          data-testid={SettingsSelectors.ViewSecretKeyListItem}
          onClick={() => navigate(RouteUrls.ViewSecretKey)}
          icon={<KeyIcon />}
        />
      )}

      <SettingsButton
        data-testid={SettingsSelectors.ToggleTheme}
        variant="chevron"
        title="Theme"
        onClick={() => {
          analytics.track('click_change_theme_menu_item');
          setShowChangeTheme(!showChangeTheme);
        }}
        icon={<SunInCloudIcon />}
      />

      <SettingsButton
        data-testid={SettingsSelectors.ChangeNetworkAction}
        variant="chevron"
        title="Network"
        onClick={() => {
          analytics.track('click_change_network_menu_item');
          setShowChangeNetwork(!showChangeNetwork);
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
          openInNewTab('https://app.leather.io/help-center');
        }}
        icon={<SupportIcon />}
      />

      <SettingsButton
        variant="external"
        title="Dev docs"
        onClick={() => {
          openInNewTab('https://leather.gitbook.io/developers');
          // TODO: where should this navigate to?
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
      {showChangeTheme && <ThemeSheet onClose={() => setShowChangeTheme(!showChangeTheme)} />}
      {showChangeNetwork && (
        <NetworkSheet onClose={() => setShowChangeNetwork(!showChangeNetwork)} />
      )}
    </Flex>
  );
}
