import { type RecipientActivity } from '@/features/send/components/recipient/recipient.types';
import { useActivityByAssetIdQuery } from '@/queries/activity/activity.query';
import { type FetchState, toFetchState } from '@/queries/fetch-state';
import { filter, isDefined, map, pipe } from 'remeda';

import {
  type AccountId,
  type BlockchainActivity,
  type FungibleCryptoAsset,
} from '@leather.io/models';
import { getAssetId } from '@leather.io/utils';

interface UseRelevantActivityProps {
  asset: FungibleCryptoAsset;
  currentAccount: AccountId;
}

export function useRelevantActivity({ asset, currentAccount }: UseRelevantActivityProps) {
  const { fingerprint, accountIndex } = currentAccount;
  return toFetchState(
    useActivityByAssetIdQuery(
      fingerprint,
      accountIndex,
      getAssetId(asset),
      selectRelevantSendActivity
    )
  );
}

function selectRelevantSendActivity(activities: BlockchainActivity[]) {
  return pipe(activities, filter(isSendActivity), map(toRecipientActivity), filter(hasReceivers));
}

function isSendActivity(activity: BlockchainActivity) {
  return activity.action === 'send';
}

function toRecipientActivity(activity: BlockchainActivity): RecipientActivity {
  return {
    txid: activity.txid,
    timestamp: activity.timestamp,
    receivers: activity.counterparty ? [activity.counterparty] : [],
  };
}

function hasReceivers(activity: RecipientActivity) {
  return isDefined(activity.receivers[0]) && activity.receivers[0].length !== 0;
}

interface MatchRelevantActivityResult {
  result: FetchState<RecipientActivity[]>;
  loading: React.ReactNode;
  error(error: string): React.ReactNode;
  success(data: RecipientActivity[]): React.ReactNode;
}

export function matchRelevantActivityResult({
  error,
  loading,
  result,
  success,
}: MatchRelevantActivityResult) {
  if (result.state === 'loading') return loading;
  if (result.state === 'error') return error(result.errorMessage);
  return success(result.value);
}
