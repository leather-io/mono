import { type ReactNode } from 'react';

import { Flex, styled } from 'leather-styles/jsx';

import { Button, Popover, SettingsSliderIcon } from '@leather.io/ui';

import { useMultisigActions } from '../../store/use-multisig';
import { TransactionTools } from './transaction-tools';

function ToolRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Flex direction="column" gap="space.02">
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        {label}
      </styled.span>
      <Flex alignItems="center" gap="space.01">
        {children}
      </Flex>
    </Flex>
  );
}

export function DevToolsPanel() {
  const { resetSession } = useMultisigActions();
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <styled.button
          type="button"
          aria-label="Open dev tools"
          position="fixed"
          bottom="space.05"
          right="space.05"
          zIndex={90}
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="44px"
          height="44px"
          borderRadius="round"
          bg="ink.text-primary"
          color="ink.background-primary"
          boxShadow="elevationLight"
          cursor="pointer"
          transition="transform 160ms ease"
          _hover={{ transform: 'scale(1.05)' }}
          _active={{ transform: 'scale(0.97)' }}
        >
          <SettingsSliderIcon color="ink.background-primary" />
        </styled.button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content side="top" align="end" aria-label="Dev tools">
          <Flex direction="column" gap="space.04" minWidth="260px">
            <styled.span textStyle="label.02">Dev tools</styled.span>
            <ToolRow label="Preview data">
              <Button variant="ghost" size="sm" onClick={() => resetSession('seed')}>
                Populated
              </Button>
              <Button variant="ghost" size="sm" onClick={() => resetSession('empty')}>
                Empty
              </Button>
            </ToolRow>
            <TransactionTools />
          </Flex>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
