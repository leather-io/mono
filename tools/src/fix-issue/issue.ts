import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import { type GitHubClient, GitHubError, paginate } from './github.js';

const userSchema = z.object({ login: z.string(), type: z.string().optional() }).nullable();

const issueSchema = z.object({
  title: z.string(),
  html_url: z.string(),
  state: z.string(),
  body: z.string().nullable(),
  created_at: z.string(),
  user: userSchema,
  labels: z.array(z.union([z.string(), z.object({ name: z.string() })])),
  pull_request: z.unknown().optional(),
});

export const commentSchema = z.object({
  body: z.string().nullable(),
  created_at: z.string(),
  user: userSchema,
  performed_via_github_app: z
    .object({ client_id: z.string().nullable().optional() })
    .nullable()
    .optional(),
});

const permissionSchema = z.object({ permission: z.string() });

type Issue = z.infer<typeof issueSchema>;
type Comment = z.infer<typeof commentSchema>;

const trustedPermissions = ['admin', 'maintain', 'write'];

interface FetchIssueOptions {
  readonly client: GitHubClient;
  readonly repo: string;
  readonly issue: number;
  readonly outFile: string;
  readonly workflowAppClientId?: string;
}

interface FetchedIssue {
  readonly comments: number;
  readonly omittedComments: number;
  readonly issueOmitted: boolean;
}

function text(value: string | null): string {
  return value === null || value === '' ? '(empty)' : value;
}

function login(user: Issue['user']): string {
  return user?.login ?? 'ghost';
}

async function hasWriteAccess(client: GitHubClient, repo: string, user: string): Promise<boolean> {
  try {
    const { permission } = permissionSchema.parse(
      await client.request('GET', `repos/${repo}/collaborators/${user}/permission`)
    );
    return trustedPermissions.includes(permission);
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) return false;
    throw error;
  }
}

export async function trustedAuthors(
  client: GitHubClient,
  repo: string,
  users: readonly (string | null)[]
): Promise<Set<string>> {
  const trusted = new Set<string>();
  for (const user of new Set(users)) {
    if (user !== null && (await hasWriteAccess(client, repo, user))) trusted.add(user);
  }
  return trusted;
}

function isTrusted(trusted: ReadonlySet<string>, user: Issue['user']): boolean {
  return user !== null && trusted.has(user.login);
}

export function isWorkflowAppComment(comment: Comment, clientId: string | undefined): boolean {
  return (
    clientId !== undefined &&
    clientId !== '' &&
    comment.user?.type === 'Bot' &&
    comment.user.login.endsWith('[bot]') &&
    comment.performed_via_github_app?.client_id === clientId
  );
}

function renderIssue(
  issue: Issue,
  comments: readonly Comment[],
  omittedComments: number,
  issueTrusted: boolean
): string {
  const labels = issue.labels.map(label => (typeof label === 'string' ? label : label.name));
  const renderedComments =
    comments.length === 0
      ? 'none'
      : comments
          .map(
            comment =>
              `### @${login(comment.user)} on ${comment.created_at}\n\n${text(comment.body)}`
          )
          .join('\n\n');
  const omittedNote =
    omittedComments === 0
      ? []
      : [
          '',
          `${omittedComments} comments from people without write access to the repository were omitted.`,
        ];
  const header = issueTrusted
    ? [`# ${issue.title}`, '', issue.html_url]
    : [
        `# Issue opened by @${login(issue.user)}`,
        '',
        issue.html_url,
        '',
        `@${login(issue.user)} has no write access to the repository, so the title and body are omitted. The brief is the specification.`,
      ];
  return [
    ...header,
    '',
    `Labels: ${labels.length === 0 ? 'none' : labels.join(', ')}`,
    `Opened by @${login(issue.user)} on ${issue.created_at}`,
    '',
    '## Body',
    '',
    issueTrusted ? text(issue.body) : '(omitted)',
    '',
    '## Comments',
    '',
    renderedComments,
    ...omittedNote,
    '',
  ].join('\n');
}

export async function fetchIssue({
  client,
  repo,
  issue,
  outFile,
  workflowAppClientId,
}: FetchIssueOptions): Promise<FetchedIssue> {
  let raw: unknown;
  try {
    raw = await client.request('GET', `repos/${repo}/issues/${issue}`);
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) {
      throw new Error(`issue #${issue} was not found in ${repo}`);
    }
    throw error;
  }
  const parsed = issueSchema.parse(raw);
  if (parsed.pull_request !== undefined)
    throw new Error(`#${issue} is a pull request, not an issue`);
  if (parsed.state !== 'open') throw new Error(`issue #${issue} is closed`);
  const comments = z
    .array(commentSchema)
    .parse(await paginate(client, `repos/${repo}/issues/${issue}/comments`));
  const fromWorkflowApp = comments.filter(comment =>
    isWorkflowAppComment(comment, workflowAppClientId)
  );
  const trusted = await trustedAuthors(client, repo, [
    parsed.user?.login ?? null,
    ...comments
      .filter(comment => !fromWorkflowApp.includes(comment))
      .map(comment => comment.user?.login ?? null),
  ]);
  const kept = comments.filter(
    comment => fromWorkflowApp.includes(comment) || isTrusted(trusted, comment.user)
  );
  const issueTrusted = isTrusted(trusted, parsed.user);
  mkdirSync(path.dirname(outFile), { recursive: true });
  writeFileSync(outFile, renderIssue(parsed, kept, comments.length - kept.length, issueTrusted));
  return {
    comments: kept.length,
    omittedComments: comments.length - kept.length,
    issueOmitted: !issueTrusted,
  };
}
