import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  angleGuides,
  angles,
  buildFinderArgs,
  buildVerifierArgs,
  collectCandidates,
  findCommentableLines,
  findFixedThreads,
  formatDiff,
  formatFindingComment,
  formatReviewBody,
  parseFindings,
  parseVerdicts,
  planReview,
  toThread,
} from './claude-review.mjs';
import { claudeModel } from './review-gate.mjs';

function finding(path, line, overrides = {}) {
  return { path, line, severity: 'medium', title: `Bug at ${line}`, body: 'Breaks.', ...overrides };
}

function allAngles(findings) {
  return Object.fromEntries(angles.map(angle => [angle, findings[angle] ?? []]));
}

const patch = '@@ -10,3 +10,4 @@\n context\n-removed\n+added\n+added again\n context';

describe('angles', () => {
  it('has a guide for every angle', () => {
    assert.deepEqual(Object.keys(angleGuides).sort(), [...angles].sort());
  });
});

describe('buildFinderArgs', () => {
  it('pins the model and limits Claude to read-only tools', () => {
    const args = buildFinderArgs('/tmp/context');
    assert.equal(args[args.indexOf('--model') + 1], claudeModel);
    assert.equal(args[args.indexOf('--tools') + 1], 'Read,Grep,Glob');
    assert.equal(args[args.indexOf('--system-prompt-file') + 1], '/tmp/context/finder.md');
  });

  it('gives the verifier its own prompt', () => {
    const args = buildVerifierArgs('/tmp/context');
    assert.equal(args[args.indexOf('--system-prompt-file') + 1], '/tmp/context/verifier.md');
  });
});

