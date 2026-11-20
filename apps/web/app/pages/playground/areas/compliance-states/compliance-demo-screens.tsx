import { useState } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import {
  BtcAvatarIcon,
  Button,
  ChevronDownIcon,
  ExpandIcon,
  Flag,
  IconButton,
  InfoCircleIcon,
  Input,
  ItemLayout,
  SettingsGearIcon,
  SkeletonLoader,
  StxAvatarIcon,
  Tabs,
  UsdcxAvatarIcon,
} from '@leather.io/ui';

import {
  keyBackupCopy,
  mockAccount,
  mockSecretKey,
  mockSendForm,
  mockTokens,
} from '../compliance-shared/compliance-content';
import {
  PopupBody,
  PopupFooter,
  PopupHeader,
  useComplianceActions,
} from '../compliance-shared/compliance-screen-parts';
import { type ScreenLayout } from '../compliance-shared/compliance-screens';

// Demo-only context screens: today's Home, send form and View Secret Key flow, mocked so the
// walkthrough has somewhere to start. None of this is new UI; the new screens live in
// compliance-shared/compliance-screens.tsx.

function TokenAvatar({ id }: { id: string }) {
  if (id === 'btc') return <BtcAvatarIcon />;
  if (id === 'stx') return <StxAvatarIcon />;
  return <UsdcxAvatarIcon />;
}

interface HomeScreenProps {
  layout: ScreenLayout;
  isLoading?: boolean;
}
export function HomeScreen({ layout, isLoading = false }: HomeScreenProps) {
  const isFull = layout === 'full';
  const actions = isFull
    ? ['Buy', 'Sell', 'Send', 'Receive', 'Swap']
    : ['Buy & Sell', 'Transfer', 'Swap'];
  return (
    <Flex direction="column" height="100%" data-testid="compliance-home" data-loading={isLoading}>
      <Box width="100%" maxWidth={isFull ? 'fullPageMaxWidth' : undefined} mx="auto">
        <styled.header p="space.04" flexShrink={0}>
          <Flex alignItems="center" justifyContent="space-between" ml="space.02">
            <Flex alignItems="center" gap="space.02">
              <styled.span textStyle="label.01">{mockAccount.name}</styled.span>
              <ChevronDownIcon variant="small" />
            </Flex>
            <Flex>
              {isFull ? null : <IconButton height="headerContainerHeight" icon={<ExpandIcon />} />}
              <IconButton height="headerContainerHeight" icon={<SettingsGearIcon />} />
            </Flex>
          </Flex>
        </styled.header>
      </Box>
      <PopupBody>
        <Box width="100%" maxWidth={isFull ? 'fullPageMaxWidth' : undefined} mx="auto">
          <Stack px="space.05" pb="space.05" gap="space.05">
            <Stack gap="space.02">
              <Flag
                reverse
                spacing="space.01"
                img={<InfoCircleIcon color="ink.text-subdued" display="inline" variant="small" />}
              >
                <styled.h2 textStyle="label.02">Total balance</styled.h2>
              </Flag>
              <SkeletonLoader width="200px" height="46px" isLoading={isLoading}>
                <styled.h1 textStyle="heading.02" animation="fadein 300ms ease-out">
                  {mockAccount.totalBalance}
                </styled.h1>
              </SkeletonLoader>
            </Stack>
            <Flex gap={isFull ? 'space.04' : 'space.01'}>
              {actions.map((label, index) => (
                <Button
                  key={label}
                  minWidth={100}
                  flexGrow={1}
                  variant={index === 0 ? 'solid' : 'outline'}
                >
                  {label}
                </Button>
              ))}
            </Flex>
          </Stack>
          <Tabs.Root defaultValue="tokens">
            <Tabs.List>
              <Tabs.Trigger value="tokens">Tokens</Tabs.Trigger>
              <Tabs.Trigger value="collectibles">Collectibles</Tabs.Trigger>
              <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>
          <Stack gap="space.00" py="space.02">
            {mockTokens.map(token => (
              <Box key={token.id} px="space.05" py="space.03">
                {isLoading ? (
                  <Flex alignItems="center" gap="space.03">
                    <SkeletonLoader isLoading width="40px" height="40px" borderRadius="round" />
                    <Stack gap="space.01" flex={1}>
                      <SkeletonLoader isLoading width="96px" height="16px" />
                      <SkeletonLoader isLoading width="48px" height="14px" />
                    </Stack>
                    <SkeletonLoader isLoading width="80px" height="16px" />
                  </Flex>
                ) : (
                  <ItemLayout
                    img={<TokenAvatar id={token.id} />}
                    titleLeft={token.name}
                    captionLeft={token.symbol}
                    titleRight={token.fiat}
                    captionRight={token.amount}
                  />
                )}
              </Box>
            ))}
          </Stack>
        </Box>
      </PopupBody>
    </Flex>
  );
}

