import { type ReactNode, type Ref, useEffect, useRef, useState } from 'react';

import { css, cx } from 'leather-styles/css';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import {
  Avatar,
  Badge,
  ChevronRightIcon,
  Favicon,
  GlobeIcon,
  LedgerIcon,
  UserIcon,
  VaultIcon,
} from '@leather.io/ui';

import { ApprovalAccountIcon } from './approval-account-icon';
import { type DirectionAccountPickerProps, useApprovalDirection } from './approval-direction';
import { displayOrigin, splitOrigin, truncateMiddle } from './approval-format';
import { useApprovalOptions } from './approval-options';
import { approvalIconTile, approvalInteractiveRow } from './approval-surface';
import type { ApprovalAccount, ApprovalNetwork, ApprovalRequester } from './approval-types';

type AccountAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const accountAvatarBoxSizes: Record<AccountAvatarSize, number> = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 40,
  xl: 48,
};

const accountAvatarRadii: Record<AccountAvatarSize, number> = {
  xs: 6,
  sm: 8,
  md: 13,
  lg: 16,
  xl: 18,
};

const accountAvatarIconSizes: Record<AccountAvatarSize, number> = {
  xs: 8,
  sm: 14,
  md: 16,
  lg: 24,
  xl: 24,
};

interface AccountAvatarProps {
  account: ApprovalAccount;
  size?: AccountAvatarSize;
  hasTile?: boolean;
}

export function AccountAvatar({ account, size = 'sm', hasTile }: AccountAvatarProps) {
  const boxSize = accountAvatarBoxSizes[size];
  const iconSize = accountAvatarIconSizes[size];
  return (
    <Flex
      position="relative"
      flexShrink={0}
      alignItems="center"
      justifyContent="center"
      borderWidth={1}
      borderColor="ink.border-default"
      bg={hasTile ? 'ink.background-primary' : undefined}
      lineHeight={0}
      style={{
        width: boxSize,
        height: boxSize,
        minWidth: boxSize,
        borderRadius: accountAvatarRadii[size],
      }}
    >
      {account.vault ? (
        <VaultIcon
          variant="small"
          color="ink.text-primary"
          width={`${iconSize}px`}
          height={`${iconSize}px`}
        />
      ) : (
        <ApprovalAccountIcon icon={account.icon} size={iconSize} />
      )}
      {account.signer === 'ledger' && size !== 'xs' && (
        <Box
          position="absolute"
          bottom="-3px"
          right="-3px"
          bg="ink.action-primary-default"
          borderRadius="xs"
          p="1px"
          lineHeight={0}
        >
          <LedgerIcon variant="small" color="ink.background-primary" width="10px" height="10px" />
        </Box>
      )}
    </Flex>
  );
}

interface RecipientAvatarProps {
  size?: 'sm' | 'md';
}

export function RecipientAvatar({ size = 'md' }: RecipientAvatarProps) {
  return (
    <Avatar
      size={size}
      icon={<UserIcon variant="small" />}
      className={approvalIconTile}
      flexShrink={0}
    />
  );
}

interface NetworkChipProps {
  network: ApprovalNetwork;
}

export function NetworkChip({ network }: NetworkChipProps) {
  const { networkLabel } = useApprovalOptions();
  const isMainnet = network.id === 'mainnet';
  if (isMainnet && networkLabel === 'non-mainnet') return null;
  if (isMainnet) {
    return (
      <styled.span textStyle="caption.01" color="ink.text-subdued" flexShrink={0}>
        {network.name}
      </styled.span>
    );
  }
  return <Badge label={network.name} variant="warning" flexShrink={0} />;
}

function connectionNote(requester: ApprovalRequester) {
  return requester.connection === 'not-connected' ? 'Not connected to this site' : undefined;
}

interface RequesterContextNoteOptions {
  includeConnection?: boolean;
}

export function requesterContextNote(
  requester: ApprovalRequester,
  { includeConnection = true }: RequesterContextNoteOptions = {}
) {
  const connection = includeConnection ? connectionNote(requester) : undefined;
  const notes = [
    requester.frameOrigin ? `Inside ${displayOrigin(requester.origin)}` : undefined,
    requester.transport === 'walletconnect' ? 'Through WalletConnect' : connection,
  ].filter(note => note !== undefined);
  return notes.length > 0 ? notes.join(' · ') : undefined;
}

const originEllipsis = '…';

type OriginAlign = 'start' | 'center';

function measuredWidth(element: Element | null) {
  return element ? element.getBoundingClientRect().width : 0;
}

function sumWidths(widths: number[]) {
  return widths.reduce((total, width) => total + width, 0);
}

