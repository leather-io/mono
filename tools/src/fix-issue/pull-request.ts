import { existsSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import { isBriefComment, renderBriefComment } from './brief.js';
import { runCommand, runOrThrow } from './exec.js';
import {
  allowedPathsDescription,
  changedPaths,
  gitBlobSha,
  headSha,
  indexChanges,
  refusedPaths,
  treeEntry,
} from './git.js';
import { type GitHubClient, graphqlData, paginate } from './github.js';
import { filesWithConflictMarkers, mergeDev } from './merge.js';
import type { FixIssuePaths } from './paths.js';
import {
  type ReviseTarget,
  answerFeedback,
  carriedScreenshots,
  noAnswers,
  readReviseTarget,
  renderReviseSummary,
  unresolvedQuestion,
} from './revise-pull-request.js';
import { isScreenshot } from './screenshots.js';
import { type FixStatus, closesNumbers, readStatus } from './status.js';

interface PublishOptions {
  readonly client: GitHubClient;
  readonly paths: FixIssuePaths;
  readonly repo: string;
  readonly baseBranch: string;
  readonly parentSha: string;
  readonly runId?: string;
  readonly runAttempt?: string;
  readonly serverUrl?: string;
  readonly coAuthor?: string;
  readonly brief?: string;
  log?(line: string): void;
}

interface OpenPullRequestOptions extends PublishOptions {
  readonly issue: number;
  readonly branch: string;
}

interface RevisePullRequestOptions extends PublishOptions {
  readonly pullRequest: number;
  readonly mergeRequested: boolean;
  readonly appLogin: string;
}

interface TreeEntry {
  readonly path: string;
  readonly mode: string;
  readonly type: 'blob' | 'commit';
  readonly sha: string | null;
}

interface CommitParents {
  readonly parents: readonly string[];
  readonly base?: string;
}

interface ScreenshotRow {
  readonly id: string;
  readonly caption: string;
  readonly before: string | null;
  readonly after: string | null;
}

const shaSchema = z.object({ sha: z.string() });
const commitSchema = z.object({
  tree: z.object({ sha: z.string() }),
  parents: z.array(z.object({ sha: z.string() })).optional(),
});
const commentBodiesSchema = z.array(z.object({ body: z.string().nullable() }));
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

const fileModes = ['100644', '100755'];
const fileMode = '100644';
const submoduleMode = '160000';

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

function addWorkspace(paths: FixIssuePaths, parentSha: string): string {
  removeWorkspace(paths);
  runOrThrow('git', ['worktree', 'add', '--detach', '--quiet', paths.applyDir, parentSha], {
    cwd: paths.root,
  });
  return paths.applyDir;
}

function applyPatch(paths: FixIssuePaths): void {
  if (existsSync(paths.patchFile) && readFileSync(paths.patchFile, 'utf8').trim() !== '') {
    const refused = refusedPaths(patchPaths(paths.root, paths.patchFile));
    if (refused.length > 0) {
      throw new Error(
        `refusing to apply the patch; only ${allowedPathsDescription} may change:\n  ${refused.join('\n  ')}`
      );
    }
    runOrThrow('git', ['apply', '--binary', paths.patchFile], { cwd: paths.applyDir });
  }
}

function refuseForbiddenChanges(workspace: string): void {
  const refused = refusedPaths(changedPaths(workspace).map(change => change.path));
  if (refused.length > 0) {
    throw new Error(
      `refusing to commit; only ${allowedPathsDescription} may change:\n  ${refused.join('\n  ')}`
    );
  }
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
  { parents, base = parents[0] }: CommitParents
): Promise<string> {
  const baseTree = base
    ? commitSchema.parse(await client.request('GET', `repos/${repo}/git/commits/${base}`)).tree.sha
    : undefined;
  const tree =
    baseTree && entries.length === 0
      ? { sha: baseTree }
      : shaSchema.parse(
          await client.request('POST', `repos/${repo}/git/trees`, {
            ...(baseTree ? { base_tree: baseTree } : {}),
            tree: entries,
          })
        );
  const commit = shaSchema.parse(
    await client.request('POST', `repos/${repo}/git/commits`, {
      message,
      tree: tree.sha,
      parents,
    })
  );
  return commit.sha;
}

async function commitEntries(
  client: GitHubClient,
  repo: string,
  workspace: string,
  base: string,
  onGitHub: readonly string[]
): Promise<TreeEntry[]> {
  const entries: TreeEntry[] = [];
  for (const change of indexChanges(workspace, base)) {
    if (change.mode === null || change.sha === null) {
      entries.push({ path: change.path, mode: change.previousMode, type: 'blob', sha: null });
      continue;
    }
    const known = onGitHub.some(commit => {
      const entry = treeEntry(workspace, commit, change.path);
      return entry?.sha === change.sha && entry.mode === change.mode;
    });
    if (known) {
      entries.push({
        path: change.path,
        mode: change.mode,
        type: change.mode === submoduleMode ? 'commit' : 'blob',
        sha: change.sha,
      });
      continue;
    }
    if (!fileModes.includes(change.mode)) {
      throw new Error(`refusing to commit ${change.path}: it is not a regular file`);
    }
    const sha = await createBlob(client, repo, path.join(workspace, change.path));
    if (sha !== change.sha) throw new Error(`${change.path} changed while it was committed`);
    entries.push({ path: change.path, mode: change.mode, type: 'blob', sha });
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
  const commit = await commitTree(client, repo, `Screenshots for #${issue}`, entries, {
    parents: head ? [head] : [],
  });
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
  if (fresh.commits > botCommitCount) return 'it was revised or someone added commits to it';
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

async function isOwnCommit(
  client: GitHubClient,
  repo: string,
  commit: string,
  parentSha: string
): Promise<boolean> {
  const { parents } = commitSchema.parse(
    await client.request('GET', `repos/${repo}/git/commits/${commit}`)
  );
  return parents?.length === 1 && parents[0]?.sha === parentSha;
}

async function postBrief(
  options: OpenPullRequestOptions,
  pullRequest: number,
  isNew: boolean,
  log: (line: string) => void
): Promise<void> {
  const { client, repo } = options;
  const comment = renderBriefComment(options.brief);
  if (comment === null) return;
  try {
    const comments = `repos/${repo}/issues/${pullRequest}/comments`;
    if (!isNew) {
      const existing = commentBodiesSchema.parse(await paginate(client, comments));
      if (existing.some(entry => isBriefComment(entry.body))) return;
    }
    await client.request('POST', comments, { body: comment });
  } catch (error) {
    log(
      `open-pull-request: could not store the brief on #${pullRequest}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function runUrl(options: PublishOptions): string | null {
  return options.runId
    ? `${options.serverUrl ?? 'https://github.com'}/${options.repo}/actions/runs/${options.runId}`
    : null;
}

async function publishFirstRun(
  options: OpenPullRequestOptions,
  status: FixStatus,
  entries: readonly TreeEntry[],
  log: (line: string) => void
): Promise<string> {
  const { client, repo, issue, branch, baseBranch, parentSha } = options;
  if (entries.length === 0) {
    if (status.state !== 'blocked' && status.handoff.length === 0)
      throw new Error('state is done but nothing changed');
    const comment = urlSchema.parse(
      await client.request('POST', `repos/${repo}/issues/${issue}/comments`, {
        body: renderQuestionsComment(status, runUrl(options)),
      })
    );
    return comment.html_url;
  }

  const existing = await findOpenPullRequest(options);
  const branchHead = await findRef(client, repo, branch);
  if (branchHead && !(await isOwnCommit(client, repo, branchHead, parentSha))) {
    throw new Error(
      `refusing to overwrite ${branch}: it holds commits beyond this run's own, from a revise or a person`
    );
  }
  const table = await publishScreenshots(options, status, log).catch((error: unknown) => {
    log(`open-pull-request: skipping screenshots: ${errorMessage(error)}`);
    return null;
  });
  const body = renderBody(status, closesNumbers(status, issue), table);
  const title = status.commit;
  const trailer = await coAuthorTrailer(client, options.coAuthor);
  const commit = await commitTree(client, repo, commitMessage(title, trailer), entries, {
    parents: [parentSha],
  });
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

  const draft = status.state === 'blocked' || status.handoff.length > 0;
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
    await postBrief(options, created.number, true, log);
    await supersedeEarlierPullRequests(options, { number: created.number, draft }, log);
    return created.html_url;
  }
  await client.request('PATCH', `repos/${repo}/pulls/${existing.number}`, { title, body });
  if (!draft && existing.draft) await client.graphql(readyMutation, { id: existing.node_id });
  if (draft && !existing.draft) await client.graphql(draftMutation, { id: existing.node_id });
  await postBrief(options, existing.number, false, log);
  await supersedeEarlierPullRequests(options, { number: existing.number, draft }, log);
  return existing.html_url;
}

async function publishRevise(
  options: RevisePullRequestOptions,
  target: ReviseTarget,
  status: FixStatus,
  entries: readonly TreeEntry[],
  resolved: boolean,
  log: (line: string) => void
): Promise<string> {
  const { client, repo, parentSha } = options;
  let commit: string | null = null;
  if (resolved && (target.merge || entries.length > 0)) {
    const trailer = await coAuthorTrailer(client, options.coAuthor);
    commit = await commitTree(client, repo, commitMessage(status.commit, trailer), entries, {
      parents: target.merge ? [target.head, parentSha] : [target.head],
      base: target.merge ? parentSha : target.head,
    });
    await client.request('PATCH', `repos/${repo}/git/refs/heads/${target.branch}`, { sha: commit });
  }

  const draft = status.state === 'blocked' || status.handoff.length > 0;
  await client.request('PATCH', `repos/${repo}/pulls/${target.number}`, {
    body: renderBody(
      status,
      closesNumbers(status, target.issue),
      carriedScreenshots(target.body, target.ordinal)
    ),
  });
  if (draft !== target.draft) {
    await graphqlData(client, z.unknown(), draft ? draftMutation : readyMutation, {
      id: target.nodeId,
    }).catch((error: unknown) => {
      log(
        `open-pull-request: could not make #${target.number} ${draft ? 'a draft' : 'ready'}: ${errorMessage(error)}`
      );
    });
  }

  const answers = await answerFeedback({
    client,
    repo,
    pullRequest: target.number,
    head: target.head,
    status,
    resolve: resolved,
    log,
  }).catch((error: unknown) => {
    log(`open-pull-request: could not answer the review threads: ${errorMessage(error)}`);
    return noAnswers;
  });
  const summary = urlSchema.parse(
    await client.request('POST', `repos/${repo}/issues/${target.number}/comments`, {
      body: renderReviseSummary({
        ordinal: target.ordinal,
        status,
        commit,
        mergedDev: target.merge ? parentSha : null,
        answers,
        requestedBy: options.coAuthor,
        request: options.brief,
        runUrl: runUrl(options),
      }),
    })
  );
  if (commit !== null && !draft && answers.reviewers.length > 0) {
    await client
      .request('POST', `repos/${repo}/pulls/${target.number}/requested_reviewers`, {
        reviewers: answers.reviewers,
      })
      .catch((error: unknown) => {
        log(`open-pull-request: could not re-request review: ${errorMessage(error)}`);
      });
  }
  return summary.html_url;
}

export async function openPullRequest(
  options: OpenPullRequestOptions | RevisePullRequestOptions
): Promise<string> {
  const { client, paths, repo, parentSha } = options;
  const log = options.log ?? console.log;
  if (headSha(paths.root) !== parentSha) throw new Error(`HEAD is not ${parentSha}`);
  const read = readStatus(paths.statusFile);
  if (!read.ok) throw new Error(`the fixer status is not valid:\n  ${read.problems.join('\n  ')}`);
  const target =
    'pullRequest' in options ? await readReviseTarget({ ...options, devSha: parentSha }) : null;

  const start = target?.head ?? parentSha;
  const workspace = addWorkspace(paths, start);
  try {
    const conflicts = target?.merge ? mergeDev(workspace, parentSha).conflicts : [];
    applyPatch(paths);
    refuseForbiddenChanges(workspace);
    const unresolved = filesWithConflictMarkers(workspace, conflicts);
    const entries = await commitEntries(
      client,
      repo,
      workspace,
      target?.merge ? parentSha : start,
      [start, parentSha]
    );
    if ('pullRequest' in options && target) {
      const status: FixStatus =
        unresolved.length === 0
          ? read.status
          : {
              ...read.status,
              state: 'blocked',
              questions: [...read.status.questions, unresolvedQuestion(unresolved)],
            };
      return await publishRevise(options, target, status, entries, unresolved.length === 0, log);
    }
    if ('pullRequest' in options) throw new Error('the pull request to revise was not read');
    return await publishFirstRun(options, read.status, entries, log);
  } finally {
    removeWorkspace(paths);
  }
}
