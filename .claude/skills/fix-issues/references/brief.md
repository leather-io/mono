# Brief

One brief per worktree, written to `<run-dir>/briefs/<branch>.md` once every decision for its
issues is settled. `bootstrap-worktree.sh` pastes it verbatim into the fixer prompt, so it is the
only thing the fixer knows about the issue. Verbatim headings, in this order; drop a section that
would be empty.

```markdown
# #<n>: <title>

<issue url> · base origin/dev @ <short sha> · branch `<branch>` · platform <extension|mobile|web|packages>

## Agreed behavior

<Expected, one or two sentences, UI strings verbatim in code>

## Cause (proven|suspect)

<where it breaks, repo-relative paths with line numbers>

## Approach

<the chosen approach in a few lines; the layer that owns it; files to change or add>

## Decisions

- Settled: <choice> — <reason>

## Out of scope

- <item>

## Verify

- Unit: `<command>` — <spec to extend or add>
- E2E: `<command>` — <covering spec>, or none covers this
- Fixtures: <fixture, mock or helper to reuse>
- Needs: <device, Speculos, funded account, flag>, or nothing

## Done when

- [ ] <checkable condition>

## Commit

`<type>(<scope>): <subject>`
```

A grouped brief repeats the whole template once per issue, in the order the fixer works them, each
starting at its own `# #<n>: <title>` heading with its own Commit section.

## How each field is filled

**Title line**: the issue number and title from `gh issue view`, the issue URL, the short form of
the `origin/dev` SHA recorded at intake, the branch from section 4 of the skill and the platform
from the title prefix or the `platform:*` label.

**Agreed behavior**: the issue's Expected (or Scope for a change) as amended by the interview. It
says what the user sees after the fix, not how the code gets there. UI strings and error text go
verbatim in code spans, so the fixer can grep for them and assert on them.

**Cause**: from research, with the subagent's marker. `proven` only when the subagent ran
something that showed it (a failing test, an observed path); anything only read stays `suspect`,
which tells the fixer to confirm the cause before building on it. Paths are repo-relative with
line numbers at the base SHA.

**Approach**: the approach the person chose in the interview, or the recommended one when they
confirmed the plan: a few lines naming the layer that owns the fix (per `CLAUDE.md`'s architecture
and the `monorepo-navigation` skill) and the files to change or add, taken from the Touches list.

**Decisions**: every `Settled` line from the issue body and comments, plus every answer from the
interview as `Settled: <choice> — <reason>`. `Open` lines never appear in a brief: a brief is
written only once every decision is settled, and an issue with an unanswered decision is not
spawned.

**Out of scope**: the issue's own Out of scope, plus anything the person excluded during the
interview and the advisory overlaps from section 5 that another worktree owns.

**Verify**: the issue's Verify section when it has one, otherwise the research subagent's. Unit
and E2E name a runnable command and a spec file; E2E comes from the feature-map entry for the
screen. Needs is what the fixer must have to run a line end to end; when the fixer has none of
it, that line becomes a `Not verified:` bullet under `TESTED:` in its status file and in the PR
body.

**Done when**: the issue's own boxes when it has them, otherwise research's, one to three, each
checkable by someone else: a spec that passes, a visible string, a number.

**Commit**: a conventional-commit subject, imperative, without the issue number. The type follows
the issue: a bug is `fix`, a change is `feat` or `refactor` by its nature, matching the examples in
`CLAUDE.md` (`feat(mobile)`, `refactor(web)`, `fix(utils)`). The scope stays the platform or
package (`extension`, `mobile`, `web`, `<package>`). It is what the
fixer writes to `COMMIT:` and the whole commit message, with no body or trailers: what
`push-as-bot.sh` commits with, or the person's `git commit -m` on the fallback path.
