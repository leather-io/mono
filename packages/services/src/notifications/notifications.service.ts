import { SupportedBlockchains } from '@leather.io/models';

import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';

export interface NotificationsService {
  registerAddressNotification(
    variables: {
      addresses: string[];
      notificationToken: string;
      chain: SupportedBlockchains;
    },
    signal?: AbortSignal
  ): Promise<unknown>;
}

export function createNotificationsService(
  leatherApiClient: LeatherApiClient
): NotificationsService {
  function registerAddressNotification(
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
    return leatherApiClient.registerAddresses({ addresses, notificationToken, chain }, signal);
  }

  return {
    registerAddressNotification,
  };
}
