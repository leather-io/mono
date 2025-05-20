import { NetworkConfiguration, QuoteCurrency } from '@leather.io/models';

export interface UserSettings {
  network: NetworkConfiguration;
  quoteCurrency: QuoteCurrency;
}

export interface SettingsService {
  getSettings(): UserSettings;
}