interface KeyBackupPasswordScreenProps {
  onContinue(): void;
}
export function KeyBackupPasswordScreen({ onContinue }: KeyBackupPasswordScreenProps) {
  const { goTo } = useComplianceActions();
  return (
    <Flex direction="column" height="100%" data-testid="compliance-key-backup-password">
      <PopupHeader onBack={() => goTo('why-created')} showSettings={false} />
      <PopupBody>
        <Stack px="space.05" gap="space.04">
          <styled.h1 textStyle="heading.03">{keyBackupCopy.passwordTitle}</styled.h1>
          <styled.p textStyle="body.02" color="ink.text-secondary">
            {keyBackupCopy.passwordBody}
          </styled.p>
          <Input.Root shrink>
            <Input.Label>Password</Input.Label>
            <Input.Field type="password" value="correct-horse-battery" readOnly />
          </Input.Root>
        </Stack>
      </PopupBody>
      <PopupFooter>
        <Button fullWidth onClick={onContinue}>
          Continue
        </Button>
      </PopupFooter>
    </Flex>
  );
}

export function KeyBackupRevealScreen() {
  const { goTo } = useComplianceActions();
  const [isRevealed, setIsRevealed] = useState(false);
  return (
    <Flex direction="column" height="100%" data-testid="compliance-key-backup-reveal">
      <PopupHeader onBack={() => goTo('why-created')} showSettings={false} />
      <PopupBody>
        <Stack px="space.05" gap="space.04">
          <styled.h1 textStyle="heading.03">{keyBackupCopy.revealTitle}</styled.h1>
          <styled.p textStyle="body.02" color="ink.text-secondary">
            {keyBackupCopy.revealBody}
          </styled.p>
          <styled.button
            type="button"
            onClick={() => setIsRevealed(true)}
            position="relative"
            cursor={isRevealed ? 'default' : 'pointer'}
            borderRadius="sm"
            bg="ink.background-secondary"
            p="space.03"
            data-testid="compliance-key-backup-words"
          >
            <Box
              display="grid"
              gridTemplateColumns="repeat(3, 1fr)"
              gap="space.02"
              filter={isRevealed ? undefined : 'blur(6px)'}
              transition="filter 200ms ease-out"
            >
              {mockSecretKey.map((word, index) => (
                <styled.span key={word} textStyle="label.02" textAlign="left">
                  {index + 1}. {word}
                </styled.span>
              ))}
            </Box>
            {isRevealed ? null : (
              <Flex position="absolute" inset={0} alignItems="center" justifyContent="center">
                <styled.span textStyle="label.02">{keyBackupCopy.revealCta}</styled.span>
              </Flex>
            )}
          </styled.button>
        </Stack>
      </PopupBody>
      <PopupFooter>
        <Button fullWidth onClick={() => goTo('lockout')}>
          {keyBackupCopy.doneCta}
        </Button>
      </PopupFooter>
    </Flex>
  );
}

interface SendFormScreenProps {
  onContinue(): void;
}
export function SendFormScreen({ onContinue }: SendFormScreenProps) {
  return (
    <Flex direction="column" height="100%" data-testid="compliance-send-form">
      <PopupHeader title="Send" onBack={() => undefined} />
      <PopupBody>
        <Stack px="space.05" pt="space.04" alignItems="center">
          <Flex alignItems="baseline" justifyContent="center" gap="space.02" height="55px">
            <styled.span fontFamily="Marche" fontSize="48px" lineHeight="55px" fontWeight={500}>
              {mockSendForm.amount}
            </styled.span>
            <styled.span fontFamily="Marche" fontSize="48px" lineHeight="55px">
              {mockSendForm.symbol}
            </styled.span>
          </Flex>
          <styled.span textStyle="caption.01" color="ink.text-subdued" mt="12px">
            {mockSendForm.fiat}
          </styled.span>
          <Flex
            alignItems="center"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="ink.border-default"
            borderRadius="sm"
            minHeight="64px"
            mt="space.06"
            mb="space.04"
            px="space.04"
            width="100%"
          >
            <Flag img={<BtcAvatarIcon />} spacing="space.03" width="100%">
              <styled.span textStyle="label.01">{mockSendForm.assetName}</styled.span>
            </Flag>
          </Flex>
          <Box width="100%">
            <Input.Root shrink>
              <Input.Label>Recipient</Input.Label>
              <Input.Field id="compliance-send-recipient" value={mockSendForm.recipient} readOnly />
            </Input.Root>
          </Box>
        </Stack>
      </PopupBody>
      <PopupFooter>
        <Button fullWidth onClick={onContinue} data-testid="compliance-send-continue">
          Continue
        </Button>
        <Flex justifyContent="space-between" mt="space.03">
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            Available balance
          </styled.span>
          <styled.span textStyle="caption.01">{mockSendForm.available}</styled.span>
        </Flex>
      </PopupFooter>
    </Flex>
  );
}
