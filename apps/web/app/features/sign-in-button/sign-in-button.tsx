import { useLeatherConnect } from '~/store/addresses';

import {
  ActiveAccountButtonLayout,
  SignInButtonContainer,
  SignInButtonLayout,
} from './sign-in-button.layout';

function InstallLeatherButton() {
  return (
    <SignInButtonContainer>
      <SignInButtonLayout
        onClick={() => {
          window.open(
            'https://chromewebstore.google.com/detail/leather/ldinpeekobnhjjdofggfgjlcehhmanlj?hl=en',
            '_blank'
          );
        }}
      >
        Install
      </SignInButtonLayout>
    </SignInButtonContainer>
  );
}

function ConnectLeatherButton() {
  const { connect } = useLeatherConnect();
  return (
    <SignInButtonContainer>
      <SignInButtonLayout onClick={connect}>Connect</SignInButtonLayout>
    </SignInButtonContainer>
  );
}

function ActiveAccountButton() {
  const { addresses, connect, disconnect } = useLeatherConnect();
  return (
    <ActiveAccountButtonLayout
      address={addresses[2].address}
      onSwitchAccount={connect}
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
