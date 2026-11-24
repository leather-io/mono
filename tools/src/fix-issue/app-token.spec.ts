import { constants, createHash, generateKeyPairSync, privateEncrypt, verify } from 'node:crypto';
import { describe, expect, test } from 'vitest';

import {
  appBotLogin,
  appJwt,
  createInstallationToken,
  kmsSigner,
  revokeInstallationToken,
} from './app-token.js';
import { fakeGitHub } from './test/fake-github.js';

const now = Date.UTC(2026, 10, 11, 12, 0, 0);

function fromBase64Url(part: string | undefined): string {
  if (part === undefined) throw new Error('the JWT has fewer than three parts');
  return Buffer.from(part, 'base64url').toString('utf8');
}

function decode(part: string | undefined): unknown {
  return JSON.parse(fromBase64Url(part));
}

describe('appJwt', () => {
  test('signs the SHA-256 digest of header.payload and issues for the client ID', () => {
    const digests: Buffer[] = [];
    const jwt = appJwt(
      'Iv23client',
      digest => {
        digests.push(digest);
        return Buffer.from('signature');
      },
      now
    );
    const [header, payload, signature] = jwt.split('.');
    expect(decode(header)).toEqual({ alg: 'RS256', typ: 'JWT' });
    const issuedAt = now / 1000 - 60;
    expect(decode(payload)).toEqual({ iat: issuedAt, exp: issuedAt + 540, iss: 'Iv23client' });
    expect(digests).toEqual([createHash('sha256').update(`${header}.${payload}`).digest()]);
    expect(fromBase64Url(signature)).toBe('signature');
  });

  test('a digest signed the way KMS signs it gives a JWT that verifies as RS256', () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const sha256DigestInfo = Buffer.from('3031300d060960864801650304020105000420', 'hex');
    const jwt = appJwt(
      'Iv23client',
      digest =>
        privateEncrypt(
          { key: privateKey, padding: constants.RSA_PKCS1_PADDING },
          Buffer.concat([sha256DigestInfo, digest])
        ),
      now
    );
    const lastDot = jwt.lastIndexOf('.');
    expect(
      verify(
        'sha256',
        Buffer.from(jwt.slice(0, lastDot)),
        publicKey,
        Buffer.from(jwt.slice(lastDot + 1), 'base64url')
      )
    ).toBe(true);
  });
});

describe('kmsSigner', () => {
  test('asks KMS to sign the digest and decodes the signature', () => {
    const calls: { command: string; args: readonly string[] }[] = [];
    const sign = kmsSigner('alias/fix-issue-app', (command, args) => {
      calls.push({ command, args });
      return {
        status: 0,
        stdout: `${Buffer.from('raw-signature').toString('base64')}\n`,
        stderr: '',
      };
    });
    const digest = Buffer.from('digest');
    expect(sign(digest).toString()).toBe('raw-signature');
    expect(calls).toEqual([
      {
        command: 'aws',
        args: [
          'kms',
          'sign',
          '--cli-binary-format',
          'base64',
          '--key-id',
          'alias/fix-issue-app',
          '--message',
          digest.toString('base64'),
          '--message-type',
          'DIGEST',
          '--signing-algorithm',
          'RSASSA_PKCS1_V1_5_SHA_256',
          '--output',
          'text',
          '--query',
          'Signature',
        ],
      },
    ]);
  });

  test('fails when KMS refuses', () => {
    const sign = kmsSigner('key', () => ({ status: 254, stdout: '', stderr: 'AccessDenied\n' }));
    expect(() => sign(Buffer.from('digest'))).toThrow('aws kms sign failed: AccessDenied');
  });
});

describe('createInstallationToken', () => {
  test('asks for a token limited to the repository and the three write scopes', async () => {
    const github = fakeGitHub((method, path) => {
      if (method === 'GET' && path === 'repos/leather-io/mono/installation') return { id: 42 };
      if (method === 'POST' && path === 'app/installations/42/access_tokens') {
        return {
          token: 'ghs_token',
          permissions: {
            contents: 'write',
            pull_requests: 'write',
            issues: 'write',
            metadata: 'read',
          },
        };
      }
      return undefined;
    });
    await expect(
      createInstallationToken({
        appClient: github,
        tokenClient() {
          return github;
        },
        repo: 'leather-io/mono',
      })
    ).resolves.toBe('ghs_token');
    expect(github.calls[1]?.body).toEqual({
      repositories: ['mono'],
      permissions: { contents: 'write', pull_requests: 'write', issues: 'write' },
    });
  });

  test('refuses and revokes a token with permissions it did not ask for', async () => {
    const github = fakeGitHub((method, path) => {
      if (method === 'GET') return { id: 42 };
      if (path.endsWith('/access_tokens')) {
        return { token: 'ghs_token', permissions: { contents: 'write', workflows: 'write' } };
      }
      return undefined;
    });
    const revoker = fakeGitHub(method => (method === 'DELETE' ? null : undefined));
    const tokens: string[] = [];
    await expect(
      createInstallationToken({
        appClient: github,
        tokenClient(token) {
          tokens.push(token);
          return revoker;
        },
        repo: 'leather-io/mono',
      })
    ).rejects.toThrow('permissions it was not asked for: workflows; it was revoked');
    expect(tokens).toEqual(['ghs_token']);
    expect(revoker.calls).toEqual([
      { method: 'DELETE', path: 'installation/token', body: undefined },
    ]);
  });

  test('refuses a repository without an owner', async () => {
    await expect(
      createInstallationToken({
        appClient: fakeGitHub(),
        tokenClient() {
          return fakeGitHub();
        },
        repo: 'mono',
      })
    ).rejects.toThrow("'mono' is not an owner/name repository");
  });
});

describe('revokeInstallationToken', () => {
  test('deletes the installation token', async () => {
    const github = fakeGitHub(method => (method === 'DELETE' ? null : undefined));
    await revokeInstallationToken(github);
    expect(github.calls).toEqual([
      { method: 'DELETE', path: 'installation/token', body: undefined },
    ]);
  });
});

describe('appBotLogin', () => {
  test('is the login the App writes under, from the App itself', async () => {
    const github = fakeGitHub((method, path) =>
      method === 'GET' && path === 'app' ? { slug: 'leather-fix-issue' } : undefined
    );
    await expect(appBotLogin(github)).resolves.toBe('leather-fix-issue[bot]');
  });
});
