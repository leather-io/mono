import { Flex, styled } from 'leather-styles/jsx';

import { Flag, InfoCircleIcon } from '@leather.io/ui';

import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

import { BalanceAmount } from './balance-amount';

interface TotalBalanceHeaderProps {
  label: string;
  totalFiatBalance: string;
  isLoading?: boolean;
  tooltipText?: string;
  dataTestId?: string;
}

export function TotalBalanceHeader({
  label,
  totalFiatBalance,
  isLoading,
  tooltipText,
  dataTestId,
}: TotalBalanceHeaderProps) {
  return (
    <Flex direction="column" gap="space.02" py="space.03" data-testid={dataTestId}>
      <BasicTooltip label={tooltipText} side="bottom">
        <Flag
          reverse
          spacing="space.01"
          img={<InfoCircleIcon color="ink.text-subdued" display="inline" variant="small" />}
        >
          <styled.h2 textStyle="label.02" color="ink.text-subdued">
            {label}
          </styled.h2>
        </Flag>
      </BasicTooltip>
      <BalanceAmount
        textStyle="heading.02"
        value={totalFiatBalance}
        isLoading={isLoading}
        canClickToShow
        skeletonWidth="200px"
        skeletonHeight="40px"
      />
    </Flex>
  );
}
