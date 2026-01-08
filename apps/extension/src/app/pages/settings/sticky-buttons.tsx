import { useState } from 'react';
import { useNavigate } from 'react-router';

import { SettingsSelectors } from '@tests/selectors/settings.selectors';

import { Button, StickyFooter } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useHasKeys } from '@app/common/hooks/auth/use-has-keys';
import { useKeyActions } from '@app/common/hooks/use-key-actions';
import { useWalletType } from '@app/common/use-wallet-type';
import { SignOut } from '@app/features/settings/sign-out/sign-out-confirm';
import { useHasDefaultInMemoryWalletSecretKey } from '@app/store/in-memory-key/in-memory-key.selectors';

export function StickyButtons() {
  const { lockWallet } = useKeyActions();
  const hasDefaultInMemorySecretKey = useHasDefaultInMemoryWalletSecretKey();
  const { hasKeys } = useHasKeys();
  const { walletType } = useWalletType();
  const navigate = useNavigate();
  const [showSignOut, setShowSignOut] = useState(false);

  return (
    <>
      <StickyFooter
        gap="space.05"
        pb="space.05"
        pt="space.03"
        background="ink.background-primary"
        px="space.05"
      >
        {hasDefaultInMemorySecretKey && hasKeys && walletType === 'software' && (
          <Button
            variant="outline"
            flex={1}
            data-testid={SettingsSelectors.LockListItem}
            onClick={() => {
              analytics.track('lock_session');
              void lockWallet({
                afterLock: () => navigate(RouteUrls.Unlock, { state: { from: location.pathname } }),
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
      </StickyFooter>
      {showSignOut && <SignOut onClose={() => setShowSignOut(!showSignOut)} />}
    </>
  );
}
