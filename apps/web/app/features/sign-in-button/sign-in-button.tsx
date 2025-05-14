import { useLeatherConnect } from '~/store/addresses';
import { openExternalLink } from '~/utils/external-links';

import { LEATHER_EXTENSION_CHROME_STORE_URL } from '@leather.io/constants';

import { ActiveAccountButtonLayout, SignInButtonLayout } from './sign-in-button.layout';

function InstallLeatherButton() {
  return (
    <SignInButtonLayout onClick={() => openExternalLink(LEATHER_EXTENSION_CHROME_STORE_URL)}>
      Install
    </SignInButtonLayout>
  );
}

function ConnectLeatherButton() {
  const { connect } = useLeatherConnect();
  return <SignInButtonLayout onClick={connect}>Connect</SignInButtonLayout>;
}

function ActiveAccountButton() {
  const { stacksAccount, connect, openExtension, disconnect } = useLeatherConnect();
  return (
    <ActiveAccountButtonLayout
      address={stacksAccount?.address ?? ''}
      onSwitchAccount={connect}
      onOpenExtension={openExtension}
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
