import { ReactNode } from 'react';

import { HStack, Stack, styled } from 'leather-styles/jsx';

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
    <Stack gap="space.04">
      {conditions.map(condition => (
        <HStack key={condition.title} alignItems="flex-start">
          {condition.icon}
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
