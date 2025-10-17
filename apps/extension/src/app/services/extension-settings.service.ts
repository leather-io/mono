import {
  SettingsService,
  buildUserSettings,
  resolveNetworkPreferenceId,
} from '@leather.io/services';
import { serializeAssetId } from '@leather.io/utils';

import { store } from '@app/store';
import { selectTokenState } from '@app/store/manage-tokens/manage-tokens.slice';
import { selectCurrentNetwork } from '@app/store/networks/networks.selectors';

export class ExtensionSettingsService implements SettingsService {
  getSettings() {
    const state = store.getState();
    const assetVisibility = Object.fromEntries(
      Object.values(selectTokenState(state).entities).map(tokenSetting => [
        serializeAssetId({
          protocol: tokenSetting.id.includes('::') ? 'sip10' : 'rune',
          id: tokenSetting.id,
        }),
        tokenSetting.enabled,
      ])
    );

    return buildUserSettings({
      quoteCurrency: 'USD',
      networkId: resolveNetworkPreferenceId(selectCurrentNetwork(state).id),
      assetVisibility,
    });
  }
}
