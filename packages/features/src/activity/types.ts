import type { OnChainActivity } from '@leather.io/models';

export type ActivityLinkClickHandler = (activityLink: string, activity: OnChainActivity) => void;

export type GetActivityLink = (activity: OnChainActivity) => string | null | undefined;

// TODO refactor these to be from the network model
export type BitcoinNetworkPreference = 'mainnet' | 'testnet4' | 'signet';
export type StacksNetworkPreference = 'mainnet' | 'testnet';
