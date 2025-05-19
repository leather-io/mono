import { StackingConditions } from '~/features/stacking/components/stacking-conditions';

import { BoxedCatLockedIcon, MagnifyingGlassIcon, StacksIcon } from '@leather.io/ui';

const poolingConditions = [
  {
    icon: <BoxedCatLockedIcon />,
    title: "This transaction can't be reversed",
    description: "Your STX will stay locked for the full duration of the pool's commitment.",
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
      "The pool's smart contract manages Stacking and using it means agreeing to its terms.",
  },
];

export function ChoosePoolingConditions() {
  return <StackingConditions conditions={poolingConditions} />;
}
