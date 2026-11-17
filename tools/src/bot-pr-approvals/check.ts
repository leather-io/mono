import { z } from 'zod';

import { type GitHubClient, paginate } from '../fix-issue/github.js';

const workflowFile = 'repo:fix-issues.yml';
const botLogin = 'github-actions[bot]';
const botBranchPattern = /^bot\/fix-(\d+)$/;
const protectedDirectory = '.github/';
const runsPageSize = 100;
const maxRunPages = 10;
const decidingStates = new Set(['APPROVED', 'CHANGES_REQUESTED', 'DISMISSED']);
const summaryHeading = '## bot-pr-approvals';

const accountSchema = z.object({ login: z.string() });
const pullSchema = z.object({
  user: accountSchema.nullable(),
  head: z.object({ ref: z.string(), sha: z.string() }),
  draft: z.boolean(),
});
const runsSchema = z.object({
  workflow_runs: z.array(
    z.object({
      display_title: z.string(),
      html_url: z.string(),
      actor: accountSchema.nullish(),
      triggering_actor: accountSchema.nullish(),
    })
  ),
});
const reviewsSchema = z.array(
  z.object({
    id: z.number(),
    state: z.string(),
    commit_id: z.string().nullable(),
    user: accountSchema.nullable(),
  })
);
const filesSchema = z.array(
  z.object({ filename: z.string(), previous_filename: z.string().optional() })
);

interface CheckOptions {
  readonly client: GitHubClient;
  readonly repo: string;
  readonly number: number;
  readonly requiredApprovals: number;
}

interface ApprovalsVerdict {
  readonly passed: boolean;
  readonly messages: readonly string[];
  readonly summary: readonly string[];
}

interface Dispatcher {
  readonly login: string;
  readonly url: string;
}

interface Approval {
  readonly login: string;
  readonly commit: string | null;
}

function compareText(a: string, b: string): number {
  if (a < b) return -1;
  return a > b ? 1 : 0;
}

async function fetchDispatchers(
  client: GitHubClient,
  repo: string,
  title: string
): Promise<Dispatcher[]> {
  const dispatchers = new Map<string, Dispatcher>();
  for (let page = 1; page <= maxRunPages; page += 1) {
    const { workflow_runs: runs } = runsSchema.parse(
      await client.request(
        'GET',
        `repos/${repo}/actions/workflows/${workflowFile}/runs?event=workflow_dispatch&per_page=${runsPageSize}&page=${page}`
      )
    );
    for (const run of runs.filter(entry => entry.display_title === title)) {
      for (const account of [run.actor, run.triggering_actor]) {
        if (!account) continue;
        const key = `${account.login.toLowerCase()}\n${run.html_url}`;
        if (!dispatchers.has(key))
          dispatchers.set(key, { login: account.login, url: run.html_url });
      }
    }
    if (runs.length < runsPageSize) break;
  }
  return [...dispatchers.entries()]
    .sort(([a], [b]) => compareText(a, b))
    .map(([, dispatcher]) => dispatcher);
}

async function fetchLatestApprovals(
  client: GitHubClient,
  repo: string,
  number: number
): Promise<Approval[]> {
  const reviews = reviewsSchema.parse(
    await paginate(client, `repos/${repo}/pulls/${number}/reviews`)
  );
  const latest = new Map<string, Approval & { readonly state: string }>();
  for (const review of [...reviews].sort((a, b) => a.id - b.id)) {
    if (!review.user || !decidingStates.has(review.state)) continue;
    latest.set(review.user.login.toLowerCase(), {
      login: review.user.login,
      commit: review.commit_id,
      state: review.state,
    });
  }
  return [...latest.entries()]
    .sort(([a], [b]) => compareText(a, b))
    .filter(([, review]) => review.state === 'APPROVED')
    .map(([, { login, commit }]) => ({ login, commit }));
}

async function fetchProtectedChanges(
  client: GitHubClient,
  repo: string,
  number: number
): Promise<string[]> {
  const files = filesSchema.parse(await paginate(client, `repos/${repo}/pulls/${number}/files`));
  const names = files.flatMap(file =>
    file.previous_filename ? [file.filename, file.previous_filename] : [file.filename]
  );
  return [...new Set(names.filter(name => name.startsWith(protectedDirectory)))].sort(compareText);
}

export async function checkBotPrApprovals({
  client,
  repo,
  number,
  requiredApprovals,
}: CheckOptions): Promise<ApprovalsVerdict> {
  const pull = pullSchema.parse(await client.request('GET', `repos/${repo}/pulls/${number}`));
  const author = pull.user?.login ?? '';
  const issue = botBranchPattern.exec(pull.head.ref)?.[1];

  if (author !== botLogin || issue === undefined) {
    const message = `#${number} by ${author} from ${pull.head.ref} is not a fix-issues bot pull request; nothing to check.`;
    return { passed: true, messages: [message], summary: [summaryHeading, '', message] };
  }

  const title = `fix-issues: #${issue}`;
  const dispatchers = await fetchDispatchers(client, repo, title);
  const summary = [
    summaryHeading,
    '',
    `Fix-issues pull request #${number} for issue #${issue} (\`${pull.head.ref}\` at \`${pull.head.sha}\`, draft: ${pull.draft}).`,
    '',
    '### Dispatched by',
    '',
  ];

  if (dispatchers.length === 0) {
    const reason = `no workflow_dispatch run of ${workflowFile} titled '${title}' was found; a bot pull request nobody dispatched is blocked`;
    return {
      passed: false,
      messages: [reason],
      summary: [...summary, 'None found.', '', '### Verdict', '', `❌ ${reason}`],
    };
  }

  const approvals = await fetchLatestApprovals(client, repo, number);
  const protectedChanges = await fetchProtectedChanges(client, repo, number);
  const dispatcherLogins = new Set(dispatchers.map(({ login }) => login.toLowerCase()));
  const approverLogins = new Set(approvals.map(({ login }) => login.toLowerCase()));
  const independent = approvals.filter(
    ({ login, commit }) =>
      commit === pull.head.sha &&
      !dispatcherLogins.has(login.toLowerCase()) &&
      login.toLowerCase() !== author.toLowerCase()
  );
  const offenders = dispatchers.filter(({ login }) => approverLogins.has(login.toLowerCase()));

  const violations = [
    ...protectedChanges.map(
      file => `${file} is changed; a fix-issues pull request may never change ${protectedDirectory}`
    ),
    ...offenders.map(({ login, url }) => `approval by ${login} is not allowed: dispatched ${url}`),
    ...(independent.length < requiredApprovals
      ? [
          `${independent.length} of ${requiredApprovals} required approvals of ${pull.head.sha} from reviewers who did not dispatch #${issue}`,
        ]
      : []),
  ];

  summary.push(
    ...dispatchers.map(({ login, url }) => `- \`${login}\`: ${url}`),
    '',
    '### Current approvers',
    '',
    ...(approvals.length === 0 ? ['None.'] : approvals.map(({ login }) => `- \`${login}\``)),
    '',
    '### Verdict',
    ''
  );

  if (violations.length === 0) {
    const message = `${independent.length} of ${requiredApprovals} required approvals from reviewers who did not dispatch #${issue}, and none by a dispatcher`;
    return { passed: true, messages: [message], summary: [...summary, `✅ ${message}.`] };
  }

  return {
    passed: false,
    messages: violations,
    summary: [...summary, ...violations.map(violation => `❌ ${violation}`)],
  };
}
