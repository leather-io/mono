import { type ReactNode } from 'react';

import { Flex, Stack, styled } from 'leather-styles/jsx';

import { Flag } from '@leather.io/ui';

import { InfoTooltip } from '@app/ui/components/tooltip/info-tooltip';

import { BalanceAmount } from './balance-amount';

interface ProtocolSectionProps {
  icon: ReactNode;
  label: string;
  totalFiatValue: string;
  summary: string;
  isLoading?: boolean;
  children: ReactNode;
  tooltipText?: string;
  dataTestId?: string;
}

export function ProtocolSection({
  icon,
  label,
  totalFiatValue,
  summary,
  isLoading,
  children,
  tooltipText,
  dataTestId,
}: ProtocolSectionProps) {
  return (
    <Stack gap="space.03" py="space.04" data-testid={dataTestId}>
      <Stack gap="space.02">
        <Flag reverse spacing="space.01" img={<InfoTooltip label={tooltipText} />}>
          <styled.h3 textStyle="label.02" color="ink.text-subdued">
            {label}
          </styled.h3>
        </Flag>
        {/* Icon centres on the amounts, not on the label above them */}
        <Flex justifyContent="space-between" alignItems="center" gap="space.02" pr="space.01">
          <Stack gap="space.00">
            <BalanceAmount
              textStyle="heading.04"
              value={totalFiatValue}
              isLoading={isLoading}
              skeletonWidth="140px"
              skeletonHeight="28px"
            />
            <BalanceAmount
              textStyle="caption.01"
              color="ink.text-subdued"
              value={summary}
              isLoading={isLoading}
              skeletonWidth="80px"
              skeletonHeight="16px"
            />
          </Stack>
          {icon}
        </Flex>
      </Stack>
      <Stack gap="space.01">{children}</Stack>
    </Stack>
  );
}