function keptLabelCount(labelWidths: number[], fixed: number, ellipsis: number, available: number) {
  if (fixed + sumWidths(labelWidths) <= available) return labelWidths.length;
  for (let kept = labelWidths.length - 1; kept > 0; kept -= 1) {
    if (fixed + ellipsis + sumWidths(labelWidths.slice(-kept)) <= available) return kept;
  }
  return 0;
}

interface OriginNameProps {
  origin: string;
  align?: OriginAlign;
}

export function OriginName({ origin, align = 'start' }: OriginNameProps) {
  const { scheme, subdomainLabels, registrable } = splitOrigin(origin);
  const containerRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [keptCount, setKeptCount] = useState(subdomainLabels.length);
  const labelCount = subdomainLabels.length;

  useEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure || labelCount === 0) return undefined;
    function fit() {
      if (!container || !measure) return;
      const labelWidths = Array.from(measure.querySelectorAll('[data-origin-label]')).map(
        measuredWidth
      );
      const fixed = measuredWidth(measure.querySelector('[data-origin-fixed]'));
      const ellipsis = measuredWidth(measure.querySelector('[data-origin-ellipsis]'));
      setKeptCount(keptLabelCount(labelWidths, fixed, ellipsis, measuredWidth(container)));
    }
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    return () => observer.disconnect();
  }, [origin, labelCount]);

  const keptLabels = subdomainLabels.slice(labelCount - keptCount);
  const isCut = keptCount < labelCount;
  return (
    <styled.span
      ref={containerRef}
      position="relative"
      display="flex"
      width="100%"
      minWidth={0}
      overflow="hidden"
      justifyContent={align === 'center' ? 'center' : 'flex-start'}
      textStyle="label.02"
      color="ink.text-primary"
      title={displayOrigin(origin)}
      data-approval-origin={registrable}
    >
      <styled.span
        flexShrink={1}
        minWidth={0}
        maxWidth="100%"
        textAlign={align === 'center' ? 'center' : 'left'}
      >
        <styled.span fontWeight={400} color="ink.text-subdued" whiteSpace="nowrap">
          {scheme}
          {isCut && originEllipsis}
          {keptLabels.map(label => `${label}.`).join('')}
        </styled.span>
        <styled.span overflowWrap="anywhere">{registrable}</styled.span>
      </styled.span>
      {labelCount > 0 && (
        <styled.span
          ref={measureRef}
          aria-hidden="true"
          position="absolute"
          top="0"
          left="0"
          visibility="hidden"
          whiteSpace="nowrap"
          pointerEvents="none"
        >
          <styled.span data-origin-fixed="">
            <styled.span fontWeight={400}>{scheme}</styled.span>
            {registrable}
          </styled.span>
          <styled.span data-origin-ellipsis="" fontWeight={400}>
            {originEllipsis}
          </styled.span>
          {subdomainLabels.map((label, index) => (
            <styled.span key={`${label}-${index}`} data-origin-label="" fontWeight={400}>
              {`${label}.`}
            </styled.span>
          ))}
        </styled.span>
      )}
    </styled.span>
  );
}

type RequesterIconSize = 28 | 32 | 48 | 56;

const securePrefix = 'https://';
const requesterIconRadiusRatio = 0.22;
const requesterIconGlyphRatio = 0.6;
const largeFaviconThreshold = 32;

function faviconSourceSize(size: RequesterIconSize) {
  return size > largeFaviconThreshold ? 64 : 32;
}

function toPx(value: number) {
  return `${Math.round(value)}px`;
}

interface RequesterIconProps {
  origin: string;
  size?: RequesterIconSize;
}

export function RequesterIcon({ origin, size = 28 }: RequesterIconProps) {
  const isSecure = origin.startsWith(securePrefix);
  const glyphSize = toPx(size * requesterIconGlyphRatio);
  return (
    <Flex
      position="relative"
      flexShrink={0}
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      bg={isSecure ? 'ink.background-primary' : 'ink.component-background-default'}
      outlineWidth={1}
      outlineStyle="solid"
      outlineColor="ink.border-transparent"
      outlineOffset={-1}
      lineHeight={0}
      css={{ '& img': { display: 'block', width: '100%', height: '100%', objectFit: 'cover' } }}
      style={{ width: size, height: size, borderRadius: toPx(size * requesterIconRadiusRatio) }}
      data-approval-site-icon=""
    >
      {isSecure ? (
        <Favicon origin={origin} size={faviconSourceSize(size)} />
      ) : (
        <GlobeIcon color="ink.text-subdued" width={glyphSize} height={glyphSize} />
      )}
    </Flex>
  );
}

type IdentityPairSize = 'md' | 'xl';
export type IdentityPairRing = 'primary' | 'secondary';

const identityPairTileSizes: Record<IdentityPairSize, RequesterIconSize> = {
  md: 32,
  xl: 48,
};

