import { type ReactNode } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import {
  AddressDisplayer,
  ArrowLeftIcon,
  BtcAvatarIcon,
  Button,
  Callout,
  IconButton,
  ItemLayout,
  Link,
} from '@leather.io/ui';

import {
  complianceActionCopy,
  lockoutCopy,
  mockAccount,
  mockSendForm,
  mockSendReview,
  recipientRefusedCopy,
  whyLockedCopy,
} from '../compliance-shared/compliance-content';
import {
  FooterActionsSkeleton,
  InfoRow,
  SentenceLines,
  UnavailableCallout,
  useComplianceActions,
} from '../compliance-shared/compliance-screen-parts';
import lockSticker from '../compliance-shared/lock-sticker.png';

// Web approximations of the mobile screens. Mobile is React Native and builds these natively
// in apps/mobile; this mimics the layout (Screen + SettingsLayout for full screens, the send
// FullHeightSheet + Approver for the review), not the code.

function StatusBar() {
  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      height="54px"
      px="space.07"
      pt="space.02"
      flexShrink={0}
    >
      <styled.span textStyle="label.02" fontWeight={600}>
        9:41
      </styled.span>
      <Flex alignItems="center" gap="space.02" aria-hidden>
        <Flex alignItems="flex-end" gap="2px" height="11px">
          {[4, 6, 8, 11].map(height => (
            <Box
              key={height}
              width="3px"
              borderRadius="1px"
              bg="ink.text-primary"
              style={{ height }}
            />
          ))}
        </Flex>
        <Box
          width="24px"
          height="11px"
          p="1px"
          borderRadius="3px"
          borderWidth="1px"
          borderStyle="solid"
          borderColor="ink.text-subdued"
        >
          <Box width="80%" height="100%" borderRadius="1px" bg="ink.text-primary" />
        </Box>
      </Flex>
    </Flex>
  );
}

function HomeIndicator() {
  return (
    <Flex height="34px" flexShrink={0} alignItems="center" justifyContent="center">
      <Box width="134px" height="5px" borderRadius="round" bg="ink.text-primary" />
    </Flex>
  );
}

interface PhoneFrameProps {
  // 'sheet' shows the screen in the send FullHeightSheet, over the app.
  variant?: 'screen' | 'sheet';
  children: ReactNode;
}
export function PhoneFrame({ variant = 'screen', children }: PhoneFrameProps) {
  const isSheet = variant === 'sheet';
  return (
    <Flex
      direction="column"
      width="390px"
      height="844px"
      flexShrink={0}
      overflow="hidden"
      transform="translateZ(0)"
      bg={isSheet ? 'ink.background-secondary' : 'ink.background-primary'}
      borderRadius="48px"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      boxShadow="0 12px 40px rgba(18, 16, 15, 0.12)"
      data-testid="compliance-phone-frame"
    >
      <StatusBar />
      {isSheet ? (
        <Flex
          direction="column"
          flex={1}
          minHeight={0}
          mt="space.02"
          bg="ink.background-primary"
          borderTopRadius="24px"
          overflow="hidden"
        >
          <Flex justifyContent="center" pt="space.02" pb="space.01" flexShrink={0}>
            <Box width="36px" height="5px" borderRadius="round" bg="ink.border-default" />
          </Flex>
          <Flex direction="column" flex={1} minHeight={0}>
            {children}
          </Flex>
          <HomeIndicator />
        </Flex>
      ) : (
        <>
          <Flex direction="column" flex={1} minHeight={0}>
            {children}
          </Flex>
          <HomeIndicator />
        </>
      )}
    </Flex>
  );
}

