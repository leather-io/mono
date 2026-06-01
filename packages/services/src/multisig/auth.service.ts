import { inject, injectable } from 'inversify';

import type { AuthSession } from '@leather.io/models';

import { LeatherAuthApiClient } from '../infrastructure/api/leather/leather-auth-api.client';
import type { TokenAuthService } from '../infrastructure/token-auth.service';
import { Types } from '../inversify.types';
import type { SignInInput } from './auth.types';

@injectable()
export class AuthService {
  constructor(
    private readonly authApiClient: LeatherAuthApiClient,
    @inject(Types.TokenAuthService) private readonly tokenAuthService: TokenAuthService
  ) {}

  signIn(input: SignInInput): Promise<AuthSession> {
    return Promise.reject(
      new Error(`TODO: implement AuthService.signIn for network ${input.network}`)
    );
  }
}
