import { Flex, styled } from 'leather-styles/jsx';

import { type HistoricalPeriod, historicalPeriods } from '@leather.io/models';

interface PeriodSelectorProps {
  value: HistoricalPeriod;
  onChange(period: HistoricalPeriod): void;
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <Flex gap="space.01" role="group" aria-label="Price history period">
      {historicalPeriods.map(period => {
        const isActive = period === value;
        return (
          <styled.button
            key={period}
            type="button"
            aria-pressed={isActive}
            flex="1"
            py="space.01"
            borderRadius="sm"
            textStyle="label.03"
            textTransform="uppercase"
            color={isActive ? 'ink.text-primary' : 'ink.text-subdued'}
            bg={isActive ? 'ink.component-background-default' : 'transparent'}
            _hover={{ bg: 'ink.component-background-hover', cursor: 'pointer' }}
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
