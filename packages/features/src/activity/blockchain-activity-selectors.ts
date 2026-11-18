import type { BlockchainActivity } from '@leather.io/models';

import type { FormatMoney } from './activity-balance';
import { createBlockchainActivityView } from './blockchain-activity-view';
import type {
  BlockchainActivityTranslate,
  BlockchainActivityView,
} from './blockchain-activity-view.types';

export interface BlockchainActivityViewDeps {
  formatMoney: FormatMoney;
  translate?: BlockchainActivityTranslate;
  counterpartyTruncateOffset?: number;
}

export interface BlockchainActivityItem {
  activity: BlockchainActivity;
  view: BlockchainActivityView;
}

export function createBlockchainActivityItem(
  activity: BlockchainActivity,
  deps: BlockchainActivityViewDeps
): BlockchainActivityItem {
  return { activity, view: createBlockchainActivityView(activity, deps) };
}

export function createBlockchainActivityItems(
  activities: BlockchainActivity[],
  deps: BlockchainActivityViewDeps
): BlockchainActivityItem[] {
  return activities.map(activity => createBlockchainActivityItem(activity, deps));
}

export function createBlockchainActivityViews(
  activities: BlockchainActivity[],
  deps: BlockchainActivityViewDeps
): BlockchainActivityView[] {
  return activities.map(activity => createBlockchainActivityView(activity, deps));
}
