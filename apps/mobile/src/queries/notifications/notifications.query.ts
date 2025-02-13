import { useMutation } from '@tanstack/react-query';

import { SupportedBlockchains } from '@leather.io/models';
import { getNotificationsService } from '@leather.io/services';

export function useRegisterNotificationMutation() {
  return useMutation({
    mutationKey: ['notification/register'],
    mutationFn: (variables: {
      addresses: string[];
      notificationToken: string;
      chain: SupportedBlockchains;
    }) => getNotificationsService().registerAddressNotification(variables),
  });
}
