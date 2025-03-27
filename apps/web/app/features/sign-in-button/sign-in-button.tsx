import { useLeatherConnect } from '~/store/addresses';

import { LEATHER_EXTENSION_CHROME_STORE_URL } from '@leather.io/constants';

import { ActiveAccountButtonLayout, SignInButtonLayout } from './sign-in-button.layout';

function InstallLeatherButton() {
  return (
    <SignInButtonLayout onClick={() => window.open(LEATHER_EXTENSION_CHROME_STORE_URL, '_blank')}>
      Install
    </SignInButtonLayout>
  );
}

function ConnectLeatherButton() {
  const { connect } = useLeatherConnect();
  return <SignInButtonLayout onClick={connect}>Connect</SignInButtonLayout>;
}

function ActiveAccountButton() {
  const { addresses, connect, openExtension, disconnect } = useLeatherConnect();
  return (
    <ActiveAccountButtonLayout
      address={addresses[2].address}
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
