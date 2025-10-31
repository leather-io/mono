import { whenEnvTarget } from '~/constants/environment';

const stagedFramerSite = 'https://prosperous-combination-099461.framer.app';

export const externalUrl = whenEnvTarget({
  development: stagedFramerSite,
  branch: stagedFramerSite,
  staging: stagedFramerSite,
  production: 'https://leather.io',
});

export function createExternalLeatherNavigator() {
  return {
    home: `${externalUrl}`,
    news: `${externalUrl}/news`,
    support: `${externalUrl}/support`,
    guides: `${externalUrl}/guides`,
    docs: 'https://leather.gitbook.io',
    wallet: `${externalUrl}/wallet`,
    apps: `${externalUrl}/apps`,
  };
}

export const externalLeatherNavigator = createExternalLeatherNavigator();
