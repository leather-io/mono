import { Children, Fragment, type ReactNode, isValidElement } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { ChevronDownIcon, ChevronRightIcon, UnlockIcon } from '@leather.io/ui';

import {
  type ApprovalGuaranteeKind,
  type DirectionGuaranteeProps,
  type DirectionSectionProps,
  isWhatMovesLabel,
} from '../pattern/approval-direction';
import { ApprovalFingerprint } from '../pattern/approval-fingerprint';
import {
  ApprovalCaution,
  ApprovalGuarantee,
  ApprovalGuaranteeIcon,
  ApprovalNote,
  ApprovalPermission,
} from '../pattern/approval-notices';
import { useApprovalOptions } from '../pattern/approval-options';
import { ApprovalAssetRow, ApprovalRecipientRow } from '../pattern/approval-rows';
import { useApprovalAccountSlot, useApprovalSigner } from '../pattern/approval-shell';
import { ApprovalSigners } from '../pattern/approval-signers';
import {
  approvalGroupFill,
  approvalSegmentedGroup,
  approvalSurface,
} from '../pattern/approval-surface';
import { ApprovalPanel } from '../pattern/approval-tray';
import { PhantomAccountRow } from './phantom-rows';

const weakKinds: ApprovalGuaranteeKind[] = ['unrestricted', 'open'];
const changeTypes: unknown[] = [ApprovalAssetRow, ApprovalRecipientRow];
const looseTypes: unknown[] = [
  ApprovalNote,
  ApprovalPanel,
  ApprovalPermission,
  ApprovalCaution,
  ApprovalSigners,
  ApprovalFingerprint,
];
const insetLooseTypes: unknown[] = [ApprovalPermission];
const surfaceLooseTypes: unknown[] = [ApprovalPanel, ApprovalSigners, ApprovalFingerprint];

interface GuaranteeElementProps {
  kind?: unknown;
}

