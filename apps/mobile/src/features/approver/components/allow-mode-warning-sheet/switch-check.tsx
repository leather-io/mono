import { Cell, Switch } from '@leather.io/ui/native';

interface SwitchCheckProps {
  title: string;
  value: boolean;
  onValueChange(val: boolean): void;
}
export function SwitchCheck({ title, value, onValueChange }: SwitchCheckProps) {
  return (
    <Cell.Root
      pressable
      style={{ paddingHorizontal: 0 }}
      onPress={() => {
        onValueChange(!value);
      }}
    >
      <Cell.Content>
        <Cell.Label variant="primary" numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Cell.Label>
      </Cell.Content>
      <Cell.Aside>
        <Switch value={value} onValueChange={onValueChange} />
      </Cell.Aside>
    </Cell.Root>
  );
}
