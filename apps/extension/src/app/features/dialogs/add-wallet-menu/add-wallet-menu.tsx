import { css } from 'leather-styles/css';
import { HStack, styled } from 'leather-styles/jsx';

import {
  ArrowRotateClockwiseIcon,
  Button,
  DropdownMenu,
  LedgerIcon,
  PlusIcon,
  WalletPlusIcon,
} from '@leather.io/ui';

import { useThemeSwitcher } from '@app/common/theme-provider';

interface AddWalletMenuProps {
  onCreateNewWallet(): void;
  onRestoreWallet(): void;
  onConnectLedger(): void;
}

export function AddWalletMenu({
  onCreateNewWallet,
  onRestoreWallet,
  onConnectLedger,
}: AddWalletMenuProps) {
  const { theme } = useThemeSwitcher();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline" flex={1} iconStart={<WalletPlusIcon />}>
          Add wallet
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          side="top"
          sideOffset={8}
          className={css({
            width: 'settingsMenuWidth',
            boxShadow: theme === 'dark' ? 'elevationDark' : 'elevationLight',
          })}
        >
          <DropdownMenu.Group>
            <DropdownMenu.Item
              onClick={e => {
                e.stopPropagation();
                onCreateNewWallet();
              }}
            >
              <HStack>
                <PlusIcon />
                <styled.span textStyle="label.02">Create new wallet</styled.span>
              </HStack>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={e => {
                e.stopPropagation();
                onRestoreWallet();
              }}
            >
              <HStack>
                <ArrowRotateClockwiseIcon />
                <styled.span textStyle="label.02">Restore wallet</styled.span>
              </HStack>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={e => {
                e.stopPropagation();
                onConnectLedger();
              }}
            >
              <HStack>
                <LedgerIcon />
                <styled.span textStyle="label.02">Connect hardware wallet</styled.span>
              </HStack>
            </DropdownMenu.Item>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
