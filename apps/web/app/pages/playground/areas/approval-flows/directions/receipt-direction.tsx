import { Children, type ReactNode, cloneElement, isValidElement } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { ChevronDownIcon, ChevronUpIcon, UnlockIcon } from '@leather.io/ui';

import {
  type ApprovalDirection,
  type ApprovalGuaranteeKind,
  type DirectionAssetRowProps,
  type DirectionFeeRowProps,
  type DirectionGuaranteeProps,
  type DirectionRecipientRowProps,
  type DirectionSectionProps,
  isWhatMovesLabel,
} from '../pattern/approval-direction';
import { ApprovalEstimateSource, ApproxAmount } from '../pattern/approval-estimate';
import { ApprovalFingerprint } from '../pattern/approval-fingerprint';
import { truncateMiddle } from '../pattern/approval-format';
import { AccountAvatar, ApprovalAccountPicker } from '../pattern/approval-identity';
import {
  ApprovalGuarantee,
  ApprovalGuaranteeIcon,
  ApprovalPermission,
} from '../pattern/approval-notices';
import { useApprovalOptions } from '../pattern/approval-options';
import { ApprovalRecipientNameBlock } from '../pattern/approval-recipient-name';
import { ApprovalLinesText, ExactAmount } from '../pattern/approval-rows';
import { useApprovalAccountSlot, useApprovalSigner } from '../pattern/approval-shell';
import { ApprovalSigners } from '../pattern/approval-signers';
import {
  approvalDivider,
  approvalInteractiveRow,
  approvalSurface,
} from '../pattern/approval-surface';
import { ApprovalPanel } from '../pattern/approval-tray';
import type { ApprovalAccount } from '../pattern/approval-types';

const weakKinds: ApprovalGuaranteeKind[] = ['unrestricted', 'open'];
const plainChildTypes: unknown[] = [
  ApprovalPanel,
  ApprovalPermission,
  ApprovalAccountPicker,
  ApprovalSigners,
  ApprovalFingerprint,
];

function isGuarantee(child: ReactNode) {
  return isValidElement(child) && child.type === ApprovalGuarantee;
}

function isWeakGuarantee(child: ReactNode) {
  return (
    isValidElement<{ kind?: ApprovalGuaranteeKind }>(child) &&
    child.type === ApprovalGuarantee &&
    child.props.kind !== undefined &&
    weakKinds.includes(child.props.kind)
  );
}

function isStrongGuarantee(child: ReactNode) {
  return isGuarantee(child) && !isWeakGuarantee(child);
}

function hasPlainChild(children: ReactNode) {
  return Children.toArray(children).some(
    child => isValidElement(child) && plainChildTypes.includes(child.type)
  );
}

function shrinkIcon(icon: ReactNode) {
  if (isValidElement<{ size?: unknown }>(icon) && icon.props.size) {
    return cloneElement(icon, { size: 'sm' });
  }
  return icon;
}

interface ReceiptRowsProps {
  children: ReactNode;
}

function ReceiptRows({ children }: ReceiptRowsProps) {
  return (
    <Stack gap="0" px="space.04">
      {Children.toArray(children).map((child, index) => (
        <Box
          key={index}
          py="2px"
          className={index === 0 ? undefined : approvalDivider}
          minWidth={0}
        >
          {child}
        </Box>
      ))}
    </Stack>
  );
}

interface ReceiptHeadingProps {
  label?: string;
  trailing?: ReactNode;
}

function ReceiptHeading({ label, trailing }: ReceiptHeadingProps) {
  if (!label && !trailing) return null;
  return (
    <Flex alignItems="center" justifyContent="space-between" gap="space.02" pb="space.02">
      {label && (
        <styled.h2 textStyle="label.03" color="ink.text-subdued">
          {label}
        </styled.h2>
      )}
      {trailing}
    </Flex>
  );
}

interface ReceiptLineProps {
  label: string;
  action?: ReactNode;
  value: ReactNode;
  valueColor?: 'ink.text-primary' | 'green.action-primary-default';
  detail?: ReactNode;
  aside?: ReactNode;
  zone?: string;
}

