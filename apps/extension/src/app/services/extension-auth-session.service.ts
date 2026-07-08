import type { AuthSessionService } from '@leather.io/services';

// Propose-only: the extension submits multisig proposals through the
// unauthenticated propose endpoint and holds no multisig auth sessions (co-signing
// and broadcast happen on app.leather.io). This stub satisfies the DI dependency
// that MultisigService -> LeatherAuthApiClient requires, without granting sessions.
export class ExtensionAuthSessionService implements AuthSessionService {
  getSession() {
    return null;
  }

  getActiveNetworks() {
    return [];
  }

  onTokenRefreshed() {
    // No-op: the extension does not maintain multisig auth sessions.
  }

  onAuthFailure() {
    // No-op: the extension does not maintain multisig auth sessions.
  }
}
