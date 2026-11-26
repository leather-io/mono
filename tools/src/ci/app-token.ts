import { createHash } from 'node:crypto';
import { z } from 'zod';

import { type CommandRunner, runCommand } from './exec.js';
import { type GitHubClient, createGitHubClient, readRequiredEnv } from './github.js';
import { writeStepOutputs } from './outputs.js';

type Signer = (digest: Buffer) => Buffer;

const clockSkewSeconds = 60;
const jwtLifetimeSeconds = 540;
const signingAlgorithm = 'RSASSA_PKCS1_V1_5_SHA_256';

export type TokenPermissions = Readonly<Record<string, 'read' | 'write'>>;

const installationSchema = z.object({ id: z.number() });
const appSchema = z.object({ slug: z.string().min(1) });
const accessTokenSchema = z.object({
  token: z.string().min(1),
  permissions: z.record(z.string(), z.string()),
});

function base64Url(data: Buffer | string): string {
  return Buffer.from(data).toString('base64url');
}

export function kmsSigner(keyId: string, run: CommandRunner = runCommand): Signer {
  return digest => {
    const result = run(
      'aws',
      [
        'kms',
        'sign',
        '--cli-binary-format',
        'base64',
        '--key-id',
        keyId,
        '--message',
        digest.toString('base64'),
        '--message-type',
        'DIGEST',
        '--signing-algorithm',
        signingAlgorithm,
        '--output',
        'text',
        '--query',
        'Signature',
      ],
      { cwd: process.cwd() }
    );
    if (result.status !== 0) throw new Error(`aws kms sign failed: ${result.stderr.trim()}`);
    const signature = Buffer.from(result.stdout.trim(), 'base64');
    if (signature.length === 0) throw new Error('aws kms sign returned no signature');
    return signature;
  };
}

export function appJwt(clientId: string, sign: Signer, nowMs: number): string {
  const issuedAt = Math.floor(nowMs / 1000) - clockSkewSeconds;
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64Url(
    JSON.stringify({ iat: issuedAt, exp: issuedAt + jwtLifetimeSeconds, iss: clientId })
  );
  const signingInput = `${header}.${payload}`;
  const signature = sign(createHash('sha256').update(signingInput).digest());
  return `${signingInput}.${base64Url(signature)}`;
}

interface InstallationTokenOptions {
  readonly appClient: GitHubClient;
  tokenClient(token: string): GitHubClient;
  readonly repo: string;
  readonly permissions: TokenPermissions;
}

export async function appBotLogin(appClient: GitHubClient): Promise<string> {
  const { slug } = appSchema.parse(await appClient.request('GET', 'app'));
  return `${slug}[bot]`;
}

export async function revokeInstallationToken(client: GitHubClient): Promise<void> {
  await client.request('DELETE', 'installation/token');
}

export async function createInstallationToken({
  appClient,
  tokenClient,
  repo,
  permissions: requested,
}: InstallationTokenOptions): Promise<string> {
  const [, name] = repo.split('/');
  if (!name) throw new Error(`'${repo}' is not an owner/name repository`);
  const { id } = installationSchema.parse(
    await appClient.request('GET', `repos/${repo}/installation`)
  );
  const { token, permissions } = accessTokenSchema.parse(
    await appClient.request('POST', `app/installations/${id}/access_tokens`, {
      repositories: [name],
      permissions: requested,
    })
  );
  const extra = Object.keys(permissions).filter(
    scope => scope !== 'metadata' && requested[scope] === undefined
  );
  if (extra.length > 0) {
    await revokeInstallationToken(tokenClient(token));
    throw new Error(
      `the installation token has permissions it was not asked for: ${extra.join(', ')}; it was revoked`
    );
  }
  return token;
}

interface AppTokenOutputOptions {
  readonly clientId: string;
  readonly kmsKeyId: string;
  readonly permissions: TokenPermissions;
  readonly withAppLogin?: boolean;
}

export async function writeAppTokenOutput({
  clientId,
  kmsKeyId,
  permissions,
  withAppLogin = false,
}: AppTokenOutputOptions): Promise<void> {
  const apiUrl = process.env.GITHUB_API_URL;
  const jwt = appJwt(clientId, kmsSigner(kmsKeyId), Date.now());
  const appClient = createGitHubClient({ token: jwt, apiUrl });
  const token = await createInstallationToken({
    appClient,
    tokenClient(installationToken) {
      return createGitHubClient({ token: installationToken, apiUrl });
    },
    repo: readRequiredEnv('GITHUB_REPOSITORY'),
    permissions,
  });
  console.log(`::add-mask::${token}`);
  writeStepOutputs(withAppLogin ? { token, 'app-login': await appBotLogin(appClient) } : { token });
  console.log('app-token: created an installation token that expires within an hour');
}
