import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { useQuery } from '@tanstack/react-query';
import { CollectiblesSelectors } from '@tests/selectors/collectibles.selectors';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { Stack } from 'leather-styles/jsx';

import type { CollectibleView } from '@leather.io/features';
import { createCollectibleTransferBlockerQueryConfig } from '@leather.io/queries';
import type { CollectibleTransferBlocker } from '@leather.io/services';
import { ErrorCircleIcon, ErrorTriangleIcon, InfoCircleIcon } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';
import { replaceRouteParams } from '@shared/utils/replace-route-params';

import { WarningSheet } from '@app/components/warning-sheet/warning-sheet';
import { useUserSettings } from '@app/hooks/use-user-settings';
import {
  getCollectibleTransferBlockerMessage,
  getCollectibleTransferBlockerTitle,
} from '@app/pages/send/send-collectible/send-collectible.utils';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

import { Sip9Card } from '../collectibles/components/sip9-card';
import { CollectibleDetailsHeader } from './collectible-details-header';
import { CollectibleDetailsPageLayout } from './collectible-details-page.layout';
import { TokenDetailsPillButton } from './components/token-details-actions';
import { Sip9Details } from './sip9-details';

type TransferSheet = 'blocked' | 'check-failed';

function getTransferBlockerIcon(blocker: CollectibleTransferBlocker) {
  if (blocker === 'unsupported-contract') return <ErrorCircleIcon />;
  return <InfoCircleIcon />;
}

interface Sip9DetailsPageProps {
  view: CollectibleView;
  onBack(): void;
}

export function Sip9DetailsPage({ view, onBack }: Sip9DetailsPageProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isSendRequested, setIsSendRequested] = useState(false);
  const [openTransferSheet, setOpenTransferSheet] = useState<TransferSheet | null>(null);
  const navigate = useNavigate();
  const policy = useCurrentPolicy();
  const settings = useUserSettings();
  const canSend = view.kind !== 'legacy-bns' && !policy;

  const asset = view.asset;
  const title = view.title || 'Stacks NFT';
  const subtitle = view.subtitle;

  const transferBlocker = useQuery({
    ...createCollectibleTransferBlockerQueryConfig(asset, settings),
    enabled: canSend,
  });
  const isCheckingTransfer =
    transferBlocker.isPending || (transferBlocker.isError && transferBlocker.isFetching);

  useEffect(() => {
    if (!isSendRequested || isCheckingTransfer) return;
    setIsSendRequested(false);
    if (transferBlocker.isError) {
      setOpenTransferSheet('check-failed');
      return;
    }
    if (transferBlocker.data) {
      setOpenTransferSheet('blocked');
      return;
    }
    void navigate(
      replaceRouteParams(RouteUrls.SendCollectible, {
        assetId: asset.assetId,
        tokenId: asset.tokenId,
      })
    );
  }, [
    isSendRequested,
    isCheckingTransfer,
    transferBlocker.isError,
    transferBlocker.data,
    navigate,
    asset.assetId,
    asset.tokenId,
  ]);

  function closeTransferSheet() {
    setOpenTransferSheet(null);
  }

  function retryTransferCheck() {
    setOpenTransferSheet(null);
    setIsSendRequested(true);
    void transferBlocker.refetch();
  }

  return (
    <Stack
      width="100%"
      gap="space.04"
      data-testid={CollectiblesSelectors.CollectibleDetailsContainer}
    >
      <CollectibleDetailsHeader title={title} subtitle={subtitle} onBack={onBack} />
      <CollectibleDetailsPageLayout
        protocol="sip9"
        media={<Sip9Card item={asset} kind={view.kind} />}
        actions={
          canSend && (
            <TokenDetailsPillButton
              label="Send"
              testId={CollectiblesSelectors.CollectibleSendBtn}
              isLoading={isSendRequested}
              onClick={() => setIsSendRequested(true)}
            />
          )
        }
      >
        <Sip9Details
          asset={asset}
          kind={view.kind}
          isDescriptionExpanded={isDescriptionExpanded}
          onToggleDescription={() => setIsDescriptionExpanded(v => !v)}
        />
      </CollectibleDetailsPageLayout>
      {transferBlocker.data && (
        <WarningSheet
          data-testid={SendCryptoAssetSelectors.SendCollectibleTransferBlocked}
          isShowing={openTransferSheet === 'blocked'}
          onClose={closeTransferSheet}
          icon={getTransferBlockerIcon(transferBlocker.data)}
          title={getCollectibleTransferBlockerTitle(transferBlocker.data)}
          body={getCollectibleTransferBlockerMessage(transferBlocker.data)}
          primaryAction={{ label: 'Got it', onClick: closeTransferSheet }}
        />
      )}
      <WarningSheet
        isShowing={openTransferSheet === 'check-failed'}
        onClose={closeTransferSheet}
        icon={<ErrorTriangleIcon />}
        title="Unable to check this collectible"
        body="Try again in a few moments."
        primaryAction={{ label: 'Try again', onClick: retryTransferCheck }}
        secondaryAction={{ label: 'Close', onClick: closeTransferSheet }}
      />
    </Stack>
  );
}
