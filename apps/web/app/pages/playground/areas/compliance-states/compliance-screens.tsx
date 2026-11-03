import { useEffect, useState } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import {
  Approver,
  BtcAvatarIcon,
  Button,
  Callout,
  ChevronDownIcon,
  ExpandIcon,
  Flag,
  IconButton,
  InfoCircleIcon,
  ItemLayout,
  Link,
  LockIcon,
  QuestionCircleIcon,
  SettingsGearIcon,
  StxAvatarIcon,
  Tabs,
  UsdcxAvatarIcon,
} from '@leather.io/ui';

import {
  counterpartyRefusedCopy,
  disputeCopy,
  lockoutCopy,
  mockAccount,
  mockDappRequest,
  mockSendReview,
  mockTokens,
  recipientRefusedCopy,
  screeningDelayMs,
  whyLockedCopy,
} from './compliance-content';
import {
  FooterActionsSkeleton,
  InfoRow,
  PopupBody,
  PopupFooter,
  PopupHeader,
  ScreeningUnavailableError,
} from './compliance-screen-parts';
import { type ComplianceStateId } from './compliance-states';

interface NavigableScreenProps {
  onNavigate(id: ComplianceStateId): void;
}

function useDelayedFlag(isActive: boolean, delayMs: number) {
  const [done, setDone] = useState(!isActive);
  useEffect(() => {
    if (!isActive) return;
    const timeout = window.setTimeout(() => setDone(true), delayMs);
    return () => window.clearTimeout(timeout);
  }, [isActive, delayMs]);
  return done;
}

function TokenAvatar({ id }: { id: string }) {
  if (id === 'btc') return <BtcAvatarIcon />;
  if (id === 'stx') return <StxAvatarIcon />;
  return <UsdcxAvatarIcon />;
}

// Home

function HomeScreen() {
  return (
    <Flex direction="column" height="100%" data-testid="compliance-home">
      <styled.header p="space.04" flexShrink={0}>
        <Flex alignItems="center" justifyContent="space-between" ml="space.02">
          <Flex alignItems="center" gap="space.02">
            <styled.span textStyle="label.01">{mockAccount.name}</styled.span>
            <ChevronDownIcon variant="small" />
          </Flex>
          <Flex>
            <IconButton height="headerContainerHeight" icon={<ExpandIcon />} />
            <IconButton height="headerContainerHeight" icon={<SettingsGearIcon />} />
          </Flex>
        </Flex>
      </styled.header>
      <PopupBody>
        <Stack px="space.05" pb="space.05" gap="space.05">
          <Stack gap="space.02">
            <Flag
              reverse
              spacing="space.01"
              img={<InfoCircleIcon color="ink.text-subdued" display="inline" variant="small" />}
            >
              <styled.h2 textStyle="label.02">Total balance</styled.h2>
            </Flag>
            <styled.h1 textStyle="heading.02">{mockAccount.totalBalance}</styled.h1>
          </Stack>
          <Flex gap="space.01">
            <Button minWidth={100} flexGrow={1} variant="solid">
              Buy & Sell
            </Button>
            <Button minWidth={100} flexGrow={1} variant="outline">
              Transfer
            </Button>
            <Button minWidth={100} flexGrow={1} variant="outline">
              Swap
            </Button>
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
              <ItemLayout
                img={<TokenAvatar id={token.id} />}
                titleLeft={token.name}
                captionLeft={token.symbol}
                titleRight={token.fiat}
                captionRight={token.amount}
              />
            </Box>
          ))}
        </Stack>
      </PopupBody>
    </Flex>
  );
}

// Lockout

export function LockoutScreen({ onNavigate }: NavigableScreenProps) {
  return (
    <Flex direction="column" height="100%" data-testid="compliance-lockout">
      <PopupHeader showLogo showSettings={false} />
      <Flex direction="column" justifyContent="center" flex={1} px="space.05" gap="space.04">
        <Flex
          width="64px"
          height="64px"
          alignItems="center"
          justifyContent="center"
          borderRadius="md"
          bg="ink.component-background-default"
          transform="rotate(-6deg)"
          mb="space.02"
        >
          <LockIcon color="ink.text-subdued" />
        </Flex>
        <styled.h1 textStyle="heading.03">{lockoutCopy.title}</styled.h1>
        <styled.p textStyle="body.02" color="ink.text-secondary">
          {lockoutCopy.body}
        </styled.p>
      </Flex>
      <PopupFooter bordered>
        <Stack gap="space.03">
          <Button fullWidth onClick={() => onNavigate('why-created')}>
            {lockoutCopy.whyCta}
          </Button>
          <Button fullWidth variant="outline" onClick={() => onNavigate('dispute')}>
            {lockoutCopy.disputeCta}
          </Button>
        </Stack>
      </PopupFooter>
    </Flex>
  );
}