interface FragmentElementProps {
  children?: ReactNode;
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

interface CardProps {
  children: ReactNode[];
}

function Card({ children }: CardProps) {
  if (children.length === 0) return null;
  return (
    <Box mx="space.04" className={approvalSegmentedGroup}>
      {children.map((child, index) => (
        <Box
          key={index}
          className={approvalGroupFill}
          px="space.04"
          py="space.02"
          minWidth={0}
          css={{ '& [data-state=loading]': { bgColor: 'ink.border-default' } }}
        >
          {child}
        </Box>
      ))}
    </Box>
  );
}

interface LooseProps {
  child: ReactNode;
}

function Loose({ child }: LooseProps) {
  if (isOfType(child, surfaceLooseTypes)) return <Box px="space.04">{child}</Box>;
  if (isOfType(child, insetLooseTypes)) return <Box px="space.05">{child}</Box>;
  return <Box>{child}</Box>;
}

interface FlowBlock {
  loose?: ReactNode;
  rows: ReactNode[];
}

function isLooseChild(child: ReactNode) {
  return isOfType(child, looseTypes) || isWeakGuarantee(child);
}

function groupFlow(items: ReactNode[]) {
  return items.reduce<FlowBlock[]>((blocks, child) => {
    if (isLooseChild(child)) return [...blocks, { loose: child, rows: [] }];
    const last = blocks.at(-1);
    if (last && !last.loose) return [...blocks.slice(0, -1), { rows: [...last.rows, child] }];
    return [...blocks, { rows: [child] }];
  }, []);
}

function renderFlow(items: ReactNode[]) {
  return groupFlow(items).map((block, index) =>
    block.loose ? <Loose key={index} child={block.loose} /> : <Card key={index}>{block.rows}</Card>
  );
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
      px="space.05"
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

interface FootnotesProps {
  children: ReactNode[];
}

function Footnotes({ children }: FootnotesProps) {
  if (children.length === 0) return null;
  return (
    <Stack gap="space.01" px="space.06" pt="space.03">
      {children}
    </Stack>
  );
}

function resolveChangesHeading(items: ReactNode[], label?: string) {
  if (items.some(isWeakGuarantee)) return 'Estimated changes';
  if (items.some(isStrongGuarantee)) return 'Balance changes';
  return label;
}

function ChangesSection({ label, trailing, children }: DirectionSectionProps) {
  const signer = useApprovalSigner();
  const hasAccountSlot = useApprovalAccountSlot();
  const { accountPlacement } = useApprovalOptions();
  const items = flatten(children);
  const changes = items.filter(child => isOfType(child, changeTypes));
  const weak = items.filter(isWeakGuarantee);
  const strong = items.filter(isStrongGuarantee);
  const loose = items.filter(child => isOfType(child, looseTypes));
  const details = items.filter(
    child => !isOfType(child, changeTypes) && !isGuarantee(child) && !isOfType(child, looseTypes)
  );
  const account = accountPlacement === 'body' && hasAccountSlot ? signer : undefined;
  const detailRows = account
    ? [<PhantomAccountRow key="account" account={account} />, ...details]
    : details;
  return (
    <styled.section data-approval-section={label} pt="space.03" pb="space.03">
      <Heading label={resolveChangesHeading(items, label)} trailing={trailing} />
      <Stack gap="space.03">
        {weak.map((child, index) => (
          <Loose key={index} child={child} />
        ))}
        <Card>{changes}</Card>
        <Card>{detailRows}</Card>
        {loose.map((child, index) => (
          <Loose key={index} child={child} />
        ))}
      </Stack>
      <Footnotes>{strong}</Footnotes>
    </styled.section>
  );
}

function DisclosureSection({ label, summary, isOpen, onToggle, children }: DirectionSectionProps) {
  const items = flatten(children);
  return (
    <styled.section data-approval-section={label} py="space.02">
      <styled.button
        type="button"
        display="flex"
        width="100%"
        alignItems="center"
        gap="space.02"
        px="space.05"
        minHeight="36px"
        cursor="pointer"
        textAlign="left"
        color="ink.text-subdued"
        aria-expanded={isOpen}
        onClick={onToggle}
        _hover={{ color: 'ink.text-primary' }}
      >
        {isOpen ? <ChevronDownIcon variant="small" /> : <ChevronRightIcon variant="small" />}
        <styled.span textStyle="label.03" flexShrink={0}>
          {label}
        </styled.span>
        {!isOpen && summary && (
          <styled.span textStyle="caption.01" color="ink.text-non-interactive" truncate>
            {summary}
          </styled.span>
        )}
      </styled.button>
      {isOpen && (
        <Stack gap="space.03" pt="space.02">
          {renderFlow(items.filter(child => !isStrongGuarantee(child)))}
        </Stack>
      )}
      {isOpen && <Footnotes>{items.filter(isStrongGuarantee)}</Footnotes>}
    </styled.section>
  );
}

function GroupSection({ label, trailing, children }: DirectionSectionProps) {
  const items = flatten(children);
  return (
    <styled.section data-approval-section={label} py="space.02">
      <Heading label={label} trailing={trailing} />
      <Stack gap="space.03">{renderFlow(items.filter(child => !isStrongGuarantee(child)))}</Stack>
      <Footnotes>{items.filter(isStrongGuarantee)}</Footnotes>
    </styled.section>
  );
}

export function PhantomSection(props: DirectionSectionProps) {
  if (isWhatMovesLabel(props.label)) return <ChangesSection {...props} />;
  if (props.collapsible && props.label) return <DisclosureSection {...props} />;
  return <GroupSection {...props} />;
}

export function PhantomGuarantee({ kind, label, isWeak, children }: DirectionGuaranteeProps) {
  if (isWeak) {
    return (
      <Flex
        gap="space.03"
        alignItems="flex-start"
        mx="space.04"
        px="space.04"
        py="space.03"
        className={approvalSurface.notice}
        data-approval-zone="guarantee"
      >
        <Flex width="32px" flexShrink={0} justifyContent="center" pt="2px" lineHeight={0}>
          <UnlockIcon variant="small" color="yellow.action-primary-default" />
        </Flex>
        <styled.p textStyle="caption.01" color="ink.text-primary">
          <styled.span textStyle="label.03">{label}.</styled.span> {children}
        </styled.p>
      </Flex>
    );
  }
  return (
    <styled.p
      textStyle="caption.01"
      color="ink.text-subdued"
      textAlign="center"
      data-approval-zone="guarantee"
    >
      <styled.span display="inline-flex" verticalAlign="-3px" mr="space.01" lineHeight={0}>
        <ApprovalGuaranteeIcon kind={kind} isWeak={false} />
      </styled.span>
      <styled.span color="ink.text-primary">{label}.</styled.span> {children}
    </styled.p>
  );
}
