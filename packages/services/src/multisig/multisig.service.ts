import { injectable } from 'inversify';

import type { AuthNetworkId } from '@leather.io/models';

import { LeatherAuthApiClient } from '../infrastructure/api/leather/leather-auth-api.client';

@injectable()
export class MultisigService {
  constructor(private readonly authApiClient: LeatherAuthApiClient) {}

  async getMe(network: AuthNetworkId, signal?: AbortSignal) {
    return this.authApiClient.fetchMultisigMe(network, { signal });
  }
}
