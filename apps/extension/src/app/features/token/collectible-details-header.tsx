import { Flex, Stack, styled } from 'leather-styles/jsx';

import {
  ArrowLeftIcon,
  DropdownMenu,
  EllipsisVIcon,
  ExternalLinkIcon,
  Flag,
  IconButton,
  LockIcon,
  UnlockIcon,
} from '@leather.io/ui';

import { Header } from '@app/components/layout/headers/header';
import { HeaderActionButton } from '@app/components/layout/headers/header-action-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';

interface CollectibleDetailsHeaderProps {
  title: string;
  subtitle?: string;
  onBack(): void;
  onViewOriginal?(): void;
  onToggleProtection?(): void;
  isProtected?: boolean;
}

export function CollectibleDetailsHeader({
  title,
  subtitle,
  onBack,
  onViewOriginal,
  onToggleProtection,
  isProtected,
}: CollectibleDetailsHeaderProps) {
  const hasMenuActions = onViewOriginal || onToggleProtection;

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
        centerCol={
          <Stack alignItems="center" gap="space.01">
            <styled.span textStyle="heading.05">{title}</styled.span>
            {subtitle ? (
              <styled.span textStyle="caption.02" color="ink.text-subdued">
                {subtitle}
              </styled.span>
            ) : null}
          </Stack>
        }
        rightCol={
          hasMenuActions ? (
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
                  {onViewOriginal && (
                    <DropdownMenu.Item
                      onClick={onViewOriginal}
                      data-testid="view-original-menu-item"
                    >
                      <Flag img={<ExternalLinkIcon />} width="100%">
                        <styled.span textStyle="label.02">View original</styled.span>
                      </Flag>
                    </DropdownMenu.Item>
                  )}
                  {onToggleProtection && (
                    <DropdownMenu.Item
                      onClick={onToggleProtection}
                      data-testid={isProtected ? 'unprotect-menu-item' : 'protect-menu-item'}
                    >
                      <Flag img={isProtected ? <UnlockIcon /> : <LockIcon />} width="100%">
                        <styled.span textStyle="label.02">
                          {isProtected ? 'Unprotect' : 'Protect'}
                        </styled.span>
                      </Flag>
                    </DropdownMenu.Item>
                  )}
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </Flex>
          ) : null
        }
      />
    </Header>
  );
}
