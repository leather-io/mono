import { Flex, styled } from 'leather-styles/jsx';

import { type HistoricalPeriod, historicalPeriods } from '@leather.io/models';

interface PeriodSelectorProps {
  value: HistoricalPeriod;
  disabledPeriods: HistoricalPeriod[];
  onChange(period: HistoricalPeriod): void;
}

export function PeriodSelector({ value, disabledPeriods, onChange }: PeriodSelectorProps) {
  return (
    <Flex gap="space.01" role="group" aria-label="Price history period">
      {historicalPeriods.map(period => {
        const isActive = period === value;
        const isDisabled = disabledPeriods.includes(period);
        return (
          <styled.button
            key={period}
            type="button"
            disabled={isDisabled}
            aria-pressed={isActive}
            flex="1"
            py="space.01"
            borderRadius="sm"
            textStyle="label.03"
            textTransform="uppercase"
            color={isActive ? 'ink.text-primary' : 'ink.text-subdued'}
            bg={isActive ? 'ink.component-background-default' : 'transparent'}
            _disabled={{ color: 'ink.text-non-interactive', cursor: 'default' }}
            _hover={
              isDisabled ? undefined : { bg: 'ink.component-background-hover', cursor: 'pointer' }
            }
            onClick={() => onChange(period)}
            data-testid={`price-history-period-${period}`}
          >
            {period}
          </styled.button>
        );
      })}
    </Flex>
  );
}
