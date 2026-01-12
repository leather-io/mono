import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { Box, styled } from 'leather-styles/jsx';

import { ORD_IO_URL } from '@leather.io/constants';
import { type InscriptionAsset } from '@leather.io/models';
import {
  DropdownMenu,
  EllipsisVIcon,
  ExternalLinkIcon,
  Flag,
  IconButton,
  LockIcon,
  OrdinalAvatarIcon,
  TrashIcon,
  UnlockIcon,
} from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';

import { useHoverWithChildren } from '@app/common/hooks/use-hover-with-children';
import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { useCurrentAccountDiscardedInscriptions } from '@app/store/settings/settings.selectors';

import { CollectibleAudio } from '@app/components/collectibles/collectible-audio';
import { CollectibleIframe } from '@app/components/collectibles/collectible-iframe';
import { CollectibleImage } from '@app/components/collectibles/collectible-image';
import { CollectibleOther } from '@app/components/collectibles/collectible-other';
import { HighSatValueUtxoWarning } from './high-sat-value-utxo';
import { InscriptionHtml } from './inscription-html';
import { InscriptionText } from './inscription-text';

interface InscriptionProps {
  inscription: InscriptionAsset;
}

function openInscriptionUrl(num: number) {
  return openInNewTab(`${ORD_IO_URL}/${num}`);
}

export function Inscription({ inscription }: InscriptionProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, bind] = useHoverWithChildren();
  const { hasInscriptionBeenDiscarded, discardInscription, recoverInscription } =
    useCurrentAccountDiscardedInscriptions();

  const openSendInscriptionModal = useCallback(() => {
    void navigate(RouteUrls.SendOrdinalInscription, {
      state: { inscription, backgroundLocation: location },
    });
  }, [navigate, inscription, location]);

  const content = useMemo(() => {
    const sharedProps = { onClickSend: () => openSendInscriptionModal() };
    const inscriptionTitle = `# ${inscription.number}`;
    const inscriptionSubtitle = 'Ordinal inscription';
    switch (inscription.mimeType) {
      case 'audio':
        return (
          <CollectibleAudio
            icon={<OrdinalAvatarIcon size="lg" />}
            key={inscription.title}
            subtitle={inscriptionSubtitle}
            title={inscriptionTitle}
            {...sharedProps}
          />
        );
      case 'html':
        return (
          <InscriptionHtml
            contentSrc={inscription.src}
            subtitle={inscriptionSubtitle}
            title={inscriptionTitle}
            {...sharedProps}
          />
        );
      case 'svg':
      case 'video':
      case 'gltf':
        return (
          <CollectibleIframe
            icon={<OrdinalAvatarIcon size="lg" />}
            key={inscription.title}
            src={inscription.src}
            subtitle={inscriptionSubtitle}
            title={inscriptionTitle}
            {...sharedProps}
          />
        );
      case 'image':
        return (
          <CollectibleImage
            icon={<OrdinalAvatarIcon size="lg" />}
            key={inscription.title}
            src={inscription.src}
            subtitle={inscriptionSubtitle}
            title={inscriptionTitle}
            {...sharedProps}
          />
        );
      case 'text':
        return (
          <InscriptionText
            contentSrc={inscription.src}
            inscriptionNumber={inscription.number}
            {...sharedProps}
          />
        );
      case 'other':
        return (
          <CollectibleOther
            key={inscription.title}
            subtitle="Ordinal inscription"
            title={`# ${inscription.number}`}
            {...sharedProps}
          >
            <OrdinalAvatarIcon size="lg" />
          </CollectibleOther>
        );
      default:
        return null;
    }
  }, [
    inscription.mimeType,
    inscription.number,
    inscription.src,
    inscription.title,
    openSendInscriptionModal,
  ]);

  return (
    <Box position="relative" {...bind}>
      <Box opacity={hasInscriptionBeenDiscarded(inscription) ? 0.5 : 1}>{content}</Box>
      {isHovered && (
        <Box
          border="1px solid"
          borderColor="ink.text-primary"
          borderRadius="2px"
          bg="ink.background-primary"
          position="absolute"
          right="space.03"
          top="space.03"
          zIndex="900"
        >
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton
                _focus={{ outline: 'focus' }}
                _hover={{ bg: 'ink.component-background-hover' }}
                bg="ink.background-primary"
                transform="rotate(90deg)"
                color="ink.action-primary-default"
                icon={<EllipsisVIcon />}
              />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              align="end"
              side="bottom"
              sideOffset={4}
              style={{ padding: '8px' }}
            >
              <DropdownMenu.Item onClick={() => openInscriptionUrl(inscription.number)}>
                <Flag img={<ExternalLinkIcon />} width="100%">
                  <styled.span textStyle="label.02">Open original</styled.span>
                </Flag>
              </DropdownMenu.Item>
              {hasInscriptionBeenDiscarded(inscription) ? (
                <DropdownMenu.Item onClick={() => recoverInscription(inscription)}>
                  <Flag img={<LockIcon />} width="100%">
                    <styled.span textStyle="label.02">Protect</styled.span>
                  </Flag>
                </DropdownMenu.Item>
              ) : (
                <DropdownMenu.Item onClick={() => discardInscription(inscription)}>
                  <Flag img={<UnlockIcon />} width="100%">
                    <styled.span textStyle="label.02">Unprotect</styled.span>
                  </Flag>
                </DropdownMenu.Item>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Box>
      )}

      <HighSatValueUtxoWarning inscription={inscription} />

      {hasInscriptionBeenDiscarded(inscription) && (
        <Box
          p="space.02"
          borderRadius="xs"
          border="1px solid"
          borderColor="ink.border-transparent"
          background="ink.background-secondary"
          position="absolute"
          bottom="134px"
          left="18px"
        >
          <Flag opacity={0.5} spacing="space.01" img={<TrashIcon variant="small" />} width="100%">
            Unprotected
          </Flag>
        </Box>
      )}
    </Box>
  );
}
