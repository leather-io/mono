import { type ReactNode, cloneElement, createContext, isValidElement, useContext } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { ArrowDownIcon, UnlockIcon } from '@leather.io/ui';

import type {
  ApprovalAssetDirection,
  ApprovalFeeSpeed,
  ApprovalLines,
  DirectionAssetRowProps,
  DirectionFeeRowProps,
  DirectionGuaranteeProps,
  DirectionRecipientRowProps,
} from '../pattern/approval-direction';
import { ApprovalEstimateSource, ApproxAmount } from '../pattern/approval-estimate';
import { ApprovalFeeIcon } from '../pattern/approval-fee-speed';
import { truncateMiddle } from '../pattern/approval-format';
import { useApprovalHistoryState } from '../pattern/approval-history-state';
import { AccountAvatar, RecipientAvatar } from '../pattern/approval-identity';
import { ApprovalGuaranteeIcon } from '../pattern/approval-notices';
import { ApprovalRecipientNameBlock } from '../pattern/approval-recipient-name';
import { ApprovalLinesText, ExactAmount } from '../pattern/approval-rows';
import { approvalInteractiveRow, approvalSurface } from '../pattern/approval-surface';
import type { ApprovalAccount } from '../pattern/approval-types';

export type LedgerNode =
  | 'start'
  | 'plus'
  | 'minus'
  | 'covered'
  | 'result'
  | 'step'
  | 'account'
  | 'none';

export type LedgerOperator = 'plus' | 'minus';

const nodeGlyph: Record<LedgerOperator, string> = {
  plus: '+',
  minus: '−',
};

const feeMarkIconSize = 16;
const exactlyThisCaption = 'Gets exactly what you send';
const exactlyThisPastCaption = 'Got exactly what you sent';

const LedgerOperatorContext = createContext<LedgerOperator | undefined>(undefined);

interface LedgerOperatorProviderProps {
  operator?: LedgerOperator;
  children: ReactNode;
}

export function LedgerOperatorProvider({ operator, children }: LedgerOperatorProviderProps) {
  return (
    <LedgerOperatorContext.Provider value={operator}>{children}</LedgerOperatorContext.Provider>
  );
}

function shrinkIcon(icon: ReactNode) {
  if (isValidElement<{ size?: unknown }>(icon) && icon.props.size) {
    return cloneElement(icon, { size: 'sm' });
  }
  return icon;
}

interface LedgerFeeMarkProps {
  icon?: ReactNode;
  speed?: ApprovalFeeSpeed;
  isCovered: boolean;
}

export function LedgerFeeMark({ icon, speed, isCovered }: LedgerFeeMarkProps) {
  return (
    <Flex
      width="24px"
      height="24px"
      flexShrink={0}
      alignItems="center"
      justifyContent="center"
      borderRadius="round"
      borderWidth={1}
      borderStyle={isCovered ? 'dashed' : 'solid'}
      borderColor="ink.border-default"
      bg={isCovered ? 'ink.background-primary' : 'ink.component-background-default'}
      opacity={isCovered ? 0.6 : 1}
      lineHeight={0}
      aria-hidden
    >
      <ApprovalFeeIcon icon={icon} speed={speed} size={feeMarkIconSize} />
    </Flex>
  );
}

interface LedgerRecipientMarkProps {
  avatar?: ReactNode;
}

export function LedgerRecipientMark({ avatar }: LedgerRecipientMarkProps) {
  return <Box lineHeight={0}>{avatar ? shrinkIcon(avatar) : <RecipientAvatar size="sm" />}</Box>;
}

interface LedgerNodeMarkProps {
  node: LedgerNode;
  account?: ApprovalAccount;
}

function LedgerNodeMark({ node, account }: LedgerNodeMarkProps) {
  if (node === 'none') return null;
  if (node === 'account' && account) return <AccountAvatar account={account} size="sm" />;
  if (node === 'plus' || node === 'minus') {
    return (
      <Flex
        width="20px"
        height="20px"
        alignItems="center"
        justifyContent="center"
        borderRadius="round"
        borderWidth={1}
        borderColor="ink.border-default"
        bg="ink.background-primary"
        textStyle="label.03"
        color="ink.text-primary"
        lineHeight="1"
        aria-hidden
      >
        {nodeGlyph[node]}
      </Flex>
    );
  }
  if (node === 'result') {
    return (
      <Flex
        width="20px"
        height="20px"
        alignItems="center"
        justifyContent="center"
        borderRadius="round"
        bg="ink.text-primary"
        aria-hidden
      >
        <ArrowDownIcon variant="small" color="ink.background-primary" />
      </Flex>
    );
  }
  if (node === 'start') {
    return <Box width="10px" height="10px" borderRadius="round" bg="ink.text-primary" />;
  }
  return (
    <Box
      width="10px"
      height="10px"
      borderRadius="round"
      borderWidth={node === 'covered' ? 1 : 2}
      borderColor="ink.border-default"
      bg="ink.background-primary"
    />
  );
}

