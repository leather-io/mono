import { StackingConditions } from '~/features/stacking/components/stacking-conditions';
import { PostLabelHoverCard } from '~/components/post-label-hover-card';

import { BoxedCatLockedIcon, MagnifyingGlassIcon, StacksIcon } from '@leather.io/ui';

const liquidStackingConditions = [
  {
    icon: <BoxedCatLockedIcon />,
    title: "This transaction can't be reversed",
    description:
      "You are converting STX to the Stacking token of your chosen provider. You may or may not be able to convert back to STX later depending on the provider.",
  },
  {
    icon: <MagnifyingGlassIcon />,
    title: "Research your protocol",
    description:
      "Accumulating the value of rewards is at the discretion of the protocol. Make sure you\'ve researched and trust the protocol you\'re using.",
  },
  {
    icon: <StacksIcon />,
    title: "Stacking with the Protocol Contract",
    description:
      "The protocol uses a smart contract that handles your Stacking. By allowing the contract to call Stacking functions, you agree to the rules of the protocol\'s contract.",
  },
];

export function ChooseLiquidStackingConditions() {
  return (
    <>
      <PostLabelHoverCard postKey="liquid-stacking-conditions" textStyle="label.01" tagName="h1" />
      <StackingConditions conditions={liquidStackingConditions} />
    </>
  );
}
