import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { Box, Circle, Flex, styled } from 'leather-styles/jsx';
import { Page } from '~/layouts/page/page';

import { Button, KeyIcon, Link as UiLink } from '@leather.io/ui';

import type { Chain } from '../data/multisig-types';
import { multisigPaths } from '../multisig.constants';
import { OnboardingConnectRow } from './components/onboarding-connect-row';

const StyledLink = styled(Link);

// UI-only onboarding: the connect step is simulated via local state (no real
// wallet connection), so reviewers can walk neither → one → both connected.
export function MultisigOnboardingPage() {
  const navigate = useNavigate();
  const [connected, setConnected] = useState<Record<Chain, boolean>>({ btc: false, stx: false });
  const bothConnected = connected.btc && connected.stx;

  function connect(chain: Chain) {
    setConnected(prev => ({ ...prev, [chain]: true }));
  }

  return (
    <Page>
      <Page.Header title="Multisig" />
      <Flex justifyContent="center" py="space.07">
        <Box
          width="100%"
          maxWidth="460px"
          p="space.06"
          borderRadius="lg"
          borderWidth="1px"
          borderStyle="solid"
          borderColor="ink.border-default"
        >
          <Flex alignItems="center" gap="space.03" mb="space.05">
            <Circle size="40px" bg="ink.background-secondary" flexShrink={0}>
              <KeyIcon variant="medium" />
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
              connected={connected.btc}
              onConnect={() => connect('btc')}
            />
            <OnboardingConnectRow
              chain="stx"
              connected={connected.stx}
              onConnect={() => connect('stx')}
            />
          </Flex>

          <Flex direction="column" gap="space.03" mt="space.05">
            <Button
              variant="solid"
              fullWidth
              disabled={!bothConnected}
              onClick={() => void navigate(multisigPaths.index)}
            >
              Enter Multisig
            </Button>
            <Flex justifyContent="center">
              <StyledLink to={multisigPaths.index} textStyle="label.03" color="ink.text-subdued">
                Skip for now
              </StyledLink>
            </Flex>
          </Flex>

          <styled.div
            textStyle="caption.01"
            color="ink.text-subdued"
            mt="space.05"
            textAlign="center"
          >
            Don't have Leather yet?{' '}
            <UiLink href="https://leather.io/install-extension">Install the extension ↗</UiLink>
          </styled.div>
        </Box>
      </Flex>
    </Page>
  );
}
