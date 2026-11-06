import { Children, Fragment, type ReactNode, isValidElement } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { ArrowDownIcon, ChevronDownIcon } from '@leather.io/ui';

import {
  type ApprovalAssetDirection,
  type ApprovalGuaranteeKind,
  type DirectionSectionProps,
  isWhatMovesLabel,
} from '../pattern/approval-direction';
import { ApprovalFingerprint } from '../pattern/approval-fingerprint';
import {
  ApprovalCaution,
  ApprovalGuarantee,
  ApprovalNote,
  ApprovalPermission,
} from '../pattern/approval-notices';
import { useApprovalOptions } from '../pattern/approval-options';
import { ApprovalAssetRow, ApprovalRecipientRow } from '../pattern/approval-rows';
import { useApprovalAccountSlot, useApprovalSigner } from '../pattern/approval-shell';
import { ApprovalSigners } from '../pattern/approval-signers';
import { approvalDivider, approvalGroupFill } from '../pattern/approval-surface';
import { ApprovalPanel } from '../pattern/approval-tray';
import type { ApprovalAccount } from '../pattern/approval-types';
import { tactilePress, useTactileRise } from './tactile-motion';
import { TactileAccountRow } from './tactile-rows';

const outgoingLabelPattern = /^(You send|You pay|You lock|Leaves)/;
const weakKinds: ApprovalGuaranteeKind[] = ['unrestricted', 'open'];
const looseTypes: unknown[] = [
  ApprovalNote,
  ApprovalPanel,
  ApprovalPermission,
  ApprovalCaution,
  ApprovalSigners,
  ApprovalFingerprint,
];
const insetLooseTypes: unknown[] = [ApprovalPermission];
const surfaceLooseTypes: unknown[] = [
  ApprovalPanel,
  ApprovalSigners,
  ApprovalFingerprint,
  ApprovalCaution,
];

interface FragmentElementProps {
  children?: ReactNode;
}

interface AssetElementProps {
  label?: string;
  direction?: ApprovalAssetDirection;
}

interface GuaranteeElementProps {
  kind?: unknown;
}

function flatten(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap(child => {
    if (isValidElement<FragmentElementProps>(child) && child.type === Fragment) {
      return flatten(child.props.children);
    }
    return [child];
  });
}

function isOfType(child: ReactNode, types: unknown[]) {
  return isValidElement(child) && types.includes(child.type);
}

function isAsset(child: ReactNode) {
  return isValidElement(child) && child.type === ApprovalAssetRow;
}

function isRecipient(child: ReactNode) {
  return isValidElement(child) && child.type === ApprovalRecipientRow;
}

function isOutgoingAsset(child: ReactNode) {
  if (!isValidElement<AssetElementProps>(child) || child.type !== ApprovalAssetRow) return false;
  if (child.props.direction === 'out') return true;
  if (child.props.direction === 'in') return false;
  return outgoingLabelPattern.test(child.props.label ?? '');
}

function isGuarantee(child: ReactNode) {
  return isValidElement(child) && child.type === ApprovalGuarantee;
}

function isWeakGuarantee(child: ReactNode) {
  return (
    isValidElement<GuaranteeElementProps>(child) &&
    child.type === ApprovalGuarantee &&
    weakKinds.some(kind => kind === child.props.kind)
  );
}

function isStrongGuarantee(child: ReactNode) {
  return isGuarantee(child) && !isWeakGuarantee(child);
}

function isLoose(child: ReactNode) {
  return isOfType(child, looseTypes);
}

interface RiseProps {
  order: number;
  children: ReactNode;
}

function Rise({ order, children }: RiseProps) {
  const ref = useTactileRise<HTMLDivElement>(order);
  return (
    <Box ref={ref} minWidth={0}>
      {children}
    </Box>
  );
}

interface SlabProps {
  order: number;
  children: ReactNode;
}

function Slab({ order, children }: SlabProps) {
  return (
    <Rise order={order}>
      <Box
        className={approvalGroupFill}
        borderRadius="16px"
        px="space.04"
        py="space.04"
        minWidth={0}
      >
        {children}
      </Box>
    </Rise>
  );
}

