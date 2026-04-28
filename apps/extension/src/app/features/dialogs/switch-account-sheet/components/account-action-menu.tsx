import { css } from 'leather-styles/css';
import { HStack, styled } from 'leather-styles/jsx';

import { DropdownMenu, EllipsisVIcon, Eye1ClosedIcon, PencilIcon } from '@leather.io/ui';

import { useThemeSwitcher } from '@app/common/theme-provider';

interface AccountActionMenuProps {
  isHidden: boolean;
  onHide(): void;
  onRename(): void;
}

export function AccountActionMenu({ isHidden, onHide, onRename }: AccountActionMenuProps) {
  const { theme } = useThemeSwitcher();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.IconButton>
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
            <DropdownMenu.Item
              onClick={e => {
                e.stopPropagation();
                onHide();
              }}
            >
              <HStack>
                <Eye1ClosedIcon />
                <styled.span textStyle="label.02">{isHidden ? 'Show' : 'Hide'}</styled.span>
              </HStack>
            </DropdownMenu.Item>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
