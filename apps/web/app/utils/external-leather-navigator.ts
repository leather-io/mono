export function createExternalLeatherNavigator() {
  const externalUrl =
    import.meta.env.MODE === 'production'
      ? 'https://leather.io'
      : 'https://prosperous-combination-099461.framer.app/earn-new';

  return {
    home: `${externalUrl}/home`,
    blog: `${externalUrl}/blog`,
    support: `${externalUrl}/support`,
    guides: `${externalUrl}/guides`,
    docs: 'https://leather.gitbook.io',
    wallet: `${externalUrl}/wallet`,
    apps: `${externalUrl}/apps`,
  };
}

export const externalLeatherNavigator = createExternalLeatherNavigator();
