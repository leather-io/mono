import { SwitchAccountSelectors } from '@tests/selectors/switch-account.selectors';
import { css } from 'leather-styles/css';
import { HStack, styled } from 'leather-styles/jsx';

import { DropdownMenu, EllipsisHIcon, PencilIcon, TrashIcon } from '@leather.io/ui';

import { useThemeSwitcher } from '@app/common/theme-provider';

interface PolicyActionMenuProps {
  onRename(): void;
  onRemove(): void;
}

export function PolicyActionMenu({ onRename, onRemove }: PolicyActionMenuProps) {
  const { theme } = useThemeSwitcher();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.IconButton data-testid={SwitchAccountSelectors.PolicyActionMenuTrigger}>
        <EllipsisHIcon color="ink.text-primary" />
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
                onRemove();
              }}
            >
              <HStack color="red.action-primary-default">
                <TrashIcon color="red.action-primary-default" />
                <styled.span textStyle="label.02">Remove</styled.span>
              </HStack>
            </DropdownMenu.Item>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
