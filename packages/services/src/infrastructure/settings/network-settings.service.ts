import { NetworkConfiguration } from '@leather.io/models';

export interface NetworkSettingsService {
  getConfig(): NetworkConfiguration;
}
