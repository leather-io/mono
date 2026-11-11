import { describe, expect, test } from 'vitest';

import {
  botBranchGuard,
  checkBotBranchSecrets,
  findWorkflowViolations,
  formatGuardReport,
  untrustedTriggers,
} from './check.js';

function workflow(on: string, jobs: string, top = ''): string {
  return `name: test\non:\n${on}\n${top}jobs:\n${jobs}`;
}

const pullRequest = '  pull_request:';

describe('untrustedTriggers', () => {
  test('treats pull requests and pushes to any branch as untrusted', () => {
    expect(untrustedTriggers('pull_request')).toEqual(['pull_request']);
    expect(untrustedTriggers(['push', 'workflow_dispatch'])).toEqual(['push']);
    expect(untrustedTriggers({ push: { branches: ['**'] } })).toEqual(['push']);
    expect(untrustedTriggers({ push: null })).toEqual(['push']);
    expect(untrustedTriggers({ pull_request_target: null })).toEqual(['pull_request_target']);
  });

  test('trusts pushes limited to dev and main, and events that run the default branch', () => {
    expect(untrustedTriggers({ push: { branches: ['dev'], paths: ['apps/**'] } })).toEqual([]);
    expect(untrustedTriggers({ push: { branches: ['main', 'dev'] } })).toEqual([]);
    expect(untrustedTriggers({ workflow_dispatch: null, schedule: [], merge_group: null })).toEqual(
      []
    );
  });

  test('treats tag pushes and ignore filters as untrusted', () => {
    expect(untrustedTriggers({ push: { branches: ['dev'], tags: ['v*'] } })).toEqual(['push']);
    expect(untrustedTriggers({ push: { 'branches-ignore': ['dev'] } })).toEqual(['push']);
  });
});

describe('findWorkflowViolations', () => {
  test('flags a secret in a step, an environment and write scopes', () => {
    const content = workflow(
      pullRequest,
      [
        '  build:',
        '    runs-on: ubuntu-latest',
        '    environment: staging',
        '    permissions:',
        '      contents: write',
        '      id-token: write',
        '    steps:',
        '      - name: deploy',
        '        env:',
        '          TOKEN: ${{ secrets.DEPLOY_TOKEN }}',
        '        run: deploy',
      ].join('\n')
    );
    expect(findWorkflowViolations({ file: 'a.yml', content })).toEqual([
      {
        file: 'a.yml',
        job: 'build',
        reasons: ['environment', 'secrets in deploy', 'contents-write', 'id-token-write'],
      },
    ]);
  });

  test('passes a job guarded against bot branches', () => {
    const content = workflow(
      pullRequest,
      [
        '  build:',
        `    if: \${{ github.event.pull_request.draft == false && ${botBranchGuard} }}`,
        '    environment: staging',
        '    steps:',
        '      - run: echo ${{ secrets.DEPLOY_TOKEN }}',
      ].join('\n')
    );
    expect(findWorkflowViolations({ file: 'a.yml', content })).toEqual([]);
  });

  test('passes a secret in a guarded step', () => {
    const content = workflow(
      '  push:\n    branches:\n      - "**"',
      [
        '  test:',
        '    steps:',
        '      - name: upload',
        `        if: \${{ ${botBranchGuard} }}`,
        '        with:',
        '          token: ${{ secrets.CODECOV_TOKEN }}',
      ].join('\n')
    );
    expect(findWorkflowViolations({ file: 'a.yml', content })).toEqual([]);
  });

  test('ignores GITHUB_TOKEN and read scopes', () => {
    const content = workflow(
      pullRequest,
      [
        '  check:',
        '    permissions:',
        '      contents: read',
        '      pull-requests: write',
        '    steps:',
        '      - run: gh pr view',
        '        env:',
        '          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}',
      ].join('\n')
    );
    expect(findWorkflowViolations({ file: 'a.yml', content })).toEqual([]);
  });

  test('uses workflow permissions and env when the job sets none', () => {
    const content = workflow(
      pullRequest,
      ['  check:', '    steps:', '      - run: echo'].join('\n'),
      'permissions: write-all\nenv:\n  KEY: ${{ secrets.KEY }}\n'
    );
    expect(findWorkflowViolations({ file: 'a.yml', content })).toEqual([
      { file: 'a.yml', job: 'check', reasons: ['secrets', 'contents-write', 'id-token-write'] },
    ]);
  });

  test('flags inherited secrets in a reusable workflow call', () => {
    const content = workflow(
      pullRequest,
      ['  call:', '    uses: ./.github/workflows/other.yml', '    secrets: inherit'].join('\n')
    );
    expect(findWorkflowViolations({ file: 'a.yml', content })).toEqual([
      { file: 'a.yml', job: 'call', reasons: ['secrets'] },
    ]);
  });

  test('ignores workflows that only run trusted refs', () => {
    const content = workflow(
      '  workflow_dispatch:',
      ['  deploy:', '    environment: production', '    steps:', '      - run: deploy'].join('\n')
    );
    expect(findWorkflowViolations({ file: 'a.yml', content })).toEqual([]);
  });
});

describe('checkBotBranchSecrets', () => {
  const flagged = workflow(
    pullRequest,
    ['  deploy:', '    environment: staging', '    steps:', '      - run: deploy'].join('\n')
  );
  const clean = workflow(pullRequest, ['  lint:', '    steps:', '      - run: lint'].join('\n'));

  test('fails a new violation and passes a baseline one', () => {
    const failing = checkBotBranchSecrets([{ file: 'a.yml', content: flagged }], {});
    expect(failing.violations).toHaveLength(1);
    expect(formatGuardReport(failing)).toContain('bot-branch-secret-guard: failed');

    const passing = checkBotBranchSecrets([{ file: 'a.yml', content: flagged }], {
      'a.yml': ['deploy'],
    });
    expect(passing.violations).toEqual([]);
    expect(passing.allowed).toHaveLength(1);
    expect(formatGuardReport(passing)).toContain('bot-branch-secret-guard: ok (1 baseline job)');
  });

  test('fails a baseline entry that no longer violates', () => {
    const result = checkBotBranchSecrets([{ file: 'a.yml', content: clean }], {
      'a.yml': ['lint'],
    });
    expect(result.stale).toEqual([{ file: 'a.yml', job: 'lint' }]);
    expect(formatGuardReport(result)).toContain('remove it');
  });

  test('reports a workflow that does not parse', () => {
    const result = checkBotBranchSecrets([{ file: 'a.yml', content: 'on: [' }], {});
    expect(result.parseErrors).toHaveLength(1);
  });
});
