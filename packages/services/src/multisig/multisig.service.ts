import { injectable } from 'inversify';

import { LeatherAuthApiClient } from '../infrastructure/api/leather/leather-auth-api.client';

@injectable()
export class MultisigService {
  constructor(private readonly authApiClient: LeatherAuthApiClient) {}

  async getMe(signal?: AbortSignal) {
    return this.authApiClient.fetchMe({ signal });
  }
}
