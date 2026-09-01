import { type ReactNode } from 'react';

import { Flex, Stack, styled } from 'leather-styles/jsx';

import { Flag, InfoCircleIcon } from '@leather.io/ui';

import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

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
      <Flex justifyContent="space-between" alignItems="flex-start">
        <Stack gap="space.02">
          <BasicTooltip label={tooltipText} side="top">
            <Flag
              reverse
              spacing="space.01"
              img={<InfoCircleIcon color="ink.text-subdued" display="inline" variant="small" />}
            >
              <styled.h3 textStyle="label.02" color="ink.text-subdued">
                {label}
              </styled.h3>
            </Flag>
          </BasicTooltip>
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
      <Stack gap="space.01">{children}</Stack>
    </Stack>
  );
}
