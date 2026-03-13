import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { Box, styled } from 'leather-styles/jsx';

import { ORD_IO_URL } from '@leather.io/constants';
import type { InscriptionAsset } from '@leather.io/models';
import {
  DropdownMenu,
  EllipsisVIcon,
  ExternalLinkIcon,
  Flag,
  IconButton,
  LockIcon,
  PaperPlaneIcon,
  TrashIcon,
  UnlockIcon,
} from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';

import { useHoverWithChildren } from '@app/common/hooks/use-hover-with-children';
import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { useCurrentAccountDiscardedInscriptions } from '@app/store/settings/settings.selectors';

import { InscriptionCard } from './inscription-card';

interface InscriptionCardActionsProps {
  item: InscriptionAsset;
  onSelect?(asset: InscriptionAsset): void;
}

export function InscriptionCardActions({ item, onSelect }: InscriptionCardActionsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, bind] = useHoverWithChildren();
  const { hasInscriptionBeenDiscarded, discardInscriptions, recoverInscriptions } =
    useCurrentAccountDiscardedInscriptions();

  const isDiscarded = hasInscriptionBeenDiscarded(item);

  const openSendInscriptionModal = useCallback(() => {
    void navigate(`/${RouteUrls.SendOrdinalInscription}`, {
      state: { inscription: item, backgroundLocation: location },
    });
  }, [navigate, item, location]);

  return (
    <Box position="relative" _hover={{ bg: 'ink.background-secondary' }} width="100%" {...bind}>
      <Box opacity={isDiscarded ? 0.5 : 1}>
        <InscriptionCard item={item} onSelect={onSelect} />
      </Box>

      {isDiscarded && (
        <Box
          p="space.02"
          borderRadius="xs"
          border="1px solid"
          borderColor="ink.border-transparent"
          bg="ink.background-secondary"
          position="absolute"
          bottom="space.05"
          left="space.04"
          data-testid="inscription-unprotected-label"
        >
          <Flag opacity={0.5} spacing="space.01" img={<TrashIcon variant="small" />} width="100%">
            Unprotected
          </Flag>
        </Box>
      )}

      {isHovered && (
        <Box position="absolute" right="space.03" top="space.03" zIndex="900">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <IconButton
                _hover={{ bg: 'ink.background-secondary' }}
                bg="ink.background-primary"
                transform="rotate(90deg)"
                color="ink.action-primary-default"
                icon={<EllipsisVIcon />}
                data-testid="inscription-card-menu-trigger"
              />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                side="bottom"
                sideOffset={4}
                style={{ padding: '8px' }}
              >
                <DropdownMenu.Item
                  onSelect={openSendInscriptionModal}
                  data-testid="inscription-menu-send"
                >
                  <Flag img={<PaperPlaneIcon />} width="100%">
                    <styled.span textStyle="label.02">Send</styled.span>
                  </Flag>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => openInNewTab(`${ORD_IO_URL}/${item.number}`)}
                  data-testid="inscription-menu-open-original"
                >
                  <Flag img={<ExternalLinkIcon />} width="100%">
                    <styled.span textStyle="label.02">Open original</styled.span>
                  </Flag>
                </DropdownMenu.Item>
                {isDiscarded ? (
                  <DropdownMenu.Item
                    onSelect={() => recoverInscriptions(item)}
                    data-testid="inscription-menu-protect"
                  >
                    <Flag img={<LockIcon />} width="100%">
                      <styled.span textStyle="label.02">Protect</styled.span>
                    </Flag>
                  </DropdownMenu.Item>
                ) : (
                  <DropdownMenu.Item
                    onSelect={() => discardInscriptions(item)}
                    data-testid="inscription-menu-unprotect"
                  >
                    <Flag img={<UnlockIcon />} width="100%">
                      <styled.span textStyle="label.02">Unprotect</styled.span>
                    </Flag>
                  </DropdownMenu.Item>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </Box>
      )}
    </Box>
  );
}
