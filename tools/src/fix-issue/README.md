# fix-issue

The steps of the `repo:fix-issue` workflow, run as `pnpm lt fix-issue <step>`. The workflow
(`.github/workflows/repo:fix-issue.yml`) and its round action (`.github/actions/fix-issue-round`)
only call these commands and Claude; everything they decide lives here.

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
| `app-token.ts`                      | the App JWT signed through KMS, the installation token and its revoke                                    |
| `stop-guard.ts`                     | the Stop hook that keeps an agent working until its output file is valid                                 |
| `dispatch.ts`                       | dispatching one brief of a run directory                                                                 |
| `run-status.ts`                     | the latest run and pull request per issue, and the questions of blocked drafts                           |
| `github.ts`                         | the GitHub REST and GraphQL client, over a token or the `gh` CLI                                         |
| `exec.ts`, `outputs.ts`, `paths.ts` | running commands, step outputs, the paths under `tmp/fix-issue/`                                         |

Specs sit next to each module and use the helpers in `test/`: `test-repo.ts` (a throwaway git repository) and
`fake-github.ts` (a recording GitHub client) instead of real tools.

## How a run works

**What the run does.** Job `fix-issue` (read-only token) checks out `dev`, builds the packages,
renders the issue and its comments to `tmp/fix-issue/issue.md` (only text by people with write
access to the repository: their permission is looked up per author, because `leather-io`
memberships are private; anyone else's comments, and the title and body of an issue they opened,
are left out with a note, so the brief must carry what an outside report says), writes the brief to
`tmp/fix-issue/notes.md`, writes `apps/extension/.env` from the `PUBLIC_*` repository variables,
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
the patch in a separate git worktree, refuses any path outside `apps/`, `packages/` and
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
first and keeps it when someone added commits to it, when it is no longer open, or when it is ready
and the new pull request is only a draft. One it fails to supersede is logged and left open; the
run still succeeds. A new run never moves an
earlier run's branch, so a change to a workflow on `dev` between runs never needs the App's
Workflows permission, which it does not have. The one exception is "Re-run jobs" on the same run:
`open-pull-request` then force-updates that run's own branch to a fresh commit on the same parent
and updates its pull request, so a flaky failure there costs a job re-run, not a new fixer run.
`## Follow-ups` lists what the run deliberately left alone but thinks deserves its own issue: the
fixer's `followUps` (things it noticed outside the issue, and ideas from changes the review made it
restore) plus the last review's minor findings, minus those on a file the fixer's entries already
name, each as "`path`: note", 20 at most. Nothing opens issues automatically; turn the ones
worth keeping into issues by hand.

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

`open-pull-request` is the boundary: a fresh runner that builds `tools` from `dev` before reading
the artifact, runs no code from the patch, applies it in a separate worktree, refuses anything
outside `apps/`, `packages/` and `pnpm-lock.yaml`, and holds the only write token. `tools/` is off
limits as a whole: this job runs `lt`, which loads every module of the package, so a fix that
changed any of them would, once merged, run next to that token and could loosen these checks. It has
no access to the Actions cache either (`cache-mode: none`, turbo and pnpm caches off), so nothing
another job saved runs next to that token. Every GitHub write there uses an installation token of
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
