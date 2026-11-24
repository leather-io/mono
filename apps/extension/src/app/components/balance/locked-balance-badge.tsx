import { Flex, styled } from 'leather-styles/jsx';

import type { Money } from '@leather.io/models';
import { LockIcon } from '@leather.io/ui';

import { formatCurrency } from '@app/common/currency-formatter';
import { InfoTooltip } from '@app/ui/components/tooltip/info-tooltip';

interface LockedBalanceBadgeProps {
  balance: Money;
}

const lockedBalanceTooltip = 'Your total, and how much of it is locked.';

/** The locked share of a token row's balance: tinted plate, then the tooltip. */
export function LockedBalanceBadge({ balance }: LockedBalanceBadgeProps) {
  return (
    <>
      <Flex
        alignItems="center"
        gap="2px"
        // Uneven to look even: the lock glyph carries ~3px of its own inset
        pl="2px"
        pr="space.01"
        py="3px"
        borderRadius="sm"
        bg="ink.component-background-default"
        color="ink.text-primary"
      >
        <LockIcon variant="small" color="ink.text-primary" width={12} height={12} />
        <styled.span textStyle="label.03">
          {formatCurrency(balance, { showCurrency: false })}
        </styled.span>
      </Flex>
      <InfoTooltip label={lockedBalanceTooltip} size={14} />
    </>
  );
}
