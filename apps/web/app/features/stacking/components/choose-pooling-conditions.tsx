import { HStack, Stack, styled } from 'leather-styles/jsx';

import { BoxedCatLockedIcon, MagnifyingGlassIcon, StacksIcon } from '@leather.io/ui';

const POOLING_CONDITIONS = [
  {
    icon: <BoxedCatLockedIcon />,
    title: "This transaction can't be reversed",
    description: "Your STX will stay locked for the full duration of the pool's stacking cycle.",
  },
  {
    icon: <MagnifyingGlassIcon />,
    title: 'Research your pool',
    description: "Reward payouts depend on the pool's policies—research before joining.",
  },
  {
    icon: <StacksIcon />,
    title: "Stacking with the pool's contract",
    description:
      "The pool's smart contract manages stacking, and using it means agreeing to its terms.",
  },
];

export function ChoosePoolingConditions() {
  return (
    <Stack gap="space.04">
      {POOLING_CONDITIONS.map(condition => (
        <HStack key={condition.title}>
          {condition.icon}
          <Stack gap="space.01">
            <styled.span textStyle="label.03">{condition.title}</styled.span>
            <styled.span textStyle="caption.01">{condition.description}</styled.span>
          </Stack>
        </HStack>
      ))}
    </Stack>
  );
}
