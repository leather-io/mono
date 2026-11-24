---
name: fix-issue
description: Take one or more GitHub issue numbers for leather-io/mono, research each one, settle the open decisions with the person in one short round per issue, write a handoff brief per issue (or per group of overlapping issues), then dispatch the repo:fix-issue GitHub workflow once per brief, which runs the fixer, verifies it and opens a signed pull request from bot/fix-issue-<issue>-<run id>, and track the runs and pull requests to the end; the same workflow, dispatched with a pull request, revises a bot pull request on its own branch. Use when given one or more GitHub issue numbers to fix, asked to work through a batch of issues, asked to dispatch fixers for issues, or asked to have a bot pull request changed or its conflicts with dev resolved.
---

# Fix issue

Hand this skill N issue numbers and get N pull requests back. The person's attention is the
expensive part, so research comes first (the questions are sharp and few), every agreement is
written down as a brief (the handoff to the fixer is lossless and survives context loss) and
overlapping fixes are grouped before anything is dispatched. That is the local half. The fixing
happens on GitHub: each brief is dispatched to the `repo:fix-issue` workflow, which fixes, verifies
and reviews the change and opens a signed pull request. Nothing is committed or pushed from this
machine. Both commands below act as the person's `gh` login.

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

Record the base with `git rev-parse origin/dev` for research. Never `git fetch`: a fetch can block
on a hardware key. Say which SHA you recorded and, if the tip looks stale, let the person refresh
it. The workflow itself always runs on the tip of `dev` at dispatch time.

Create the run directory for the briefs:

```bash
run_dir="${XDG_STATE_HOME:-$HOME/.local/state}/fix-issue/$(date +%Y%m%d-%H%M)"
mkdir -p "$run_dir/briefs"
```

Never in a temp dir: a reboot wipes it. The briefs are the only local state; runs and pull
requests are looked up on GitHub by issue number (section 7).

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
issue ineligible for dispatch until it is answered; say so. Never a second round for the same
issue.

## 4. Briefs

Write `$run_dir/briefs/bot/fix-issue-<n>.md` per issue from `references/brief.md`, `<n>` being
the issue (for a group, its first issue); `dispatch` and `status` find it there. Pick the template
there by the issue: the short one when the issue is already a full spec written by someone with
write access (a `new-issue` issue, or one with a triage work item), which only adds the interview's
decisions, the approach, the maintainer changes and the commit subject; the full one otherwise. The
fixer never sees this conversation, so whatever the issue does not say has to be in the brief.

**Paths the run may not change.** The fixer may only change `apps/`, `packages/`, `tools/` and
`pnpm-lock.yaml`. Check every Touches entry against that before writing the brief. Each one outside
it (root config such as `knip.json`, `turbo.json`, `eslint.config.js`, `.gitignore`,
`.dependency-cruiser.cjs`, root `docs/`, `.claude/`, `.github/`) goes under the brief's
`## Maintainer changes` with the exact change, and is named to the person before dispatch: the run
does everything else, lists those changes under `## Needs a maintainer` in a draft pull request,
and a maintainer adds them to that branch before merge. When every Touches entry is outside the
allowed paths, say so and do not dispatch: the change is for a normal session. Never phrase a brief
so that the fixer has to find another home for an off-limits change; the fixer and the review both
treat such a workaround as a defect.

## 5. Overlap check

Intersect the Touches lists across briefs.

| Overlap                       | Action                                                    |
| ----------------------------- | --------------------------------------------------------- |
| Any shared file               | One dispatch for the group, one brief listing every issue |
| Same package, different files | Advisory: report it, keep separate dispatches             |
| Nothing shared                | One dispatch per issue                                    |

A group dispatches once, with its first issue as `issue` and the brief listing every issue in
order. The fixer receives only that first issue's text, so the brief carries every other issue in
full (`references/brief.md`, Groups). The fixer works them in one run, ends with one commit, and
its status lists every number under `closes`, so the one pull request closes them all (a blocked
draft only references them). Show the grouping and wait for the person to confirm it before
anything is dispatched.

## 6. Dispatch

Dispatching is a GitHub write: show the list (issue and brief path) and get one explicit yes for
the batch first. Then per brief:

```bash
pnpm lt fix-issue dispatch --run-dir "$run_dir" --issue 123
```

For a group, pass the first issue of the brief. It refuses a brief over the size limit
(`references/brief.md`); trim it and dispatch again. When GitHub refuses the dispatch, it prints
the command for someone with write access to `leather-io/mono`; give that to the person. The issue
must be open: a closed one fails the run at `fetch-issue`. Dispatching an issue again while its
run is still going cancels that run.

What comes back, per run, 20 minutes to two hours later:

- a pull request from the fix-issue App on its own `bot/fix-issue-<n>-<run id>` branch, with the
  brief as a folded first comment;
