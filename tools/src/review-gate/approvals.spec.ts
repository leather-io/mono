import { describe, expect, it } from 'vitest';

import {
  describeGate,
  findApprovers,
  findDispatchers,
  findFixIssueRun,
  findSharedHeadPullRequests,
  hasWriteAccess,
  isDispatcher,
  isForkPullRequest,
} from './approvals.js';
import type { Review, WorkflowRun } from './schemas.js';

function review(login: string, state: string, overrides: Partial<Review> = {}): Review {
  return {
    id: 1,
    user: { login, type: 'User' },
    state,
    commit_id: 'head',
    ...overrides,
  };
}

describe('findApprovers', () => {
  const context = { headSha: 'head', author: 'author' };

  it('returns distinct approvers on the head commit with the review that approved', () => {
    const reviews = [review('alice', 'APPROVED', { id: 7 }), review('bob', 'APPROVED', { id: 8 })];
    expect(findApprovers(reviews, context)).toEqual([
      { login: 'alice', reviewId: 7 },
      { login: 'bob', reviewId: 8 },
    ]);
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
    expect(findApprovers(reviews, context).map(({ login }) => login)).toEqual(['alice']);
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

describe('findFixIssueRun', () => {
  function pullRequest(ref: string, type = 'Bot') {
    return {
      user: { login: 'leather-fix-issue[bot]', type },
      head: { sha: 'abc', ref, repo: null },
    };
  }

  it('reads the issue and the run from a fix-issue bot branch', () => {
    expect(findFixIssueRun(pullRequest('bot/fix-issue-12-987'))).toEqual({
      issue: '12',
      runId: '987',
    });
  });

  it('ignores a person on a fix-issue branch', () => {
    expect(findFixIssueRun(pullRequest('bot/fix-issue-12-987', 'User'))).toBeNull();
  });

  it.each(['bot/audit-fix', 'bot/fix-12', 'bot/screenshots-12', 'fix/fees'])(
    'ignores the branch %s',
    ref => {
      expect(findFixIssueRun(pullRequest(ref))).toBeNull();
    }
  );
});

describe('findDispatchers', () => {
  function workflowRun(overrides: Partial<WorkflowRun> = {}): WorkflowRun {
    return {
      path: '.github/workflows/repo:fix-issue.yml',
      event: 'workflow_dispatch',
      display_title: 'fix-issue: #12',
      html_url: 'https://github.com/leather-io/mono/actions/runs/987',
      actor: { login: 'alice' },
      triggering_actor: { login: 'alice' },
      ...overrides,
    };
  }

  it('names whoever dispatched the run', () => {
    expect(findDispatchers(workflowRun(), '12')).toEqual(['alice']);
  });

  it('names whoever re-ran it as well', () => {
    expect(findDispatchers(workflowRun({ triggering_actor: { login: 'bob' } }), '12')).toEqual([
      'alice',
      'bob',
    ]);
  });

  it.each([
    ['does not exist', null],
    ['is for another issue', workflowRun({ display_title: 'fix-issue: #120' })],
    ['is of another workflow', workflowRun({ path: '.github/workflows/repo:audit-fix.yml' })],
    ['was not dispatched by a person', workflowRun({ event: 'schedule' })],
  ])('names nobody when the run %s', (_, run) => {
    expect(findDispatchers(run, '12')).toEqual([]);
  });
});

describe('isDispatcher', () => {
  it('matches logins regardless of case', () => {
    expect(isDispatcher('alice', ['Alice'])).toBe(true);
    expect(isDispatcher('carol', ['Alice'])).toBe(false);
  });
});

describe('isForkPullRequest', () => {
  const repository = 'leather-io/mono';

  function head(fullName: string | null) {
    return {
      head: {
        sha: 'abc',
        ref: 'fix/fees',
        repo: fullName === null ? null : { full_name: fullName },
      },
    };
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

  it('fails a bot pull request nobody dispatched, whatever its approvals', () => {
    expect(describeGate({ approvals: 2, required: 1, undispatched: true })).toEqual({
      state: 'failure',
      description: 'No fix-issue run dispatched by a person was found for this bot pull request.',
    });
  });

  it('says whose approval was left out because they dispatched the fix', () => {
    expect(describeGate({ approvals: 0, required: 1, dispatcherApprovals: ['alice'] })).toEqual({
      state: 'failure',
      description: '0 of 1 required approvals; alice dispatched the fix, so cannot approve it',
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
