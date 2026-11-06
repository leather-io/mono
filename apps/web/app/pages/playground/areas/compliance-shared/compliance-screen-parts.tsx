import { type ReactNode, createContext, useContext } from 'react';

import { Box, Flex, Grid, HStack, Stack, styled } from 'leather-styles/jsx';

import {
  ArrowLeftIcon,
  Callout,
  type CalloutProps,
  IconButton,
  Logo,
  SettingsGearIcon,
  SkeletonLoader,
} from '@leather.io/ui';

import { type MailKind, getMailto, unavailableCopy } from './compliance-content';

// Where the screens' own links lead. The demo maps these to its walkthrough states; the
// static board scrolls to the matching section.
export type ComplianceTarget = 'lockout' | 'why-created' | 'key-backup';

interface ComplianceActions {
  goTo(target: ComplianceTarget): void;
  openMail(kind: MailKind): void;
}

const ComplianceActionsContext = createContext<ComplianceActions>({
  goTo() {
    return undefined;
  },
  openMail() {
    return undefined;
  },
});

export const ComplianceActionsProvider = ComplianceActionsContext.Provider;

export function useComplianceActions() {
  return useContext(ComplianceActionsContext);
}

interface PopupHeaderProps {
  title?: string;
  onBack?(): void;
  showLogo?: boolean;
  showSettings?: boolean;
}
export function PopupHeader({ title, onBack, showLogo, showSettings = true }: PopupHeaderProps) {
  return (
    <styled.header p="space.04" flexShrink={0}>
      <Grid alignItems="center" gridTemplateColumns="2fr 4fr 2fr" minHeight="headerContainerHeight">
        <Flex ml="space.02" alignItems="center">
          {onBack ? (
            <IconButton
              height="headerContainerHeight"
              icon={<ArrowLeftIcon />}
              aria-label="Back"
              onClick={onBack}
            />
          ) : null}
          {showLogo ? <Logo /> : null}
        </Flex>
        <Box textAlign="center">
          {title ? (
            <styled.span textStyle="heading.05" whiteSpace="nowrap">
              {title}
            </styled.span>
          ) : null}
        </Box>
        <Flex justifyContent="flex-end">
          {showSettings ? (
            <IconButton height="headerContainerHeight" icon={<SettingsGearIcon />} />
          ) : null}
        </Flex>
      </Grid>
    </styled.header>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  isAddress?: boolean;
}
export function InfoRow({ label, value, isAddress }: InfoRowProps) {
  return (
    <HStack alignItems="start" justifyContent="space-between">
      <styled.span color="ink.text-subdued" textStyle="body.02">
        {label}
      </styled.span>
      <styled.span color="ink.text-primary" textStyle={isAddress ? 'code' : 'label.02'}>
        {value}
      </styled.span>
    </HStack>
  );
}

// Banner bodies are short sentences; each sits on its own line so no line ends in a stray word.
export function SentenceLines({ text }: { text: string }) {
  return (
    <>
      {text.split(/(?<=[.!?])\s+/).map(sentence => (
        <styled.span key={sentence} display="block">
          {sentence}
        </styled.span>
      ))}
    </>
  );
}

// Same full-width Callout the apps use for warnings: edge to edge, text on the content inset,
// icon on the header icons' axis. No custom notice styles.
export function UnavailableCallout(props: Omit<CalloutProps, 'variant' | 'title'>) {
  const { openMail } = useComplianceActions();
  return (
    <Callout
      variant="warning"
      title={unavailableCopy.title}
      data-testid="compliance-unavailable-error"
      {...props}
    >
      <styled.span display="block">{unavailableCopy.body}</styled.span>
      <styled.span display="block">
        {unavailableCopy.lead}
        <styled.a
          href={getMailto('support')}
          onClick={event => {
            event.preventDefault();
            openMail('support');
          }}
          textDecorationLine="underline"
          textUnderlineOffset="2px"
          data-testid="compliance-contact-support"
        >
          {unavailableCopy.linkLabel}
        </styled.a>
        {unavailableCopy.trail}
      </styled.span>
    </Callout>
  );
}

interface PopupFooterProps {
  notice?: ReactNode;
  children: ReactNode;
  bordered?: boolean;
}
export function PopupFooter({ notice, children, bordered }: PopupFooterProps) {
  return (
    <Box
      flexShrink={0}
      p="space.05"
      bg="ink.background-primary"
      boxShadow={bordered ? undefined : 'contentOverflowFade'}
      borderTopWidth={bordered ? '1px' : 0}
      borderTopStyle="solid"
      borderColor="ink.border-default"
    >
      {notice}
      {children}
    </Box>
  );
}

export function FooterActionsSkeleton({ count }: { count: number }) {
  return (
    <Flex gap="space.04" width="100%">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonLoader key={index} isLoading height="48px" width="100%" borderRadius="round" />
      ))}
    </Flex>
  );
}

export function PopupBody({ children }: { children: ReactNode }) {
  return (
    <Stack flex={1} minHeight={0} overflowY="auto" gap="space.00">
      {children}
    </Stack>
  );
}
