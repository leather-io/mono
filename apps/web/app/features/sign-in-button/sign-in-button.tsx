import { styled } from 'leather-styles/jsx';
import { RotatedArrow } from '~/components/icons/rotated-icon';
import { useLeatherConnect } from '~/store/addresses';
import { openExternalLink } from '~/utils/external-links';
import { leather } from '~/utils/leather-sdk';
import { getConnectedWalletId, leatherProviderId } from '~/utils/wallet';

import { LEATHER_EXTENSION_CHROME_STORE_URL } from '@leather.io/constants';
import { Link, Sheet } from '@leather.io/ui';

import { ActiveAccountButtonLayout, SignInButtonLayout } from './sign-in-button.layout';

function NoStacksAccountsWarningDialog() {
  const { showMissingStacksKeysDialog, setShowMissingStacksKeysDialog } = useLeatherConnect();
  const isLeatherSelected = getConnectedWalletId() === leatherProviderId;
  return (
    <Sheet
      isShowing={showMissingStacksKeysDialog}
      onClose={() => setShowMissingStacksKeysDialog(false)}
    >
      <styled.div p="space.05">
        <styled.h1 textStyle="heading.03">Unable to connect</styled.h1>
        <styled.p textStyle="heading.05" mt="space.03">
          Your wallet does not have a Stacks account available.
        </styled.p>
        {isLeatherSelected ? (
          <styled.p textStyle="body.02" mt="space.02">
            <Link
              display="inline-block"
              color="inherit"
              fontSize="inherit"
              onClick={() => leather.open({ mode: 'fullpage' })}
            >
              Open Leather <RotatedArrow />
            </Link>{' '}
            with your Ledger device ready, and select Connect Stacks from the home screen
          </styled.p>
        ) : (
          <styled.p textStyle="body.02" mt="space.02">
            Open your wallet and enable a Stacks account, then try connecting again
          </styled.p>
        )}
      </styled.div>
    </Sheet>
  );
}

function InstallLeatherButton() {
  return (
    <SignInButtonLayout onClick={() => openExternalLink(LEATHER_EXTENSION_CHROME_STORE_URL)}>
      Install
    </SignInButtonLayout>
  );
}

function ConnectLeatherButton() {
  const { connect } = useLeatherConnect();
  return (
    <>
      <SignInButtonLayout onClick={connect}>Connect</SignInButtonLayout>
      <NoStacksAccountsWarningDialog />
    </>
  );
}

function ActiveAccountButton() {
  const { stacksAccount, connect, openExtension, disconnect, isLeatherWallet } =
    useLeatherConnect();
  return (
    <ActiveAccountButtonLayout
      address={stacksAccount?.address ?? ''}
      onSwitchAccount={connect}
      onOpenExtension={isLeatherWallet ? openExtension : undefined}
      onSignout={disconnect}
    />
  );
}

export function SignInButton() {
  const { status } = useLeatherConnect();

  switch (status) {
    case 'missing':
      return <InstallLeatherButton />;
    case 'detected':
      return <ConnectLeatherButton />;
    case 'connected':
      return <ActiveAccountButton />;
    default:
      return null;
  }
}
