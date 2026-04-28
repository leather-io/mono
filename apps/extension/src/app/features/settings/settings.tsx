import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { css } from 'leather-styles/css';
import { Flex } from 'leather-styles/jsx';

import {
  DropdownMenu,
  ExitIcon,
  Eye1ClosedIcon,
  Eye1Icon,
  Flag,
  LockIcon,
  SettingsGearIcon,
  Switch,
} from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useHasKeys } from '@app/common/hooks/auth/use-has-keys';
import { useKeyActions } from '@app/common/hooks/use-key-actions';
import { useModifierKey } from '@app/common/hooks/use-modifier-key';
import { useWalletType } from '@app/common/use-wallet-type';
import { Divider } from '@app/components/layout/divider';
import { SignOut } from '@app/features/settings/sign-out/sign-out-confirm';
import {
  useHasActiveInMemoryWalletSecretKey,
  useHasUnlockedSoftwareWallets,
} from '@app/store/in-memory-key/in-memory-key.selectors';
import { useTogglePrivateMode } from '@app/store/settings/settings.actions';
import { useIsPrivateMode } from '@app/store/settings/settings.selectors';

import { AdvancedMenuItems } from './components/advanced-menu-items';

interface SettingsProps {
  canLockWallet?: boolean;
}
export function Settings({ canLockWallet = true }: SettingsProps) {
  const [showSignOut, setShowSignOut] = useState(false);

  const hasUnlockedWallets = useHasUnlockedSoftwareWallets();

  const { lockWallet } = useKeyActions();

  const navigate = useNavigate();

  const { walletType } = useWalletType();

  const isPrivateMode = useIsPrivateMode();
  const togglePrivateMode = useTogglePrivateMode();

  const location = useLocation();

  const { isPressed: showAdvancedMenuOptions } = useModifierKey('alt', 120);
  const showLockWalletItem = canLockWallet && hasUnlockedWallets;
  const showSignOutItem = hasUnlockedWallets;
  const hasDefaultInMemorySecretKey = useHasActiveInMemoryWalletSecretKey();
  const isWalletUnlocked = hasDefaultInMemorySecretKey || walletType === 'ledger';

  const settingsItem = (
    <DropdownMenu.Item
      data-testid={SettingsSelectors.SettingsMenuItem}
      onSelect={() => {
        analytics.track('click_settings_menu_item');
        void navigate(RouteUrls.Settings);
      }}
    >
      <Flag img={<SettingsGearIcon />} width="100%">
        <Flex justifyContent="space-between" textStyle="label.02">
          Settings
        </Flex>
      </Flag>
    </DropdownMenu.Item>
  );

  const togglePrivacyItem = (
    <DropdownMenu.Item
      data-testid={SettingsSelectors.TogglePrivacy}
      onSelect={e => {
        analytics.track('click_toggle_privacy');
        togglePrivateMode();
        e.preventDefault();
      }}
    >
      <Flag img={isPrivateMode ? <Eye1ClosedIcon /> : <Eye1Icon />} width="100%">
        <Flex justifyContent="space-between" textStyle="label.02">
          Toggle privacy
          <Switch.Root checked={isPrivateMode}>
            <Switch.Thumb />
          </Switch.Root>
        </Flex>
      </Flag>
    </DropdownMenu.Item>
  );

  const lockWalletItem = (
    <DropdownMenu.Item
      onSelect={() => {
        analytics.track('lock_session');
        void lockWallet({
          afterLock: () => navigate(RouteUrls.Unlock, { state: { from: location.pathname } }),
        });
      }}
      data-testid={SettingsSelectors.LockListItem}
    >
      <Flag img={<LockIcon />} textStyle="label.02" width="100%">
        Lock
      </Flag>
    </DropdownMenu.Item>
  );

  const signOutItem = (
    <DropdownMenu.Item
      onSelect={() => setShowSignOut(!showSignOut)}
      data-testid={SettingsSelectors.SignOutListItem}
    >
      <Flag
        color="red.action-primary-default"
        img={<ExitIcon color="red.action-primary-default" />}
        textStyle="label.02"
        width="100%"
      >
        Sign out
      </Flag>
    </DropdownMenu.Item>
  );

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.IconButton>
          <SettingsGearIcon data-testid={SettingsSelectors.SettingsMenuBtn} />
        </DropdownMenu.IconButton>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            side="bottom"
            sideOffset={8}
            className={css({
              width: 'settingsMenuWidth',
              maxHeight: 'var(--radix-dropdown-menu-content-available-height)',
              overflowY: 'scroll',
              boxShadow: 'elevation',
            })}
          >
            <DropdownMenu.Group>
              {isWalletUnlocked && settingsItem}
              {isWalletUnlocked && togglePrivacyItem}

              {(showAdvancedMenuOptions || showLockWalletItem || showSignOutItem) &&
                isWalletUnlocked && <Divider />}

              {showAdvancedMenuOptions && <AdvancedMenuItems />}

              {showLockWalletItem && lockWalletItem}

              {showSignOutItem && signOutItem}
            </DropdownMenu.Group>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      {showSignOut && <SignOut onClose={() => setShowSignOut(!showSignOut)} />}
    </>
  );
}
