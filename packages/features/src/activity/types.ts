import type { OnChainActivity } from '@leather.io/models';

export type ActivityLinkClickHandler = (activityLink: string, activity: OnChainActivity) => void;

export type GetActivityLink = (activity: OnChainActivity) => string | null | undefined;
