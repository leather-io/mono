import { ReactNode } from 'react';

import { Box, HStack, Stack, styled } from 'leather-styles/jsx';

export interface StackingConditionItem {
  icon: ReactNode;
  title: string;
  description: string;
}

export interface StackingConditionsProps {
  conditions: StackingConditionItem[];
}

export function StackingConditions({ conditions }: StackingConditionsProps) {
  return (
    <Stack gap="space.00">
      {conditions.map(condition => (
        <HStack py="space.03" gap="space.03" key={condition.title} alignItems="flex-start">
          <Box flexShrink={0}>{condition.icon}</Box>
          <Stack gap="0">
            <styled.span textStyle="label.03">{condition.title}</styled.span>
            <styled.span textStyle="caption.01" color="ink.text-subdued">
              {condition.description}
            </styled.span>
          </Stack>
        </HStack>
      ))}
    </Stack>
  );
}
