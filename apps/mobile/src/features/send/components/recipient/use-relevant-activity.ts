import { toFetchState } from '@/components/loading/fetch-state';
import { type RecipientActivity } from '@/features/send/components/recipient/recipient.types';
import { useActivityByAssetIdQuery } from '@/queries/activity/activity.query';
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
