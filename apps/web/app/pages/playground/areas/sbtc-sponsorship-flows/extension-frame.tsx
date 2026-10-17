import { type ReactNode, useState } from 'react';

import { Box, Flex, HStack, Stack, styled } from 'leather-styles/jsx';
import { formatCryptoPrecise, formatCurrency } from '~/utils/currency-formatter';

import type { Money } from '@leather.io/models';
import {
  Badge,
  CheckmarkCircleIcon,
  CheckmarkIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  CircleIcon,
  CloseIcon,
  DashedHr,
  Logo,
} from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { type FeeTier, feeTierLabels, feeTiers } from './sponsorship-mock-data';

const frameWidth = '390px';
const frameHeight = '640px';

interface ExtensionFrameProps {
  title: string;
  footer?: ReactNode;
  overlay?: ReactNode;
  overlayKey?: string;
  onBack?(this: void): void;
  children: ReactNode;
}
export function ExtensionFrame({
  title,
  footer,
  overlay,
  overlayKey,
  onBack,
  children,
}: ExtensionFrameProps) {
  return (
    <Flex
      flexDirection="column"
      position="relative"
      width={frameWidth}
      height={frameHeight}
      flexShrink={0}
      bg="ink.background-secondary"
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="0px 12px 32px rgba(27, 39, 51, 0.12)"
    >
      {overlay && (
        <Flex
          position="absolute"
          inset={0}
          zIndex={20}
          alignItems="flex-end"
          bg="rgba(27, 39, 51, 0.45)"
        >
          <Box
            key={overlayKey}
            width="100%"
            maxHeight="92%"
            overflowY="auto"
            bg="ink.background-primary"
            borderTopRadius="lg"
            px="space.05"
            pt="space.05"
            pb="space.05"
          >
            {overlay}
          </Box>
        </Flex>
      )}
      <HStack
        justifyContent="space-between"
        px="space.04"
        minHeight="56px"
        bg="ink.background-primary"
        borderBottomWidth={1}
        borderColor="ink.border-default"
      >
        <HStack gap="space.03">
          {onBack ? (
            <styled.button type="button" onClick={onBack} cursor="pointer" display="flex">
              <ChevronLeftIcon />
            </styled.button>
          ) : (
            <Logo />
          )}
          <styled.span textStyle="heading.05">{title}</styled.span>
        </HStack>
        <CloseIcon color="ink.text-subdued" />
      </HStack>
      <Box flex={1} overflowY="auto">
        {children}
      </Box>
      {footer && (
        <Box
          p="space.04"
          bg="ink.background-primary"
          borderTopWidth={1}
          borderColor="ink.border-default"
        >
          {footer}
        </Box>
      )}
    </Flex>
  );
}

export function MockCard({ children }: { children: ReactNode }) {
  return (
    <Stack gap="space.00" m="space.04" p="space.05" bg="ink.background-primary" borderRadius="md">
      {children}
    </Stack>
  );
}

export function MockSection({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <Stack gap="space.03" px="space.05" py="space.04" bg="ink.background-primary">
      {title && (
        <styled.span textStyle="label.03" color="ink.text-subdued">
          {title}
        </styled.span>
      )}
      {children}
    </Stack>
  );
}

interface InfoRowProps {
  title: string;
  value: ReactNode;
  titleAddon?: ReactNode;
}
export function InfoRow({ title, value, titleAddon }: InfoRowProps) {
  return (
    <HStack alignItems="start" justifyContent="space-between" py="space.02">
      <HStack gap="space.02">
        <styled.span color="ink.text-subdued" textStyle="body.02">
          {title}
        </styled.span>
        {titleAddon}
      </HStack>
      {typeof value === 'string' ? (
        <styled.span textStyle="label.02" fontVariant="tabular-nums" textAlign="right">
          {value}
        </styled.span>
      ) : (
        value
      )}
    </HStack>
  );
}

export function InfoSeparator() {
  return <DashedHr my="space.03" />;
}

export function AddressValue({ address }: { address: string }) {
  return (
    <styled.span textStyle="label.02" fontFamily="monospace" title={address}>
      {truncateMiddle(address, 6)}
    </styled.span>
  );
}

const sponsoredTooltip =
  'A Leather sponsor pays the STX network fee for this transaction. In return, the sBTC fee shown is included in your transfer and goes to the sponsor.';

export function SponsoredBadge() {
  return (
    <styled.span title={sponsoredTooltip} display="inline-flex">
      <Badge label="Sponsored" variant="info" outlined />
    </styled.span>
  );
}

export type MockTxStatus = 'queued' | 'pending' | 'confirmed';

