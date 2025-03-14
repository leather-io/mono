import { injectable } from 'inversify';

import { SupportedBlockchains } from '@leather.io/models';

import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';

@injectable()
export class NotificationsService {
  constructor(private readonly leatherApiClient: LeatherApiClient) {}

  public async registerAddressNotification(
    {
      addresses,
      notificationToken,
      chain,
    }: {
      addresses: string[];
      notificationToken: string;
      chain: SupportedBlockchains;
    },
    signal?: AbortSignal
  ) {
    return await this.leatherApiClient.registerAddresses(
      { addresses, notificationToken, chain },
      signal
    );
  }
}
