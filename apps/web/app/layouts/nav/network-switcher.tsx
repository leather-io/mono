import type { StacksNetworkName } from '@stacks/network';
import { Flex, styled } from 'leather-styles/jsx';
import { multisigEnabled } from '~/pages/multisig/multisig.constants';
import { useStacksNetwork } from '~/store/stacks-network';

import { CheckmarkIcon, ChevronDownIcon, DropdownMenu } from '@leather.io/ui';

// Driven by a list so more networks (and eventually custom ones) can be added
// here without changing the control. Custom networks also need the underlying
// network model widened; this is just the UI shape to grow into.
const networkOptions: { value: StacksNetworkName; label: string }[] = [
  { value: 'mainnet', label: 'Mainnet' },
  { value: 'testnet', label: 'Testnet' },
];

// Global network switcher. Behind the multisig feature flag for now: the rest of
// the app is mainnet-only, so switching is only meaningful where testnet is
// supported (routes that aren't fall back to the NetworkGate).
export function NetworkSwitcher() {
  const { networkName, setNetworkName } = useStacksNetwork();
  if (!multisigEnabled) return null;

  const active = networkOptions.find(option => option.value === networkName) ?? networkOptions[0];

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <styled.button
          type="button"
          aria-label="Switch network"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
          mx="space.04"
          mb="space.04"
          px="space.03"
          py="space.02"
          borderRadius="sm"
          bg="ink.background-secondary"
          color="ink.text-primary"
          textStyle="label.02"
          cursor="pointer"
        >
          {active.label}
          <ChevronDownIcon variant="small" />
        </styled.button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={6} align="start">
          <styled.div width="220px" py="space.02">
            {networkOptions.map(option => (
              <DropdownMenu.Item key={option.value} onSelect={() => setNetworkName(option.value)}>
                <Flex
                  alignItems="center"
                  justifyContent="space-between"
                  width="100%"
                  gap="space.04"
                >
                  <styled.span textStyle="label.02">{option.label}</styled.span>
                  {option.value === networkName && <CheckmarkIcon variant="small" />}
                </Flex>
              </DropdownMenu.Item>
            ))}
          </styled.div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
