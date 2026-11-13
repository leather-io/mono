import { describe, expect, it } from 'vitest';

import {
  describeGate,
  findApprovers,
  findSharedHeadPullRequests,
  hasWriteAccess,
  isForkPullRequest,
} from './approvals.js';
import type { Review } from './schemas.js';

function review(login: string, state: string, overrides: Partial<Review> = {}): Review {
  return {
    user: { login, type: 'User' },
    state,
    commit_id: 'head',
    ...overrides,
  };
}

describe('findApprovers', () => {
  const context = { headSha: 'head', author: 'author' };

  it('returns distinct approvers on the head commit', () => {
    const reviews = [review('alice', 'APPROVED'), review('bob', 'APPROVED')];
    expect(findApprovers(reviews, context)).toEqual(['alice', 'bob']);
  });

  it('ignores approvals on an older commit', () => {
    expect(findApprovers([review('alice', 'APPROVED', { commit_id: 'old' })], context)).toEqual([]);
  });

  it('uses the latest decisive review per reviewer', () => {
    const reviews = [
      review('alice', 'APPROVED'),
      review('alice', 'COMMENTED'),
      review('bob', 'APPROVED'),
      review('bob', 'CHANGES_REQUESTED'),
    ];
    expect(findApprovers(reviews, context)).toEqual(['alice']);
  });

  it('ignores the author', () => {
    expect(findApprovers([review('author', 'APPROVED')], context)).toEqual([]);
  });

  it('ignores approvals from bots, apps and deleted accounts', () => {
    const reviews = [
      review('claude[bot]', 'APPROVED', { user: { login: 'claude[bot]', type: 'Bot' } }),
      review('ghost', 'APPROVED', { user: null }),
    ];
    expect(findApprovers(reviews, context)).toEqual([]);
  });
});

describe('isForkPullRequest', () => {
  const repository = 'leather-io/mono';

  function head(fullName: string | null) {
    return { head: { sha: 'abc', repo: fullName === null ? null : { full_name: fullName } } };
  }

  it('treats a head in this repository as not a fork', () => {
    expect(isForkPullRequest(head(repository), repository)).toBe(false);
  });

  it('treats a head in another repository as a fork', () => {
    expect(isForkPullRequest(head('someone/mono'), repository)).toBe(true);
  });

  it('treats a deleted head repository as a fork', () => {
    expect(isForkPullRequest(head(null), repository)).toBe(true);
  });
});

describe('hasWriteAccess', () => {
  it('accepts write and admin permissions only', () => {
    expect(hasWriteAccess({ permission: 'admin' })).toBe(true);
    expect(hasWriteAccess({ permission: 'write' })).toBe(true);
    expect(hasWriteAccess({ permission: 'read' })).toBe(false);
    expect(hasWriteAccess({ permission: 'none' })).toBe(false);
    expect(hasWriteAccess(null)).toBe(false);
  });
});

describe('describeGate', () => {
  it('passes once enough approvals are in', () => {
    expect(describeGate({ approvals: 1, required: 1 })).toEqual({
      state: 'success',
      description: '1 of 1 required approvals',
    });
  });

  it('fails while approvals are missing', () => {
    expect(describeGate({ approvals: 1, required: 2 })).toEqual({
      state: 'failure',
      description: '1 of 2 required approvals',
    });
  });

  it('names a fork pull request in the description', () => {
    expect(describeGate({ approvals: 1, required: 2, fromFork: true })).toEqual({
      state: 'failure',
      description: '1 of 2 required approvals (fork pull request)',
    });
  });

  it('fails when another open pull request shares the head commit', () => {
    expect(describeGate({ approvals: 2, required: 1, sharedWith: [12, 34] })).toEqual({
      state: 'failure',
      description:
        'Head commit is also the head of #12, #34. Push a commit unique to this pull request.',
    });
  });
});

describe('findSharedHeadPullRequests', () => {
  const headSha = 'abc';

  it('finds other open pull requests with the same head', () => {
    const pullRequests = [
      { number: 1, state: 'open', head: { sha: headSha } },
      { number: 2, state: 'open', head: { sha: headSha } },
      { number: 3, state: 'closed', head: { sha: headSha } },
      { number: 4, state: 'open', head: { sha: 'def' } },
    ];
    expect(findSharedHeadPullRequests(pullRequests, { number: 1, headSha })).toEqual([2]);
  });

  it('finds nothing when the pull request is the only one', () => {
    const pullRequests = [{ number: 1, state: 'open', head: { sha: headSha } }];
    expect(findSharedHeadPullRequests(pullRequests, { number: 1, headSha })).toEqual([]);
  });
});
