import { existsSync, lstatSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import { runCommand, runOrThrow } from './exec.js';
import { allowedPathsDescription, changedPaths, gitBlobSha, headSha, refusedPaths } from './git.js';
import { type GitHubClient, paginate } from './github.js';
import type { FixIssuePaths } from './paths.js';
import { isScreenshot } from './screenshots.js';
import { type FixStatus, closesNumbers, readStatus } from './status.js';

interface OpenPullRequestOptions {
  readonly client: GitHubClient;
  readonly paths: FixIssuePaths;
  readonly repo: string;
  readonly issue: number;
  readonly branch: string;
  readonly baseBranch: string;
  readonly parentSha: string;
  readonly runId?: string;
  readonly runAttempt?: string;
  readonly serverUrl?: string;
  readonly coAuthor?: string;
  log?(line: string): void;
}

interface TreeEntry {
  readonly path: string;
  readonly mode: string;
  readonly type: 'blob';
  readonly sha: string | null;
}

interface ScreenshotRow {
  readonly id: string;
  readonly caption: string;
  readonly before: string | null;
  readonly after: string | null;
}

const shaSchema = z.object({ sha: z.string() });
const commitSchema = z.object({ tree: z.object({ sha: z.string() }) });
const refsSchema = z.array(z.object({ ref: z.string(), object: z.object({ sha: z.string() }) }));
const pullSchema = z.object({
  number: z.number(),
  draft: z.boolean(),
  node_id: z.string(),
  html_url: z.string(),
  head: z.object({ ref: z.string(), repo: z.object({ full_name: z.string() }).nullable() }),
});
const urlSchema = z.object({ html_url: z.string() });
const createdPullSchema = z.object({ number: z.number(), html_url: z.string() });
const runIdPattern = /^\d+$/;
const userSchema = z.object({ id: z.number(), login: z.string(), name: z.string().nullable() });
const botLoginPattern = /\[bot\]$/;

async function coAuthorTrailer(
  client: GitHubClient,
  login: string | undefined
): Promise<string | null> {
  if (!login || botLoginPattern.test(login)) return null;
  const user = userSchema.parse(await client.request('GET', `users/${login}`));
  const name = user.name?.trim() || user.login;
  return `Co-authored-by: ${name} <${user.id}+${user.login}@users.noreply.github.com>`;
}

function commitMessage(subject: string, trailer: string | null): string {
  return trailer ? `${subject}\n\n${trailer}\n` : subject;
}

const executableMode = '100755';
const fileMode = '100644';

function bullets(lines: readonly string[]): string {
  return lines.map(line => `- ${line}`).join('\n');
}

function sections(entries: readonly (readonly [string, readonly string[]])[]): string[] {
  return entries
    .filter(([, lines]) => lines.length > 0)
    .map(([title, lines]) => `\n## ${title}\n\n${bullets(lines)}\n`);
}

function imageCell(label: string, url: string | null): string {
  return url ? `![${label}](${url})` : '—';
}

export function renderScreenshotTable(rows: readonly ScreenshotRow[]): string {
  return [
    '| State | Before | After |',
    '| --- | --- | --- |',
    ...rows.map(
      row =>
        `| ${row.caption.replaceAll('|', '\\|')} | ${imageCell(`Before: ${row.id}`, row.before)} | ${imageCell(`After: ${row.id}`, row.after)} |`
    ),
  ].join('\n');
}

export function renderBody(
  status: FixStatus,
  numbers: readonly number[],
  screenshotTable: string | null
): string {
  const blocked = status.state === 'blocked';
  const keyword = blocked ? 'Refs' : 'Closes';
  const closes = numbers.map(number => `${keyword} #${number}\n`).join('');
  const body = sections([
    ['Needs a maintainer', status.handoff.map(renderHandoff)],
    ['Blocked', blocked ? status.questions : []],
    ['Questions', blocked ? [] : status.questions],
    ['Why', status.why],
    ['How', status.how],
    ['Tested', status.tested],
    ['Follow-ups', status.followUps],
  ]);
  const screenshots = screenshotTable ? [`\n## Screenshots\n\n${screenshotTable}\n`] : [];
  return [closes, ...body, ...screenshots].join('');
}

function renderHandoff(handoff: FixStatus['handoff'][number]): string {
  return `\`${handoff.path}\`: ${handoff.change}`;
}

function renderQuestionsComment(status: FixStatus, runUrl: string | null): string {
  const run = runUrl ? ` (${runUrl})` : '';
  const parts = [`The \`repo:fix-issue\` run${run} stopped before changing anything.`];
  if (status.questions.length > 0)
    parts.push(`It needs answers to:\n\n${bullets(status.questions)}`);
  if (status.handoff.length > 0) {
    parts.push(
      `A maintainer needs to make these changes, outside the paths the run may change:\n\n${bullets(status.handoff.map(renderHandoff))}`
    );
  }
  if (status.followUps.length > 0) {
    parts.push(`Worth a separate issue:\n\n${bullets(status.followUps)}`);
  }
  return `${parts.join('\n\n')}\n`;
}

function patchPaths(root: string, patchFile: string): string[] {
  return runOrThrow('git', ['apply', '--numstat', '-z', patchFile], { cwd: root })
    .split('\0')
    .filter(record => record !== '')
    .map(record => record.split('\t').slice(2).join('\t'));
}

function prepareWorkspace(paths: FixIssuePaths, parentSha: string): string {
  removeWorkspace(paths);
  runOrThrow('git', ['worktree', 'add', '--detach', '--quiet', paths.applyDir, parentSha], {
    cwd: paths.root,
  });
  if (existsSync(paths.patchFile) && readFileSync(paths.patchFile, 'utf8').trim() !== '') {
    const refused = refusedPaths(patchPaths(paths.root, paths.patchFile));
    if (refused.length > 0) {
      throw new Error(
        `refusing to apply the patch; only ${allowedPathsDescription} may change:\n  ${refused.join('\n  ')}`
      );
    }
    runOrThrow('git', ['apply', '--binary', paths.patchFile], { cwd: paths.applyDir });
  }
  return paths.applyDir;
}

function removeWorkspace(paths: FixIssuePaths): void {
  runCommand('git', ['worktree', 'remove', '--force', paths.applyDir], { cwd: paths.root });
  rmSync(paths.applyDir, { recursive: true, force: true });
  runCommand('git', ['worktree', 'prune'], { cwd: paths.root });
}

async function createBlob(client: GitHubClient, repo: string, file: string): Promise<string> {
  const content = readFileSync(file);
  const { sha } = shaSchema.parse(
    await client.request('POST', `repos/${repo}/git/blobs`, {
      content: content.toString('base64'),
      encoding: 'base64',
    })
  );
  if (sha !== gitBlobSha(content))
    throw new Error(`the blob created for ${file} does not match the file`);
  return sha;
}

async function findRef(client: GitHubClient, repo: string, branch: string): Promise<string | null> {
  const refs = refsSchema.parse(
    await client.request('GET', `repos/${repo}/git/matching-refs/heads/${branch}`)
  );
  return refs.find(ref => ref.ref === `refs/heads/${branch}`)?.object.sha ?? null;
}

async function commitTree(
  client: GitHubClient,
  repo: string,
  message: string,
  entries: readonly TreeEntry[],
  parent: string | null
): Promise<string> {
  const baseTree = parent
    ? commitSchema.parse(await client.request('GET', `repos/${repo}/git/commits/${parent}`)).tree
        .sha
    : undefined;
  const tree = shaSchema.parse(
    await client.request('POST', `repos/${repo}/git/trees`, {
      ...(baseTree ? { base_tree: baseTree } : {}),
      tree: entries,
    })
  );
  const commit = shaSchema.parse(
    await client.request('POST', `repos/${repo}/git/commits`, {
      message,
      tree: tree.sha,
      parents: parent ? [parent] : [],
    })
  );
  return commit.sha;
}

async function changeEntries(
  client: GitHubClient,
  repo: string,
  workspace: string
): Promise<TreeEntry[]> {
  const entries: TreeEntry[] = [];
  for (const change of changedPaths(workspace)) {
    const file = path.join(workspace, change.path);
    if (change.present) {
      const stat = lstatSync(file);
      if (stat.isSymbolicLink())
        throw new Error(`refusing to commit the symbolic link ${change.path}`);
      entries.push({
        path: change.path,
        mode: (stat.mode & 0o111) === 0 ? fileMode : executableMode,
        type: 'blob',
        sha: await createBlob(client, repo, file),
      });
    } else {
      const mode = runOrThrow('git', ['ls-tree', 'HEAD', '--', change.path], {
        cwd: workspace,
      }).split(' ')[0];
      entries.push({ path: change.path, mode: mode || fileMode, type: 'blob', sha: null });
    }
  }
  return entries;
}

async function publishScreenshots(
  options: OpenPullRequestOptions,
  status: FixStatus,
  log: (line: string) => void
): Promise<string | null> {
  const { client, repo, issue, paths } = options;
  const folder = `${issue}/${options.runId ?? 'local'}-${options.runAttempt ?? '1'}`;
  const entries: TreeEntry[] = [];
  const found: { id: string; caption: string; sides: Set<string> }[] = [];
  for (const { id, caption } of status.screenshots) {
    const sides = new Set<string>();
    for (const side of ['before', 'after']) {
      const file = path.join(paths.screenshotsDir, side, `${id}.png`);
      if (isScreenshot(file)) {
        entries.push({
          path: `${folder}/${side}/${id}.png`,
          mode: fileMode,
          type: 'blob',
          sha: await createBlob(client, repo, file),
        });
        sides.add(side);
      } else if (existsSync(file)) {
        log(`open-pull-request: skipping ${side}/${id}.png: not a PNG under 1 MB`);
      }
    }
    found.push({ id, caption, sides });
  }
  if (entries.length === 0) return null;

  const branch = `bot/screenshots-${issue}`;
  const head = await findRef(client, repo, branch);
  const commit = await commitTree(client, repo, `Screenshots for #${issue}`, entries, head);
  if (head) {
    await client.request('PATCH', `repos/${repo}/git/refs/heads/${branch}`, { sha: commit });
  } else {
    await client.request('POST', `repos/${repo}/git/refs`, {
      ref: `refs/heads/${branch}`,
      sha: commit,
    });
  }
  const base = `https://raw.githubusercontent.com/${repo}/${commit}/${folder}`;
  return renderScreenshotTable(
    found.map(({ id, caption, sides }) => ({
      id,
      caption,
      before: sides.has('before') ? `${base}/before/${id}.png` : null,
      after: sides.has('after') ? `${base}/after/${id}.png` : null,
    }))
  );
}

async function findOpenPullRequest(options: OpenPullRequestOptions) {
  const { client, repo, branch, baseBranch } = options;
  const owner = repo.split('/')[0];
  const pulls = z
    .array(pullSchema)
    .parse(
      await client.request(
        'GET',
        `repos/${repo}/pulls?state=open&head=${owner}:${branch}&base=${baseBranch}`
      )
    );
  return pulls.find(pull => pull.head.repo?.full_name === repo) ?? null;
}

function isEarlierRunBranch(ref: string, issue: number, current: string): boolean {
  const prefix = `bot/fix-issue-${issue}-`;
  return ref !== current && ref.startsWith(prefix) && runIdPattern.test(ref.slice(prefix.length));
}

const botCommitCount = 1;
const freshPullSchema = z.object({
  state: z.string(),
  draft: z.boolean(),
  commits: z.number(),
});

interface CurrentPull {
  readonly number: number;
  readonly draft: boolean;
}

async function keepReason(
  options: OpenPullRequestOptions,
  earlier: number,
  current: CurrentPull
): Promise<string | null> {
  const { client, repo } = options;
  const fresh = freshPullSchema.parse(
    await client.request('GET', `repos/${repo}/pulls/${earlier}`)
  );
  if (fresh.state !== 'open') return 'it is no longer open';
  if (fresh.commits > botCommitCount) return 'someone added commits to it';
  if (current.draft && !fresh.draft) return `it is ready and #${current.number} is only a draft`;
  return null;
}

async function supersedeEarlierPullRequests(
  options: OpenPullRequestOptions,
  current: CurrentPull,
  log: (line: string) => void
): Promise<void> {
  const { client, repo, issue, branch, baseBranch } = options;
  const open = z
    .array(pullSchema)
    .parse(await paginate(client, `repos/${repo}/pulls?state=open&base=${baseBranch}`));
  const earlier = open.filter(
    pull =>
      pull.number !== current.number &&
      pull.head.repo?.full_name === repo &&
      isEarlierRunBranch(pull.head.ref, issue, branch)
  );
  for (const pull of earlier) {
    try {
      const kept = await keepReason(options, pull.number, current);
      if (kept) {
        log(`open-pull-request: kept #${pull.number}; ${kept}`);
        continue;
      }
      await client.request('POST', `repos/${repo}/issues/${pull.number}/comments`, {
        body: `Superseded by #${current.number}.`,
      });
      await client.request('PATCH', `repos/${repo}/pulls/${pull.number}`, { state: 'closed' });
      await client.request('DELETE', `repos/${repo}/git/refs/heads/${pull.head.ref}`);
      log(`open-pull-request: closed #${pull.number}, superseded by #${current.number}`);
    } catch (error) {
      log(
        `open-pull-request: could not supersede #${pull.number}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

const readyMutation =
  'mutation($id: ID!) { markPullRequestReadyForReview(input: { pullRequestId: $id }) { clientMutationId } }';
const draftMutation =
  'mutation($id: ID!) { convertPullRequestToDraft(input: { pullRequestId: $id }) { clientMutationId } }';

export async function openPullRequest(options: OpenPullRequestOptions): Promise<string> {
  const { client, paths, repo, issue, branch, baseBranch, parentSha } = options;
  const log = options.log ?? console.log;
  if (headSha(paths.root) !== parentSha) throw new Error(`HEAD is not ${parentSha}`);
  const status = readStatus(paths.statusFile);
  if (!status.ok)
    throw new Error(`the fixer status is not valid:\n  ${status.problems.join('\n  ')}`);

  const workspace = prepareWorkspace(paths, parentSha);
  try {
    const refused = refusedPaths(changedPaths(workspace).map(change => change.path));
    if (refused.length > 0)
      throw new Error(
        `refusing to commit; only ${allowedPathsDescription} may change:\n  ${refused.join('\n  ')}`
      );
    const entries = await changeEntries(client, repo, workspace);

    if (entries.length === 0) {
      if (status.status.state !== 'blocked' && status.status.handoff.length === 0)
        throw new Error('state is done but nothing changed');
      const runUrl = options.runId
        ? `${options.serverUrl ?? 'https://github.com'}/${repo}/actions/runs/${options.runId}`
        : null;
      const comment = urlSchema.parse(
        await client.request('POST', `repos/${repo}/issues/${issue}/comments`, {
          body: renderQuestionsComment(status.status, runUrl),
        })
      );
      return comment.html_url;
    }

    const existing = await findOpenPullRequest(options);
    const branchHead = await findRef(client, repo, branch);
    const table = await publishScreenshots(options, status.status, log).catch((error: unknown) => {
      log(
        `open-pull-request: skipping screenshots: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    });
    const body = renderBody(status.status, closesNumbers(status.status, issue), table);
    const title = status.status.commit;
    const trailer = await coAuthorTrailer(client, options.coAuthor);
    const commit = await commitTree(
      client,
      repo,
      commitMessage(title, trailer),
      entries,
      parentSha
    );
    if (branchHead) {
      await client.request('PATCH', `repos/${repo}/git/refs/heads/${branch}`, {
        sha: commit,
        force: true,
      });
    } else {
      await client.request('POST', `repos/${repo}/git/refs`, {
        ref: `refs/heads/${branch}`,
        sha: commit,
      });
    }

    const draft = status.status.state === 'blocked' || status.status.handoff.length > 0;
    if (!existing) {
      const created = createdPullSchema.parse(
        await client.request('POST', `repos/${repo}/pulls`, {
          title,
          head: branch,
          base: baseBranch,
          body,
          draft,
        })
      );
      await supersedeEarlierPullRequests(options, { number: created.number, draft }, log);
      return created.html_url;
    }
    await client.request('PATCH', `repos/${repo}/pulls/${existing.number}`, { title, body });
    if (!draft && existing.draft) await client.graphql(readyMutation, { id: existing.node_id });
    if (draft && !existing.draft) await client.graphql(draftMutation, { id: existing.node_id });
    await supersedeEarlierPullRequests(options, { number: existing.number, draft }, log);
    return existing.html_url;
  } finally {
    removeWorkspace(paths);
  }
}