interface LedgerStepProps {
  node: LedgerNode;
  mark?: ReactNode;
  account?: ApprovalAccount;
  isFirst: boolean;
  isLast: boolean;
  children: ReactNode;
}

export function LedgerStep({ node, mark, account, isFirst, isLast, children }: LedgerStepProps) {
  return (
    <Flex gap="space.03" alignItems="stretch" minWidth={0}>
      <Box position="relative" width="24px" flexShrink={0}>
        {!isFirst && (
          <Box
            position="absolute"
            left="11.5px"
            top="0"
            height="20px"
            width="1px"
            bg="ink.border-default"
          />
        )}
        {!isLast && (
          <Box
            position="absolute"
            left="11.5px"
            top="20px"
            bottom="0"
            width="1px"
            bg="ink.border-default"
          />
        )}
        <Flex
          position="relative"
          height="20px"
          mt="10px"
          alignItems="center"
          justifyContent="center"
        >
          {mark ?? <LedgerNodeMark node={node} account={account} />}
        </Flex>
      </Box>
      <Box flex="1" minWidth={0}>
        {children}
      </Box>
    </Flex>
  );
}

interface LedgerAmountLineProps {
  label: string;
  qualifier?: ReactNode;
  icon?: ReactNode;
  amount: ReactNode;
  fiat?: string;
  direction: ApprovalAssetDirection;
  estimateSource?: string;
  zone: string;
}

function LedgerAmountLine({
  label,
  qualifier,
  icon,
  amount,
  fiat,
  direction,
  estimateSource,
  zone,
}: LedgerAmountLineProps) {
  return (
    <Flex
      justifyContent="space-between"
      alignItems="flex-start"
      gap="space.04"
      py="space.02"
      minHeight="40px"
      data-approval-zone={zone}
    >
      <Stack gap="0" minWidth={0} pt="2px">
        <styled.span textStyle="label.02">{label}</styled.span>
        {qualifier && (
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {qualifier}
          </styled.span>
        )}
        {estimateSource && <ApprovalEstimateSource source={estimateSource} />}
      </Stack>
      <Stack gap="0" alignItems="flex-end" textAlign="right" flexShrink={0} maxWidth="66%">
        <Flex
          alignItems="center"
          gap="space.02"
          textStyle="label.01"
          color={direction === 'in' ? 'green.action-primary-default' : 'ink.text-primary'}
          whiteSpace="nowrap"
        >
          {icon && (
            <Box flexShrink={0} lineHeight={0}>
              {shrinkIcon(icon)}
            </Box>
          )}
          {estimateSource ? <ApproxAmount>{amount}</ApproxAmount> : amount}
        </Flex>
        {fiat && (
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {fiat}
          </styled.span>
        )}
      </Stack>
    </Flex>
  );
}

export function BreakdownAssetRow({
  icon,
  label,
  qualifier,
  amount,
  fiat,
  direction,
  estimateSource,
}: DirectionAssetRowProps) {
  return (
    <LedgerAmountLine
      label={label}
      qualifier={qualifier}
      icon={icon}
      amount={amount}
      fiat={fiat}
      direction={direction}
      estimateSource={estimateSource}
      zone="asset"
    />
  );
}

export function BreakdownFeeRow({ label, amount, fiat, caption, action }: DirectionFeeRowProps) {
  const operator = useContext(LedgerOperatorContext);
  return (
    <Flex
      justifyContent="space-between"
      alignItems="flex-start"
      gap="space.04"
      py="space.02"
      minHeight="40px"
      className={action ? approvalInteractiveRow : undefined}
      data-approval-zone="fee"
    >
      <Stack gap="0" minWidth={0} pt="2px">
        <Flex alignItems="center" gap="space.02">
          <styled.span textStyle="body.02" color="ink.text-subdued">
            {label}
          </styled.span>
          {action}
        </Flex>
        {caption && (
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            <ApprovalLinesText lines={caption} />
          </styled.span>
        )}
      </Stack>
      <Stack gap="0" alignItems="flex-end" textAlign="right" flexShrink={0} pt="2px">
        <styled.span textStyle="label.02" whiteSpace="nowrap">
          {operator && <styled.span color="ink.text-subdued">{nodeGlyph[operator]} </styled.span>}
          {amount}
        </styled.span>
        {fiat && (
          <styled.span textStyle="caption.01" color="ink.text-subdued" whiteSpace="nowrap">
            {fiat}
          </styled.span>
        )}
      </Stack>
    </Flex>
  );
}

interface BreakdownRecipientStopProps extends DirectionRecipientRowProps {
  isSameAmount: boolean;
}

