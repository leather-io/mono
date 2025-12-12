import { useState } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { formatCurrency } from '~/utils/currency-formatter';

import { Money } from '@leather.io/models';
import { InfoCircleIcon } from '@leather.io/ui';

type TabId = 'token-allocation' | 'yield-positions';

interface TabConfig {
  id: TabId;
  label: string;
  value: Money | null;
  percentChange?: number;
}

interface PortfolioTabsProps {
  tokenAllocationValue: Money | null;
  tokenAllocationChange?: number;
  yieldPositionsValue: Money | null;
  activeTab: TabId;
  onTabChange(tab: TabId): void;
}

interface TabItemProps {
  label: string;
  value: Money | null;
  percentChange?: number;
  isActive: boolean;
  onClick(): void;
}

function TabItem({ label, value, percentChange, isActive, onClick }: TabItemProps) {
  const hasPositiveChange = percentChange !== undefined && percentChange > 0;
  const hasNegativeChange = percentChange !== undefined && percentChange < 0;

  return (
    <Box
      as="button"
      onClick={onClick}
      pb="space.05"
      pr="space.07"
      borderBottom={isActive ? '4px solid' : '1px solid'}
      borderColor={isActive ? 'ink.action-primary-default' : 'ink.border-default'}
      cursor="pointer"
      textAlign="left"
      background="none"
      _hover={{ opacity: 0.8 }}
    >
      <Flex alignItems="center" gap="space.01" mb="space.02">
        <styled.span textStyle="label.02" color="ink.text-primary">
          {label}
        </styled.span>
        <InfoCircleIcon variant="small" color="ink.text-subdued" />
      </Flex>
      <Flex alignItems="center" gap="space.03">
        <styled.span
          textStyle="heading.04"
          color={isActive ? 'ink.text-primary' : 'ink.text-subdued'}
        >
          {value ? formatCurrency(value) : '$0'}
        </styled.span>
        {percentChange !== undefined && percentChange !== 0 && (
          <Flex
            alignItems="center"
            gap="space.01"
            px="space.02"
            py="space.01"
            borderRadius="100px"
            background={hasPositiveChange ? 'green.background-secondary' : 'red.background-secondary'}
          >
            <styled.span
              textStyle="label.03"
              fontWeight="bold"
              color={hasPositiveChange ? 'green.action-primary-default' : 'red.action-primary-default'}
            >
              {hasPositiveChange ? '▲' : '▼'} {Math.abs(percentChange).toFixed(2)}%
            </styled.span>
          </Flex>
        )}
      </Flex>
    </Box>
  );
}

export function PortfolioTabs({
  tokenAllocationValue,
  tokenAllocationChange,
  yieldPositionsValue,
  activeTab,
  onTabChange,
}: PortfolioTabsProps) {
  const tabs: TabConfig[] = [
    {
      id: 'token-allocation',
      label: 'Token allocation',
      value: tokenAllocationValue,
      percentChange: tokenAllocationChange,
    },
    {
      id: 'yield-positions',
      label: 'Yield positions',
      value: yieldPositionsValue,
    },
  ];

  return (
    <Flex borderBottom="1px solid" borderColor="ink.border-default">
      {tabs.map(tab => (
        <TabItem
          key={tab.id}
          label={tab.label}
          value={tab.value}
          percentChange={tab.percentChange}
          isActive={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        />
      ))}
    </Flex>
  );
}

export type { TabId };