const identityPairOffsetStyles: Record<IdentityPairSize, string> = {
  md: css({ ml: '-10px', p: '2px', borderRadius: '15px' }),
  xl: css({ ml: '-13px', p: '3px', borderRadius: '21px' }),
};

const identityPairRingColorStyles: Record<IdentityPairRing, string> = {
  primary: css({ bg: 'ink.background-primary' }),
  secondary: css({ bg: 'ink.background-secondary' }),
};

interface RequesterAccountPairSlotProps {
  size: IdentityPairSize;
  ring: IdentityPairRing;
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

export function RequesterAccountPairSlot({
  size,
  ring,
  ref,
  children,
}: RequesterAccountPairSlotProps) {
  return (
    <Box
      ref={ref}
      position="relative"
      flexShrink={0}
      lineHeight={0}
      className={cx(identityPairOffsetStyles[size], identityPairRingColorStyles[ring])}
    >
      {children}
    </Box>
  );
}

export function identityPairTileSize(size: IdentityPairSize) {
  return identityPairTileSizes[size];
}

interface RequesterAccountPairProps {
  origin: string;
  account: ApprovalAccount;
  size?: IdentityPairSize;
  ring?: IdentityPairRing;
}

export function RequesterAccountPair({
  origin,
  account,
  size = 'md',
  ring = 'primary',
}: RequesterAccountPairProps) {
  return (
    <Flex alignItems="center" flexShrink={0} data-approval-pair="">
      <RequesterIcon origin={origin} size={identityPairTileSizes[size]} />
      <RequesterAccountPairSlot size={size} ring={ring}>
        <AccountAvatar account={account} size={size} />
      </RequesterAccountPairSlot>
    </Flex>
  );
}

interface AccountCaptionProps {
  account: ApprovalAccount;
}

export function AccountCaption({ account }: AccountCaptionProps) {
  return (
    <styled.span
      textStyle="caption.01"
      color="ink.text-primary"
      truncate
      data-approval-zone="account"
    >
      {account.vault ? account.vault.name : account.name}
      <styled.span color="ink.text-subdued">
        {account.vault ? ` · as ${account.name}` : ` · ${truncateMiddle(account.address, 4)}`}
      </styled.span>
    </styled.span>
  );
}

interface AccountLineProps {
  account: ApprovalAccount;
  compact?: boolean;
}

export function AccountLine({ account, compact }: AccountLineProps) {
  if (account.vault) {
    return (
      <styled.span textStyle="label.03" truncate>
        {account.vault.name}{' '}
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          {compact ? `· as ${account.name}` : `· signing as ${account.name}`}
        </styled.span>
      </styled.span>
    );
  }
  return (
    <styled.span textStyle="label.03" truncate>
      {account.name}{' '}
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        · {truncateMiddle(account.address, 4)}
      </styled.span>
    </styled.span>
  );
}

function BaselineAccountPicker({ account, caption, isConnected }: DirectionAccountPickerProps) {
  return (
    <Flex
      alignItems="center"
      gap="space.03"
      py="space.03"
      px="space.03"
      mx="-space.03"
      borderRadius="md"
      cursor="pointer"
      _hover={{ bg: 'ink.component-background-hover' }}
      className={approvalInteractiveRow}
      data-approval-zone="account-picker"
    >
      <AccountAvatar account={account} size="lg" />
      <Stack gap="0" flex="1" minWidth={0}>
        <Flex alignItems="center" gap="space.02">
          <styled.span textStyle="label.02">{account.name}</styled.span>
          {isConnected && <Badge label="Connected" variant="success" />}
        </Flex>
        <styled.span textStyle="caption.01" color="ink.text-subdued" truncate>
          {caption}
        </styled.span>
      </Stack>
      <Flex alignItems="center" gap="space.01" color="ink.text-subdued">
        <styled.span textStyle="label.03">Change</styled.span>
        <ChevronRightIcon variant="small" color="ink.text-subdued" />
      </Flex>
    </Flex>
  );
}

interface ApprovalAccountPickerProps {
  account: ApprovalAccount;
  bitcoinAddress?: string;
  caption?: string;
  isConnected?: boolean;
}

function pickerCaption(account: ApprovalAccount, bitcoinAddress?: string) {
  const stacks = truncateMiddle(account.address, 4);
  return bitcoinAddress ? `${stacks} · ${truncateMiddle(bitcoinAddress, 4)}` : stacks;
}

export function ApprovalAccountPicker({
  account,
  bitcoinAddress,
  caption,
  isConnected,
}: ApprovalAccountPickerProps) {
  const Picker = useApprovalDirection()?.AccountPicker ?? BaselineAccountPicker;
  return (
    <Picker
      account={account}
      caption={caption ?? pickerCaption(account, bitcoinAddress)}
      isConnected={isConnected}
    />
  );
}
