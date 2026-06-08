import { injectable } from 'inversify';

import { type AuthSession, authApplications } from '@leather.io/models';

import { LeatherAuthApiClient } from '../api/leather/leather-auth-api.client';
import type { SignInInput } from './sign-in.types';
import { decodeAuthIdentity } from './sign-in.utils';

@injectable()
export class SignInService {
  constructor(private readonly authApiClient: LeatherAuthApiClient) {}

  async signIn({ network, application, payload }: SignInInput): Promise<AuthSession> {
    if (!application.every(app => authApplications.includes(app))) {
      throw new Error('Invalid application');
    }
    const { accessToken, refreshToken } = await this.authApiClient.authenticate({
      network,
      application,
      signature: payload.signature,
      publicKey: payload.publicKey,
      address: payload.address,
      timestamp: payload.timestamp,
      xpub: payload.xpub,
      xpubOriginFingerprint: payload.xpubOriginFingerprint,
      xpubOriginPath: payload.xpubOriginPath,
    });

    return {
      accessToken,
      refreshToken,
      identity: decodeAuthIdentity(accessToken),
    };
  }
}