export function MobileLockoutScreen() {
  const { goTo, openMail } = useComplianceActions();
  return (
    <Flex direction="column" height="100%" data-testid="compliance-mobile-lockout">
      <Box px="space.05" pt="space.07">
        <styled.h1 textStyle="heading.03" pb="space.04">
          {lockoutCopy.title}
        </styled.h1>
        <styled.p textStyle="label.01">{lockoutCopy.body}</styled.p>
      </Box>
      <Flex flex={1} minHeight={0} alignItems="center" justifyContent="center" py="space.03">
        <styled.img src={lockSticker} alt="" width="240px" height="240px" objectFit="contain" />
      </Flex>
      <Stack px="space.05" pb="space.03" gap="space.02">
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

export function MobileWhyLockedScreen({ backupWalletNames }: { backupWalletNames: string[] }) {
  const { goTo, openMail } = useComplianceActions();
  return (
    <Flex direction="column" height="100%" data-testid="compliance-mobile-why-locked">
      <Flex alignItems="center" height="56px" px="space.03" flexShrink={0}>
        <IconButton icon={<ArrowLeftIcon />} aria-label="Back" onClick={() => goTo('lockout')} />
      </Flex>
      <Stack flex={1} minHeight={0} overflowY="auto" px="space.05" gap="space.04">
        <styled.h1 textStyle="heading.03" pb="space.02">
          {whyLockedCopy.title}
        </styled.h1>
        {whyLockedCopy.paragraphs.map(paragraph => (
          <styled.p key={paragraph} textStyle="label.01">
            {paragraph}
          </styled.p>
        ))}
        {backupWalletNames.length > 0 ? (
          <Stack gap="space.01" mt="space.02">
            {backupWalletNames.map(walletName => (
              <Box key={walletName}>
                <Link
                  href="#"
                  onClick={event => {
                    event.preventDefault();
                    goTo('key-backup');
                  }}
                >
                  {whyLockedCopy.backupLink(walletName)}
                </Link>
              </Box>
            ))}
            <styled.span textStyle="caption.01" color="ink.text-subdued">
              {whyLockedCopy.backupNote}
            </styled.span>
          </Stack>
        ) : null}
      </Stack>
      <Box px="space.05" pb="space.03" flexShrink={0}>
        <Button fullWidth variant="outline" onClick={() => openMail('dispute')}>
          {lockoutCopy.disputeCta}
        </Button>
      </Box>
    </Flex>
  );
}

function Subheader({ children }: { children: ReactNode }) {
  return (
    <styled.h2 textStyle="label.03" color="ink.text-subdued" pb="space.02">
      {children}
    </styled.h2>
  );
}

type MobileReviewState = 'recipient-flagged' | 'screening' | 'no-answer';

// The send sheet's approver (psbt-signer.tsx on mobile): header, outcome, recipient, account,
// fee, then a footer with Total spend and the action buttons.
export function MobileSendReviewScreen({ state }: { state: MobileReviewState }) {
  const isRefused = state === 'recipient-flagged';
  const fee = mockSendReview.rows.find(row => row.label === 'Fee');

  function renderActions() {
    if (state === 'screening') return <FooterActionsSkeleton count={2} />;
    if (isRefused) {
      return (
        <Button fullWidth variant="outline">
          {complianceActionCopy.close}
        </Button>
      );
    }
    return (
      <Flex gap="space.04">
        <Button flex={1} variant="outline">
          {complianceActionCopy.cancel}
        </Button>
        <Button flex={1}>{complianceActionCopy.tryAgain}</Button>
      </Flex>
    );
  }

  return (
    <Flex direction="column" height="100%" data-testid="compliance-mobile-send-review">
      <Stack flex={1} minHeight={0} overflowY="auto" gap="space.00">
        <Box px="space.05" pt="space.04" pb="space.05">
          <styled.h1 textStyle="heading.03">Send token</styled.h1>
        </Box>
        {state === 'no-answer' ? (
          <Box pb="space.05">
            <UnavailableCallout />
          </Box>
        ) : null}
        {isRefused ? (
          <Box pb="space.05">
            <Callout variant="error" title={recipientRefusedCopy.title}>
              <SentenceLines text={recipientRefusedCopy.body} />
            </Callout>
          </Box>
        ) : (
          <Box px="space.05" pb="space.05">
            <Subheader>You’ll send</Subheader>
            <styled.span display="block" textStyle="heading.03">
              {mockSendReview.amount}&nbsp;{mockSendReview.symbol}
            </styled.span>
            <styled.span textStyle="label.02" color="ink.text-subdued">
              ~ {mockSendReview.fiat}&nbsp;USD
            </styled.span>
          </Box>
        )}
        <Box px="space.05" pb="space.05">
          <Subheader>To address</Subheader>
          <AddressDisplayer address={mockSendForm.recipient} />
        </Box>
        <Box px="space.05" pb="space.05">
          <Subheader>From</Subheader>
          <ItemLayout
            img={<BtcAvatarIcon />}
            titleLeft={mockAccount.name}
            captionLeft="Wallet 1"
            titleRight={mockSendForm.available}
          />
        </Box>
        {fee ? (
          <Box px="space.05" pb="space.05">
            <InfoRow label={fee.label} value={fee.value} />
          </Box>
        ) : null}
      </Stack>
      <Box
        flexShrink={0}
        px="space.05"
        pt="space.04"
        pb="space.03"
        borderTopWidth="1px"
        borderTopStyle="solid"
        borderColor="ink.border-default"
      >
        <Flex justifyContent="space-between" pb="space.04">
          <styled.span textStyle="label.02">Total spend</styled.span>
          <styled.span textStyle="label.02">{mockSendReview.fiat}</styled.span>
        </Flex>
        {renderActions()}
      </Box>
    </Flex>
  );
}
