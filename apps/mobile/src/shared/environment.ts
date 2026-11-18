import { assertExistence } from '@leather.io/utils';

export function isProduction() {
  return process.env.EXPO_PUBLIC_NODE_ENV === 'production';
}

export function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

export function getAppEnvironment() {
  return process.env.EXPO_PUBLIC_NODE_ENV ?? 'development';
}

export function getLeatherApiUrl() {
  return process.env.EXPO_PUBLIC_LEATHER_API_URL;
}

export function getBitflowEnv() {
  return {
    bitflowApiHost: process.env.EXPO_PUBLIC_BITFLOW_API_HOST ?? '',
    bitflowApiKey: process.env.EXPO_PUBLIC_BITFLOW_API_KEY ?? '',
    bitflowProviderAddress: process.env.EXPO_PUBLIC_BITFLOW_PROVIDER_ADDRESS ?? '',
    keeperApiHost: process.env.EXPO_PUBLIC_BITFLOW_KEEPER_API_HOST ?? '',
    keeperApiKey: process.env.EXPO_PUBLIC_BITFLOW_KEEPER_API_KEY ?? '',
  };
}

export function getLaunchDarklyClientId() {
  return process.env.EXPO_PUBLIC_LAUNCH_DARKLY ?? '';
}

export function getMixpanelToken() {
  return process.env.EXPO_PUBLIC_MIXPANEL_TOKEN;
}

export function getSentryDsn() {
  return process.env.EXPO_PUBLIC_SENTRY_DSN;
}

export function getOnramperEnv() {
  assertExistence(
    process.env.EXPO_PUBLIC_ONRAMPER_API_KEY,
    'EXPO_PUBLIC_ONRAMPER_API_KEY should be set'
  );
  assertExistence(
    process.env.EXPO_PUBLIC_ONRAMPER_SIGNING_SECRET,
    'EXPO_PUBLIC_ONRAMPER_SIGNING_SECRET should be set'
  );
  assertExistence(
    process.env.EXPO_PUBLIC_ONRAMPER_WIDGET_HOST,
    'EXPO_PUBLIC_ONRAMPER_WIDGET_HOST should be set'
  );
  return {
    apiKey: process.env.EXPO_PUBLIC_ONRAMPER_API_KEY,
    signingSecret: process.env.EXPO_PUBLIC_ONRAMPER_SIGNING_SECRET,
    widgetHost: process.env.EXPO_PUBLIC_ONRAMPER_WIDGET_HOST,
  };
}
