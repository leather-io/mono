---
name: fix-issues
description: Take one or more GitHub issue numbers for leather-io/mono, research each one, settle the open decisions with the person in one short round per issue, write a handoff brief per issue, then run one herdr worktree and Claude agent per issue (or per group of overlapping issues) until every worktree is staged, verified and reviewed, then committed and pushed by a fork bot account with the pull request open (or, with no bot configured, the commit and push commands printed). Use when given one or more GitHub issue numbers to fix, asked to work through a batch of issues, or asked to spin up a worktree per issue.
---

# Fix issues

Hand this skill N issue numbers and get N pushable worktrees back. The person's attention is the
expensive part, so research comes first (the questions are sharp and few), every agreement is
written down as a brief (the handoff to the worktree agent is lossless and survives context
loss), overlapping fixes are grouped before anything is spawned, the mechanical parts run as shell
scripts in `scripts/`, and **done** means staged, verified and reviewed, then committed and pushed
by a bot account to its fork with the pull request open. The person's commits are signed with a
hardware key, so no agent ever commits as them: without a bot configured, done means the commit
command is printed for the person.

The scripts need `jq` and, from section 6 on, `herdr`. Each takes `--help` and `--dry-run`.

## 1. Intake

Per issue:

```bash
gh issue view <n> --repo leather-io/mono --json number,title,body,labels,url,comments
```

From the body take the platform (the title prefix or the `platform:*` label: extension, mobile,
web, packages) and, when present, `### Decisions`, `### Verify`, `### Done when` and
`### Out of scope`. An issue drafted with the `new-issue` skill has them: `Settled:` lines are
binding, `Open:` lines must be asked before code is written. Read the comments too; they can carry
later decisions. An issue without those sections gets the same information from research.

Record the base with `git rev-parse origin/dev`. Never `git fetch`: a fetch can block on a
hardware key. Say which SHA you recorded and, if the tip looks stale, let the person refresh it.

Create the run directory and keep everything the skill and the scripts write there:

```bash
run_dir="${XDG_STATE_HOME:-$HOME/.local/state}/fix-issues/$(date +%Y%m%d-%H%M)"
mkdir -p "$run_dir/briefs" "$run_dir/status"
printf '[]\n' > "$run_dir/run.json"
touch "$run_dir/run.log"
```

Never write inside a worktree (an untracked file pollutes `git status` for the fixer) and never in
a temp dir (a reboot wipes it). `run.json` is the manifest: a JSON array with one object per
worktree, appended by `bootstrap-worktree.sh`.

## 2. Research, one subagent per issue

Generate the extension feature map once, in the orchestrating checkout, before fanning out:
`pnpm lt feature-map generate --app extension` (see the `feature-map` skill).

Then one research subagent per issue, read-only, at most five at a time. Pass `model: "opus"`
explicitly on every one: subagents inherit the session model, and parallel subagents on a Fable
session hit the Fable rate limit. Give each the issue in full (body and comments), the base SHA,
the pointer to `.claude/skills/feature-map/SKILL.md` and the generated `extension.md`, any
`### Decisions` already on the issue with the rule that a `Settled` line is never re-asked, and ask
for exactly this shape back:

- **Cause** marked `proven` (a failing test or an observed path in this session) or `suspect`
  (anything only read). Proven requires running something; reading is suspect.
- **Touches**: repo-relative file paths the fix would change or add, one per line, best estimate.
- **Approaches**: one to three, each with the layer that owns it and one line of trade-off, the
  recommended one first.
- **Open decisions**: at most four, each with two to four options and a recommendation, only for
  choices that neither the code, `CLAUDE.md` nor the issue already settles. Zero is a fine answer.
- **Verify**: `Unit` command and the spec to extend or add; `E2E` command and the covering spec
  from the feature-map entry, or "none covers this"; `Fixtures` to reuse; `Needs` (device,
  Speculos, funded account, flag) or nothing.
- **Done when**: one to three boxes, behavior not implementation, reusing the issue's own when it
  has them.

## 3. Interview, one round per issue

Per issue, show the person in a few lines: the cause with its marker, the recommended approach,
the Touches and the Verify lines. Then exactly one `AskUserQuestion` round with the open decisions
(at most four, recommendation first) when there are any. An issue with none is shown as a plan to
confirm or redirect.

Every answer becomes `Settled: <choice> — <reason>`. Anything skipped stays `Open` and makes the
issue ineligible for spawning until it is answered; say so. Never a second round for the same
issue.

## 4. Briefs

Write `$run_dir/briefs/<branch>.md` per issue from `references/brief.md` (the branch has a slash,
so the brief sits in `briefs/fix/`). The brief is the complete decision record the fixer gets and
must stand alone: the fixer never sees this conversation.

