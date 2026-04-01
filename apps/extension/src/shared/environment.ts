export const BRANCH = process.env.GITHUB_REF;
export const BRANCH_NAME = 'dev'; // use only dev branch name as config is now stored in leather-io/extension repo
export const PR_NUMBER = process.env.PR_NUMBER;
export const COMMIT_SHA = process.env.COMMIT_SHA;
// ts-unused-exports:disable-next-line
export const IS_DEV_ENV = process.env.WALLET_ENVIRONMENT === 'development';
export const IS_TEST_ENV = process.env.WALLET_ENVIRONMENT === 'testing';
export const MIXPANEL_TOKEN = process.env.MIXPANEL_TOKEN ?? '';
export const SENTRY_DSN = process.env.SENTRY_DSN ?? '';
export const WALLET_ENVIRONMENT = process.env.WALLET_ENVIRONMENT ?? 'unknown';

export const BITFLOW_API_HOST = process.env.BITFLOW_API_HOST ?? '';
export const BITFLOW_API_KEY = process.env.BITFLOW_API_KEY ?? '';
export const BITFLOW_READONLY_CALL_API_HOST = process.env.BITFLOW_READONLY_CALL_API_HOST ?? '';
export const BITFLOW_READONLY_CALL_API_KEY = process.env.BITFLOW_READONLY_CALL_API_KEY ?? '';
export const BITFLOW_KEEPER_API_KEY = process.env.BITFLOW_KEEPER_API_KEY ?? '';
export const BITFLOW_KEEPER_API_HOST = process.env.BITFLOW_KEEPER_API_HOST ?? '';
export const BITFLOW_PROVIDER_ADDRESS = process.env.BITFLOW_PROVIDER_ADDRESS ?? '';
export const DEBUG_TX_MONITOR = process.env.DEBUG_TX_MONITOR === 'true';
export const ONRAMPER_API_KEY = process.env.ONRAMPER_API_KEY ?? '';
export const ONRAMPER_WIDGET_HOST = process.env.ONRAMPER_WIDGET_HOST ?? '';
export const ONRAMPER_SIGNING_SECRET = process.env.ONRAMPER_SIGNING_SECRET ?? '';
