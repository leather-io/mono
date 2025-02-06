import { FiatCurrency, NetworkConfiguration } from '@leather.io/models';

export interface UserSettings {
  network: NetworkConfiguration;
  fiatCurrency: FiatCurrency;
}

export interface SettingsService {
  getSettings(): UserSettings;
}