interface WhyLockedScreenProps extends NavigableScreenProps {
  isCreatedInLeather: boolean;
}
export function WhyLockedScreen({ onNavigate, isCreatedInLeather }: WhyLockedScreenProps) {
  return (
    <Flex direction="column" height="100%" data-testid="compliance-why-locked">
      <PopupHeader onBack={() => onNavigate('lockout')} showSettings={false} />
      <PopupBody>
        <Stack px="space.05" gap="space.04">
          <styled.h1 textStyle="heading.03">{whyLockedCopy.title}</styled.h1>
          {whyLockedCopy.paragraphs.map(paragraph => (
            <styled.p key={paragraph} textStyle="body.02" color="ink.text-secondary">
              {paragraph}
            </styled.p>
          ))}
          {isCreatedInLeather ? (
            <Stack gap="space.01" mt="space.02">
              <Box>
                <Link href="#" onClick={event => event.preventDefault()}>
                  {whyLockedCopy.backupLink}
                </Link>
              </Box>
              <styled.span textStyle="caption.01" color="ink.text-subdued">
                {whyLockedCopy.backupNote}
              </styled.span>
            </Stack>
          ) : null}
        </Stack>
      </PopupBody>
      <PopupFooter bordered>
        <Button fullWidth variant="outline" onClick={() => onNavigate('dispute')}>
          {lockoutCopy.disputeCta}
        </Button>
      </PopupFooter>
    </Flex>
  );
}

export function DisputeScreen({ onNavigate }: NavigableScreenProps) {
  const [message, setMessage] = useState('');
  return (
    <Flex direction="column" height="100%" data-testid="compliance-dispute">
      <PopupHeader onBack={() => onNavigate('lockout')} showSettings={false} />
      <PopupBody>
        <Stack px="space.05" gap="space.04">
          <styled.h1 textStyle="heading.03">{disputeCopy.title}</styled.h1>
          <Callout variant="warning" title={disputeCopy.calloutTitle} borderRadius="sm">
            {disputeCopy.calloutBody}
          </Callout>
          <Stack gap="space.02">
            <styled.label htmlFor="compliance-dispute-message" textStyle="label.02">
              {disputeCopy.fieldLabel}
            </styled.label>
            <styled.textarea
              id="compliance-dispute-message"
              value={message}
              onChange={event => setMessage(event.target.value)}
              placeholder={disputeCopy.fieldPlaceholder}
              rows={5}
              resize="none"
              p="space.04"
              textStyle="body.02"
              borderWidth="1px"
              borderStyle="solid"
              borderColor="ink.border-default"
              borderRadius="sm"
              bg="ink.background-primary"
              _placeholder={{ color: 'ink.text-subdued' }}
              _focus={{ outline: 'none', borderColor: 'ink.action-primary-default' }}
            />
          </Stack>
        </Stack>
      </PopupBody>
      <PopupFooter bordered>
        <Button fullWidth disabled={message.trim().length === 0}>
          {disputeCopy.submit}
        </Button>
      </PopupFooter>
    </Flex>
  );
}

// Send review (popup)

type ReviewVerdict = 'clean' | 'recipient-flagged' | 'own-flagged' | 'no-answer';

interface SendReviewScreenProps extends NavigableScreenProps {
  verdict: ReviewVerdict;
  startScreening: boolean;
}
export function SendReviewScreen({ verdict, startScreening, onNavigate }: SendReviewScreenProps) {
  const [currentVerdict, setCurrentVerdict] = useState(verdict);
  const [isScreening, setIsScreening] = useState(startScreening);

  useEffect(() => {
    if (!isScreening) return;
    const timeout = window.setTimeout(() => setIsScreening(false), screeningDelayMs);
    return () => window.clearTimeout(timeout);
  }, [isScreening]);

  function retry() {
    setCurrentVerdict('clean');
    setIsScreening(true);
  }

  if (!isScreening && currentVerdict === 'own-flagged') {
    return <LockoutScreen onNavigate={onNavigate} />;
  }

  const isRefused = !isScreening && currentVerdict === 'recipient-flagged';
  const isUnavailable = !isScreening && currentVerdict === 'no-answer';

  function renderActions() {
    if (isScreening) return <FooterActionsSkeleton count={1} />;
    if (isRefused) {
      return (
        <Button fullWidth variant="outline">
          Close
        </Button>
      );
    }
    if (isUnavailable) {
      return (
        <Flex gap="space.04">
          <Button flex={1} variant="outline">
            Cancel
          </Button>
          <Button flex={1} onClick={retry}>
            Try again
          </Button>
        </Flex>
      );
    }
    return <Button fullWidth>Confirm and send transaction</Button>;
  }

  return (
    <Flex direction="column" height="100%" data-testid="compliance-send-review">
      <PopupHeader title="Review" onBack={() => undefined} />
      <PopupBody>
        {isRefused ? (
          <Box px="space.05" pt="space.02" pb="space.05">
            <Callout
              variant="error"
              title={recipientRefusedCopy.title}
              borderRadius="sm"
              data-testid="compliance-recipient-refused"
            >
              {recipientRefusedCopy.body}
            </Callout>
          </Box>
        ) : (
          <Stack alignItems="center" gap="space.01" py="space.05" mb="space.05">
            <styled.h1 textStyle="heading.03">
              {mockSendReview.amount}&nbsp;{mockSendReview.symbol}
            </styled.h1>
            <styled.span textStyle="label.01">~ {mockSendReview.fiat}&nbsp;USD</styled.span>
          </Stack>
        )}
        <Stack px="space.06" pb="space.06" gap="space.03">
          {mockSendReview.rows.map(row => (
            <InfoRow key={row.label} {...row} />
          ))}
        </Stack>
      </PopupBody>
      <PopupFooter notice={isUnavailable ? <ScreeningUnavailableError /> : null}>
        {renderActions()}
      </PopupFooter>
    </Flex>
  );
}

