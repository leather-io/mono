import { appendFileSync } from 'node:fs';
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
const maxErrorLength = 300;

const graphqlResponseSchema = z.object({
  data: z.unknown().optional(),
  errors: z.unknown().optional(),
});

function graphqlData(response: unknown): unknown {
  const result = graphqlResponseSchema.parse(response);
  if (result.errors !== undefined) {
    throw new Error(
      `GitHub GraphQL failed: ${JSON.stringify(result.errors).slice(0, maxErrorLength)}`
    );
  }
  return result.data;
}

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
      return graphqlData(await send('POST', 'graphql', { query, variables }));
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
    async graphql(query, variables) {
      return graphqlData(await send('POST', 'graphql', { query, variables }));
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

const codePattern = /(```[\s\S]*?```|`[^`\n]*`)/;

export function neutraliseMentions(text: string): string {
  return text
    .split(codePattern)
    .map((part, index) =>
      index % 2 === 1 ? part : part.replace(/@(?=[\w-])(?![\w-]*\.[\w.-]*\/)/g, '@​')
    )
    .join('');
}

export function readRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export function writeSummary(markdown: string): void {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) appendFileSync(summaryPath, `${markdown}\n`);
  console.log(markdown);
}

export function describeError(error: unknown, maxLength = maxErrorLength): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.slice(0, maxLength);
}

export function describeZodError(error: z.ZodError): string {
  return error.issues
    .map(issue => `${issue.path.map(String).join('.') || 'value'}: ${issue.message}`)
    .join('; ');
}
