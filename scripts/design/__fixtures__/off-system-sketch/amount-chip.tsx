// Fixture: a selectable amount chip built on styled.button. Nothing in ui matches it.
import { styled } from 'leather-styles/jsx';

interface AmountChipProps {
  amount: string;
  selected: boolean;
  onSelect(amount: string): void;
}

export function AmountChip({ amount, selected, onSelect }: AmountChipProps) {
  return (
    <styled.button
      type="button"
      onClick={() => onSelect(amount)}
      borderRadius="sm"
      px="space.03"
      py="6px"
      bg={selected ? 'ink.text-primary' : 'ink.component-background-default'}
      color={selected ? 'ink.background-primary' : 'ink.text-primary'}
      textStyle="label.03"
    >
      {amount}
    </styled.button>
  );
}