const txStatusBadges: Record<
  MockTxStatus,
  { label: string; variant: 'default' | 'warning' | 'success' }
> = {
  queued: { label: 'Queued', variant: 'default' },
  pending: { label: 'Pending', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'success' },
};

export function TxStatusBadge({ status }: { status: MockTxStatus }) {
  const { label, variant } = txStatusBadges[status];
  return <Badge label={label} variant={variant} />;
}

interface FeeTierSelectProps {
  tier: FeeTier;
  feeByTier: Record<FeeTier, Money>;
  fiatByTier: Record<FeeTier, Money>;
  onChange(this: void, tier: FeeTier): void;
}
export function FeeTierSelect({ tier, feeByTier, fiatByTier, onChange }: FeeTierSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <HStack justifyContent="space-between" width="100%" position="relative">
      <HStack gap="space.03">
        <styled.span color="ink.text-subdued" textStyle="label.02">
          Fee
        </styled.span>
        <styled.button
          type="button"
          display="flex"
          alignItems="center"
          gap="space.01"
          cursor="pointer"
          onClick={() => setIsOpen(open => !open)}
        >
          <styled.span textStyle="label.02">{feeTierLabels[tier]}</styled.span>
          <ChevronDownIcon variant="small" />
        </styled.button>
        {isOpen && (
          <Stack
            position="absolute"
            top="28px"
            left="40px"
            zIndex={10}
            minWidth="180px"
            p="space.01"
            gap="space.00"
            bg="ink.background-primary"
            borderRadius="xs"
            boxShadow="0px 8px 16px rgba(27, 39, 51, 0.12)"
          >
            {feeTiers.map(option => (
              <styled.button
                key={option}
                type="button"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap="space.03"
                height="32px"
                px="space.02"
                borderRadius="xs"
                cursor="pointer"
                _hover={{ bg: 'ink.component-background-hover' }}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                <HStack gap="space.01">
                  <styled.span textStyle="label.02">{feeTierLabels[option]}</styled.span>
                  {option === tier && <CheckmarkIcon variant="small" />}
                </HStack>
                <styled.span textStyle="caption.01" color="ink.text-subdued">
                  {formatCryptoPrecise(feeByTier[option])}
                </styled.span>
              </styled.button>
            ))}
          </Stack>
        )}
      </HStack>
      <HStack gap="space.02">
        <SponsoredBadge />
        <styled.span
          color="ink.text-subdued"
          textStyle="label.02"
          title={formatCurrency(fiatByTier[tier])}
        >
          {formatCryptoPrecise(feeByTier[tier])}
        </styled.span>
      </HStack>
    </HStack>
  );
}

export interface TimelineStep {
  label: string;
  detail: string;
}

interface TimelineProps {
  title: string;
  steps: TimelineStep[];
  activeIndex: number;
}
export function Timeline({ title, steps, activeIndex }: TimelineProps) {
  return (
    <Stack gap="space.04" flex={1} minWidth="280px" maxWidth="52ch">
      <styled.h4 textStyle="label.02">{title}</styled.h4>
      <Stack gap="space.04">
        {steps.map((step, index) => {
          const isDone = index < activeIndex;
          const isActive = index === activeIndex;
          return (
            <HStack key={step.label} alignItems="start" gap="space.03">
              <Box flexShrink={0} mt="2px">
                {isDone && (
                  <CheckmarkCircleIcon variant="small" color="green.action-primary-default" />
                )}
                {isActive && <CircleIcon variant="small" color="blue.action-primary-default" />}
                {!isDone && !isActive && (
                  <CircleIcon variant="small" color="ink.text-non-interactive" />
                )}
              </Box>
              <Stack gap="space.01">
                <styled.span
                  textStyle="label.02"
                  color={isDone || isActive ? 'ink.text-primary' : 'ink.text-subdued'}
                >
                  {step.label}
                </styled.span>
                <styled.span textStyle="caption.01" color="ink.text-subdued">
                  {step.detail}
                </styled.span>
              </Stack>
            </HStack>
          );
        })}
      </Stack>
    </Stack>
  );
}

interface FlowBoardProps {
  frame: ReactNode;
  timeline: ReactNode;
  onReset(this: void): void;
}
export function FlowBoard({ frame, timeline, onReset }: FlowBoardProps) {
  return (
    <Flex gap="space.07" flexWrap="wrap" alignItems="start">
      <Stack gap="space.03" alignItems="start">
        {frame}
        <styled.button
          type="button"
          onClick={onReset}
          textStyle="caption.01"
          color="ink.text-subdued"
          textDecoration="underline"
          cursor="pointer"
        >
          Start over
        </styled.button>
      </Stack>
      {timeline}
    </Flex>
  );
}
