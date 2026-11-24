# fix-issue

The steps of the `repo:fix-issue` workflow, run as `pnpm lt fix-issue <step>`. The workflow
(`.github/workflows/repo:fix-issue.yml`) and its round action (`.github/actions/fix-issue-round`)
only call these commands and Claude; everything they decide lives here. The same workflow has two
uses: dispatched with an issue it writes a new pull request, and dispatched with a pull request it
revises that pull request on its own branch.

## Flow

```
dispatch (issue, brief)
  │
  ▼  job fix-issue: read-only token, runs the fixer's code
fetch-issue ─▶ round 1 ─▶ round 2? ─▶ round 3? ─▶ round finish ─▶ strip-forbidden
  ─▶ screenshots capture ─▶ patch
                 │
                 └─ fix (Claude) ─▶ round verify ─▶ review (Claude) ─▶ round check-review
                                     ─▶ round end
  │
  ▼  job open-pull-request: write token, runs only dev's code
open-pull-request ─▶ signed commit on a new bot/fix-issue-<n>-<run id>, co-authored by the dispatcher
  ─▶ pull request (or a comment with questions)
```

How rounds end, and what `round finish` and `strip-forbidden` do after them, is under
[How rounds end](#how-rounds-end).

```
dispatch (pull_request, notes?, merge?)
  │
  ▼  job fix-issue: read-only token, runs the pull request's code and the fixer
revise prepare (checks the pull request, gathers feedback, checks out its head, merges dev if needed)
  ─▶ round 1 ─▶ round 2? ─▶ round 3? ─▶ round finish ─▶ strip-forbidden ─▶ patch
  │
  ▼  job open-pull-request: write token, runs only dev's code
open-pull-request --pull-request ─▶ signed commit on top of the branch head, co-authored by the dispatcher
  ─▶ thread replies, new description, a comment that records the revise
```

[Revising a pull request](#revising-a-pull-request) has the rules.

## Files in `tmp/fix-issue/`

| File                                  | Written by                                       | Read by                                                  |
| ------------------------------------- | ------------------------------------------------ | -------------------------------------------------------- |
| `issue.md`                            | `fetch-issue`                                    | fixer, reviewer                                          |
| `notes.md`                            | workflow (the brief)                             | fixer, reviewer                                          |
| `status.json`                         | fixer, then `round finish` and `strip-forbidden` | every step; schema in `status.ts`                        |
| `verify.md`                           | `round verify` on failure                        | `round end`, next fixer                                  |
| `review-snapshot.txt`                 | `round verify`                                   | `round check-review`                                     |
| `review.json`                         | reviewer                                         | `round check-review`, `round end`; schema in `review.ts` |
| `rounds/<n>/`                         | `round end`                                      | next fixer and reviewer, `round finish`                  |
| `run.json`                            | `round end`                                      | `round end`, `round finish`                              |
| `screenshot-specs/*.spec.ts`          | fixer                                            | `screenshots capture`                                    |
| `screenshots/{before,after}/<id>.png` | `screenshots capture`                            | `open-pull-request`                                      |
| `fix.patch`                           | workflow (`git diff`)                            | `open-pull-request`                                      |
| `feedback.md`                         | `revise prepare`                                 | fixer, reviewer                                          |
| `pull-request.md`                     | `revise prepare`                                 | fixer                                                    |
| `pull-request.diff`                   | `revise prepare`                                 | fixer, reviewer                                          |
| `revise.json`                         | `revise prepare`                                 | `round verify`, `round end`, `open-pull-request`         |

## Modules

| Module                              | Responsibility                                                                                           |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `status.ts`                         | the fixer status schema and its rules (subject, required entries, screenshots)                           |
| `review.ts`                         | the review schema                                                                                        |
| `git.ts`                            | changed paths, allowed paths, tree snapshots, blob hashes                                                |
| `verify.ts`                         | the verification gate                                                                                    |
| `strip.ts`                          | removing changes outside the allowed paths, with a blocking question                                     |
| `rounds.ts`                         | round verify (clears the last round, snapshots for the review), review check, end and finish             |
| `screenshots.ts`                    | capture before and after, PNG checks                                                                     |
| `issue.ts`                          | fetch and render the issue                                                                               |
| `pull-request.ts`                   | patch in a separate worktree, signed commit, screenshots, pull request or questions comment, superseding |
| `brief.ts`                          | the brief as a comment on the pull request, and reading it back                                          |
| `revise-gate.ts`                    | whether a pull request may be revised, and what the revise has to address                                |
| `feedback.ts`                       | unresolved review threads and review summaries by people with write access, rendered as `feedback.md`    |
| `merge.ts`                          | when a revise merges dev, the merge itself (the same in both jobs), leftover conflict markers            |
| `revise.ts`                         | moving the fixer job from dev to the pull request head: the checkout, the merge, the diff                |
| `revise-pull-request.ts`            | what `open-pull-request` adds for a revise: its target, thread replies, the comment that records it      |
| `revise-state.ts`                   | `revise.json`, the branch name pattern, the marker that counts revises                                   |
| `app-token.ts`                      | the App JWT signed through KMS, the installation token and its revoke                                    |
| `stop-guard.ts`                     | the Stop hook that keeps an agent working until its output file is valid                                 |
| `dispatch.ts`                       | dispatching one brief of a run directory, or the revise of a pull request                                |
| `run-status.ts`                     | the latest run and pull request per issue, and the questions of blocked drafts                           |
| `github.ts`                         | the GitHub REST and GraphQL client, over a token or the `gh` CLI                                         |
| `exec.ts`, `outputs.ts`, `paths.ts` | running commands, step outputs, the paths under `tmp/fix-issue/`                                         |

Specs sit next to each module and use the helpers in `test/`: `test-repo.ts` (a throwaway git repository) and
`fake-github.ts` (a recording GitHub client) instead of real tools.

## How a run works

**What the run does.** Job `fix-issue` (read-only token) checks out `dev`,
renders the issue and its comments to `tmp/fix-issue/issue.md` (only text by people with write
access to the repository: their permission is looked up per author, because `leather-io`
memberships are private; anyone else's comments, and the title and body of an issue they opened,
are left out with a note, so the brief must carry what an outside report says), writes the brief to
`tmp/fix-issue/notes.md`, builds the packages, writes `apps/extension/.env` from the `PUBLIC_*` repository variables,
installs Chromium for Playwright and runs the fixer
with `.github/prompts/fix-issue.md`. `fetch-issue` fails the run when the number is a pull request
or a closed issue. The fixer can build the extension in test mode and run its
end-to-end specs under `xvfb-run` with the `EXTENSION_INTEGRATION_TEST_MNEMONIC` test wallet. It has
no GitHub MCP server and is told not to fetch issues or pull requests itself, so its only view of the
issue is the filtered `issue.md`; on a public repository a fixer with network access could still
fetch public issue text, which the prompt, auto mode's classifier and the pull request job's checks
are what stand against.

The fix runs in up to three rounds of the composite action `.github/actions/fix-issue-round`, each
fix → verify → review:

- **Fix.** Round 1 follows `.github/prompts/fix-issue.md`; later rounds follow
  `.github/prompts/fix-issue-round.md` and fix only what the previous round reported.
- **Verify.** `pnpm lt fix-issue round verify`: the status in `status.json` must be valid, every
  change must be under the allowed paths; when `pnpm-lock.yaml` or a `package.json` changed, every
  `node_modules` and ignored `*.tsbuildinfo` is removed and the dependencies reinstalled from the
  lockfile, as CI starts; `pnpm format` must
  change nothing, then syncpack,
  filenames, lint, typecheck, knip, the extension's unused exports, the dependency rules (after
  building the changed packages) and the unit tests of every changed package and its
  dependents. A failure is written to `verify.md` with the tail of the failing output and sends the
  change back to fix; the review is skipped. When nothing changed, a `blocked` status or one with
  handoffs skips the gate and the review, and a `done` status fails.
- **Review.** A separate Claude pass with `.github/prompts/fix-issue-review.md` writes `review.json`:
  confirmed `critical`, `blocker` and `regression` findings under `blocking`, anything smaller under
  `minor`. It maps every expected behavior, `Settled:` line and `Done when` box to the code that
  delivers it (a gap is a `blocker`), traces each user-visible state through to its render, and
  checks every doubt in the fixer's questions and `Not verified` lines in the code instead of
  passing it over. Later rounds see earlier reviews and report only what is still unfixed, what the
  fixes since introduced, and new `critical` findings, scope gaps and confirmed doubts.
  The run fails if the review touched any file. A review that ends without a valid `review.json`
  (it crashed, or ended its turn waiting on something) fails the round, not the run, so the next
  round runs the fix and review again. Both agents may use background commands and sub-agents, but
  a headless session ends with the agent's turn and is never woken when they finish, so a Claude
  Code `Stop` hook (`lt fix-issue stop-guard --output status|review`) refuses to let the fixer stop until
  `status.json` is valid, or the reviewer until `review.json` is, up to three times per round; the
  failed round above is the backstop. Blocking findings send the change back to fix; minor ones are
  left for the human review.

### How rounds end

Each round is kept in `tmp/fix-issue/rounds/<n>/`, which is uploaded with the patch, and recorded
in `tmp/fix-issue/run.json`, which stays on the runner. `round end` decides what comes next:

| The round                                                               | Outcome   | Next                          |
| ----------------------------------------------------------------------- | --------- | ----------------------------- |
| checks passed and the review found nothing blocking                     | `clean`   | finish                        |
| the fixer set `"state": "blocked"`                                      | `blocked` | finish                        |
| checks failed while the status lists a `handoff`                        | `failed`  | finish                        |
| checks failed, or the review found blocking findings or wrote no review | `failed`  | the next round, up to round 3 |

A blocked fixer that changed files is still verified and reviewed, so its draft says how the change
fared. Then `round finish` adds one `Round <n>: …` entry per round to `tested` and turns any
unresolved end into a question, so the result is a draft pull request:

- blocking findings a blocked fixer left unfixed;
- a check that failed while handoffs wait, naming the check and the pending files (no round can
  change a file outside the allowed paths);
- a fix that still fails after round 3, naming what fails.

Last, `strip-forbidden` removes every change outside the allowed paths (restoring tracked files,
deleting new ones) and, when it removed any, sets the status to `blocked` with a question that names
the paths and says to treat the run as suspect unless the issue asked for them. The patch therefore
only ever holds allowed paths, and a fixer that touched `.github/` produces a draft pull request with
that question (or, when nothing else changed, a comment with it on the issue) instead of a refused,
empty run.

For a change that alters what an extension screen shows, the fixer writes throwaway Playwright
specs in `tmp/fix-issue/screenshot-specs/` that save one PNG per state, and lists the states under
`screenshots` in the status. `pnpm lt fix-issue screenshots capture` builds the test extension and
runs them on the fix, stashes the fix, builds and runs them on `dev`, then restores the fix and
fails the run if it did not come back intact. A failed build or spec only leaves that cell empty.
`open-pull-request` checks each image (a real PNG, at most 1 MB, a lowercase hyphenated name, 12 at
most), commits them to the issue's own `bot/screenshots-<issue>` branch under
`<issue>/<run>-<attempt>/` (created on the issue's first run, added to after that; a new dispatch
cancels the issue's run in progress, so runs for one issue never overlap and the branch never
races), and adds a `## Screenshots` table with one row per
state and `Before` and `After` images linked by commit. A failure to publish them is logged and the
pull request opens without the table; screenshots never cost the fix. Delete a
`bot/screenshots-<issue>` branch once its issue is closed if you want the branch list tidy.

Job `open-pull-request` builds `tools` from `dev`, gets only the run's artifact (the patch, the
status file, the round records and the screenshots), applies
the patch in a separate git worktree, refuses any path outside `apps/`, `packages/`, `tools/` and
`pnpm-lock.yaml`, and writes the signed commit to a new `bot/fix-issue-<n>-<run id>` (`pnpm lt fix-issue
open-pull-request`). The commit carries a `Co-authored-by:` trailer for the person who dispatched
the run (`github.triggering_actor`, with their public name and GitHub no-reply email; bots are
skipped), which GitHub keeps in the squash-merge message. `done`
opens a pull request, with a `## Questions` section when the fixer left any; `blocked` with changes
opens a draft that lists the questions under `## Blocked` and links the issues with `Refs` instead
of `Closes`; `blocked` with no changes comments the questions on the issue. Any `handoff` entry (a change
outside the allowed paths that a maintainer must make) puts a `## Needs a maintainer` section at
the top of the body and makes the pull request a draft; with no changes at all, the handoffs go
into the issue comment instead.
Every run gets its own branch and its own pull request. Once it is open, the run comments
`Superseded by #<new>` on the issue's earlier bot pull requests (those on a
`bot/fix-issue-<n>-` branch), closes them and deletes their branches. It checks each one again
first and keeps it when it holds more than the run's one commit (a revise or a person added to it),
when it is no longer open, or when it is ready and the new pull request is only a draft. One it fails to supersede is logged and left open; the
run still succeeds. A new run never moves an
earlier run's branch, so a change to a workflow on `dev` between runs never needs the App's
Workflows permission, which it does not have. The one exception is "Re-run jobs" on the same run:
`open-pull-request` then force-updates that run's own branch to a fresh commit on the same parent
and updates its pull request, so a flaky failure there costs a job re-run, not a new fixer run. It
refuses when the branch head is anything but the run's own single commit, so a re-run never
overwrites a revise or a person's commit.