function ReceiptLine({
  label,
  action,
  value,
  valueColor = 'ink.text-primary',
  detail,
  aside,
  zone,
}: ReceiptLineProps) {
  return (
    <Stack
      gap="0"
      py="space.02"
      className={action ? approvalInteractiveRow : undefined}
      data-approval-zone={zone}
    >
      <Flex justifyContent="space-between" alignItems="center" gap="space.04" minHeight="24px">
        <Flex alignItems="center" gap="space.02" flexShrink={0} maxWidth="50%">
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {label}
          </styled.span>
          {action}
        </Flex>
        <Flex
          alignItems="center"
          justifyContent="flex-end"
          gap="space.02"
          minWidth={0}
          textStyle="label.02"
          textAlign="right"
          color={valueColor}
        >
          {value}
        </Flex>
      </Flex>
      {(detail || aside) && (
        <Flex justifyContent="space-between" alignItems="flex-start" gap="space.04">
          <styled.span textStyle="caption.01" color="ink.text-subdued" minWidth={0}>
            {detail}
          </styled.span>
          {aside && (
            <styled.span
              textStyle="caption.01"
              color="ink.text-subdued"
              textAlign="right"
              flexShrink={0}
              whiteSpace="nowrap"
            >
              {aside}
            </styled.span>
          )}
        </Flex>
      )}
    </Stack>
  );
}

interface ReceiptFromRowProps {
  account: ApprovalAccount;
}

function ReceiptFromRow({ account }: ReceiptFromRowProps) {
  const detail = account.vault ? `as ${account.name}` : truncateMiddle(account.address, 4);
  return (
    <ReceiptLine
      label="From"
      zone="account"
      value={
        <>
          <AccountAvatar account={account} size="sm" />
          <styled.span truncate>{account.vault ? account.vault.name : account.name}</styled.span>
        </>
      }
      detail={account.signer === 'ledger' ? `${detail} · Ledger` : detail}
      aside={
        account.balance && (
          <>
            Balance <ExactAmount value={account.balance.amount} symbol={account.balance.symbol} />
          </>
        )
      }
    />
  );
}

function ReceiptSummary({ label, trailing, children }: DirectionSectionProps) {
  const signer = useApprovalSigner();
  const hasAccountSlot = useApprovalAccountSlot();
  const { accountPlacement } = useApprovalOptions();
  const items = Children.toArray(children);
  const rows = items.filter(child => !isGuarantee(child));
  const weakGuarantees = items.filter(isWeakGuarantee);
  const strongGuarantees = items.filter(isStrongGuarantee);
  const fromAccount = accountPlacement === 'body' && hasAccountSlot ? signer : undefined;
  return (
    <styled.section data-approval-section={label} px="space.05" py="space.02">
      <ReceiptHeading label={label} trailing={trailing} />
      <Box className={approvalSurface.group} overflow="hidden">
        <ReceiptRows>
          {fromAccount && <ReceiptFromRow account={fromAccount} />}
          {rows}
        </ReceiptRows>
      </Box>
      {weakGuarantees}
      {strongGuarantees}
    </styled.section>
  );
}

function ReceiptDisclosure({ label, summary, isOpen, onToggle, children }: DirectionSectionProps) {
  return (
    <styled.section data-approval-section={label} px="space.05" py="space.02">
      <Box className={approvalSurface.interactive} overflow="hidden">
        <styled.button
          type="button"
          display="flex"
          width="100%"
          alignItems="center"
          justifyContent="space-between"
          gap="space.03"
          px="space.04"
          py="space.03"
          minHeight="44px"
          cursor="pointer"
          textAlign="left"
          aria-expanded={isOpen}
          onClick={onToggle}
          _hover={{ bg: 'ink.component-background-hover' }}
        >
          <styled.span textStyle="label.02" flexShrink={0}>
            {label}
          </styled.span>
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
        {isOpen && (
          <Box className={approvalDivider}>
            <ReceiptRows>{children}</ReceiptRows>
          </Box>
        )}
      </Box>
    </styled.section>
  );
}

function ReceiptGroup({ label, trailing, children }: DirectionSectionProps) {
  return (
    <styled.section data-approval-section={label} px="space.05" py="space.02">
      <ReceiptHeading label={label} trailing={trailing} />
      {hasPlainChild(children) ? (
        <Stack gap="0">{children}</Stack>
      ) : (
        <Box className={approvalSurface.group}>
          <ReceiptRows>{children}</ReceiptRows>
        </Box>
      )}
    </styled.section>
  );
}

