import { Children, Fragment, type ReactNode, isValidElement } from 'react';

import { css, cx } from 'leather-styles/css';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { ArrowDownIcon, ChevronDownIcon } from '@leather.io/ui';

import { ApprovalChoiceList } from '../pattern/approval-choice';
import {
  type ApprovalAssetDirection,
  type ApprovalGuaranteeKind,
  type DirectionSectionProps,
} from '../pattern/approval-direction';
import { ApprovalFingerprint } from '../pattern/approval-fingerprint';
import { ApprovalAccountPicker } from '../pattern/approval-identity';
import { ApprovalCaution, ApprovalGuarantee, ApprovalNote } from '../pattern/approval-notices';
import {
  ApprovalAssetRow,
  ApprovalDisclosureRow,
  ApprovalFeeRow,
  ApprovalRecipientRow,
  ApprovalRow,
} from '../pattern/approval-rows';
import { ApprovalSigners } from '../pattern/approval-signers';
import { ApprovalSwitchRow } from '../pattern/approval-switch-row';
import { ApprovalPanel } from '../pattern/approval-tray';
import {
  HandshakeAction,
  handshakeInteractiveSurface,
  handshakeOutline,
  isHandshakeAction,
} from './handshake-rows';
import { tactilePress, useTactileRise } from './tactile-motion';

const outgoingLabelPattern = /^(You send|You pay|You lock|Leaves)/;
const weakKinds: ApprovalGuaranteeKind[] = ['unrestricted', 'open'];
const looseTypes: unknown[] = [
  ApprovalNote,
  ApprovalPanel,
  ApprovalCaution,
  ApprovalSigners,
  ApprovalFingerprint,
];
const standaloneInteractiveTypes: unknown[] = [
  ApprovalAccountPicker,
  ApprovalChoiceList,
  ApprovalDisclosureRow,
  ApprovalSwitchRow,
];
const sectionUpdatedInset = css({
  '--approval-updated-inset': '60px',
  '& [data-approval-zone=updated]': { mt: 'space.02', pb: '0' },
});
const groupUpdatedInset = css({ '--approval-updated-inset': '44px' });

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