The brief the run was dispatched with is posted on the new pull request as a folded comment
(`<!-- fix-issue:brief -->`). That is its durable home: a later revise reads it back from there,
long after the run's artifact has expired, and reviewers can read what the fixer was told. It needs
no branch and no permission beyond the ones the App has. A dispatch with no brief stores none, and
a failure to post it is logged and does not cost the pull request.
`## Follow-ups` lists what the run deliberately left alone but thinks deserves its own issue: the
fixer's `followUps` (things it noticed outside the issue, and ideas from changes the review made it
restore) plus the last review's minor findings, minus those on a file the fixer's entries already
name, each as "`path`: note", 20 at most. Nothing opens issues automatically; turn the ones
worth keeping into issues by hand.

### Revising a pull request

To have a bot pull request changed, dispatch the same workflow with `pull_request` instead of
`issue` (the "Run workflow" form, `gh workflow run`, or
`pnpm lt fix-issue dispatch --pull-request <n> [--notes-file <file>] [--merge]`). Only people with
write access can dispatch, and the dispatcher is recorded as on a first run.

| Dispatch                         | What the revise addresses                                                  |
| -------------------------------- | -------------------------------------------------------------------------- |
| `pull_request` alone             | every unresolved review thread and every review summary on the head commit |
| with `notes`                     | the notes, plus those threads and summaries                                |
| with `merge`                     | merges `dev` into the branch and fixes what that breaks, nothing else      |
| with `merge` and `notes`         | the merge, the notes, the threads and the summaries                        |
| any of them, on a conflicting PR | merges `dev` first; without notes it then only resolves the conflicts      |

