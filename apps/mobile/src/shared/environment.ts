export const BRANCH_NAME = 'dev'; //TODO: hardcoding to dev until we move the config to monorepo process.env.GITHUB_HEAD_REF ?? process.env.BRANCH_NAME;

export function isProduction() {
  return process.env.EXPO_PUBLIC_NODE_ENV === 'production';
}
