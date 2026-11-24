import { afterEach, describe, expect, test, vi } from 'vitest';
import { z } from 'zod';

import type { CommandRunner } from './exec.js';
import {
  GitHubError,
  createGhCliClient,
  createGitHubClient,
  graphqlData,
  paginate,
} from './github.js';
import { fakeGitHub } from './test/fake-github.js';

interface Sent {
  readonly url: string;
  readonly init: RequestInit;
}

function stubFetch(responses: readonly { status: number; body: string }[]) {
  const sent: Sent[] = [];
  let index = 0;
  vi.stubGlobal('fetch', (url: string, init: RequestInit) => {
    sent.push({ url, init });
    const { status, body } = responses[Math.min(index, responses.length - 1)] ?? {
      status: 200,
      body: '',
    };
    index += 1;
    return Promise.resolve(new Response(body === '' ? null : body, { status }));
  });
  return sent;
}

describe('createGitHubClient', () => {
  afterEach(() => vi.unstubAllGlobals());

  test('sends an authorized JSON request and parses the response', async () => {
    const sent = stubFetch([{ status: 201, body: '{"number":7}' }]);
    const client = createGitHubClient({ token: 'secret', apiUrl: 'https://api.example' });
    await expect(client.request('POST', '/repos/o/r/pulls', { title: 't' })).resolves.toEqual({
      number: 7,
    });
    expect(sent[0]?.url).toBe('https://api.example/repos/o/r/pulls');
    expect(sent[0]?.init).toMatchObject({
      method: 'POST',
      body: '{"title":"t"}',
      headers: {
        authorization: 'Bearer secret',
        'content-type': 'application/json',
        'x-github-api-version': '2022-11-28',
      },
    });
  });

  test('returns null for an empty response', async () => {
    stubFetch([{ status: 204, body: '' }]);
    const client = createGitHubClient({ token: 'secret' });
    await expect(client.request('DELETE', 'repos/o/r/git/refs/heads/b')).resolves.toBeNull();
  });

  test('throws a GitHubError with the status on a failed request', async () => {
    stubFetch([{ status: 422, body: '{"message":"exists"}' }]);
    const client = createGitHubClient({ token: 'secret' });
    const failure = client.request('POST', 'repos/o/r/git/refs', {});
    await expect(failure).rejects.toBeInstanceOf(GitHubError);
    await expect(failure).rejects.toMatchObject({ status: 422 });
  });

  test('sends GraphQL as a POST to /graphql', async () => {
    const sent = stubFetch([{ status: 200, body: '{"data":{}}' }]);
    await createGitHubClient({ token: 'secret' }).graphql('query { viewer { login } }', {});
    expect(sent[0]?.url).toBe('https://api.github.com/graphql');
    expect(sent[0]?.init.body).toBe('{"query":"query { viewer { login } }","variables":{}}');
  });
});

describe('paginate', () => {
  afterEach(() => vi.unstubAllGlobals());

  test('reads pages until one comes back short', async () => {
    const full = JSON.stringify(Array.from({ length: 100 }, (_, index) => index));
    const sent = stubFetch([
      { status: 200, body: full },
      { status: 200, body: '[100]' },
    ]);
    const items = await paginate(
      createGitHubClient({ token: 'secret' }),
      'repos/o/r/pulls?state=open'
    );
    expect(items).toHaveLength(101);
    expect(sent.map(request => request.url)).toEqual([
      'https://api.github.com/repos/o/r/pulls?state=open&per_page=100&page=1',
      'https://api.github.com/repos/o/r/pulls?state=open&per_page=100&page=2',
    ]);
  });

  test('refuses a response that is not a list', async () => {
    stubFetch([{ status: 200, body: '{}' }]);
    await expect(paginate(createGitHubClient({ token: 'secret' }), 'repos/o/r')).rejects.toThrow(
      'GET repos/o/r did not return a list'
    );
  });
});

describe('createGhCliClient', () => {
  function fakeGh(result: ReturnType<CommandRunner>) {
    const calls: { args: readonly string[]; input?: string }[] = [];
    function run(_command: string, args: readonly string[], options: { input?: string }) {
      calls.push({ args, input: options.input });
      return result;
    }
    return { calls, run };
  }

  test('reads through gh api and parses its output', async () => {
    const gh = fakeGh({ status: 0, stdout: '{"login":"me"}\n', stderr: '' });
    await expect(createGhCliClient('/repo', gh.run).request('GET', 'user')).resolves.toEqual({
      login: 'me',
    });
    expect(gh.calls).toEqual([{ args: ['api', '--method', 'GET', 'user'], input: undefined }]);
  });

  test('sends a body as JSON on standard input', async () => {
    const gh = fakeGh({ status: 0, stdout: '', stderr: '' });
    await expect(
      createGhCliClient('/repo', gh.run).request('POST', 'graphql', { query: 'q' })
    ).resolves.toBeNull();
    expect(gh.calls).toEqual([
      { args: ['api', '--method', 'POST', 'graphql', '--input', '-'], input: '{"query":"q"}' },
    ]);
  });

  test('rejects with gh standard error when the call fails', async () => {
    const gh = fakeGh({ status: 1, stdout: '', stderr: 'HTTP 404: Not Found\n' });
    await expect(createGhCliClient('/repo', gh.run).request('GET', 'repos/o/r')).rejects.toThrow(
      'gh api GET repos/o/r failed: HTTP 404: Not Found'
    );
  });
});

describe('graphqlData', () => {
  const schema = z.object({ viewer: z.object({ login: z.string() }) });

  test('returns the data of a response in the shape it expects', async () => {
    const client = fakeGitHub(undefined, () => ({ data: { viewer: { login: 'me' } } }));
    await expect(graphqlData(client, schema, 'query { viewer { login } }', {})).resolves.toEqual({
      viewer: { login: 'me' },
    });
  });

  test('fails on the errors GitHub returns with a successful status', async () => {
    const client = fakeGitHub(undefined, () => ({
      data: null,
      errors: [{ message: 'Resource not accessible by integration' }, { message: 'Second' }],
    }));
    await expect(graphqlData(client, schema, 'query', {})).rejects.toThrow(
      'GraphQL request failed: Resource not accessible by integration; Second'
    );
  });

  test('fails on data in another shape', async () => {
    const client = fakeGitHub(undefined, () => ({ data: { viewer: null } }));
    await expect(graphqlData(client, schema, 'query', {})).rejects.toThrow();
  });
});
