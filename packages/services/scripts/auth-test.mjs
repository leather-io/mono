import 'reflect-metadata';

import { Container } from 'inversify';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { defaultCurrentNetwork } from '@leather.io/models';
import { HttpCacheService } from '@leather.io/services';

function loadEnv() {
  try {
    const envPath = resolve(new URL('.', import.meta.url).pathname, '..', '.env');
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^(\w+)=['"](.*)['"]\s*$/);
      if (match) process.env[match[1]] ??= match[2];
    }
  } catch {}
}
loadEnv();

const Types = {
  Environment: Symbol.for('Environment'),
  SettingsService: Symbol.for('SettingsService'),
  CacheService: Symbol.for('CacheService'),
  TokenAuthService: Symbol.for('TokenAuthService'),
};

class InMemoryCacheService extends HttpCacheService {
  cache = new Map();
  async fetchWithCacheInternal(key, fetchFn) {
    const cacheKey = JSON.stringify(key);
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;
    const promise = fetchFn();
    this.cache.set(cacheKey, promise);
    return promise;
  }
  async clearInternal() {}
}

class TestSettingsService {
  getSettings() {
    return {
      network: defaultCurrentNetwork,
      quoteCurrency: 'USD',
      assetVisibility: {},
    };
  }
}

class TestTokenAuthService {
  accessToken = null;
  refreshToken = null;

  getAccessToken() {
    return this.accessToken;
  }
  getRefreshToken() {
    return this.refreshToken;
  }
  onTokenRefreshed(accessToken) {
    console.log('  [TokenAuthService] Token refreshed');
    this.accessToken = accessToken;
  }
  onAuthFailure() {
    console.log('  [TokenAuthService] Auth failure — clearing tokens');
    this.accessToken = null;
    this.refreshToken = null;
  }
}

async function main() {
  const { makeRandomPrivKey } = await import('@stacks/transactions');
  const { signStructuredDataMessage } = await import('@leather.io/stacks');
  const {
    LeatherAuthApiClient,
    MultisigService,
    buildLeatherSignInMessage,
    buildLeatherSignInDomain,
  } = await import('@leather.io/services');

  const testPrivateKey = process.env.TEST_PRIVATE_KEY ?? makeRandomPrivKey();

  const container = new Container({ autobind: true, defaultScope: 'Singleton' });
  container.bind(Types.Environment).toConstantValue({ environment: 'staging' });
  container.bind(Types.SettingsService).to(TestSettingsService).inSingletonScope();
  container.bind(Types.CacheService).to(InMemoryCacheService).inSingletonScope();
  const tokenAuthService = new TestTokenAuthService();
  container.bind(Types.TokenAuthService).toConstantValue(tokenAuthService);

  const authClient = container.get(LeatherAuthApiClient);
  const multisigService = container.get(MultisigService);

  console.log('\nAuth Service Test');
  console.log('='.repeat(60));

  // Step 1: Sign a message and authenticate
  console.log('\n1. Authenticating...');
  const timestamp = Math.floor(Date.now() / 1000);
  const message = buildLeatherSignInMessage(timestamp);
  const domain = buildLeatherSignInDomain();
  const { signature, publicKey } = signStructuredDataMessage(message, domain, testPrivateKey);
  console.log(`  Public key: ${publicKey}`);
  console.log(`  Timestamp: ${timestamp}`);

  try {
    const authResult = await authClient.authenticate(signature, publicKey, timestamp);
    console.log('  Access token received:', authResult.accessToken.slice(0, 20) + '...');
    console.log('  Refresh token received:', authResult.refreshToken.slice(0, 20) + '...');

    tokenAuthService.accessToken = authResult.accessToken;
    tokenAuthService.refreshToken = authResult.refreshToken;
  } catch (err) {
    console.error(`  AUTH FAILED: ${err.message}`);
    process.exit(1);
  }

  // Step 2: Call authenticated /multisig/me endpoint
  console.log('\n2. Calling /multisig/me...');
  try {
    const me = await multisigService.getMe();
    console.log('  Response:', JSON.stringify(me, null, 2));
    console.log(`  Public key matches: ${me.publicKey === publicKey}`);
  } catch (err) {
    console.error(`  /multisig/me FAILED: ${err.message}`);
    process.exit(1);
  }

  // Step 3: Test token refresh
  console.log('\n3. Testing token refresh...');
  try {
    const refreshResult = await authClient.refreshAccessToken(tokenAuthService.refreshToken);
    console.log('  New access token:', refreshResult.accessToken.slice(0, 20) + '...');
    tokenAuthService.accessToken = refreshResult.accessToken;
  } catch (err) {
    console.error(`  REFRESH FAILED: ${err.message}`);
    process.exit(1);
  }

  // Step 4: Verify refreshed token works
  console.log('\n4. Calling /multisig/me with refreshed token...');
  try {
    const me = await multisigService.getMe();
    console.log('  Response:', JSON.stringify(me, null, 2));
    console.log(`  Public key matches: ${me.publicKey === publicKey}`);
  } catch (err) {
    console.error(`  /multisig/me FAILED after refresh: ${err.message}`);
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  console.log('All tests passed');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
