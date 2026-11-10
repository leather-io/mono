import { z } from 'zod';

import type { GitHubClient } from './github.js';

const workflowFile = 'repo:fix-issue.yml';
const runsPageSize = 100;
const maxRunPages = 10;

const runSchema = z.object({
  id: z.number(),
  display_title: z.string(),
  status: z.string(),
  conclusion: z.string().nullable(),
  html_url: z.string(),
  created_at: z.string(),
});
const runsSchema = z.object({ workflow_runs: z.array(runSchema) });

const pullSchema = z.object({
  number: z.number(),
  html_url: z.string(),
  state: z.string(),
  draft: z.boolean(),
  body: z.string().nullable(),
});
const pullsSchema = z.array(pullSchema);

interface IssueRunStatus {
  readonly issue: number;
  readonly run: z.infer<typeof runSchema> | null;
  readonly pull: z.infer<typeof pullSchema> | null;
  readonly blocked: readonly string[];
}

function runTitle(issue: number): string {
  return `fix-issue: #${issue}`;
}

function blockedQuestions(body: string | null): string[] {
  if (body === null) return [];
  const questions: string[] = [];
  let inside = false;
  for (const line of body.split('\n')) {
    if (line.startsWith('## ')) {
      inside = line.trim() === '## Blocked';
    } else if (inside && line.startsWith('- ')) {
      questions.push(line.slice(2).trim());
    }
  }
  return questions;
}

async function fetchRuns(
  client: GitHubClient,
  repo: string,
  issues: readonly number[]
): Promise<z.infer<typeof runSchema>[]> {
  const titles = new Set(issues.map(runTitle));
  const runs: z.infer<typeof runSchema>[] = [];
  for (let page = 1; page <= maxRunPages; page += 1) {
    const { workflow_runs: entries } = runsSchema.parse(
      await client.request(
        'GET',
        `repos/${repo}/actions/workflows/${workflowFile}/runs?event=workflow_dispatch&per_page=${runsPageSize}&page=${page}`
      )
    );
    runs.push(...entries.filter(entry => titles.has(entry.display_title)));
    const found = new Set(runs.map(entry => entry.display_title));
    if (entries.length < runsPageSize || found.size === titles.size) break;
  }
  return runs;
}

export async function fetchRunStatuses(
  client: GitHubClient,
  repo: string,
  issues: readonly number[]
): Promise<IssueRunStatus[]> {
  const owner = repo.split('/')[0];
  const runs = await fetchRuns(client, repo, issues);
  return Promise.all(
    issues.map(async issue => {
      const run =
        runs
          .filter(entry => entry.display_title === runTitle(issue))
          .sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null;
      if (!run) return { issue, run: null, pull: null, blocked: [] };
      const branch = `bot/fix-issue-${issue}-${run.id}`;
      const pulls = pullsSchema.parse(
        await client.request(
          'GET',
          `repos/${repo}/pulls?state=all&head=${encodeURIComponent(`${owner}:${branch}`)}`
        )
      );
      const pull = pulls[0] ?? null;
      const blocked = pull?.draft ? blockedQuestions(pull.body) : [];
      return { issue, run, pull, blocked };
    })
  );
}

function pullLabel(pull: IssueRunStatus['pull']): string {
  if (!pull) return '-';
  return `#${pull.number} ${pull.state}${pull.draft ? ' draft' : ''}`;
}

export function formatRunStatuses(statuses: readonly IssueRunStatus[]): string {
  const rows = statuses.map(({ issue, run, pull }) =>
    [
      `#${issue}`,
      run?.status ?? 'not found',
      run?.conclusion ?? '-',
      pullLabel(pull),
      pull?.html_url ?? run?.html_url ?? '-',
    ].join('  ')
  );
  const blocked = statuses
    .filter(status => status.blocked.length > 0)
    .map(
      ({ issue, pull, blocked: questions }) =>
        `#${issue} ${pull?.html_url ?? ''}\n${questions.map(question => `  - ${question}`).join('\n')}`
    );
  return [
    rows.join('\n'),
    ...(blocked.length > 0 ? [`Blocked, waiting for answers:\n${blocked.join('\n')}`] : []),
  ].join('\n\n');
}

export function anyRunFailed(statuses: readonly IssueRunStatus[]): boolean {
  return statuses.some(({ run }) => run?.status === 'completed' && run.conclusion !== 'success');
}
