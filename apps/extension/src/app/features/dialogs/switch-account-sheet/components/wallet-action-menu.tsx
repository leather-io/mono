import { SwitchAccountSelectors } from '@tests/selectors/switch-account.selectors';
import { css } from 'leather-styles/css';
import { HStack, styled } from 'leather-styles/jsx';

import { DropdownMenu, EllipsisVIcon, Eye1Icon, PencilIcon, TrashIcon } from '@leather.io/ui';

import { useThemeSwitcher } from '@app/common/theme-provider';
import { WalletType } from '@app/store/common/wallet-type.selectors';

interface WalletActionMenuProps {
  walletType: WalletType;
  canRemoveWallet: boolean;
  onRename(): void;
  onRemove(): void;
  onViewSecretKey(): void;
}

export function WalletActionMenu({
  walletType,
  canRemoveWallet,
  onRename,
  onRemove,
  onViewSecretKey,
}: WalletActionMenuProps) {
  const { theme } = useThemeSwitcher();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.IconButton data-testid={SwitchAccountSelectors.WalletActionMenuTrigger}>
        <EllipsisVIcon color="ink.text-primary" />
      </DropdownMenu.IconButton>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          side="bottom"
          sideOffset={8}
          className={css({
            width: 'settingsMenuWidth',
            boxShadow: theme === 'dark' ? 'elevationDark' : 'elevationLight',
          })}
        >
          <DropdownMenu.Group>
            {walletType === 'software' && (
              <DropdownMenu.Item
                onClick={e => {
                  e.stopPropagation();
                  onViewSecretKey();
                }}
              >
                <HStack>
                  <Eye1Icon />
                  <styled.span textStyle="label.02">View Secret Key</styled.span>
                </HStack>
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Item
              onClick={e => {
                e.stopPropagation();
                onRename();
              }}
            >
              <HStack>
                <PencilIcon />
                <styled.span textStyle="label.02">Rename</styled.span>
              </HStack>
            </DropdownMenu.Item>
            {canRemoveWallet && (
              <DropdownMenu.Item
                onClick={e => {
                  e.stopPropagation();
                  onRemove();
                }}
              >
                <HStack color="red.action-primary-default">
                  <TrashIcon color="red.action-primary-default" />
                  <styled.span textStyle="label.02">Remove wallet</styled.span>
                </HStack>
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
