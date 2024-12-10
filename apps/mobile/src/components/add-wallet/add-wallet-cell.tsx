import { Box, Cell } from '@leather.io/ui/native';

interface AddWalletCellProps {
  icon?: React.ReactNode;
  title: string;
  caption?: string;
  onPress(): void;
  testID?: string;
}

export function AddWalletCell({ icon, title, caption, onPress, testID }: AddWalletCellProps) {
  return (
    <Cell.Root pressable={true} onPress={onPress} testID={testID}>
      <Cell.Icon>
        <Box p="3" bg="ink.background-secondary" borderRadius="round">
          {icon}
        </Box>
      </Cell.Icon>
      <Cell.Content>
        <Cell.Label variant="primary">{title}</Cell.Label>
        {caption && <Cell.Label variant="secondary">{caption}</Cell.Label>}
      </Cell.Content>
    </Cell.Root>
  );
}
