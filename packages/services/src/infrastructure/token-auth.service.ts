export interface TokenAuthService {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  onTokenRefreshed(accessToken: string): void;
  onAuthFailure(): void;
}