| Field          | Shape                                                                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Branch         | `fix/<n>-<kebab-slug>`, slug from the title, at most five words                                                                                      |
| Grouped branch | `fix/<n1>-<n2>-<slug>` (section 5)                                                                                                                   |
| Commit type    | follows the issue: a bug is `fix`, a change is `feat` or `refactor` by its nature (as in `CLAUDE.md`: `feat(mobile)`, `refactor(web)`, `fix(utils)`) |
| Commit scope   | the platform or package: `extension`, `mobile`, `web`, `<package>`                                                                                   |

The subject carries no issue number: the PR adds `(#n)` on merge, and `Closes #n` goes in the PR
body drafted in section 8.

## 5. Overlap check

Intersect the Touches lists across briefs.

| Overlap                       | Action                                                             |
| ----------------------------- | ------------------------------------------------------------------ |
| Any shared file               | One worktree for the group, one brief listing every issue in order |
| Same package, different files | Advisory: report it, keep separate worktrees                       |
| Nothing shared                | One worktree per issue                                             |

A grouped fixer handles its issues one at a time as separate staged commits: it stages the first,
writes `STATE: staged`, the orchestrator commits it with `push-as-bot.sh --commit-only` (or the
person commits on the fallback path), then the orchestrator prompts it for the next. Show the
grouping and wait for the person to confirm it before anything is created.

## 6. Spawn

```bash
command -v herdr && command -v jq
```

**Without herdr**, stop here. Print each brief's path and the manual equivalent per group, then
report:

```bash
git worktree add -b <branch> <path> origin/dev
cd <path> && pnpm i && pnpm build
cp <main checkout>/apps/extension/.env apps/extension/.env
cp <main checkout>/apps/mobile/.env apps/mobile/.env
claude    # paste the fixer prompt: references/fixer-prompt.md filled from the brief
```

**With herdr**, check disk first: `df -h <main checkout>`, and warn when free space is below 4 GB
times the number of groups (a bootstrapped mono worktree costs roughly 3.5–4 GB). Then run the
bootstrap once per group, **sequentially**, never in parallel (parallel bootstraps have hit ENOSPC
and they fight for CPU):

```bash
.claude/skills/fix-issues/scripts/bootstrap-worktree.sh --run-dir "$run_dir" \
  --branch fix/123-fee-row-shows-zero --brief "$run_dir/briefs/fix/123-fee-row-shows-zero.md" \
  --issues 123
```

It creates the worktree (or reuses the branch's existing one), runs `pnpm i && pnpm build` in its
pane and checks the turbo summary, copies the `.env` files, fills the fixer prompt into
`$run_dir/prompts/<branch>.md`, starts a Claude agent named `fix-<first issue>` in the pane (or in
a split when the person already has a session there), prompts it and appends the entry to
`run.json`. Every step is idempotent; re-run it after a failure.

Pass `--hold` for every group beyond the fifth: the agent starts but is not prompted, and
`run-wave.sh` prompts it when a slot frees up. Pass the person's usual permission flags to Claude
after `--` (for example `-- --permission-mode auto`): nobody watches these panes, and a fixer that
stops on an approval dialog is idle to the wave runner, which answers it with Escape. The run
directory is always added with `--add-dir` so the fixer can write its status file.

## 7. Waves

```bash
nohup .claude/skills/fix-issues/scripts/run-wave.sh --run-dir "$run_dir" --parallel 5 \
  >> "$run_dir/run.log" 2>&1 &
```

Detached, so it survives the orchestrator's tool-call limits. Default and maximum parallelism is
5, the person's standing cap. It keeps at most that many agents working, prompts held agents as
slots free, waits on each working agent in turn, checks the status file and the staged diff on
disk when an agent goes idle, re-prompts one that stopped short (twice at most, then `stalled`),
and exits when every agent is `done`, `staged`, `blocked` or `stalled`. `blocked` agents are
reported and skipped.

Watch it with `tail -n 20 "$run_dir/run.log"` and `scripts/status.sh --run-dir "$run_dir"`; do
not poll agents yourself. When a grouped fixer writes `STATE: staged`, commit it with
`push-as-bot.sh --commit-only` (section 8), or on the fallback path ask the person to commit (the
subject is in the `COMMIT:` line), then `herdr agent prompt <agent> "The commit is done.
Continue with the next issue in your brief."`.

To stop it, kill the script and its waits separately; killing the script does not reach the
`herdr agent wait` children:

```bash
kill "$(cat "$run_dir/run-wave.pid")"
pkill -f 'herdr agent wait fix-'
```

## 8. Commit and push as the bot

For each worktree, in order:

1. `status.sh` shows the entry `done`, a non-empty staged diff and a `TESTED:` list in the
   status file.
2. **One review, then at most one fix round.** This is a gate, not advice: `push-as-bot.sh` and
   `status.sh --finish` refuse a worktree until `review-round.sh check` passes.

   1. Review the worktree's diff once (for a grouped brief, after its last issue: the bot commits
      on the branch plus the staged set). Run the `code-review` skill at `medium` against the
      worktree path, as a non-fork subagent with `model: "opus"`, so the reviewer shares nothing
      with the fixer.
   2. Classify every finding on its own line in a file in the run directory: `CRITICAL:` for a
      correctness bug or a regression this diff introduces (wrong behavior, a crash, lost data or
      funds, a security hole, existing behavior that broke); `OTHER:` for everything else
      (simplification, style, naming, coverage, nits). When in doubt it is `OTHER`.
   3. Record it:

      ```bash
      .claude/skills/fix-issues/scripts/review-round.sh record --run-dir "$run_dir" \
        --branch <branch> --findings <file>
      ```

      It keeps the findings in `$run_dir/reviews/<branch>.md` and counts them in `run.json`. With
      critical findings it prompts the fixer once with only those (`REVIEW FIXES`: fix these,
      change nothing else, rerun verification, restage, add a `FIXED:` list). A second `record`
      for the same branch is refused.

   4. Wait for the fix round with `herdr agent wait <agent> --until idle --until done`, or rerun
      `run-wave.sh`, which picks the fixer up again once it writes `STATE: working`. The gate
      passes when the status file says `done` and has a `FIXED:` list.

   There is no second review and no second fix round, whatever the fix round produced. `OTHER`
   findings are never sent to the fixer; they go in the report. A fixer that comes back with
   `Not fixed:` lines still passes the gate; say so in the report.

