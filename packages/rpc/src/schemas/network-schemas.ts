import { z } from 'zod';

import {
  type DefaultNetworkConfigurations,
  WalletDefaultNetworkConfigurationIds,
} from '@leather.io/models';

type NonEmptyDefaultNetworkIdList = [
  DefaultNetworkConfigurations,
  ...DefaultNetworkConfigurations[],
];

export const baseNetworkSchema = z.enum(
  Object.values(WalletDefaultNetworkConfigurationIds) as NonEmptyDefaultNetworkIdList
);
