import { assertExistence } from '@leather.io/utils';

export const BRANCH_NAME = 'dev'; //TODO: hardcoding to dev until we move the config to monorepo process.env.GITHUB_HEAD_REF ?? process.env.BRANCH_NAME;

export function isProduction() {
  return process.env.EXPO_PUBLIC_NODE_ENV === 'production';
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