3. Show the person the reviewed batch (branch, subject, staged file count, critical findings and
   what `FIXED:` says) and get one yes for it: pushing and opening pull requests are GitHub
   writes. Then, per worktree:

   ```bash
   .claude/skills/fix-issues/scripts/push-as-bot.sh --run-dir "$run_dir" --branch <branch>
   ```

The bot is a normal GitHub user account that owns a fork of `leather-io/mono` and has no
permissions on `leather-io/mono` itself; its pull requests are external contributions. The
person's hardware key is never involved. `push-as-bot.sh`:

- commits the staged set in the worktree with
  `git -c commit.gpgsign=false -c user.name=$BOT_USER -c user.email=$BOT_EMAIL commit -F <file>`.
  The message is the `COMMIT:` subject line and nothing else: no body, no trailers. It goes
  through a file in `$run_dir/commits/`, never an inline string.
- reads the token once by running `sh -c "$BOT_TOKEN_CMD"` (never `eval`). Git gets it through a `GIT_ASKPASS` script
  in the run directory (mode 0700, removed on exit) that answers from environment variables, with
  the credential helpers switched off for that push; `gh` gets it as `GH_TOKEN` for that one
  command. It is never in a URL, a `-c` argument, a file or the output.
- checks that `$BOT_FORK` is a fork of `$UPSTREAM` and stops with the one-time instructions if not.
- pushes `HEAD:refs/heads/<branch>` to `https://github.com/$BOT_FORK.git`. A re-push of the same
  branch adds `--force-with-lease` against the commit recorded at the last push. The fork's own
  `dev` is never synced; the branch carries upstream history, which is all a cross-repository pull
  request needs.
- opens `gh pr create --repo $UPSTREAM --base $BASE_BRANCH --head $BOT_USER:<branch>`, unless an
  open one already exists for that head, in which case the push has updated it and its URL is
  printed. The body (`$run_dir/pr/<branch>.md`) is very brief and comes only from the status
  file: one `Closes #<n>` line per issue; `## Why` with the `WHY:` bullets (one to three, one line
  each); `## How` with the `HOW:` bullets (one to three); `## Tested` with one bullet per check
  that ran and a `Not verified: …` bullet for anything that could not. Nothing else.
- records `pr_url`, `pr_number`, `pushed_at` and `commit_sha` in the entry in `run.json`.
  `status.sh --finish` then shows the PR URL instead of a command.

Commit messages and pull request bodies never carry Claude attribution: no Claude or Claude Code
mention, no "generated" line, no co-author trailer.