// dApp "Approve transaction" (request window)

type ApproveVerdict = 'clean' | 'counterparty-flagged' | 'no-answer';

interface ApproveTransactionScreenProps {
  verdict: ApproveVerdict;
  startScreening: boolean;
}
export function ApproveTransactionScreen({
  verdict,
  startScreening,
}: ApproveTransactionScreenProps) {
  const [currentVerdict, setCurrentVerdict] = useState(verdict);
  const [isScreening, setIsScreening] = useState(startScreening);

  useEffect(() => {
    if (!isScreening) return;
    const timeout = window.setTimeout(() => setIsScreening(false), screeningDelayMs);
    return () => window.clearTimeout(timeout);
  }, [isScreening]);

  function retry() {
    setCurrentVerdict('clean');
    setIsScreening(true);
  }

  const isRefused = !isScreening && currentVerdict === 'counterparty-flagged';
  const isUnavailable = !isScreening && currentVerdict === 'no-answer';

  function getActions() {
    if (isScreening) return [<FooterActionsSkeleton key="skeleton" count={2} />];
    if (isRefused) {
      return [
        <Button key="close" fullWidth variant="outline">
          Close
        </Button>,
      ];
    }
    return [
      <Button key="cancel" fullWidth variant="outline">
        <styled.span textStyle="label.02">Cancel</styled.span>
      </Button>,
      isUnavailable ? (
        <Button key="retry" fullWidth onClick={retry}>
          <styled.span textStyle="label.02">Try again</styled.span>
        </Button>
      ) : (
        <Button key="confirm" fullWidth>
          <styled.span textStyle="label.02">Confirm</styled.span>
        </Button>
      ),
    ];
  }

  return (
    <Approver requester={mockDappRequest.origin} width="100%" data-testid="compliance-approve">
      <Approver.Header
        title="Approve transaction"
        info={
          <styled.span display="block" p="space.01">
            <QuestionCircleIcon variant="small" />
          </styled.span>
        }
      />
      {isRefused ? (
        <Approver.Section>
          <Callout
            variant="error"
            title={counterpartyRefusedCopy.title}
            borderRadius="sm"
            data-testid="compliance-counterparty-refused"
          >
            {counterpartyRefusedCopy.body}
          </Callout>
        </Approver.Section>
      ) : null}
      <Approver.Section>
        <styled.p textStyle="body.02" color="ink.text-secondary">
          {mockDappRequest.intro}
        </styled.p>
      </Approver.Section>
      <Approver.Section>
        <Approver.Subheader>Transaction</Approver.Subheader>
        <Stack gap="space.03" pb="space.03">
          {mockDappRequest.rows.map(row => (
            <InfoRow key={row.label} {...row} />
          ))}
        </Stack>
      </Approver.Section>
      <Approver.Actions actions={getActions()}>
        {isUnavailable ? <ScreeningUnavailableError /> : null}
      </Approver.Actions>
    </Approver>
  );
}

// Home → lockout: Home with balances, then the background result lands and
// the lockout replaces it.

interface HomeToLockoutScreenProps extends NavigableScreenProps {
  delayMs: number;
}
export function HomeToLockoutScreen({ onNavigate, delayMs }: HomeToLockoutScreenProps) {
  const isLocked = useDelayedFlag(true, delayMs);
  if (isLocked) return <LockoutScreen onNavigate={onNavigate} />;
  return <HomeScreen />;
}
