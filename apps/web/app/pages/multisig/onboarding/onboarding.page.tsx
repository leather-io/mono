import { Navigate, useSearchParams } from 'react-router';

import { Flex, styled } from 'leather-styles/jsx';
import { ConnectCard } from '~/components/connect-card/connect-card';
import { useMultisigNetworks } from '~/features/multisig/auth/use-multisig-networks';
import { useSession } from '~/features/multisig/auth/use-session';
import { useIsRestoringSession } from '~/features/multisig/auth/use-session-bootstrap';
import { useSignIn } from '~/features/multisig/auth/use-sign-in';
import { useSignOut } from '~/features/multisig/auth/use-sign-out';
import { Page } from '~/layouts/page/page';

import { Link as UiLink } from '@leather.io/ui';

import { multisigPaths } from '../multisig.constants';
import { OnboardingConnectRow } from './components/onboarding-connect-row';

export function MultisigOnboardingPage() {
  const { btc: btcNetwork, stx: stxNetwork } = useMultisigNetworks();
  const btcSession = useSession(btcNetwork);
  const stxSession = useSession(stxNetwork);
  const btcSignIn = useSignIn(btcNetwork);
  const stxSignIn = useSignIn(stxNetwork);
  const btcSignOut = useSignOut(btcNetwork);
  const stxSignOut = useSignOut(stxNetwork);
  const btcRestoring = useIsRestoringSession(btcNetwork);
  const stxRestoring = useIsRestoringSession(stxNetwork);
  const [searchParams] = useSearchParams();

  if (btcSession || stxSession) {
    const invite = searchParams.get('invite');
    return (
      <Navigate
        to={
          invite
            ? `${multisigPaths.index}?invite=${encodeURIComponent(invite)}`
            : multisigPaths.index
        }
        replace
      />
    );
  }

  return (
    <Page>
      <Page.Header title="Multisig" />
      <Flex justifyContent="center" py="space.07">
        <ConnectCard
          width="100%"
          maxWidth="540px"
          title="Get started with Leather Multisig"
          description="Connect a wallet on each chain you want to use."
          footer={
            <styled.div
              textStyle="caption.01"
              color="ink.text-subdued"
              mt="space.05"
              textAlign="center"
            >
              Don't have Leather yet?{' '}
              <UiLink
                href="https://leather.io/wallet/extension"
                size="sm"
                target="_blank"
                rel="noreferrer"
                color="ink.text-primary"
                textDecorationColor="ink.text-subdued"
                fontWeight={400}
              >
                Install the extension ↗
              </UiLink>
            </styled.div>
          }
        >
          <OnboardingConnectRow
            chain="btc"
            session={btcSession}
            isPending={btcSignIn.isPending}
            isRestoring={btcRestoring}
            error={btcSignIn.error}
            onSignIn={() => btcSignIn.mutate()}
            onSignOut={btcSignOut}
          />
          <OnboardingConnectRow
            chain="stx"
            session={stxSession}
            isPending={stxSignIn.isPending}
            isRestoring={stxRestoring}
            error={stxSignIn.error}
            onSignIn={() => stxSignIn.mutate()}
            onSignOut={stxSignOut}
          />
        </ConnectCard>
      </Flex>
    </Page>
  );
}
