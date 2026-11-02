import { Flex, Stack, styled } from 'leather-styles/jsx';

import { Switch } from '@leather.io/ui';

interface RotateAddressToggleProps {
  isChecked: boolean;
  onToggle(isChecked: boolean): void;
}
export function RotateAddressToggle({ isChecked, onToggle }: RotateAddressToggleProps) {
  return (
    <Flex alignItems="center" gap="space.03" justifyContent="space-between" mt="space.04">
      <Stack gap="space.01">
        <styled.label htmlFor="rotate-address-toggle" textStyle="label.02">
          Move remaining STX to a fresh address
        </styled.label>
        <styled.span color="ink.text-subdued" textStyle="caption.01">
          Sends your other unlocked STX to a new account in the same transaction
        </styled.span>
      </Stack>
      <Switch.Root id="rotate-address-toggle" checked={isChecked} onCheckedChange={onToggle}>
        <Switch.Thumb />
      </Switch.Root>
    </Flex>
  );
}
