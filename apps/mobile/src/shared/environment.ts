export const BRANCH_NAME = 'dev'; //TODO: hardcoding to dev until we move the config to monorepo process.env.GITHUB_HEAD_REF ?? process.env.BRANCH_NAME;
export const WALLET_ENVIRONMENT = process.env.WALLET_ENVIRONMENT ?? 'unknown';
