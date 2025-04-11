export function createExternalLeatherNavigator() {
  const baseUrl = 'https://leather.io';

  return {
    home: baseUrl,
    blog: `${baseUrl}/blog`,
    support: `${baseUrl}/support`,
    guides: `${baseUrl}/guides`,
    docs: 'https://leather.gitbook.io',
  };
}

export const externalLeatherNavigator = createExternalLeatherNavigator();
