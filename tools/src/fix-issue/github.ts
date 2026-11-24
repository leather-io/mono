import { z } from 'zod';

import { type CommandRunner, runCommand } from './exec.js';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface GitHubClient {
  request(method: HttpMethod, path: string, body?: unknown): Promise<unknown>;
  graphql(query: string, variables: Readonly<Record<string, unknown>>): Promise<unknown>;
}

export class GitHubError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface GitHubClientOptions {
  readonly token: string;
  readonly apiUrl?: string;
}

const defaultApiUrl = 'https://api.github.com';
const pageSize = 100;
const maxPages = 30;

export function createGitHubClient({
  token,
  apiUrl = defaultApiUrl,
}: GitHubClientOptions): GitHubClient {
  async function send(method: HttpMethod, path: string, body?: unknown): Promise<unknown> {
    const response = await fetch(`${apiUrl}/${path.replace(/^\//, '')}`, {
      method,
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${token}`,
        'x-github-api-version': '2022-11-28',
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    if (!response.ok) {
      throw new GitHubError(
        response.status,
        `${method} ${path} failed with ${response.status}: ${text}`
      );
    }
    return text === '' ? null : JSON.parse(text);
  }

  return {
    request: send,
    async graphql(query, variables) {
      return send('POST', 'graphql', { query, variables });
    },
  };
}

export function createGhCliClient(cwd: string, run: CommandRunner = runCommand): GitHubClient {
  function send(method: HttpMethod, path: string, body?: unknown): Promise<unknown> {
    const args = ['api', '--method', method, path, ...(body === undefined ? [] : ['--input', '-'])];
    const result = run('gh', args, {
      cwd,
      input: body === undefined ? undefined : JSON.stringify(body),
    });
    if (result.status !== 0) {
      return Promise.reject(new Error(`gh api ${method} ${path} failed: ${result.stderr.trim()}`));
    }
    return Promise.resolve(result.stdout.trim() === '' ? null : JSON.parse(result.stdout));
  }

  return {
    request: send,
    graphql(query, variables) {
      return send('POST', 'graphql', { query, variables });
    },
  };
}

export async function paginate(client: GitHubClient, path: string): Promise<unknown[]> {
  const separator = path.includes('?') ? '&' : '?';
  const items: unknown[] = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const response = await client.request(
      'GET',
      `${path}${separator}per_page=${pageSize}&page=${page}`
    );
    if (!Array.isArray(response)) throw new Error(`GET ${path} did not return a list`);
    const entries: unknown[] = response;
    items.push(...entries);
    if (entries.length < pageSize) break;
  }
  return items;
}

const graphqlResponseSchema = z.object({
  data: z.unknown().optional(),
  errors: z.array(z.object({ message: z.string() })).optional(),
});

export async function graphqlData<Schema extends z.ZodType>(
  client: GitHubClient,
  schema: Schema,
  query: string,
  variables: Readonly<Record<string, unknown>>
): Promise<z.infer<Schema>> {
  const response = graphqlResponseSchema.parse(await client.graphql(query, variables));
  if (response.errors && response.errors.length > 0) {
    throw new Error(
      `GraphQL request failed: ${response.errors.map(error => error.message).join('; ')}`
    );
  }
  return schema.parse(response.data);
}