interface ActionElementProps {
  action?: ReactNode;
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

function hasAction(child: ReactNode) {
  if (!isValidElement<ActionElementProps>(child)) return false;
  return (
    (child.type === ApprovalFeeRow || child.type === ApprovalRow) &&
    isHandshakeAction(child.props.action)
  );
}

function isInteractive(child: ReactNode) {
  return hasAction(child) || isOfType(child, standaloneInteractiveTypes);
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

interface CardProps {
  order: number;
  children: ReactNode;
}

function AmountCard({ order, children }: CardProps) {
  return (
    <Rise order={order}>
      <Box
        className={cx(handshakeOutline, groupUpdatedInset)}
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

interface ReadOnlyGroupProps {
  order: number;
  children: ReactNode[];
}

function ReadOnlyGroup({ order, children }: ReadOnlyGroupProps) {
  if (children.length === 0) return null;
  return (
    <Rise order={order}>
      <Stack
        gap="space.01"
        className={cx(handshakeOutline, groupUpdatedInset)}
        px="space.04"
        py="space.02"
        minWidth={0}
        css={{ '& [data-state=loading]': { bgColor: 'ink.border-default' } }}
      >
        {children.map((child, index) => (
          <Box key={index} minWidth={0}>
            {child}
          </Box>
        ))}
      </Stack>
    </Rise>
  );
}

interface InteractiveGroupProps {
  children: ReactNode[];
}

function InteractiveGroup({ children }: InteractiveGroupProps) {
  return (
    <Stack gap="space.02" minWidth={0}>
      {children.map((child, index) => (
        <Box key={index} minWidth={0}>
          {child}
        </Box>
      ))}
    </Stack>
  );
}

interface LabelledItemProps {
  label?: unknown;
}

function singleItemLabel(items: ReactNode[]) {
  if (items.length !== 1) return undefined;
  const [item] = items;
  if (!isValidElement<LabelledItemProps>(item)) return undefined;
  if (item.type === ApprovalAccountPicker) return 'Account';
  if (
    !isOfType(item, [
      ApprovalAssetRow,
      ApprovalRecipientRow,
      ApprovalFeeRow,
      ApprovalRow,
      ApprovalDisclosureRow,
    ])
  ) {
    return undefined;
  }
  const label = item.props.label;
  if (typeof label === 'string') return label === 'To' ? 'Recipient' : label;
  if (item.type === ApprovalFeeRow) return 'Network fee';
  if (item.type === ApprovalRecipientRow) return 'Recipient';
  return undefined;
}

function sectionHeadingLabel(label: string | undefined, trailing: ReactNode, items: ReactNode[]) {
  if (!label || trailing) return label;
  const itemLabel = singleItemLabel(items);
  return itemLabel?.trim().toLowerCase() === label.trim().toLowerCase() ? undefined : label;
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
      pb="space.02"
      minHeight="24px"
    >
      {label && (
        <styled.h2 display="flex" alignItems="center" gap="space.01" textStyle="label.03">
          {label}
        </styled.h2>
      )}
      {trailing && <HandshakeAction action={trailing} />}
    </Flex>
  );
}

type FlowKind = 'single' | 'interactive' | 'read-only';

interface FlowBlock {
  kind: FlowKind;
  rows: ReactNode[];
}

function flowKind(child: ReactNode): FlowKind {
  if (isInteractive(child)) return 'interactive';
  if (isLoose(child) || isWeakGuarantee(child)) return 'single';
  return 'read-only';
}

function groupFlow(items: ReactNode[]) {
  return items.reduce<FlowBlock[]>((blocks, child) => {
    const kind = flowKind(child);
    const last = blocks.at(-1);
    if (kind !== 'single' && last && last.kind === kind) {
      return [...blocks.slice(0, -1), { kind, rows: [...last.rows, child] }];
    }
    return [...blocks, { kind, rows: [child] }];
  }, []);
}

function renderFlow(items: ReactNode[], startOrder = 0) {
  return groupFlow(items).map((block, index) => {
    if (block.kind === 'single') return <Box key={index}>{block.rows}</Box>;
    if (block.kind === 'interactive') {
      return <InteractiveGroup key={index}>{block.rows}</InteractiveGroup>;
    }
    return (
      <ReadOnlyGroup key={index} order={startOrder + index}>
        {block.rows}
      </ReadOnlyGroup>
    );
  });
}

function ChangesSection({ label, trailing, children }: DirectionSectionProps) {
  const items = flatten(children);
  const headingLabel = sectionHeadingLabel(label, trailing, items);
  const outs = items.filter(isOutgoingAsset);
  const targets = [
    ...items.filter(isRecipient),
    ...items.filter(child => isAsset(child) && !isOutgoingAsset(child)),
  ];
  const weak = items.filter(isWeakGuarantee);
  const strong = items.filter(isStrongGuarantee);
  const rest = items.filter(child => !isAsset(child) && !isRecipient(child) && !isGuarantee(child));
  const cards = [...outs, ...targets];
  return (
    <styled.section
      data-approval-section={label}
      aria-label={headingLabel ? undefined : label}
      px="space.05"
      py="space.03"
      className={sectionUpdatedInset}
    >
      <Heading label={headingLabel} trailing={trailing} />
      <Stack gap="space.03">
        {weak.map((child, index) => (
          <Box key={index}>{child}</Box>
        ))}
        {cards.length > 0 && (
          <Stack gap="0" isolation="isolate">
            {outs.map((child, index) => (
              <Box key={`out-${index}`} pt={index === 0 ? '0' : '4px'}>
                <AmountCard order={index}>{child}</AmountCard>
              </Box>
            ))}
            {outs.length > 0 && targets.length > 0 && (
              <Rise order={outs.length}>
                <FlowBadge />
              </Rise>
            )}
            {targets.map((child, index) => (
              <Box key={`target-${index}`} pt={index === 0 ? '0' : '4px'}>
                <AmountCard order={outs.length + 1 + index}>{child}</AmountCard>
              </Box>
            ))}
          </Stack>
        )}
        {strong.length > 0 && <Stack gap="space.03">{strong}</Stack>}
        {renderFlow(rest, cards.length + 1)}
      </Stack>
    </styled.section>
  );
}

function DisclosureSection({ label, summary, isOpen, onToggle, children }: DirectionSectionProps) {
  const items = flatten(children);
  return (
    <styled.section
      data-approval-section={label}
      px="space.05"
      py="space.03"
      className={sectionUpdatedInset}
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
        textAlign="left"
        aria-expanded={isOpen}
        onClick={onToggle}
        className={cx(handshakeInteractiveSurface, tactilePress)}
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

function GroupSection({ label, trailing, children }: DirectionSectionProps) {
  const items = flatten(children);
  const headingLabel = sectionHeadingLabel(label, trailing, items);
  return (
    <styled.section
      data-approval-section={label}
      aria-label={headingLabel ? undefined : label}
      px="space.05"
      py="space.03"
      className={sectionUpdatedInset}
    >
      <Heading label={headingLabel} trailing={trailing} />
      <Stack gap="space.03">
        {renderFlow(items.filter(child => !isStrongGuarantee(child)))}
        {items.some(isStrongGuarantee) && (
          <Stack gap="space.03">{items.filter(isStrongGuarantee)}</Stack>
        )}
      </Stack>
    </styled.section>
  );
}

export function HandshakeSection(props: DirectionSectionProps) {
  if (props.collapsible && props.label) return <DisclosureSection {...props} />;
  if (flatten(props.children).some(child => isAsset(child) || isRecipient(child))) {
    return <ChangesSection {...props} />;
  }
  return <GroupSection {...props} />;
}
