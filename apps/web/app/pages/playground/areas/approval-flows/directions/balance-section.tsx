import {
  Children,
  type ReactElement,
  type ReactNode,
  createContext,
  isValidElement,
  useContext,
  useState,
} from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { Badge, ChevronDownIcon, ChevronUpIcon } from '@leather.io/ui';

import {
  type ApprovalGuaranteeKind,
  type DirectionGuaranteeProps,
  type DirectionSectionProps,
  isWhatMovesLabel,
} from '../pattern/approval-direction';
import { ApprovalGuarantee, ApprovalGuaranteeIcon } from '../pattern/approval-notices';
import {
  approvalDivider,
  approvalInteractiveTrigger,
  approvalSurface,
} from '../pattern/approval-surface';

const weakKinds: ApprovalGuaranteeKind[] = ['unrestricted', 'open'];

type GuaranteePlacement = 'inline' | 'chip' | 'caption';

interface GuaranteeSlotValue {
  placement: GuaranteePlacement;
  isExplained: boolean;
  onToggle(): void;
}

const GuaranteeSlotContext = createContext<GuaranteeSlotValue>({
  placement: 'inline',
  isExplained: false,
  onToggle() {
    return undefined;
  },
});

interface GuaranteeElementProps {
  kind?: unknown;
}

function isGuaranteeElement(child: ReactNode): child is ReactElement<GuaranteeElementProps> {
  return isValidElement<GuaranteeElementProps>(child) && child.type === ApprovalGuarantee;
}

function isWeakKind(kind: unknown) {
  return weakKinds.some(weakKind => weakKind === kind);
}

interface SectionHeadingProps {
  children: ReactNode;
}

function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <styled.h2 textStyle="label.03" color="ink.text-subdued" flexShrink={0}>
      {children}
    </styled.h2>
  );
}

function PlainSection({
  label,
  trailing,
  children,
  divided,
  collapsible,
  summary,
  isOpen,
  onToggle,
}: DirectionSectionProps) {
  return (
    <styled.section
      data-approval-section={label}
      px="space.05"
      py="space.03"
      className={divided ? approvalDivider : undefined}
    >
      {label && collapsible && (
        <styled.button
          type="button"
          display="flex"
          width="100%"
          alignItems="center"
          justifyContent="space-between"
          gap="space.03"
          pb={isOpen ? 'space.02' : '0'}
          minHeight="28px"
          cursor="pointer"
          textAlign="left"
          aria-expanded={isOpen}
          onClick={onToggle}
          className={approvalInteractiveTrigger}
        >
          <SectionHeading>{label}</SectionHeading>
          <Flex alignItems="center" gap="space.02" minWidth={0}>
            {!isOpen && summary && (
              <styled.span textStyle="caption.01" color="ink.text-subdued" truncate>
                {summary}
              </styled.span>
            )}
            {isOpen ? (
              <ChevronUpIcon variant="small" color="ink.text-subdued" />
            ) : (
              <ChevronDownIcon variant="small" color="ink.text-subdued" />
            )}
          </Flex>
        </styled.button>
      )}
      {label && !collapsible && (
        <Flex alignItems="center" justifyContent="space-between" gap="space.02" pb="space.02">
          <SectionHeading>{label}</SectionHeading>
          {trailing}
        </Flex>
      )}
      {isOpen && <Stack gap="0">{children}</Stack>}
    </styled.section>
  );
}

function BalanceChangesSection({ label, trailing, divided, children }: DirectionSectionProps) {
  const [isExplained, setExplained] = useState(false);
  const childList = Children.toArray(children);
  const guarantees = childList.filter(isGuaranteeElement);
  const rows = childList.filter(child => !isGuaranteeElement(child));
  const isEstimate = guarantees.some(guarantee => isWeakKind(guarantee.props.kind));
  const slot = {
    isExplained,
    onToggle() {
      setExplained(!isExplained);
    },
  };
  return (
    <styled.section
      data-approval-section={label}
      px="space.05"
      py="space.03"
      className={divided ? approvalDivider : undefined}
    >
      <Flex
        alignItems="center"
        justifyContent="space-between"
        gap="space.02"
        pb="space.02"
        minHeight="28px"
      >
        <SectionHeading>{isEstimate ? 'Estimated changes' : 'Balance changes'}</SectionHeading>
        <Flex alignItems="center" gap="space.02" minWidth={0}>
          {trailing}
          <GuaranteeSlotContext.Provider value={{ placement: 'chip', ...slot }}>
            {guarantees}
          </GuaranteeSlotContext.Provider>
        </Flex>
      </Flex>
      <GuaranteeSlotContext.Provider value={{ placement: 'caption', ...slot }}>
        {guarantees}
      </GuaranteeSlotContext.Provider>
      {rows.length > 0 && (
        <Stack
          gap="0"
          px="space.04"
          py="space.02"
          className={approvalSurface.group}
          data-approval-zone="balance-changes"
        >
          {rows}
        </Stack>
      )}
    </styled.section>
  );
}

export function BalanceSection(props: DirectionSectionProps) {
  if (isWhatMovesLabel(props.label)) return <BalanceChangesSection {...props} />;
  return <PlainSection {...props} />;
}

interface GuaranteeChipProps {
  kind: ApprovalGuaranteeKind;
  label: string;
  isWeak: boolean;
  isExplained?: boolean;
  onToggle?(): void;
}

function GuaranteeChip({ kind, label, isWeak, isExplained, onToggle }: GuaranteeChipProps) {
  const chip = (
    <Badge
      label={label}
      variant={isWeak ? 'warning' : 'default'}
      icon={<ApprovalGuaranteeIcon kind={kind} isWeak={isWeak} />}
    />
  );
  if (!onToggle || isWeak) return chip;
  return (
    <styled.button
      type="button"
      display="inline-flex"
      cursor="pointer"
      borderRadius="round"
      aria-expanded={isExplained}
      aria-label={`${label}, what this means`}
      onClick={onToggle}
    >
      {chip}
    </styled.button>
  );
}

export function BalanceGuarantee({ kind, label, isWeak, children }: DirectionGuaranteeProps) {
  const { placement, isExplained, onToggle } = useContext(GuaranteeSlotContext);
  if (placement === 'chip') {
    return (
      <Box data-approval-zone="guarantee" lineHeight={0}>
        <GuaranteeChip
          kind={kind}
          label={label}
          isWeak={isWeak}
          isExplained={isExplained}
          onToggle={onToggle}
        />
      </Box>
    );
  }
  if (placement === 'caption') {
    if (!isWeak && !isExplained) return null;
    return (
      <styled.p textStyle="caption.01" color="ink.text-subdued" pb="space.02">
        {children}
      </styled.p>
    );
  }
  return (
    <Stack gap="space.01" alignItems="flex-start" py="space.02" data-approval-zone="guarantee">
      <GuaranteeChip kind={kind} label={label} isWeak={isWeak} />
      {isWeak && (
        <styled.p textStyle="caption.01" color="ink.text-subdued">
          {children}
        </styled.p>
      )}
    </Stack>
  );
}
