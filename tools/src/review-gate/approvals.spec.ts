import { describe, expect, it } from 'vitest';

import {
  describeGate,
  findApprovers,
  findDispatchers,
  findFixIssueRun,
  findSharedHeadPullRequests,
  isDispatcher,
} from './approvals.js';
import type { Review, WorkflowRun } from './schemas.js';

const teamId = 5;

function onBehalfOf(...teamIds: number[]): Review['onBehalfOf'] {
  return { nodes: teamIds.map(databaseId => ({ databaseId })) };
}

function review(login: string, state: string, overrides: Partial<Review> = {}): Review {
  return {
    state,
    author: { login, __typename: 'User' },
    commit: { oid: 'head' },
    onBehalfOf: onBehalfOf(teamId),
    ...overrides,
  };
}

describe('findApprovers', () => {
  const context = { headSha: 'head', author: 'author', teamId };

  it('returns distinct approvers on the head commit and whether the team is credited', () => {
    const reviews = [
      review('alice', 'APPROVED'),
      review('bob', 'APPROVED', { onBehalfOf: onBehalfOf(teamId + 1) }),
      review('carol', 'APPROVED', { onBehalfOf: onBehalfOf() }),
    ];
    expect(findApprovers(reviews, context)).toEqual([
      { login: 'alice', forTeam: true },
      { login: 'bob', forTeam: false },
      { login: 'carol', forTeam: false },
    ]);
  });

  it('ignores approvals on an older commit', () => {
    const reviews = [review('alice', 'APPROVED', { commit: { oid: 'old' } })];
    expect(findApprovers(reviews, context)).toEqual([]);
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
      review('claude[bot]', 'APPROVED', { author: { login: 'claude[bot]', __typename: 'Bot' } }),
      review('ghost', 'APPROVED', { author: null }),
    ];
    expect(findApprovers(reviews, context)).toEqual([]);
  });
});

describe('findFixIssueRun', () => {
  function pullRequest(ref: string, type = 'Bot') {
    return {
      user: { login: 'leather-fix-issue[bot]', type },
      head: { sha: 'abc', ref },
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

describe('describeGate', () => {
  const met = {
    approvals: 2,
    required: 1,
    sharedWith: [],
    undispatched: false,
    dispatcherApprovals: [],
  };

  it('passes once enough approvals are in', () => {
    expect(describeGate({ ...met, approvals: 1 })).toEqual({
      state: 'success',
      description: '1 of 1 required approvals',
    });
  });

  it('fails while approvals are missing', () => {
    expect(describeGate({ ...met, approvals: 1, required: 2 })).toEqual({
      state: 'failure',
      description: '1 of 2 required approvals',
    });
  });

  it('fails a bot pull request nobody dispatched, whatever its approvals', () => {
    expect(describeGate({ ...met, undispatched: true })).toEqual({
      state: 'failure',
      description: 'No fix-issue run dispatched by a person was found for this bot pull request.',
    });
  });

  it('says whose approval was left out because they dispatched the fix', () => {
    expect(describeGate({ ...met, approvals: 0, dispatcherApprovals: ['alice'] })).toEqual({
      state: 'failure',
      description: '0 of 1 required approvals; alice dispatched the fix, so cannot approve it',
    });
  });

  it('fails when another open pull request shares the head commit', () => {
    expect(describeGate({ ...met, sharedWith: [12, 34] })).toEqual({
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
