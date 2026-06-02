import { injectable } from 'inversify';

import type { AuthSession } from '@leather.io/models';

import { LeatherAuthApiClient } from '../api/leather/leather-auth-api.client';
import type { SignInInput } from './auth.types';

@injectable()
export class SignInService {
  constructor(private readonly authApiClient: LeatherAuthApiClient) {}

  signIn(input: SignInInput): Promise<AuthSession> {
    void this.authApiClient;
    return Promise.reject(
      new Error(`TODO: implement SignInService.signIn for network ${input.network}`)
    );
  }
}