The run is named `fix-issue: revise #<pull request>`, and one revise runs at a time per pull
request: a second dispatch waits for the first instead of cancelling it.

Job `fix-issue` starts on `dev` as always. Before any code of the pull request runs,
`revise prepare` fails the run, with the reason, unless all of this holds:

- the pull request is open, targets `dev`, has its head in this repository on a
  `bot/fix-issue-<issue>-<run id>` branch, and was opened by a bot (`open-pull-request` checks
  again, with the App's own identity, that the bot is the fix-issue App before it writes);
- fewer than five revises have run on it: each one leaves a summary comment with a
  `<!-- fix-issue:revise n -->` marker, and only the App's own comments count;
- there is something to revise: notes, an unresolved thread, a review summary or a conflict;
- `dev` does not conflict with the branch in a file outside the allowed paths, which a person has
  to merge.

It then writes what the fixer works from: `issue.md` as in a first run, `notes.md` from the brief
comment (empty when the pull request has none), `pull-request.md` with the title and the
description, and `feedback.md`. Feedback is one item per section, each with an id: `instructions`
(the notes of the dispatch), `merge`, `thread-<id>` per unresolved review thread with its path, line
and comments, and `review-<id>` per review summary. The same write-access filter as `issue.md`
applies to every thread comment and every review: text by anyone else, bots included, is left out
and counted. Only review summaries written on the current head commit are taken, so one that an
earlier revise answered with a commit is not handed over twice.

Last, it checks out the pull request head and decides whether to merge `dev` (the commit the run
started from; a merge, never a rebase):

- when the dispatch asked for it or `dev` conflicts with the branch;
- on its own when `tools/` or `.github/prompts/` changed on `dev` since the branch was cut, so the
  steps and prompts in the working tree are the ones this workflow expects. That merge does not
  narrow the revise: the threads and summaries are still addressed.

A merge is committed locally, conflict markers included, as the baseline: `HEAD` is that merge and
the fixer's work is the diff against it. The baseline is never pushed. The workflow then
reinstalls dependencies, which also re-resolves a conflicting `pnpm-lock.yaml`.

The rounds are the same, with these differences, all keyed on `revise.json` and `feedback.md`:

- `.github/prompts/fix-issue.md` sends the fixer to `.github/prompts/fix-issue-revise.md`. The
  fixer addresses each item and answers it under `feedback` in the status (`id`, `addressed`, a
  one-line `reply`). The brief's `Settled:` lines still bind: feedback that contradicts one is not
  applied and becomes a question.
- `round verify` fails a round whose status does not answer the items one for one, or that calls
  itself done while a conflict marker remains, and runs the gate over every package the pull
  request changed against `dev`, not only what the revise touched. A revise that changes nothing
  and only answers is valid and skips the gate and the review; a merge is always checked, even when
  the fixer left it untouched.
- The reviewer also checks each item against its answer and reads every conflict resolution.
- No screenshots are captured; the description keeps the table it had, with a line saying it
  predates the revise.

`open-pull-request --pull-request` is the same command as on a first run, with a different target.
It refuses unless the pull request is still open, was opened by the App, and has its head where the
fixer started; a push during the run fails the job and costs a new dispatch. It decides about the
merge itself with the same rule and repeats it in its own worktree, so the baseline comes from `dev`
and the branch, not from the fixer's job, then applies the patch with the same allowed-paths checks.
The signed commit has the branch head as its parent, and `dev` as a second parent after a merge, and
the branch is moved without force. While a conflict marker remains nothing is committed, the
question goes on the pull request and it becomes a draft. After the commit it:

- replies on each unresolved review thread the fixer answered, when the thread has a comment by
  someone with write access, and resolves the ones marked addressed (GraphQL);
- rewrites the description from the status, which describes the whole pull request as it now
  stands, and makes the pull request a draft when the status is blocked or hands changes off, or
  ready again when nothing blocks it;
- posts one comment that records the revise on the pull request: which revise of five it was, who
  dispatched it and with which notes, the run, the commit, the answers to the items that have no
  thread, the questions, and how many unresolved threads were left out;
- requests review again from the authors of the threads and summaries it answered, when a commit
  landed and the pull request is not a draft.

Nothing shows on the pull request while a revise runs, and a failed run leaves it as it was, with
no comment; the run itself is the record then.

### Trust

The `fix-issue` job runs code the fixer can change, so its checks are a quality gate, not a
boundary. The fixer runs with `--permission-mode auto --permission-prompts none`: Claude Code's
classifier reviews each tool call and refuses the ones that reach beyond the fix, and anything that
would wait for a person is denied. `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB` must stay unset: it forces
the default permission mode, which turns auto mode off. `pnpm` scripts are arbitrary code the fixer
can edit, so an allowlist would not be a boundary either. The job has no access to the Actions
cache: `cache-mode: none` denies its cache token both restores and saves. GitHub enforces the mode
at the cache service through that token, so it holds for any code in the job, not only for the
cache actions. Without it, a `workflow_dispatch` run on `dev` may write the default branch's cache,
and an entry the fixer wrote would be restored by every workflow on `dev`, including the release
jobs. The turbo and pnpm caches are off as well (`TURBO_CACHE` and `PNPM_CACHE` in `provision`),
and the Playwright browsers are installed on every run. The fixer's and the reviewer's full
transcripts reach the log only
outside `leather-io/mono` (`show_full_output`): on the public repository a transcript could carry
a secret in a form GitHub does not mask, so debug a run there by reproducing it on a fork. What it can reach: its job holds the
OAuth token for Claude (the action needs it) and a read-only GitHub token, and its shell inherits
both.

A revise is the same job with one difference: after `revise prepare` it runs a bot branch, not
`dev`. What is on a bot branch was written by an earlier fixer and passed through the pull request
job's path checks, or was pushed by someone with write access, and it runs only when someone with
write access dispatches the revise, with the same two tokens and no others. Everything before the
checkout, the checks on the pull request and the gathering of feedback, runs `dev`'s code; from
then on the steps use the branch's `tools/`, which the merge rule above keeps in line with `dev`,
and like every check in that job this is for correctness, not a boundary. What that leaves: someone
who stole a live App token could push to a bot branch and wait for a maintainer to dispatch a
revise of it, and would then reach the Claude token and a read-only GitHub token, nothing that
writes. The App token is revoked when its job ends, so such a push has to happen in the minutes the
write job runs.

`open-pull-request` is the boundary: a fresh runner that builds `tools` from `dev` before reading
the artifact, runs no code from the patch, applies it in a separate worktree, refuses anything
outside `apps/`, `packages/`, `tools/` and `pnpm-lock.yaml`, and holds the only write token. It has
no access to the Actions cache either (`cache-mode: none`, turbo and pnpm caches off), so nothing
another job saved runs next to that token. For a revise it takes what it acts on from the dispatch
(the pull request, whether to merge, the notes) and from GitHub (the head commit, the open threads,
how many revises ran), and from the fixer's job only the patch, the status, the round records and
the commit the fixer says it started from, which must match the head. It never forces the branch. Every GitHub write there uses an installation token of
the `fix-issue` GitHub App, not the run's
`GITHUB_TOKEN`. GitHub starts no workflows for events made with `GITHUB_TOKEN`; the App's push and
pull request start CI like any contributor's, and its API commits are signed. The pull request then
needs two human reviews like any other.

The App's private key never reaches the runner. It lives in AWS KMS: the `aws-credentials` step
logs in to AWS through GitHub's OIDC token, then `pnpm lt fix-issue app-token create` has KMS sign
the App's JWT and exchanges the JWT for an installation token limited to this repository and to
contents, pull requests and issues. A token that comes back with any other permission is revoked
and the step fails. The job revokes the token when it ends (`app-token revoke`), so a token that
leaks from a run stops working when the run does, and within an hour at most. Nobody can copy the
key, and every signature is logged in CloudTrail.

**What a leaked token can reach.** The App writes code, so the repository's rulesets are what keep a
stolen token away from everything but bot branches. Keep them as follows:

- a branch ruleset on every branch except `bot/**` that restricts creations, updates and deletions,
  with bypass for people with write access, Dependabot and the release and bot workflows' own
  identity, so the App can only write `bot/` branches;
- the tag ruleset restricts creations as well as updates and deletions, so the App cannot create a
  tag and publish a release on it (published releases are already immutable);
- the App is on no ruleset's bypass list;
- `dev` keeps two approvals from the reviewers team and approval of the most recent push by someone
  other than its pusher, so the App's own approval never counts.

The App can still push anything except workflow files to a `bot/` branch, and CI runs it there. Any
job that runs on pull requests or on pushes to any branch must therefore skip `bot/` branches
before it gets a secret, an environment or `contents` or `id-token` write, or calls a reusable
workflow: `if: ${{ !startsWith(github.head_ref || github.ref_name, 'bot/') }}` on the job, or on
each step that uses a secret when secrets in steps are all the job gets. `pnpm lt
bot-branch-secret-guard check` (part of `pnpm lint`, so it runs locally and in CI) fails a job
without it, apart from the jobs listed in `.github/bot-branch-secret-guard-baseline.json`, whose
secrets are low-risk; that list only shrinks, and an entry that is no longer needed fails the check
too.

**App setup, once per repository:**

1. Create a GitHub App (webhook off; repository permissions Contents, Pull requests and Issues read
   and write, Metadata read; no Workflows permission) and install it on the repository only. Set
   the repository variable `FIX_ISSUE_APP_CLIENT_ID` (the App's client ID, not a secret).
2. Create the environment `environment/mono-fix-issue`, limited to the `dev` branch, with the
   variables `AWS_ROLE_ARN`, `AWS_REGION` and `FIX_ISSUE_APP_KMS_KEY_ID`. It holds no secrets.
3. In AWS, import a private key generated for the App into an asymmetric KMS key (`RSA_2048`,
   `SIGN_VERIFY`), then delete the downloaded `.pem` and every other key on the App's settings page.
   The role in `AWS_ROLE_ARN` trusts only GitHub's OIDC subject
   `repo:leather-io/mono:environment:environment/mono-fix-issue` and may only call `kms:Sign` on
   that key.
4. Set up the rulesets above.

Without the environment or the role the `aws-credentials` step fails, and without the key the
`app-token` step does; either way no pull request opens and
the patch stays in the run's artifact for three days. The fixer job reads the client ID too:
`fetch-issue` keeps the App's own comments (its questions) next to the answers, and omits them when
the variable is missing.
