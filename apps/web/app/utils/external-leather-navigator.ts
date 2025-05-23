import { whenEnvTarget } from '~/constants/environment';

const stagedFramerSite = 'https://prosperous-combination-099461.framer.app';

export function createExternalLeatherNavigator() {
  const externalUrl = whenEnvTarget({
    development: stagedFramerSite,
    branch: stagedFramerSite,
    staging: stagedFramerSite,
    production: 'https://leather.io',
  });

  return {
    home: `${externalUrl}`,
    blog: `${externalUrl}/blog`,
    support: `${externalUrl}/support`,
    guides: `${externalUrl}/guides`,
    docs: 'https://leather.gitbook.io',
    wallet: `${externalUrl}/wallet`,
    apps: `${externalUrl}/apps`,
    news: `${externalUrl}/news`,
  };
}

export const externalLeatherNavigator = createExternalLeatherNavigator();
