export const CollectiblesSelectors = {
  CollectibleCardSip9: 'collectible-card-sip9',
  CollectibleDetailsContainer: 'collectible-details-container',
  CollectiblesEmpty: 'collectibles-empty',
  ManageCollectiblesBtn: 'manage-collectibles-btn',
  RefreshCollectibles: 'refresh-collectibles',
} as const;
export type CollectiblesSelectors =
  (typeof CollectiblesSelectors)[keyof typeof CollectiblesSelectors];