Preconditions, each a one-line error: the config file, `gh` on the path, `STATE: done`
(`staged` or `done` with `--commit-only`), a non-empty staged diff (or bot commits already on the
branch, for a re-push), nothing but bot commits in `origin/dev..HEAD`, and, for a push, the
review gate (`review-round.sh check`). `--commit-only` is not gated, so a grouped brief can commit
issue by issue before its one review. Exit 3 means no bot is configured.

**Grouped briefs**: when the fixer writes `STATE: staged`, run
`push-as-bot.sh --run-dir "$run_dir" --branch <branch> --commit-only`, then prompt the fixer that
the commit is done. After the last issue, run it without the flag: it commits the rest, pushes
everything and opens one pull request with a `Closes #<n>` per issue.

### Config

`${XDG_CONFIG_HOME:-$HOME/.config}/fix-issues/bot.env`, sourced by the script:

```bash
BOT_USER=leather-fixer
BOT_EMAIL=<id>+leather-fixer@users.noreply.github.com
BOT_FORK=leather-fixer/mono
BOT_TOKEN_CMD='security find-generic-password -s fix-issues-bot -a leather-fixer -w'
UPSTREAM=leather-io/mono
BASE_BRANCH=dev
```

`BOT_FORK`, `UPSTREAM` and `BASE_BRANCH` default to the values shown. `BOT_TOKEN_CMD` is a shell
command that prints the token to stdout; the script runs it once per invocation with `sh -c`, and
`--dry-run` prints it without running it. Two forms:

| Store                    | Store the token once                                               | `BOT_TOKEN_CMD`                                                     |
| ------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| macOS Keychain (default) | `security add-generic-password -s fix-issues-bot -a <bot user> -w` | `security find-generic-password -s fix-issues-bot -a <bot user> -w` |
| 1Password                | an item with a `token` field                                       | `op read op://<vault>/<item>/token`                                 |

With the Keychain, `-w` as the last argument makes `security` prompt for the value; never pass
the token as an argument, where it lands in shell history and the process list. The token is a classic
personal access token of the bot account with only the `public_repo` scope. Observed on
2026-11-07: a fine-grained token with no Contents permission failed the push to the bot's own fork
with `403 Permission to <fork> denied to <bot>`; a classic token with only `public_repo` pushed
through the askpass script and opened the pull request. The only thing not yet observed is the
cross-repository pull request on the upstream, which the first real run proves. One-time setup: create the account, fork `leather-io/mono` to it by hand,
create the token, store it with one of the forms above, write the file.

### What to expect on a bot pull request

- **Squash-merge only.** The `dev` ruleset requires signed commits and the bot's commits are
  unsigned; only a squash produces a commit GitHub signs. A merge commit is rejected.
- `repo:claude-code-review` skips cross-repository pull requests.
- Workflow runs wait for a maintainer's "Approve and run" until the account has a merged pull
  request.
- `repo:code-checks` triggers on `push`, so lint, typecheck and unit tests do not run on fork pull
  requests until that workflow gains a `pull_request` trigger. The verification the fixer ran in
  the worktree is what covers them meanwhile; say so in the report.

### Fallback: no bot configured

Without `bot.env`, `push-as-bot.sh` exits 3 and nothing is committed. Print the finish commands
from `status.sh --run-dir "$run_dir" --finish` and stop:

- `git -C <path> commit -m "<subject from the brief>"`: the person runs it. Their commits are
  signed with a hardware key and an agent-run `git commit` hangs forever waiting for a touch.
  Never run it, never suggest `--no-gpg-sign`.
- `git -C <path> push https://github.com/leather-io/mono.git HEAD:refs/heads/<branch>`: HTTPS
  needs no key touch, but it needs `gh auth setup-git` run once. `status.sh --finish` checks the
  credential helpers for `gh`; when it is missing, print the one-time command and never embed a
  token in the URL.
- `gh pr create … --body-file <file>` against `--base dev` with the brief's subject as title, the
  body in `$run_dir/pr/`. Print it, never run it: any GitHub write happens only after an explicit
  yes, and one yes may cover the batch.

## 9. Report

Per issue: branch, workspace id, agent name, state (`done`, `blocked: <why>` or
`open decisions`), staged file count, the checks the fixer's `TESTED:` list claims, the review
(critical count, the fixer's `FIXED:` lines including any `Not fixed:`, and the `OTHER` findings
from `$run_dir/reviews/<branch>.md` left for a follow-up), the `Not verified:` lines from `TESTED:` (the `Needs` that could not be
met, so the PR says what was not verified end to end), and the PR URL from `run.json`, or, on the fallback path, the three finish commands.
For bot pull requests add that fork CI needs "Approve and run" and does not run lint, typecheck or
unit tests, and that the merge must be a squash. Then the run directory path, so a later session
can resume from `status.sh` alone.
