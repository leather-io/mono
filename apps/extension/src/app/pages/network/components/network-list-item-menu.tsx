import { NetworkSelectors } from '@tests/selectors/network.selectors';
import { css } from 'leather-styles/css';
import { HStack, styled } from 'leather-styles/jsx';

import { BasicTooltip, DropdownMenu, EllipsisVIcon, PencilIcon, TrashIcon } from '@leather.io/ui';

import { useThemeSwitcher } from '@app/common/theme-provider';

interface Props {
  isPolicyLocked: boolean;
  onEditNetwork(): void;
  onClickDeleteNetwork(): void;
}

const editDisabledTooltip = 'Remove multisig policies before editing this network.';
const deleteDisabledTooltip = 'Remove multisig policies before deleting this network.';

export function NetworkItemMenu({ isPolicyLocked, onClickDeleteNetwork, onEditNetwork }: Props) {
  const { theme } = useThemeSwitcher();
  const editColor = isPolicyLocked ? 'ink.text-non-interactive' : 'ink.text-primary';
  const deleteColor = isPolicyLocked ? 'ink.text-non-interactive' : 'red.action-primary-default';
  return (
    <DropdownMenu.Root>
      <DropdownMenu.IconButton data-testid={NetworkSelectors.NetworkMenuBtn}>
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
            <BasicTooltip
              asChild
              disabled={!isPolicyLocked}
              label={editDisabledTooltip}
              side="left"
            >
              <DropdownMenu.Item
                data-testid={NetworkSelectors.EditNetworkMenuBtn}
                disabled={isPolicyLocked}
                onClick={
                  isPolicyLocked
                    ? undefined
                    : e => {
                        e.stopPropagation();
                        onEditNetwork();
                      }
                }
              >
                <HStack color={editColor}>
                  <PencilIcon color={editColor} />
                  <styled.span textStyle="label.02">Edit</styled.span>
                </HStack>
              </DropdownMenu.Item>
            </BasicTooltip>
            <BasicTooltip
              asChild
              disabled={!isPolicyLocked}
              label={deleteDisabledTooltip}
              side="left"
            >
              <DropdownMenu.Item
                data-testid={NetworkSelectors.DeleteNetworkMenuBtn}
                disabled={isPolicyLocked}
                onClick={
                  isPolicyLocked
                    ? undefined
                    : e => {
                        e.stopPropagation();
                        onClickDeleteNetwork();
                      }
                }
              >
                <HStack color={deleteColor}>
                  <TrashIcon color={deleteColor} />
                  <styled.span textStyle="label.02">Delete</styled.span>
                </HStack>
              </DropdownMenu.Item>
            </BasicTooltip>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
