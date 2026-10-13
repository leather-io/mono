import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { Box, Flex, styled } from 'leather-styles/jsx';

import { Button, LeatherLettermarkIcon, LeatherLogomarkIcon, Link } from '@leather.io/ui';

interface WelcomeLayoutProps {
  isGeneratingWallet: boolean;
  onSelectConnectLedger(): void;
  onStartOnboarding(): void;
  onRestoreWallet(): void;
}
export function WelcomeLayout({
  isGeneratingWallet,
  onStartOnboarding,
  onSelectConnectLedger,
  onRestoreWallet,
}: WelcomeLayoutProps): React.JSX.Element {
  const tagline = (
    <>
      <styled.span whiteSpace="nowrap">Buy. send.</styled.span>
      <br />
      <styled.span whiteSpace="nowrap">swap. earn.</styled.span>
      <br />
      grow.
    </>
  );
  const taglineExtended = 'The bitcoin wallet for the rest of us';
  const subheader =
    'Leather is a wallet for Bitcoin and Stacks, designed for security, clarity, and growth. Join 100,000+ users on your favorite platform.';

  return (
    <Flex flexDir={['column-reverse', null, 'row']} minW="100vw" minH="100vh">
      <Flex flexDir="column" bg="ink.background-primary" flex={[1, null, 2]} p="space.05">
        <Flex
          flexDir="column"
          flex={[1, null, 0]}
          justifyContent={['end', null, 'flex-start']}
          color="ink.text-primary"
        >
          <styled.h1 hideBelow="md" textStyle="display.01" fontSize="9vw" lineHeight="7vw">
            {tagline}
          </styled.h1>
          <styled.h1 hideFrom="md" textStyle="heading.03" maxWidth="996px">
            {taglineExtended}
          </styled.h1>

          <styled.h2
            textStyle={['label.01', 'heading.04']}
            mt={['space.02', 'space.07']}
            maxW="556px"
          >
            {subheader}
          </styled.h2>
        </Flex>
        <Flex flexDir={['column', null, 'row']} gap="space.04" mt="space.07" width="100%">
          <Button
            onClick={onStartOnboarding}
            data-testid={OnboardingSelectors.SignUpBtn}
            aria-busy={isGeneratingWallet}
          >
            Create new wallet
          </Button>

          <Flex gap="space.04">
            <Button
              variant="outline"
              fullWidth
              flex={1}
              onClick={onRestoreWallet}
              data-testid={OnboardingSelectors.SignInLink}
            >
              Use existing key
            </Button>
            <Button variant="outline" fullWidth flex={1} onClick={onSelectConnectLedger}>
              Use Ledger
            </Button>
          </Flex>
        </Flex>
      </Flex>
      <Flex
        p="space.05"
        bg={['ink.background-primary', null, 'ink.text-primary']}
        color={['ink.text-primary', null, 'ink.background-primary']}
        flexDir="column"
        justifyContent="space-between"
        flex={[0, 1]}
      >
        <Flex justifyContent="space-between">
          <Box hideFrom="md">
            <LeatherLogomarkIcon height={34} width={150} color="ink.action-primary-default" />
          </Box>
          <Box hideBelow="md">
            <LeatherLogomarkIcon height={34} width={150} color="ink.background-primary" />
          </Box>
          <Link href="https://leather.io/" hideBelow="md" variant="text" mt="13px">
            leather.io
          </Link>
        </Flex>
        <Box hideBelow="md">
          <LeatherLettermarkIcon height="auto" width="100%" color="ink.background-primary" />
        </Box>
      </Flex>
    </Flex>
  );
}
