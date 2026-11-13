# review-gate

The `repo:review-gate` workflow, run as `pnpm lt review-gate <command>`. The workflows check out trusted code, install this package
(`.github/actions/setup-tools`) and call these commands; every decision lives here. Commands read
their inputs from the job environment (`GITHUB_TOKEN`, `RUN_URL`, ...) and flags.

## review-gate

Decides whether a pull request into `dev` needs 1 or 2 approvals and reports the `review-gate`
commit status. Every write is made with the review gate GitHub App's token, and the ruleset requires
`review-gate` from that App, so a status a pull request posts as `github-actions[bot]` counts for
nothing.

```
pull_request, pull_request_review  ─▶ repo:review-gate-dispatch ─▶ workflow_dispatch on dev ─┐
/review-gate comment (writers)     ─▶ issue_comment, dev's workflow ───────────────────────┤
                                                                                           ▼
                                   check: pending ─▶ classify (once per head) ─▶ count approvals
schedule, every 5 minutes          ─▶ sweep: count approvals on every open fork pull request
```

| Command | Does                                                                                     |
| ------- | ---------------------------------------------------------------------------------------- |
| `check` | sets `review-gate` pending, classifies the head unless it already has an answer, records |
|         | `review-gate/decision` and the sticky comment, then counts approvals and posts the gate  |
| `sweep` | counts approvals on fork pull requests, which always need 2, posting only on a change    |

Classifying applies the path rules (`rules.ts`) first and asks Claude, with no tools and the tier
schema, only when none decides. Anything invalid fails closed to 2 reviews, and a fallback is
retried on the next check. A fork pull request is never classified and always needs 2 approvals.
`check --requested-by <login>` does nothing unless that commenter has write access.

Sensitive paths live in `.github/review-gate/sensitive-paths.yml` and are matched with `minimatch`,
dotfiles included, against both sides of a rename (`sensitive-paths.ts`);
`sensitive-paths.spec.ts` keeps the list in step with the repository.

| Module               | Responsibility                                                  |
| -------------------- | --------------------------------------------------------------- |
| `rules.ts`           | size limits, hidden diffs, the classifier prompt                |
| `sensitive-paths.ts` | reading and matching the sensitive path list                    |
| `classifier.ts`      | the classifier's Claude arguments                               |
| `decision.ts`        | the tier schema, fail-closed decisions, status and comment text |
| `approvals.ts`       | counting approvers, shared-head detection, the gate status      |
| `client.ts`          | the GitHub REST calls, each response checked with `schemas.ts`  |
| `steps.ts`           | the `check` and `sweep` commands                                |

`../ci/` holds the shared pieces: the GitHub request client and Actions helpers (`github.ts`), the
pinned Claude invocation (`claude.ts`) and the prompt loader (`prompts.ts`).

## Prompts

Everything Claude is told lives in `.github/prompts/` as markdown, read from the trusted checkout.
`review-gate-classifier.md` is the classifier's system prompt. The pull request reaches Claude as
a JSON payload on standard input, since the classifier has no tools, and Claude answers through
`--json-schema` structured output, parsed with zod before anything uses it.

## Trust

`repo:review-gate` only runs from `dev`: `workflow_dispatch` is started with `--ref dev`,
`issue_comment` and `schedule` always use the default branch, and the App key sits in the
`review-gate` environment, whose deployment branches are limited to `dev`. A pull request can edit
`repo:review-gate-dispatch`, but the most it can do is not start the gate, or start it from its own
branch, where the environment refuses the key. Either way no App status appears and the pull
request stays blocked.

The gate never checks out or runs pull request code. Claude only ever sees the pull request as
data, and its answers are parsed against a schema before anything acts on them. A pull request that
changes `tools/`, `.github/` or the sensitive path list needs 2 approvals, because it changes the
gate itself.