- a draft instead when the fixer is blocked, the checks still fail after its rounds, or a change
  outside `apps/`, `packages/`, `tools/` and `pnpm-lock.yaml` is needed (listed under
  `## Needs a maintainer`);
- an issue comment with the questions and any maintainer changes, and no pull request, when the
  run changed nothing.

The fixer sees only the issue text written by people with write access, so a brief for an outside
report must carry what the report says. How a run works inside is in
`tools/src/fix-issue/README.md`; the skill does not need it.

## 7. Track

```bash
pnpm lt fix-issue status --run-dir "$run_dir"
```

One line per brief in the run directory: the latest run, its result and its pull request (the run
itself when it opened none), then the questions of every blocked draft. Questions a run left as an
issue comment are only on the issue. It exits 1 when a brief's latest run failed or was cancelled.
Pass issue numbers instead of `--run-dir` to check others, and `--repo` on either command to use a
fork. Check back at the pace runs take, never in a tight loop.

## 8. Answer blocked runs

Put the questions from `status` (or from the issue comment) to the person in one `AskUserQuestion`
round per issue: these are the fixer's questions, a new set, not a second interview. Append each
answer to the brief's Decisions as `Settled: <choice> — <reason>`, then dispatch again after the
same explicit yes. The new run's pull request replaces the earlier one, which is closed, unless
the earlier one was revised or someone added commits to it, or it is ready and the new one is a
draft; then both stay open and the person picks. A run that only comments on the issue closes
nothing.

When the answer does not change a `Settled:` line and the draft's work is worth keeping, revise the
draft with the answer as its notes instead (section 9); that continues on the same branch.

## 9. Ask for changes on a pull request

A bot pull request is changed in place by dispatching the same workflow with the pull request
instead of an issue. It needs no brief: the run reads the review from GitHub.

```bash
pnpm lt fix-issue dispatch --pull-request <pull request> [--notes-file <file>] [--merge]
gh run list --repo leather-io/mono --workflow repo:fix-issue.yml --limit 5
```

| Dispatch                 | What the revise does                                                          |
| ------------------------ | ----------------------------------------------------------------------------- |
| the pull request alone   | addresses every unresolved review thread and every review summary on its head |
| with `--notes-file`      | does what the notes ask, and addresses those threads and summaries            |
| with `--merge`           | merges `dev` into the branch and fixes what that breaks, nothing else         |
| with `--merge` and notes | the merge, the notes, the threads and the summaries                           |

So the usual way is for reviewers to review on GitHub as for any pull request, with comments on
the lines, and then for someone to dispatch the revise. Write the notes file only for what the
review does not already say; never put it in a temp directory the run directory does not own. When
the pull request conflicts with `dev`, any revise merges `dev` first, and one without notes only
resolves the conflicts and leaves the threads for the next one. Reviewers without a session can
use "Run workflow" on `repo:fix-issue` in the Actions tab and fill in `pull_request`.

Dispatching is a GitHub write as the person: show the pull request, the notes and the flags, and
get an explicit yes first. Whoever dispatches is recorded as the co-author of the revise commit.

What comes back, 20 minutes to two hours later, on the same pull request:

- one new signed commit on top of the branch, never a force-push; after a merge it has `dev` as its
  second parent;
- a reply on each review thread saying what was done, resolved when it was addressed and left open
  when the fixer disagreed or needs an answer;
- the description rewritten for the pull request as it now stands, and review requested again from
  the people whose feedback it answered;
- one comment that records the revise: `Revise <n> of 5`, who dispatched it and with which notes,
  the commit, and the answers that have no thread;
- a draft with the question when it needs a decision. Feedback that contradicts a `Settled:` line
  of the brief is never applied; it comes back as a question. To change a settled decision, change
  the brief and dispatch the issue again (section 8).

The run fails, with the reason in its log and nothing written to the pull request, when there is
nothing to revise, when the pull request has had its five revises, when it is not an open bot pull
request, or when `dev` conflicts in a file outside `apps/`, `packages/`, `tools/` and
`pnpm-lock.yaml` (merge `dev` by hand first). A push to the branch while a revise runs fails that
revise. `status` (section 7) keeps showing the run that opened the pull request; revise runs are
named `fix-issue: revise #<pull request>`.

A revised pull request is no longer replaced by a new dispatch of its issue, so pick one path per
pull request: revise it, or dispatch the issue again and close it by hand.

## 10. Report

Per issue: the run URL and result, the pull request URL and whether it is a draft, and what still
needs a human: the open questions, a failed run's failing step (`gh run view <id> --log-failed`),
the `Not verified:` lines of the pull request, any `## Needs a maintainer` changes, and the reviews
every pull request needs before merge. When only the `open-pull-request` job failed, re-running the
failed job (`gh run rerun <id> --failed`) within three days opens the pull request from the patch
the fixer already made; it is a GitHub write, so ask first. Then the run directory path, so a later
session can resume with `status --run-dir` alone.
