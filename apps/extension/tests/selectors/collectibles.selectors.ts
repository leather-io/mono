export const CollectiblesSelectors = {
  CollectibleCardSip9: 'collectible-card-sip9',
  ManageCollectiblesBtn: 'manage-collectibles-btn',
  RefreshCollectibles: 'refresh-collectibles',
} as const;
export type CollectiblesSelectors =
  (typeof CollectiblesSelectors)[keyof typeof CollectiblesSelectors];
