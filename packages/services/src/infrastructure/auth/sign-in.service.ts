import { injectable } from 'inversify';

import type { AuthSession } from '@leather.io/models';

import { LeatherAuthApiClient } from '../api/leather/leather-auth-api.client';
import type { SignInInput } from './auth.types';

@injectable()
export class SignInService {
  constructor(private readonly authApiClient: LeatherAuthApiClient) {}

  async signIn(input: SignInInput): Promise<AuthSession> {
    const { network, payload } = input;
    const tokens = await this.authApiClient.authenticate(
      payload.signature,
      payload.publicKey,
      payload.timestamp
    );
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      identity: {
        address: payload.address,
        publicKey: payload.publicKey,
        network,
      },
    };
  }
}
