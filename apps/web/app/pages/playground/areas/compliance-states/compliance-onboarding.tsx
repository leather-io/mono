import { type ReactNode, useEffect, useState } from 'react';

import { Box, Flex, Grid, Stack, styled } from 'leather-styles/jsx';

import {
  ArrowLeftIcon,
  Button,
  Caption,
  Eye1Icon,
  IconButton,
  Input,
  LeatherLettermarkIcon,
  LeatherLogomarkIcon,
  Link,
} from '@leather.io/ui';

import { mockSecretKey, onboardingCopy } from './compliance-content';

const wordRevealIntervalMs = 140;
const mockPassword = 'correct-horse-2026';

interface OnboardingStepProps {
  onContinue(): void;
}

export function OnboardingWelcome({ onContinue }: OnboardingStepProps) {
  return (
    <Flex height="100%" data-testid="compliance-onboarding-welcome">
      <Flex direction="column" bg="ink.background-primary" flex={2} p="space.05">
        <styled.h1 textStyle="display.01" fontSize="88px" lineHeight="70px">
          {onboardingCopy.tagline.map(line => (
            <styled.span key={line} display="block" whiteSpace="nowrap">
              {line}
            </styled.span>
          ))}
        </styled.h1>
        <styled.h2 textStyle="heading.04" mt="space.07" maxWidth="556px">
          {onboardingCopy.subheader}
        </styled.h2>
        <Flex gap="space.04" mt="space.07" width="100%">
          <Button>Create new wallet</Button>
          <Flex gap="space.04" flex={1}>
            <Button
              variant="outline"
              fullWidth
              flex={1}
              onClick={onContinue}
              data-testid="compliance-use-existing-key"
            >
              Use existing key
            </Button>
            <Button variant="outline" fullWidth flex={1}>
              Use Ledger
            </Button>
          </Flex>
        </Flex>
      </Flex>
      <Flex
        p="space.05"
        bg="ink.text-primary"
        color="ink.background-primary"
        direction="column"
        justifyContent="space-between"
        flex={1}
      >
        <Flex justifyContent="space-between">
          <LeatherLogomarkIcon height={34} width={150} color="ink.background-primary" />
          <styled.span textStyle="label.02" mt="10px">
            leather.io
          </styled.span>
        </Flex>
        <LeatherLettermarkIcon height="auto" width="100%" color="ink.background-primary" />
      </Flex>
    </Flex>
  );
}

function OnboardingHeader() {
  return (
    <styled.header px="space.04" py="space.04">
      <Flex ml="space.02">
        <IconButton height="headerContainerHeight" icon={<ArrowLeftIcon />} aria-label="Back" />
      </Flex>
    </styled.header>
  );
}

interface TwoColumnProps {
  title: string;
  description: string;
  leftExtra?: ReactNode;
  children: ReactNode;
}
function TwoColumn({ title, description, leftExtra, children }: TwoColumnProps) {
  return (
    <Flex pt="space.06" px="space.05" gap="space.05" width="100%" justifyContent="space-between">
      <Flex maxWidth="1/3" direction="column" gap="space.04">
        <Stack gap="space.05">
          <styled.h1 textStyle="heading.03">{title}</styled.h1>
          <styled.p textStyle="body.01">{description}</styled.p>
        </Stack>
        {leftExtra}
      </Flex>
      <Flex flexGrow={1} gap="space.05" direction="column">
        {children}
      </Flex>
    </Flex>
  );
}

export function OnboardingSecretKey({ onContinue }: OnboardingStepProps) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (revealed >= mockSecretKey.length) return;
    const timeout = window.setTimeout(() => setRevealed(value => value + 1), wordRevealIntervalMs);
    return () => window.clearTimeout(timeout);
  }, [revealed]);

  return (
    <Box height="100%" overflowY="auto" data-testid="compliance-onboarding-secret-key">
      <OnboardingHeader />
      <TwoColumn
        title={onboardingCopy.signInTitle}
        description={onboardingCopy.signInDescription}
        leftExtra={
          <Link textStyle="label.03" width="fit-content" variant="text">
            Use 24 word Secret Key
          </Link>
        }
      >
        <Stack gap="space.05">
          <Grid gridTemplateColumns="repeat(3, minmax(170px, 1fr))" gap="space.02">
            {mockSecretKey.map((word, index) => {
              const value = index < revealed ? word : '';
              return (
                <Input.Root key={word} shrink={value.length > 0}>
                  <Input.Field
                    id={`compliance-word-${index + 1}`}
                    type="password"
                    value={value}
                    readOnly
                  />
                  <Input.Label>Word {index + 1}</Input.Label>
                </Input.Root>
              );
            })}
          </Grid>
          <Button
            fullWidth
            disabled={revealed < mockSecretKey.length}
            onClick={onContinue}
            data-testid="compliance-secret-key-continue"
          >
            Continue
          </Button>
        </Stack>
      </TwoColumn>
    </Box>
  );
}

const strongPasswordBars = 4;

export function OnboardingPassword({ onContinue }: OnboardingStepProps) {
  return (
    <Box height="100%" overflowY="auto" data-testid="compliance-onboarding-password">
      <OnboardingHeader />
      <TwoColumn
        title={onboardingCopy.passwordTitle}
        description={onboardingCopy.passwordDescription}
      >
        <Stack
          p="space.05"
          gap="space.04"
          bg="ink.background-primary"
          borderWidth="1px"
          borderStyle="solid"
          borderColor="ink.border-default"
          borderRadius="lg"
          width="100%"
          minWidth="twoColumnPageWidth"
        >
          <Box position="relative">
            <Input.Root shrink>
              <Input.Label>Password</Input.Label>
              <Input.Field id="compliance-password" type="password" value={mockPassword} readOnly />
            </Input.Root>
            <Box position="absolute" right="space.04" top="22px">
              <Eye1Icon />
            </Box>
          </Box>
          <Flex height="6px" gap="8px">
            {Array.from({ length: strongPasswordBars }, (_, index) => (
              <Box key={index} flexGrow={1} borderRadius="xs" bg="green.action-primary-default" />
            ))}
          </Flex>
          <Flex alignItems="center">
            <Caption mr="space.02">Password strength:</Caption>
            <Caption>Strong</Caption>
          </Flex>
          <Button mt="space.05" onClick={onContinue} data-testid="compliance-password-continue">
            Continue
          </Button>
        </Stack>
      </TwoColumn>
    </Box>
  );
}
