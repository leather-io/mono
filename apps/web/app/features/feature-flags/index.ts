import { asyncWithLDProvider, useFlags } from 'launchdarkly-react-client-sdk';
import { VERSION } from '~/constants/constants';
import { getClientId } from '~/utils/client-id';

export function createLDProvider() {
  return asyncWithLDProvider({
    clientSideID: import.meta.env.LEATHER_LAUNCH_DARKLY_KEY ?? '',
    options: {
      application: {
        id: 'leather-web',
        version: VERSION,
      },
    },
    context: {
      kind: 'clientId',
      key: getClientId(),
    },
    reactOptions: { useCamelCaseFlagKeys: false },
  });
}

export function useWebPortfolioFlag() {
  const { web_portfolio } = useFlags<{ web_portfolio: boolean }>();
  return web_portfolio ?? false;
}
