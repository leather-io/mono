import { Flex, Stack, styled } from 'leather-styles/jsx';

import {
  ArrowLeftIcon,
  DropdownMenu,
  EllipsisVIcon,
  ExternalLinkIcon,
  Flag,
  IconButton,
  PaperPlaneIcon,
} from '@leather.io/ui';

import { Header } from '@app/components/layout/headers/header';
import { HeaderActionButton } from '@app/components/layout/headers/header-action-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';

interface CollectibleTitleProps {
  title: string;
  subtitle?: string;
}

function CollectibleTitle({ title, subtitle }: CollectibleTitleProps) {
  return (
    <Stack alignItems="center" gap="space.01">
      <styled.span textStyle="heading.05">{title}</styled.span>
      {subtitle ? (
        <styled.span textStyle="caption.02" color="ink.text-subdued">
          {subtitle}
        </styled.span>
      ) : null}
    </Stack>
  );
}

interface CollectibleOptionsMenuProps {
  onSend?(): void;
  onViewOriginal?(): void;
}

function CollectibleOptionsMenu({ onSend, onViewOriginal }: CollectibleOptionsMenuProps) {
  return (
    <Flex alignItems="center">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <IconButton
            _focus={{ outline: 'focus' }}
            _hover={{ bg: 'ink.component-background-hover' }}
            color="ink.action-primary-default"
            icon={<EllipsisVIcon />}
            data-testid="collectible-details-options"
          />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" side="bottom" sideOffset={4}>
          {onSend && (
            <DropdownMenu.Item onClick={onSend} data-testid="collectible-send-menu-item">
              <Flag img={<PaperPlaneIcon />} width="100%">
                <styled.span textStyle="label.02">Send</styled.span>
              </Flag>
            </DropdownMenu.Item>
          )}
          {onViewOriginal && (
            <DropdownMenu.Item onClick={onViewOriginal} data-testid="view-original-menu-item">
              <Flag img={<ExternalLinkIcon />} width="100%">
                <styled.span textStyle="label.02">View original</styled.span>
              </Flag>
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Flex>
  );
}

interface CollectibleDetailsHeaderProps {
  title: string;
  subtitle?: string;
  onBack(): void;
  onSend?(): void;
  onViewOriginal?(): void;
}

export function CollectibleDetailsHeader({
  title,
  subtitle,
  onBack,
  onSend,
  onViewOriginal,
}: CollectibleDetailsHeaderProps) {
  const hasMenuActions = onSend || onViewOriginal;

  return (
    <Header px={{ base: 'space.04', md: 'space.00' }}>
      <HeaderGrid
        leftCol={
          <HeaderActionButton
            icon={<ArrowLeftIcon />}
            onAction={onBack}
            dataTestId="collectible-details-back"
          />
        }
        centerCol={<CollectibleTitle title={title} subtitle={subtitle} />}
        rightCol={
          hasMenuActions ? (
            <Flex justifyContent="flex-end">
              <CollectibleOptionsMenu onSend={onSend} onViewOriginal={onViewOriginal} />
            </Flex>
          ) : null
        }
      />
    </Header>
  );
}