function FlowBadge() {
  return (
    <Box position="relative" height="8px" zIndex={1} aria-hidden>
      <Flex
        position="absolute"
        left="50%"
        top="50%"
        transform="translate(-50%, -50%)"
        width="36px"
        height="36px"
        alignItems="center"
        justifyContent="center"
        borderRadius="round"
        borderWidth="4px"
        borderColor="ink.background-primary"
        bg="ink.text-primary"
      >
        <ArrowDownIcon variant="small" color="ink.background-primary" />
      </Flex>
    </Box>
  );
}

interface TrayCardProps {
  order: number;
  children: ReactNode[];
}

function TrayCard({ order, children }: TrayCardProps) {
  if (children.length === 0) return null;
  return (
    <Rise order={order}>
      <Box
        className={approvalGroupFill}
        borderRadius="16px"
        px="space.04"
        py="space.01"
        minWidth={0}
        css={{ '& [data-state=loading]': { bgColor: 'ink.border-default' } }}
      >
        {children.map((child, index) => (
          <Box key={index} className={index === 0 ? undefined : approvalDivider} minWidth={0}>
            {child}
          </Box>
        ))}
      </Box>
    </Rise>
  );
}

interface LooseProps {
  child: ReactNode;
}

function Loose({ child }: LooseProps) {
  if (isOfType(child, insetLooseTypes)) return <Box px="space.01">{child}</Box>;
  if (isOfType(child, surfaceLooseTypes)) return <Box>{child}</Box>;
  return <Box mx="-space.04">{child}</Box>;
}

interface HeadingProps {
  label?: string;
  trailing?: ReactNode;
}

function Heading({ label, trailing }: HeadingProps) {
  if (!label && !trailing) return null;
  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      gap="space.02"
      px="space.01"
      pb="space.02"
      minHeight="24px"
    >
      {label && (
        <styled.h2 textStyle="label.03" color="ink.text-subdued">
          {label}
        </styled.h2>
      )}
      {trailing}
    </Flex>
  );
}

interface FlowBlock {
  loose?: ReactNode;
  rows: ReactNode[];
}

function groupFlow(items: ReactNode[]) {
  return items.reduce<FlowBlock[]>((blocks, child) => {
    if (isLoose(child) || isWeakGuarantee(child)) return [...blocks, { loose: child, rows: [] }];
    const last = blocks.at(-1);
    if (last && !last.loose) return [...blocks.slice(0, -1), { rows: [...last.rows, child] }];
    return [...blocks, { rows: [child] }];
  }, []);
}

function renderFlow(items: ReactNode[]) {
  return groupFlow(items).map((block, index) =>
    block.loose ? (
      <Loose key={index} child={block.loose} />
    ) : (
      <TrayCard key={index} order={index}>
        {block.rows}
      </TrayCard>
    )
  );
}

interface ChangesSectionProps extends DirectionSectionProps {
  account?: ApprovalAccount;
}

function ChangesSection({ label, trailing, divided, children, account }: ChangesSectionProps) {
  const items = flatten(children);
  const outs = items.filter(isOutgoingAsset);
  const targets = [
    ...items.filter(isRecipient),
    ...items.filter(child => isAsset(child) && !isOutgoingAsset(child)),
  ];
  const weak = items.filter(isWeakGuarantee);
  const strong = items.filter(isStrongGuarantee);
  const loose = items.filter(isLoose);
  const details = items.filter(
    child => !isAsset(child) && !isRecipient(child) && !isGuarantee(child) && !isLoose(child)
  );
  const trayRows = account
    ? [<TactileAccountRow key="account" account={account} />, ...details]
    : details;
  const slabs = [...outs, ...targets];
  return (
    <styled.section
      data-approval-section={label}
      px="space.04"
      py="space.03"
      className={divided ? approvalDivider : undefined}
    >
      <Heading label={label} trailing={trailing} />
      <Stack gap="space.03">
        {weak.map((child, index) => (
          <Box key={index}>{child}</Box>
        ))}
        {slabs.length > 0 && (
          <Stack gap="0" isolation="isolate">
            {outs.map((child, index) => (
              <Box key={`out-${index}`} pt={index === 0 ? '0' : '4px'}>
                <Slab order={index}>{child}</Slab>
              </Box>
            ))}
            {outs.length > 0 && targets.length > 0 && (
              <Rise order={outs.length}>
                <FlowBadge />
              </Rise>
            )}
            {targets.map((child, index) => (
              <Box key={`target-${index}`} pt={index === 0 ? '0' : '4px'}>
                <Slab order={outs.length + 1 + index}>{child}</Slab>
              </Box>
            ))}
          </Stack>
        )}
        {strong.length > 0 && (
          <Stack gap="space.03" px="space.01">
            {strong}
          </Stack>
        )}
        <TrayCard order={slabs.length + 1}>{trayRows}</TrayCard>
        {loose.map((child, index) => (
          <Loose key={index} child={child} />
        ))}
      </Stack>
    </styled.section>
  );
}

