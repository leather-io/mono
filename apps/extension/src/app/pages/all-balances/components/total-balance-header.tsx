import { Flex, styled } from 'leather-styles/jsx';

import { InfoCircleIcon } from '@leather.io/ui';

interface TotalBalanceHeaderProps {
  label: string;
  totalFiatBalance: string;
}

export function TotalBalanceHeader({ label, totalFiatBalance }: TotalBalanceHeaderProps) {
  return (
    <Flex direction="column" gap="space.01" py="space.03">
      <Flex alignItems="center" gap="space.01">
        <styled.span textStyle="label.02" color="ink.text-subdued">
          {label}
        </styled.span>
        <InfoCircleIcon variant="small" />
      </Flex>
      <styled.span textStyle="heading.02">{totalFiatBalance}</styled.span>
    </Flex>
  );
}
