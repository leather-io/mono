import { useState } from 'react';

import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { Flex } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useHasKeys } from '@app/common/hooks/auth/use-has-keys';
import { useKeyActions } from '@app/common/hooks/use-key-actions';
import { useWalletType } from '@app/common/use-wallet-type';
import { SignOut } from '@app/features/settings/sign-out/sign-out-confirm';
import { useNavigate } from '@app/routes/compat';
import { useAppDispatch } from '@app/store';
import { useHasDefaultInMemoryWalletSecretKey } from '@app/store/in-memory-key/in-memory-key.selectors';
import { miscNavigationSlice } from '@app/store/navigation/misc-navigation.slice';

export function StickyButtons() {
  const { lockWallet } = useKeyActions();
  const hasDefaultInMemorySecretKey = useHasDefaultInMemoryWalletSecretKey();
  const { hasKeys } = useHasKeys();
  const { walletType } = useWalletType();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showSignOut, setShowSignOut] = useState(false);

  return (
    <>
      <Flex
        gap="space.05"
        pb="space.05"
        pt="space.03"
        px="space.05"
        mx="-space.05"
        background="ink.background-primary"
        position="sticky"
        bottom={0}
        boxShadow="contentOverflowFade"
      >
        {hasDefaultInMemorySecretKey && hasKeys && walletType === 'software' && (
          <Button
            variant="outline"
            flex={1}
            data-testid={SettingsSelectors.LockListItem}
            onClick={() => {
              analytics.track('lock_session');
              void lockWallet({
                afterLock: () => {
                  dispatch(miscNavigationSlice.actions.setUnlockReturnPath(location.pathname));
                  navigate(RouteUrls.Unlock);
                },
              });
            }}
          >
            Lock App
          </Button>
        )}

        {hasKeys && (
          <Button
            variant="outline"
            color="red.action-primary-default"
            flex={1}
            data-testid={SettingsSelectors.SignOutListItem}
            onClick={() => {
              setShowSignOut(!showSignOut);
            }}
          >
            Sign Out
          </Button>
        )}
      </Flex>
      {showSignOut && <SignOut onClose={() => setShowSignOut(!showSignOut)} />}
    </>
  );
}
