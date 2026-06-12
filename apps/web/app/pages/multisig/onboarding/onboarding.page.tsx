import { Navigate } from 'react-router';

import { Box, Circle, Flex, styled } from 'leather-styles/jsx';
import { useSession } from '~/features/multisig/auth/use-session';
import { useIsRestoringSession } from '~/features/multisig/auth/use-session-bootstrap';
import { useSignIn } from '~/features/multisig/auth/use-sign-in';
import { useSignOut } from '~/features/multisig/auth/use-sign-out';
import { Page } from '~/layouts/page/page';

import type { AuthNetworkId } from '@leather.io/models';
import { KeyIcon, Link as UiLink } from '@leather.io/ui';

import type { Chain } from '../data/multisig-types';
import { multisigPaths } from '../multisig.constants';
import { OnboardingConnectRow } from './components/onboarding-connect-row';

const chainNetwork: Record<Chain, AuthNetworkId> = {
  btc: 'btc:mainnet',
  stx: 'stx:mainnet',
};

export function MultisigOnboardingPage() {
  const btcSession = useSession(chainNetwork.btc);
  const stxSession = useSession(chainNetwork.stx);
  const btcSignIn = useSignIn(chainNetwork.btc);
  const stxSignIn = useSignIn(chainNetwork.stx);
  const btcSignOut = useSignOut(chainNetwork.btc);
  const stxSignOut = useSignOut(chainNetwork.stx);
  const btcRestoring = useIsRestoringSession(chainNetwork.btc);
  const stxRestoring = useIsRestoringSession(chainNetwork.stx);

  if (btcSession || stxSession) {
    return <Navigate to={multisigPaths.index} replace />;
  }

  return (
    <Page>
      <Page.Header title="Multisig" />
      <Flex justifyContent="center" py="space.07">
        <Box
          width="100%"
          maxWidth="540px"
          p="space.06"
          borderRadius="lg"
          borderWidth="1px"
          borderStyle="solid"
          borderColor="ink.border-default"
        >
          <Flex alignItems="center" gap="space.03" mb="space.05">
            <Circle size="40px" bg="ink.text-primary" flexShrink={0}>
              <KeyIcon variant="medium" color="ink.background-primary" />
            </Circle>
            <Box>
              <styled.h2 textStyle="heading.05">Get started with Leather Multisig</styled.h2>
              <styled.p textStyle="body.02" color="ink.text-subdued">
                Connect a wallet on each chain you want to use.
              </styled.p>
            </Box>
          </Flex>

          <Flex direction="column" gap="space.03">
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
          </Flex>

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
        </Box>
      </Flex>
    </Page>
  );
}
