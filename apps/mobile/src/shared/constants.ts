import { LEATHER_GUIDES_URL } from '@leather.io/constants';

export const HEADER_HEIGHT = 64;

export const GITHUB_ORG = 'leather-io';
export const GITHUB_REPO = 'extension'; // TODO: we need to create 'mono' config;

export enum GuideLinks {
  Analytics = `${LEATHER_GUIDES_URL}/mobile-analytics`,
  AccountIdentifier = `${LEATHER_GUIDES_URL}/mobile-account-identifier`,
  BitcoinUnit = `${LEATHER_GUIDES_URL}/mobile-bitcoin-unit`,
  AppAuthentication = `${LEATHER_GUIDES_URL}/mobile-app-authentication`,
  RemoveWallet = `${LEATHER_GUIDES_URL}/mobile-remove-wallet`,
  SwitchNetworks = `${LEATHER_GUIDES_URL}/mobile-switch-networks`,
  AddWallet = `${LEATHER_GUIDES_URL}/mobile-add-wallet`,
}
