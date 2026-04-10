import type { TokenAuthService } from '@leather.io/services';

let accessToken: string | null = null;
let refreshToken: string | null = null;

export class WebTokenAuthService implements TokenAuthService {
  getAccessToken() {
    return accessToken;
  }

  getRefreshToken() {
    return refreshToken;
  }

  setTokens(access: string, refresh: string) {
    accessToken = access;
    refreshToken = refresh;
  }

  onTokenRefreshed(newAccessToken: string) {
    accessToken = newAccessToken;
  }

  onAuthFailure() {
    accessToken = null;
    refreshToken = null;
  }
}
