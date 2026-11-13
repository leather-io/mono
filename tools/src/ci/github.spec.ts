import { afterEach, describe, expect, it, vi } from 'vitest';

import { createGitHubRequest, neutraliseMentions } from './github.js';

function respondWith(body: unknown, status = 200) {
  const fetchMock = vi.fn(() => Promise.resolve(Response.json(body, { status })));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const github = createGitHubRequest({ token: 'token', repository: 'leather-io/mono' });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createGitHubRequest', () => {
  it('returns GraphQL data when the response has no errors key', async () => {
    respondWith({ data: { viewer: { login: 'alice' } } });
    await expect(github.graphql('query { viewer { login } }', {})).resolves.toEqual({
      viewer: { login: 'alice' },
    });
  });

  it('rejects GraphQL errors', async () => {
    respondWith({ data: null, errors: [{ message: 'nope' }] });
    await expect(github.graphql('query { viewer { login } }', {})).rejects.toThrow(/nope/);
  });

  it('reads every page until a short one', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json(Array.from({ length: 100 }, (_, index) => index)))
      .mockResolvedValueOnce(Response.json([100]));
    vi.stubGlobal('fetch', fetchMock);
    await expect(github.requestAllPages('/pulls/1/files')).resolves.toHaveLength(101);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('rejects a failed request with its status', async () => {
    respondWith({ message: 'Not Found' }, 404);
    await expect(github.request('/pulls/1')).rejects.toThrow(/failed with 404/);
  });
});

describe('neutraliseMentions', () => {
  it('defuses user and team mentions', () => {
    expect(neutraliseMentions('ping @alice')).not.toMatch(/@alice/);
    expect(neutraliseMentions('ask @leather-io/reviewers')).not.toMatch(/@leather-io/);
  });

  it('keeps package names with a dotted scope intact', () => {
    expect(neutraliseMentions('import from @leather.io/utils')).toBe(
      'import from @leather.io/utils'
    );
  });

  it('leaves inline code and code blocks untouched', () => {
    expect(neutraliseMentions('use `@stacks/transactions`')).toBe('use `@stacks/transactions`');
    expect(neutraliseMentions('```\n@alice\n```')).toBe('```\n@alice\n```');
  });
});