export function BreakdownRecipientStop({
  address,
  label,
  name,
  caption,
  isSameAmount,
}: BreakdownRecipientStopProps) {
  const isConfirmed = useApprovalHistoryState() === 'confirmed';
  return (
    <Stack gap="space.01" py="space.02" minWidth={0} data-approval-zone="recipient">
      <Flex justifyContent="space-between" alignItems="baseline" gap="space.03" pt="2px">
        <styled.span textStyle="label.02" flexShrink={0}>
          {label}
        </styled.span>
        {isSameAmount && (
          <styled.span textStyle="caption.01" color="ink.text-subdued" textAlign="right">
            {isConfirmed ? exactlyThisPastCaption : exactlyThisCaption}
          </styled.span>
        )}
      </Flex>
      {name && <ApprovalRecipientNameBlock name={name} />}
      <Box textStyle="label.02" minWidth={0}>
        {typeof address === 'string' ? (
          <styled.span overflowWrap="anywhere">{address}</styled.span>
        ) : (
          address
        )}
      </Box>
      {caption && (
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          <ApprovalLinesText lines={caption} />
        </styled.span>
      )}
    </Stack>
  );
}

interface DefinitionProps {
  label: string;
  children: ReactNode;
}

function Definition({ label, children }: DefinitionProps) {
  return (
    <Stack gap="2px" minWidth={0}>
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        {label}
      </styled.span>
      <Box textStyle="label.02" minWidth={0}>
        {children}
      </Box>
    </Stack>
  );
}

export function BreakdownRecipientRow({
  address,
  label,
  name,
  caption,
  avatar,
}: DirectionRecipientRowProps) {
  return (
    <Stack gap="space.03" py="space.02" data-approval-zone="recipient">
      <Flex alignItems="center" gap="space.03">
        {avatar ?? <RecipientAvatar size="sm" />}
        <styled.h3 textStyle="label.02">{label}</styled.h3>
      </Flex>
      {name && (
        <Definition label="Name">
          <ApprovalRecipientNameBlock name={name} />
        </Definition>
      )}
      <Definition label="Address">
        {typeof address === 'string' ? (
          <styled.span overflowWrap="anywhere">{address}</styled.span>
        ) : (
          address
        )}
      </Definition>
      {caption && (
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          <ApprovalLinesText lines={caption} />
        </styled.span>
      )}
    </Stack>
  );
}

interface BreakdownFromLineProps {
  account: ApprovalAccount;
}

export function BreakdownFromLine({ account }: BreakdownFromLineProps) {
  const identity = account.vault ? `as ${account.name}` : truncateMiddle(account.address, 4);
  return (
    <Flex
      justifyContent="space-between"
      alignItems="flex-start"
      gap="space.04"
      py="space.02"
      minHeight="40px"
      data-approval-zone="account"
    >
      <Stack gap="0" minWidth={0} pt="2px">
        <styled.span textStyle="body.02" color="ink.text-subdued">
          From
        </styled.span>
        <styled.span textStyle="caption.01" color="ink.text-subdued" truncate>
          {account.signer === 'ledger' ? `${identity} · Ledger` : identity}
        </styled.span>
      </Stack>
      <Stack gap="0" alignItems="flex-end" textAlign="right" minWidth={0} pt="2px">
        <styled.span textStyle="label.02" truncate maxWidth="100%">
          {account.vault ? account.vault.name : account.name}
        </styled.span>
        {account.balance && (
          <styled.span textStyle="caption.01" color="ink.text-subdued" whiteSpace="nowrap">
            Balance <ExactAmount value={account.balance.amount} symbol={account.balance.symbol} />
          </styled.span>
        )}
      </Stack>
    </Flex>
  );
}

interface BreakdownMetaLineProps {
  label: string;
  value: ApprovalLines;
}

export function BreakdownMetaLine({ label, value }: BreakdownMetaLineProps) {
  return (
    <Flex
      justifyContent="space-between"
      alignItems="flex-start"
      gap="space.04"
      py="space.02"
      data-approval-zone="arrival"
    >
      <styled.span textStyle="body.02" color="ink.text-subdued" flexShrink={0}>
        {label}
      </styled.span>
      <styled.span textStyle="label.02" textAlign="right">
        <ApprovalLinesText lines={value} />
      </styled.span>
    </Flex>
  );
}

export function BreakdownGuarantee({ kind, label, isWeak, children }: DirectionGuaranteeProps) {
  if (isWeak) {
    return (
      <Flex
        gap="space.02"
        alignItems="flex-start"
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
    <Flex gap="space.02" alignItems="flex-start" py="space.02" data-approval-zone="guarantee">
      <Box flexShrink={0} pt="2px" lineHeight={0}>
        <ApprovalGuaranteeIcon kind={kind} isWeak={false} />
      </Box>
      <styled.p textStyle="caption.01" color="ink.text-subdued">
        <styled.span textStyle="label.03" color="ink.text-primary">
          {label}.
        </styled.span>{' '}
        {children}
      </styled.p>
    </Flex>
  );
}
