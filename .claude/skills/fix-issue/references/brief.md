# Brief

One brief per dispatch, written to `<run-dir>/briefs/bot/fix-issue-<n>.md` once every decision for
its issues is settled. The fixer gets the dispatched issue and its comments as well (for a group,
only the first issue's), but only text written by people with write access to `leather-io/mono`;
the brief is everything else it knows. It must stand
alone: no "as discussed", no pointers to this conversation, to the run directory or to files that
exist only on this machine. Verbatim headings, in this order; drop a section that would be empty.

**Size cap: 60,000 bytes.** `dispatch` refuses a larger brief; trim quoted logs and code first, the
fixer can read the files itself.

## Which template

| The issue                                                                                                      | Template |
| -------------------------------------------------------------------------------------------------------------- | -------- |
| Opened by someone with write access, and has `### Expected` (or a scope), `### Verify` and `### Done when`     | Short    |
| Has a triage work item comment (**Approach**, **Test**, **Done when**) by someone with write access            | Short    |
| Anything else: no such sections, or opened by someone without write access (its text never reaches the fixer) | Full     |

An issue drafted with the `new-issue` skill has the sections. Check the author with
`gh api repos/leather-io/mono/collaborators/<login>/permission --jq .permission`: `write`,
`maintain` or `admin` counts.

## Short: the issue is the spec

```markdown
# #<n>: <title>

The issue is the spec; this brief only adds to it.

## Decisions

- Settled: <choice> — <reason>

## Approach

<the chosen approach in a few lines; the layer that owns it; files to change or add>

## Maintainer changes

- `<path outside apps/, packages/, tools/ and pnpm-lock.yaml>`: <the exact change a maintainer makes there>

## Out of scope

- <item>

## Commit

`<type>(<scope>): <subject>`
```

Approach only when the issue leaves it open or the interview chose another. Out of scope only for
what the interview added; the issue's own list already reaches the fixer. Never repeat the issue's
Expected, Cause, Verify or Done when.

## Full: the brief is the spec

```markdown
# #<n>: <title>

<issue url> · base origin/dev @ <short sha> · platform <extension|mobile|web|packages>

## Agreed behavior

<Expected, one or two sentences, UI strings verbatim in code>

## Cause (proven|suspect)

<where it breaks, repo-relative paths with line numbers>

## Approach

<the chosen approach in a few lines; the layer that owns it; files to change or add>

## Decisions

- Settled: <choice> — <reason>

## Maintainer changes

- `<path outside apps/, packages/, tools/ and pnpm-lock.yaml>`: <the exact change a maintainer makes there>

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

## Groups

A grouped brief repeats a template once per issue, in the order the fixer works them, each starting
at its own `# #<n>: <title>` heading, and ends with one Commit section for the group: the run makes
one commit and one pull request that closes every issue listed. Only the first issue, the one the
brief is dispatched with, may use the short template, and only when it qualifies. The fixer
receives that issue's text and no other, so every other issue gets the full template, with its
Agreed behavior, Verify, Done when and Out of scope written out.

## How each field is filled

Most fields come straight from research (section 2 of the skill) and the interview; these are the
rules that are only the brief's:

- **Agreed behavior**: what the user sees after the fix, not how the code gets there, with UI
  strings and error text verbatim in code spans so the fixer can grep and assert on them.
- **Cause**: keep research's `proven` or `suspect` marker; `suspect` tells the fixer to confirm the
  cause before building on it.
- **Approach**: the one the person chose, or the recommended one when they confirmed the plan,
  naming the layer that owns it.
- **Decisions**: `Settled: <choice> — <reason>`. The full template carries the issue's lines and the
  interview's, the short one only the interview's. A brief's line wins over the issue where they
  differ. `Open` lines never appear: an issue with an unanswered decision is not dispatched.
- **Maintainer changes**: one entry per file outside `apps/`, `packages/`, `tools/` and
  `pnpm-lock.yaml`, with the exact change (section 4 of the skill).
- **Out of scope**: what the interview excluded, plus the areas another dispatch owns (section 5
  of the skill); the full template adds the issue's own list.
- **Verify** and **Done when**: the issue's own when it has them, otherwise research's.
- **Commit**: a conventional-commit subject, imperative, no issue number, at most 100 characters. A
  bug is `fix`, a change is `feat` or `refactor` by its nature; the scope is the platform or
  package (`extension`, `mobile`, `web`, `<package>`). It becomes the commit subject and the pull
  request title; the workflow adds a `Co-authored-by` trailer for whoever dispatched.
