import { type ReactNode, createContext, useContext } from 'react';

import { Box, Flex, Grid, HStack, Stack, styled } from 'leather-styles/jsx';

import {
  ArrowLeftIcon,
  ErrorTriangleIcon,
  IconButton,
  Logo,
  SettingsGearIcon,
  SkeletonLoader,
} from '@leather.io/ui';

import { type MailKind, getMailto, unavailableCopy } from './compliance-content';
import { type ComplianceStateId } from './compliance-states';

interface ComplianceActions {
  goTo(id: ComplianceStateId): void;
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

export function UnavailableError() {
  const { openMail } = useComplianceActions();
  return (
    <Flex
      role="alert"
      gap="space.02"
      alignItems="flex-start"
      mb="space.04"
      px="space.03"
      py="space.03"
      borderRadius="sm"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="red.border"
      bg="red.background-primary"
      color="red.text-primary"
      textAlign="left"
      data-testid="compliance-unavailable-error"
    >
      <Box flexShrink={0} pt="1px">
        <ErrorTriangleIcon variant="small" color="red.action-primary-default" />
      </Box>
      <styled.span textStyle="caption.01">
        {unavailableCopy.lead}
        <styled.a
          href={getMailto('support')}
          onClick={event => {
            event.preventDefault();
            openMail('support');
          }}
          fontWeight={500}
          color="red.text-primary"
          textDecorationLine="underline"
          textUnderlineOffset="2px"
          data-testid="compliance-contact-support"
        >
          {unavailableCopy.linkLabel}
        </styled.a>
        {unavailableCopy.trail}
      </styled.span>
    </Flex>
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
