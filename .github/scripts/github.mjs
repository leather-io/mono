import { randomUUID } from 'node:crypto';
import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const apiUrl = process.env.GITHUB_API_URL ?? 'https://api.github.com';
const graphqlUrl = process.env.GITHUB_GRAPHQL_URL ?? 'https://api.github.com/graphql';
const pageSize = 100;
const maxErrorLength = 300;

export function createGitHubRequest({ token, repository }) {
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  };

  async function request(path, { method = 'GET', body } = {}) {
    const response = await fetch(`${apiUrl}/repos/${repository}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (method === 'DELETE' && response.status === 404) return null;
    if (!response.ok) {
      const detail = (await response.text()).slice(0, maxErrorLength);
      throw new Error(`GitHub ${method} ${path} failed with ${response.status}: ${detail}`);
    }
    return response.json();
  }

  async function requestAllPages(path) {
    const items = [];
    for (let page = 1; ; page++) {
      const separator = path.includes('?') ? '&' : '?';
      const batch = await request(`${path}${separator}per_page=${pageSize}&page=${page}`);
      items.push(...batch);
      if (batch.length < pageSize) return items;
    }
  }

  async function graphql(query, variables) {
    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });
    const result = await response.json();
    if (!response.ok || result.errors) {
      const detail = JSON.stringify(result.errors ?? result).slice(0, maxErrorLength);
      throw new Error(`GitHub GraphQL failed with ${response.status}: ${detail}`);
    }
    return result.data;
  }

  return { request, requestAllPages, graphql };
}

export function readRequiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export function createGitHubRequestFromEnv() {
  return createGitHubRequest({
    token: readRequiredEnv('GITHUB_TOKEN'),
    repository: readRequiredEnv('GITHUB_REPOSITORY'),
  });
}

export function writeOutput(name, value) {
  const delimiter = `EOF_${randomUUID()}`;
  appendFileSync(
    readRequiredEnv('GITHUB_OUTPUT'),
    `${name}<<${delimiter}\n${value}\n${delimiter}\n`
  );
}

export function writeSummary(markdown) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) appendFileSync(summaryPath, `${markdown}\n`);
  console.log(markdown);
}

export function runMode(moduleUrl, modes) {
  if (moduleUrl !== pathToFileURL(process.argv[1]).href) return;
  const run = modes[process.argv[2]];
  Promise.resolve()
    .then(() => {
      if (!run) throw new Error(`Unknown mode: ${process.argv[2]}`);
      return run();
    })
    .catch(error => {
      console.error(error);
      process.exitCode = 1;
    });
}