function ReceiptSection({ label, collapsible, ...props }: DirectionSectionProps) {
  if (isWhatMovesLabel(label)) return <ReceiptSummary label={label} {...props} />;
  if (collapsible && label) {
    return <ReceiptDisclosure label={label} collapsible={collapsible} {...props} />;
  }
  return <ReceiptGroup label={label} {...props} />;
}

function ReceiptAssetRow({
  icon,
  label,
  qualifier,
  amount,
  fiat,
  direction,
  estimateSource,
}: DirectionAssetRowProps) {
  return (
    <ReceiptLine
      label={label}
      value={
        <>
          <Box flexShrink={0} lineHeight={0}>
            {shrinkIcon(icon)}
          </Box>
          {estimateSource ? <ApproxAmount>{amount}</ApproxAmount> : amount}
        </>
      }
      valueColor={direction === 'in' ? 'green.action-primary-default' : 'ink.text-primary'}
      detail={
        estimateSource ? (
          <>
            {qualifier && <styled.span display="block">{qualifier}</styled.span>}
            <ApprovalEstimateSource source={estimateSource} />
          </>
        ) : (
          qualifier
        )
      }
      aside={fiat}
    />
  );
}

function ReceiptRecipientRow({
  address,
  label,
  name,
  caption,
  avatar,
}: DirectionRecipientRowProps) {
  const captionText = caption && <ApprovalLinesText lines={caption} />;
  if (typeof address === 'string') {
    return (
      <ReceiptLine
        label={label}
        zone="recipient"
        value={
          <>
            {avatar && (
              <Box flexShrink={0} lineHeight={0}>
                {shrinkIcon(avatar)}
              </Box>
            )}
            <styled.span truncate>{address}</styled.span>
          </>
        }
        detail={captionText}
      />
    );
  }
  return (
    <Stack gap="space.01" py="space.02" data-approval-zone="recipient">
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        {label}
      </styled.span>
      {name && <ApprovalRecipientNameBlock name={name} />}
      <Box textStyle="label.02">{address}</Box>
      {captionText && (
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          {captionText}
        </styled.span>
      )}
    </Stack>
  );
}

function ReceiptFeeRow({ label, amount, fiat, caption, action }: DirectionFeeRowProps) {
  return (
    <ReceiptLine
      label={label}
      action={action}
      zone="fee"
      value={amount}
      detail={caption && <ApprovalLinesText lines={caption} />}
      aside={fiat}
    />
  );
}

function ReceiptGuarantee({ kind, label, isWeak, children }: DirectionGuaranteeProps) {
  if (isWeak) {
    return (
      <Flex
        gap="space.02"
        alignItems="flex-start"
        mt="space.02"
        px="space.04"
        py="space.03"
        className={approvalSurface.notice}
        data-approval-zone="guarantee"
      >
        <Box flexShrink={0} pt="2px" lineHeight={0}>
          <UnlockIcon variant="small" color="yellow.action-primary-default" />
        </Box>
        <styled.p textStyle="caption.01" color="ink.text-primary">
          <styled.span fontWeight={500}>{label}.</styled.span> {children}
        </styled.p>
      </Flex>
    );
  }
  return (
    <Flex
      gap="space.02"
      alignItems="flex-start"
      px="space.04"
      pt="space.03"
      data-approval-zone="guarantee"
    >
      <Box flexShrink={0} pt="2px" lineHeight={0}>
        <ApprovalGuaranteeIcon kind={kind} isWeak={false} />
      </Box>
      <styled.p textStyle="caption.01" color="ink.text-subdued">
        <styled.span color="ink.text-primary">{label}.</styled.span> {children}
      </styled.p>
    </Flex>
  );
}

export const receiptDirection: ApprovalDirection = {
  id: 'receipt',
  name: 'Receipt',
  description:
    'A payment-sheet summary: labelled rows in one card, fee and total in the same list.',
  inspiration: 'Apple Pay, Stripe Checkout, Coinbase',
  Section(props) {
    return <ReceiptSection {...props} />;
  },
  AssetRow(props) {
    return <ReceiptAssetRow {...props} />;
  },
  RecipientRow(props) {
    return <ReceiptRecipientRow {...props} />;
  },
  FeeRow(props) {
    return <ReceiptFeeRow {...props} />;
  },
  Guarantee(props) {
    return <ReceiptGuarantee {...props} />;
  },
  AccountBlock() {
    return null;
  },
};
