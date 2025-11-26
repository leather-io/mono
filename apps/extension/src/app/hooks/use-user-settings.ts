import { useMemo } from 'react';

import type { UserSettings } from '@leather.io/services';
import { serializeAssetId } from '@leather.io/utils';

import { useUserAllTokens } from '../store/manage-tokens/manage-tokens.slice';
import { useCurrentNetwork } from '../store/networks/networks.selectors';

export function useUserSettings(): UserSettings {
  const network = useCurrentNetwork();
  const tokenSettings = useUserAllTokens();

  const assetVisibility = useMemo(
    () =>
      Object.fromEntries(
        tokenSettings.map(tokenSetting => [
          serializeAssetId({
            protocol: tokenSetting.id.includes('::') ? 'sip10' : 'rune',
            id: tokenSetting.id,
          }),
          tokenSetting.enabled,
        ])
      ),
    [tokenSettings]
  );

  return useMemo(
    () => ({
      quoteCurrency: 'USD',
      network,
      assetVisibility,
    }),
    [network, assetVisibility]
  );
}