function DisclosureSection({
  label,
  summary,
  divided,
  isOpen,
  onToggle,
  children,
}: DirectionSectionProps) {
  const items = flatten(children);
  return (
    <styled.section
      data-approval-section={label}
      px="space.04"
      py="space.03"
      className={divided ? approvalDivider : undefined}
    >
      <styled.button
        type="button"
        display="flex"
        width="100%"
        alignItems="center"
        justifyContent="space-between"
        gap="space.03"
        px="space.04"
        minHeight="44px"
        borderRadius="round"
        bg="ink.component-background-default"
        cursor="pointer"
        textAlign="left"
        aria-expanded={isOpen}
        onClick={onToggle}
        className={tactilePress}
        _hover={{ bg: 'ink.component-background-hover' }}
      >
        <Flex alignItems="center" gap="space.02" minWidth={0}>
          <styled.span textStyle="label.02" flexShrink={0}>
            {label}
          </styled.span>
          {!isOpen && summary && (
            <styled.span textStyle="caption.01" color="ink.text-subdued" truncate>
              {summary}
            </styled.span>
          )}
        </Flex>
        <Box
          flexShrink={0}
          lineHeight={0}
          transition="transform 220ms cubic-bezier(0.34, 1.4, 0.64, 1)"
          transform={isOpen ? 'rotate(180deg)' : 'none'}
        >
          <ChevronDownIcon variant="small" color="ink.text-subdued" />
        </Box>
      </styled.button>
      {isOpen && (
        <Stack gap="space.03" pt="space.03">
          {renderFlow(items.filter(child => !isStrongGuarantee(child)))}
          {items.filter(isStrongGuarantee)}
        </Stack>
      )}
    </styled.section>
  );
}

function GroupSection({ label, trailing, divided, children }: DirectionSectionProps) {
  const items = flatten(children);
  return (
    <styled.section
      data-approval-section={label}
      px="space.04"
      py="space.03"
      className={divided ? approvalDivider : undefined}
    >
      <Heading label={label} trailing={trailing} />
      <Stack gap="space.03">
        {renderFlow(items.filter(child => !isStrongGuarantee(child)))}
        {items.some(isStrongGuarantee) && (
          <Stack gap="space.03" px="space.01">
            {items.filter(isStrongGuarantee)}
          </Stack>
        )}
      </Stack>
    </styled.section>
  );
}

function WhatMovesSection(props: DirectionSectionProps) {
  const signer = useApprovalSigner();
  const hasAccountSlot = useApprovalAccountSlot();
  const { accountPlacement } = useApprovalOptions();
  const account = accountPlacement === 'body' && hasAccountSlot ? signer : undefined;
  return <ChangesSection {...props} account={account} />;
}

export function TactileSection(props: DirectionSectionProps) {
  if (isWhatMovesLabel(props.label)) return <WhatMovesSection {...props} />;
  if (props.collapsible && props.label) return <DisclosureSection {...props} />;
  if (flatten(props.children).some(child => isAsset(child) || isRecipient(child))) {
    return <ChangesSection {...props} />;
  }
  return <GroupSection {...props} />;
}
