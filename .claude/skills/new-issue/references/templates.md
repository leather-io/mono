# Templates

Headings are `###` so every issue reads the same way to people and to agents. There are no issue
forms; issues are blank issues with a body drafted from these templates. Keep the order. Drop a
section that would be empty. The core stays under 250 words of prose, not counting code blocks,
links, Decisions, Verify and the details block.

Title for every variant: `<Extension|Mobile|Web|Packages>: <what breaks or changes, in the user's words>`.

An agent fixing an issue reads it this way:

- **Decisions**: every `Settled` line is binding; do not reopen it. Ask the person about every
  `Open` line before writing code.
- **Verify**: run every line before ticking Done when. A line that says no spec covers it means
  adding coverage or saying in the PR that it was not tested end to end.
- **No Decisions or Verify section**: the issue was drafted without the code (text mode). Research
  and ask before writing code.

## Bug

```markdown
### Problem

<one sentence>

### Version

<app version, or dev @ short sha>

### Where

<screen or route> · <network> · <account type> · dev @ <short sha>

### Repro

1. <step>
2. <step>
3. <what you see>

### Expected

<one sentence>

### Actual

<one sentence>

### Cause (suspect)

<where it breaks, with permalinks>

### Decisions

- Settled: <choice> — <one-line reason>
- Open: <question>? Options: <a> / <b>. Recommended: <a>, because <reason>.

### Done when

- [ ] <checkable condition>

### Verify

- Unit: `<command>` — <spec to extend or add>
- E2E: `<command>` — <covering spec>, or none covers this
- Fixtures: <fixture, mock or helper to reuse>
- Needs: <device, Speculos, funded account, flag>, or nothing

### Out of scope

- <excluded item>

<details><summary>Evidence and pointers</summary>

<screenshots, logs, long pointers, rationale>

</details>
```

- **Problem**: what happens, to whom, what it costs them. No cause here.
- **Version**: the app version from Settings or the store listing; for packages or an unreleased
  build, `dev @ <short sha>`.
- **Where**: one line, no app or version. For packages, the package name and function replace the
  screen: `@leather.io/bitcoin · getTaprootPayment · dev @ <sha>`. Drop the fields you do not
  know.
- **Repro**: at most 5 numbered steps ending in what you see, or one failing test command such as
  `pnpm --filter @leather.io/bitcoin test:unit -t '<name>'`. Start from a state the covering spec
  can set up.
- **Expected** and **Actual**: one sentence each; UI strings and error text verbatim in code.
- **Cause (suspect)** or **Cause (proven)**: proven only when a reproduction ran in the session
  that wrote the issue (a failing test, an observed path). Permalinks pinned to the dev SHA.
- **Decisions**: the choices a fixer would otherwise guess, found while reading the code. The
  person's answers become `Settled` with their reason; unanswered ones stay `Open` with options
  and a recommendation. Drop the section when the code leaves nothing to choose.
- **Done when**: one to three boxes, each checkable by someone else: a spec that passes, a
  visible string, a number. State the behavior, not the fix; the fix belongs in Cause or
  Decisions.
- **Verify**: how to prove Done when. Unit and E2E name a runnable command and the spec file;
  E2E takes the covering spec from the feature-map entry and needs `pnpm --filter
@leather.io/extension build:test` first. Needs is the only line the person supplies. Drop a
  line that does not apply.
- **Out of scope**: what a reasonable reader might expect this issue to cover but it does not.
- **Sibling**: only when the same change is split per app; see the Change variant.
- **Evidence and pointers**: screenshots, recordings, logs, call chains, the suggested patch,
  rationale. Anything that pushes the core over budget goes here.

## Change

```markdown
### Problem

<what changes and why>

### Where

<screen or route> · <network> · <account type> · dev @ <short sha>

### Scope

- <behavior after the change>

### Decisions

- Settled: <choice> — <one-line reason>
- Open: <question>? Options: <a> / <b>. Recommended: <a>, because <reason>.

### Out of scope

- <excluded item>

### Done when

- [ ] <checkable condition>

### Verify

- Unit: `<command>` — <spec to extend or add>
- E2E: `<command>` — <covering spec>, or none covers this
- Fixtures: <fixture, mock or helper to reuse>
- Needs: <device, Speculos, funded account, flag>, or nothing

### Sibling

<#number or "opened next"> (<other platform>)

<details><summary>Rationale and pointers</summary>

<background, file pointers, designs>

</details>
```

- **Problem**: what changes and why it matters to the user, in one or two sentences.
- **Where**: as in Bug. A change has no Version section.
- **Scope**: the end state as short bullets, one behavior each. No implementation plan.
- **Decisions**: as in Bug. Questions the owner must settle before starting go here as `Open`
  lines, not in the details block.
- **Out of scope**: neighbors that stay as they are and issues that track them.
- **Done when** and **Verify**: as in Bug.
- **Sibling**: the issue that carries the same change on the other platform. Present on both
  issues of a pair.
- **Rationale and pointers**: file pointers, the shared constant to reuse, design links.

## Idea

```markdown
_Idea capture, not scoped work._

<one paragraph: what prompted it, the idea, what it would replace>

### Open questions

- <question>
```

- No Where, no Done when; an idea is not work someone can close yet.
- Labels: no type label; exactly one `platform:*` like any issue, matching the title prefix.
  Use `Packages:` when the idea is tooling or spans apps.
- When the open questions are answered, file Change issues from it and link back.