describe('formatDiff', () => {
  it('names renames and omitted patches', () => {
    const diff = formatDiff([
      {
        filename: 'b.ts',
        previous_filename: 'a.ts',
        status: 'renamed',
        additions: 0,
        deletions: 0,
      },
    ]);
    assert.match(diff, /### b\.ts \(renamed from a\.ts, \+0 -0\)/);
    assert.match(diff, /GitHub omitted this patch/);
  });
});

describe('findCommentableLines', () => {
  it('returns head-side lines inside hunks', () => {
    assert.deepEqual([...findCommentableLines(patch)], [10, 11, 12, 13]);
  });

  it('returns nothing without a patch', () => {
    assert.equal(findCommentableLines(undefined).size, 0);
  });
});

describe('parseFindings', () => {
  it('accepts valid findings', () => {
    assert.deepEqual(parseFindings(JSON.stringify({ findings: [finding('a.ts', 1)] })), [
      finding('a.ts', 1),
    ]);
  });

  it('rejects empty or malformed output', () => {
    assert.equal(parseFindings(''), null);
    assert.equal(parseFindings('{"findings":[{"path":"a.ts"}]}'), null);
  });
});

describe('collectCandidates', () => {
  it('drops exact duplicates across angles and numbers the rest', () => {
    const { candidates, failedAngles } = collectCandidates(
      allAngles({
        correctness: [finding('a.ts', 1), finding('a.ts', 2)],
        security: [finding('a.ts', 1, { title: ' BUG AT 1 ' })],
      })
    );
    assert.deepEqual(
      candidates.map(candidate => [candidate.id, candidate.line, candidate.angle]),
      [
        ['F1', 1, 'correctness'],
        ['F2', 2, 'correctness'],
      ]
    );
    assert.deepEqual(failedAngles, []);
  });

  it('keeps the most severe candidates when over the limit and counts the rest', () => {
    const lows = Array.from({ length: 40 }, (_, index) =>
      finding('a.ts', index + 1, { severity: 'low' })
    );
    const { candidates, skippedCount, skippedBlockingCount } = collectCandidates(
      allAngles({
        correctness: lows,
        wallet: [finding('b.ts', 1, { severity: 'high' }), finding('b.ts', 2)],
      })
    );
    assert.equal(candidates.length, 40);
    assert.deepEqual(
      candidates.slice(0, 2).map(candidate => [candidate.id, candidate.severity]),
      [
        ['F1', 'high'],
        ['F2', 'medium'],
      ]
    );
    assert.equal(skippedCount, 2);
    assert.equal(skippedBlockingCount, 0);
  });

  it('counts skipped blocking candidates', () => {
    const highs = Array.from({ length: 41 }, (_, index) =>
      finding('a.ts', index + 1, { severity: 'high' })
    );
    const { skippedBlockingCount } = collectCandidates(allAngles({ correctness: highs }));
    assert.equal(skippedBlockingCount, 1);
  });

  it('reports angles that returned nothing usable', () => {
    const { failedAngles } = collectCandidates({ correctness: [] });
    assert.deepEqual(failedAngles, ['security', 'wallet', 'conventions']);
  });
});

describe('parseVerdicts', () => {
  const confirmed = { id: 'F1', verdict: 'confirmed', severity: 'high', reason: 'traced' };

  it('requires both lists', () => {
    assert.equal(parseVerdicts('{"findings":[]}', []), null);
    assert.equal(parseVerdicts('', []), null);
    assert.deepEqual(parseVerdicts('{"findings":[],"threads":[]}', []), {
      findings: [],
      threads: [],
    });
  });

  it('requires a verdict for every candidate', () => {
    const text = JSON.stringify({ findings: [confirmed], threads: [] });
    assert.equal(parseVerdicts(text, ['F1', 'F2']), null);
    assert.deepEqual(parseVerdicts(text, ['F1'])?.findings, [confirmed]);
  });

  it('rejects malformed verdicts', () => {
    const text = JSON.stringify({ findings: [{ id: 'F1', verdict: 'maybe' }], threads: [] });
    assert.equal(parseVerdicts(text, ['F1']), null);
  });
});

describe('planReview', () => {
  const patches = { 'a.ts': patch };

  function verdict(id, severity, verdictValue = 'confirmed') {
    return { id, verdict: verdictValue, severity, reason: 'traced' };
  }

  it('posts blocking findings inline or on the file and keeps the rest as notes', () => {
    const candidates = [
      { id: 'F1', ...finding('a.ts', 12) },
      { id: 'F2', ...finding('a.ts', 99) },
      { id: 'F3', ...finding('a.ts', 11) },
      { id: 'F4', ...finding('other.ts', 5) },
      { id: 'F5', ...finding('a.ts', 13) },
    ];
    const plan = planReview({
      candidates,
      patches,
      verdicts: {
        findings: [
          verdict('F1', 'high'),
          verdict('F2', 'medium'),
          verdict('F3', 'low'),
          verdict('F4', 'high'),
          verdict('F5', 'high', 'refuted'),
        ],
        threads: [],
      },
    });
    assert.deepEqual(
      plan.inline.map(item => item.id),
      ['F1']
    );
    assert.deepEqual(
      plan.fileLevel.map(item => item.id),
      ['F2']
    );
    assert.deepEqual(
      plan.notes.map(item => item.id),
      ['F3', 'F4']
    );
    assert.equal(plan.inline[0].severity, 'high');
  });

  it('ignores verdicts for unknown candidates', () => {
    const plan = planReview({
      candidates: [],
      patches,
      verdicts: { findings: [verdict('F9', 'high')], threads: [] },
    });
    assert.deepEqual(plan, { inline: [], fileLevel: [], notes: [] });
  });
});

describe('toThread', () => {
  function node(login, body, isResolved = false) {
    return {
      id: 'T1',
      isResolved,
      path: 'a.ts',
      line: 3,
      comments: { nodes: [{ author: { login }, body }] },
    };
  }

  it('marks open Claude findings as resolvable', () => {
    assert.equal(toThread(node('github-actions', '**high: Bug**')).resolvable, true);
  });

  it('never resolves human threads, other bot comments or resolved threads', () => {
    assert.equal(toThread(node('alice', '**high: Bug**')).resolvable, false);
    assert.equal(toThread(node('github-actions', 'Coverage report')).resolvable, false);
    assert.equal(toThread(node('github-actions', '**high: Bug**', true)).resolvable, false);
  });
});

describe('findFixedThreads', () => {
  it('returns only fixed verdicts for resolvable threads', () => {
    const threads = [
      { id: 'T1', resolvable: true },
      { id: 'T2', resolvable: false },
      { id: 'T3', resolvable: true },
    ];
    const fixed = findFixedThreads({
      threads,
      verdicts: {
        findings: [],
        threads: [
          { id: 'T1', status: 'fixed', reason: 'guarded' },
          { id: 'T2', status: 'fixed', reason: 'human thread' },
          { id: 'T3', status: 'open', reason: 'still broken' },
        ],
      },
    });
    assert.deepEqual(
      fixed.map(thread => thread.id),
      ['T1']
    );
  });
});

describe('formatFindingComment', () => {
  it('starts with the marker threads are recognised by and defuses mentions', () => {
    const comment = formatFindingComment({
      ...finding('a.ts', 1, { severity: 'high', body: 'ping @alice' }),
      reason: 'traced',
    });
    assert.match(comment, /^\*\*high: Bug at 1\*\*/);
    assert.doesNotMatch(comment, /@alice/);
  });
});

describe('formatReviewBody', () => {
  it('lists blocking count, notes and unfinished angles', () => {
    const body = formatReviewBody({
      blockingCount: 2,
      notes: [finding('a.ts', 4, { severity: 'low' })],
      failedAngles: ['wallet'],
    });
    assert.match(body, /2 blocking findings/);
    assert.match(body, /`a\.ts:4` \*\*low: Bug at 4\*\*/);
    assert.match(body, /the wallet review did not finish/);
  });

  it('reports candidates skipped by the limit', () => {
    const body = formatReviewBody({
      blockingCount: 0,
      notes: [],
      failedAngles: [],
      skippedCount: 3,
    });
    assert.match(body, /3 lower-severity candidate findings were not verified/);
  });
});
