import { appendFileSync } from 'node:fs';
import { z } from 'zod';

const pageSize = 100;
const maxErrorLength = 300;

const pageSchema = z.array(z.unknown());
const graphqlResponseSchema = z.object({
  data: z.unknown().optional(),
  errors: z.unknown().optional(),
});

interface RequestOptions {
  readonly method?: string;
  readonly body?: unknown;
}

interface GitHubRequest {
  request(path: string, options?: RequestOptions): Promise<unknown>;
  requestAllPages(path: string): Promise<unknown[]>;
  graphql(query: string, variables: Record<string, unknown>): Promise<unknown>;
}

interface GitHubRequestConfig {
  readonly token: string;
  readonly repository: string;
}

function apiUrl(): string {
  return process.env.GITHUB_API_URL ?? 'https://api.github.com';
}

function graphqlUrl(): string {
  return process.env.GITHUB_GRAPHQL_URL ?? 'https://api.github.com/graphql';
}

export function createGitHubRequest({ token, repository }: GitHubRequestConfig): GitHubRequest {
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  };

  async function request(path: string, { method = 'GET', body }: RequestOptions = {}) {
    const response = await fetch(`${apiUrl()}/repos/${repository}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (method === 'DELETE' && response.status === 404) return null;
    if (!response.ok) {
      const detail = (await response.text()).slice(0, maxErrorLength);
      throw new Error(`GitHub ${method} ${path} failed with ${response.status}: ${detail}`);
    }
    const result: unknown = await response.json();
    return result;
  }

  async function requestAllPages(path: string) {
    const items: unknown[] = [];
    for (let page = 1; ; page++) {
      const separator = path.includes('?') ? '&' : '?';
      const batch = pageSchema.parse(
        await request(`${path}${separator}per_page=${pageSize}&page=${page}`)
      );
      items.push(...batch);
      if (batch.length < pageSize) return items;
    }
  }

  async function graphql(query: string, variables: Record<string, unknown>) {
    const response = await fetch(graphqlUrl(), {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });
    const result = graphqlResponseSchema.parse(await response.json());
    if (!response.ok || result.errors) {
      const detail = JSON.stringify(result.errors ?? result).slice(0, maxErrorLength);
      throw new Error(`GitHub GraphQL failed with ${response.status}: ${detail}`);
    }
    return result.data;
  }

  return { request, requestAllPages, graphql };
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

export function createGitHubRequestFromEnv(): GitHubRequest {
  return createGitHubRequest({
    token: readRequiredEnv('GITHUB_TOKEN'),
    repository: readRequiredEnv('GITHUB_REPOSITORY'),
  });
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
