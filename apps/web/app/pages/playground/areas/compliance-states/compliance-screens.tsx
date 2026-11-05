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
  Input,
  ItemLayout,
  Link,
  QuestionCircleIcon,
  SettingsGearIcon,
  SkeletonLoader,
  StxAvatarIcon,
  Tabs,
  UsdcxAvatarIcon,
} from '@leather.io/ui';

import {
  counterpartyRefusedCopy,
  keyBackupCopy,
  lockoutCopy,
  mockAccount,
  mockDappRequest,
  mockMultisigReview,
  mockSecretKey,
  mockSendForm,
  mockSendReview,
  mockStacksRequest,
  mockTokens,
  multisigRefusedCopy,
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
  UnavailableError,
  useComplianceActions,
} from './compliance-screen-parts';
import lockSticker from './lock-sticker.png';

type ScreenLayout = 'popup' | 'full';

function TokenAvatar({ id }: { id: string }) {
  if (id === 'btc') return <BtcAvatarIcon />;
  if (id === 'stx') return <StxAvatarIcon />;
  return <UsdcxAvatarIcon />;
}

function useRetry() {
  const [phase, setPhase] = useState<'idle' | 'screening' | 'clean'>('idle');
  useEffect(() => {
    if (phase !== 'screening') return;
    const timeout = window.setTimeout(() => setPhase('clean'), screeningDelayMs);
    return () => window.clearTimeout(timeout);
  }, [phase]);
  return { phase, retry: () => setPhase('screening') };
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

interface LockoutScreenProps {
  layout?: ScreenLayout;
}
export function LockoutScreen({ layout = 'popup' }: LockoutScreenProps) {
  const { goTo, openMail } = useComplianceActions();
  const isFull = layout === 'full';
  return (
    <Flex
      direction="column"
      height="100%"
      width="100%"
      maxWidth={isFull ? '440px' : undefined}
      mx="auto"
      animation="fadein 240ms ease-out"
      data-testid="compliance-lockout"
    >
      {isFull ? null : <PopupHeader showLogo showSettings={false} />}
      <Box px="space.05" pt={isFull ? 'space.07' : 'space.01'}>
        <styled.h1 textStyle="heading.03" pb="space.04">
          {lockoutCopy.title}
        </styled.h1>
        <styled.p textStyle="label.01">{lockoutCopy.body}</styled.p>
      </Box>
      <Flex flex={1} minHeight={0} alignItems="center" justifyContent="center" py="space.03">
        <styled.img
          src={lockSticker}
          alt=""
          width={isFull ? '240px' : '184px'}
          height={isFull ? '240px' : '184px'}
          objectFit="contain"
          data-testid="compliance-lock-sticker"
        />
      </Flex>
      <Stack px="space.05" pb="space.05" gap="space.02">
        <Button fullWidth variant="ghost" onClick={() => openMail('dispute')}>
          {lockoutCopy.disputeCta}
        </Button>
        <Button fullWidth onClick={() => goTo('why-created')}>
          {lockoutCopy.whyCta}
        </Button>
      </Stack>
    </Flex>
  );
}

interface WhyLockedScreenProps {
  isCreatedInLeather: boolean;
}
export function WhyLockedScreen({ isCreatedInLeather }: WhyLockedScreenProps) {
  const { goTo, openMail } = useComplianceActions();
  return (
    <Flex direction="column" height="100%" data-testid="compliance-why-locked">
      <PopupHeader onBack={() => goTo('lockout')} showSettings={false} />
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
                <Link
                  href="#"
                  onClick={event => {
                    event.preventDefault();
                    goTo('key-backup');
                  }}
                >
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
        <Button fullWidth variant="outline" onClick={() => openMail('dispute')}>
          {lockoutCopy.disputeCta}
        </Button>
      </PopupFooter>
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

type ReviewVerdict = 'recipient-flagged' | 'member-flagged' | 'no-answer';

interface SendReviewScreenProps {
  verdict: ReviewVerdict;
  isScreening: boolean;
}
export function SendReviewScreen({ verdict, isScreening }: SendReviewScreenProps) {
  const { phase, retry } = useRetry();
  const showSkeleton = isScreening || phase === 'screening';
  const isMultisig = verdict === 'member-flagged';
  const review = isMultisig ? mockMultisigReview : mockSendReview;
  const refusedCopy = isMultisig ? multisigRefusedCopy : recipientRefusedCopy;
  const isRefused = !showSkeleton && (verdict === 'recipient-flagged' || isMultisig);
  const isUnavailable = !showSkeleton && verdict === 'no-answer' && phase === 'idle';

  function renderActions() {
    if (showSkeleton) return <FooterActionsSkeleton count={1} />;
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
    return (
      <Button fullWidth>{isMultisig ? 'Propose transaction' : 'Confirm and send transaction'}</Button>
    );
  }

  return (
    <Flex direction="column" height="100%" data-testid="compliance-send-review">
      <PopupHeader title="Review" onBack={() => undefined} />
      <PopupBody>
        {isRefused ? (
          <Box px="space.05" pt="space.02" pb="space.05" animation="fadein 240ms ease-out">
            <Callout
              variant="error"
              title={refusedCopy.title}
              borderRadius="sm"
              data-testid={isMultisig ? 'compliance-multisig-refused' : 'compliance-recipient-refused'}
            >
              {refusedCopy.body}
            </Callout>
          </Box>
        ) : (
          <Stack alignItems="center" gap="space.01" py="space.05" mb="space.05">
            <styled.h1 textStyle="heading.03">
              {review.amount}&nbsp;{review.symbol}
            </styled.h1>
            <styled.span textStyle="label.01">~ {review.fiat}&nbsp;USD</styled.span>
          </Stack>
        )}
        <Stack px="space.06" pb="space.06" gap="space.03">
          {review.rows.map(row => (
            <InfoRow key={row.label} {...row} />
          ))}
        </Stack>
      </PopupBody>
      <PopupFooter notice={isUnavailable ? <UnavailableError /> : null}>
        {renderActions()}
      </PopupFooter>
    </Flex>
  );
}

type ApproveVerdict = 'clean' | 'counterparty-flagged' | 'no-answer';

interface ApproveTransactionScreenProps {
  verdict: ApproveVerdict;
  isScreening: boolean;
  request?: 'bitcoin' | 'stacks';
}
export function ApproveTransactionScreen({
  verdict,
  isScreening,
  request = 'bitcoin',
}: ApproveTransactionScreenProps) {
  const details = request === 'stacks' ? mockStacksRequest : mockDappRequest;
  const { phase, retry } = useRetry();
  const showSkeleton = isScreening || phase === 'screening';
  const isRefused = !showSkeleton && verdict === 'counterparty-flagged';
  const isUnavailable = !showSkeleton && verdict === 'no-answer' && phase === 'idle';

  function getActions() {
    if (showSkeleton) return [<FooterActionsSkeleton key="skeleton" count={2} />];
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
    <Approver requester={details.origin} width="100%" data-testid="compliance-approve">
      <Approver.Header
        title={request === 'stacks' ? 'Call contract' : 'Approve transaction'}
        info={
          <styled.span display="block" p="space.01">
            <QuestionCircleIcon variant="small" />
          </styled.span>
        }
      />
      {isRefused ? (
        <Approver.Section
          className="approver-section skip-animation"
          animation="fadein 240ms ease-out"
        >
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
          {details.intro}
        </styled.p>
      </Approver.Section>
      <Approver.Section>
        <Approver.Subheader>Transaction</Approver.Subheader>
        <Stack gap="space.03" pb="space.03">
          {details.rows.map(row => (
            <InfoRow key={row.label} {...row} />
          ))}
        </Stack>
      </Approver.Section>
      <Approver.Actions actions={getActions()}>
        {isUnavailable ? <UnavailableError /> : null}
      </Approver.Actions>
    </Approver>
  );
}
