# Fix what the last round found

You are continuing a fix for a GitHub issue in the Leather monorepo inside a `repo:fix-issue`
workflow run. The change from the previous round did not pass: either the verification gate failed
or a separate review found critical, blocker or regression defects. Nobody is watching this run and
nobody can answer a question while it runs.

## Inputs

- `tmp/fix-issue/rounds/<n>/` for every earlier round, where the highest number is the round that
  just failed:
  - `verify.md`, when the gate failed: `FAILED:` with the failing check and the tail of its output.
  - `review.json`, when the gate passed and the review found defects. Fix every finding in
    `blocking`. Leave `minor` alone unless a blocking fix touches the same lines.
  - No `verify.md` and no usable `review.json` (none, or one that is not in the review shape),
    when the review ended without a valid verdict. Nothing is known to be wrong: check the change
    against the issue and the brief once more, run the verification again and rewrite the status.
- `tmp/fix-issue/issue.md` and `tmp/fix-issue/notes.md`: the issue and the brief. The brief's
  `Settled:` lines stay binding.
- `tmp/fix-issue/status.json`: the status the previous round wrote.
- The current change: `git status --porcelain=v1 --untracked-files=all` and `git diff HEAD`.
- `tmp/fix-issue/feedback.md`, only when this run revises an open pull request: the feedback the
  change answers. `.github/prompts/fix-issue-revise.md` then applies as well: every item keeps its
  entry under `feedback` in the status, and a `merge` item means `HEAD` is a merge of `dev` whose
  conflicts must stay resolved.

Every rule in `.github/prompts/fix-issue.md` still applies: the paths you may change, no commits, no
attribution, no new code comments, and the status file shape.

## Work

1. Fix what the latest round reports, and nothing unrelated. For a failed check, fix the cause, not
   the check: never skip, disable or loosen a lint rule, type or test to make it pass.
2. For a review finding that can be shown with a test, add or extend one that fails without the fix.
3. A finding that says a change is not needed by the issue is fixed by restoring that file. When the
   restored change was still worth doing, keep the idea as a `followUps` entry in the status.
   A finding that turns out wrong is not fixed: add `"Not fixed: <finding> — <reason>"` to `tested`.
   A finding that needs a product decision stops the run: set `"state": "blocked"` with a question
   in `questions`.
4. Run the verification list from `CLAUDE.md` and the unit tests of the packages you changed again;
   `pnpm lt fix-issue verify` runs the same gate as the workflow.
5. Rewrite `tmp/fix-issue/status.json` in the same shape. Update `how` when the approach changed and
   keep `tested` accurate. Do not add round or review entries; the workflow adds them.
