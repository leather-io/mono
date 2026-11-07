# Fixer prompt

`bootstrap-worktree.sh` fills the template below and hands it to the worktree agent with
`herdr agent prompt`. It reads only the lines between the two four-backtick fences. Placeholders:
`{{worktree}}`, `{{branch}}`, `{{base_sha}}` and `{{status_file}}` are replaced inline; the line
`{{brief}}` is replaced by the brief file's content. The status file's first line is always
`STATE: working|staged|done|blocked`; `run-wave.sh` and `status.sh` parse only that line and
`COMMIT:`.

````text
You are fixing a GitHub issue in a herdr worktree. Nobody is watching this pane.

1. Where you are. Worktree {{worktree}}, branch {{branch}}, based on origin/dev @ {{base_sha}}. CLAUDE.md in this checkout applies in full, including the no-comments rule, the verification list and the rule that mobile changes run `pnpm lingui` from apps/mobile/ first.

2. The brief below is the decision record. Its Settled lines are binding. Do not ask questions and do not open dialogs. If the brief turns out wrong, the fix is impossible as specified, or Needs names something you do not have, write `STATE: blocked` and the reason to {{status_file}} and stop.

3. Start by writing `STATE: working` to {{status_file}}. Read what the brief points at: the feature-map entry (`pnpm lt feature-map generate --app extension`, then the entry in .claude/skills/feature-map/extension.md), the spec, the files under Cause. Implement the approach. Add or extend the test named under Verify; a fix with no test is not done unless Verify says none applies.

4. Run every Verify line and the full verification list from CLAUDE.md. Fix what fails. E2E specs need `pnpm --filter @leather.io/extension build:test` first.

5. Stage everything with `git add`. Never commit: the orchestrator commits for you. Never `git fetch`, `pull`, `push`, `rebase` or `checkout` another branch, never touch another worktree, never run `gh` write commands.

6. Write {{status_file}} last, in exactly this shape, and stop:

```
STATE: done
COMMIT: <subject from the brief>
WHY:
- <why the change is needed, one line; at most three bullets>
HOW:
- <how it was implemented, one line; at most three bullets>
TESTED:
- <a command that ran green, one per bullet>
- Not verified: <a Verify line that could not run, and why>
```

WHY, HOW and TESTED become the pull request body as written: keep each bullet to one plain line, and never mention Claude, Claude Code or that anything was generated.

7. When the brief holds more than one issue, work them one at a time in the order given. After staging each one, write `STATE: staged` with `COMMIT: <its subject>` and the other lines for that issue, then stop and wait for a prompt saying the commit is done before starting the next. After that prompt, write `STATE: working` to {{status_file}} before starting the next issue. Write `STATE: done` only after the last one.

8. After you report done, your diff gets exactly one review. If it finds critical problems (correctness bugs or regressions your change introduces), you get one prompt starting `REVIEW FIXES`. Follow it exactly: fix only the findings it lists, change nothing else, rerun the verification, restage, and rewrite the status file with a `FIXED:` list. There is no second review and no other fix round; never act on review findings that were not sent to you.

The brief:

{{brief}}
````
