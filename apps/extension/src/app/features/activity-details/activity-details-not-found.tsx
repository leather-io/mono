import { ActivitySelectors } from '@tests/selectors/activity.selectors';
import { Stack, styled } from 'leather-styles/jsx';

import type { CryptoAssetChain } from '@leather.io/models';

import { DetailsPillButton } from '@app/components/details/details-pill-button';
import { DetailsScreen } from '@app/components/details/details-screen';

import { ActivityDetailsHeader } from './activity-details-header';
import { useOpenActivityInExplorer } from './use-open-activity-in-explorer';

interface ActivityDetailsNotFoundProps {
  chain?: CryptoAssetChain;
  txid?: string;
  onBack(): void;
}

export function ActivityDetailsNotFound({ chain, txid, onBack }: ActivityDetailsNotFoundProps) {
  const openInExplorer = useOpenActivityInExplorer();

  return (
    <DetailsScreen
      header={<ActivityDetailsHeader onBack={onBack} />}
      testId={ActivitySelectors.ActivityDetails}
      overview={
        <Stack bg="ink.background-primary" alignItems="center" p="space.05" gap="space.04">
          <styled.span textStyle="label.01" color="ink.text-subdued">
            Transaction not found
          </styled.span>
          {chain && txid ? (
            <DetailsPillButton
              label="View in explorer"
              onClick={() => openInExplorer(chain, txid)}
              testId={ActivitySelectors.ActivityDetailsExplorer}
            />
          ) : null}
        </Stack>
      }
    >
      {null}
    </DetailsScreen>
  );
}
