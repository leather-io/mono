---
name: new-issue
description: Draft a GitHub issue for the Leather monorepo (leather-io/mono) in a fixed, agent-ready shape, from a description or from the current conversation, and hand back a prefilled GitHub issue to submit. Use when asked to file an issue, write an issue, report a bug, open a ticket, create an issue for this, or turn a finding into an issue.
---

# New issue

Draft one issue per unit of work for `leather-io/mono`, in the shape in `references/templates.md`,
and hand the person a prefilled GitHub issue. They add screenshots and press Submit; you never do.
Humans and agents read the same issue, so every draft carries precise anchors, the decisions a
fixer must not guess, how to verify the fix, a checkable done condition and explicit scope.

**Nothing is created without an explicit yes** after the person has seen every draft in full with
its title and labels. A draft is not consent for the next one.

## 1. Detect the surface

Pick the first mode that works and say once which one you are in.

- **Full mode**: you can run shell commands, the working directory is a `leather-io/mono` checkout
  (`git remote -v`), and `gh auth status` succeeds. Research runs in the checkout, dedup and
  creation use `gh`.
- **Clone mode**: you can run shell commands and reach github.com, but there is no checkout or no
  `gh`. The repo is public: clone it (§2) and research there. Dedup uses the public search API;
  the output is a link and a Markdown body.
- **Text mode**: no shell, or the clone fails. No feature map, no anchors, no dedup; the output is
  a link and a Markdown body, and the report says the issue still needs anchors, Decisions and
  Verify from someone in full or clone mode.

## 2. Generate the feature map

Before any research, in full and clone mode. `pnpm lt feature-map generate --help` lists the apps
the generator supports (today `extension`); generate every one, whatever the report is about.

- **Full mode**: in the checkout, `pnpm lt feature-map generate --app extension`. If `pnpm lt`
  reports an unknown command, run `pnpm --filter @leather.io/tools build` first.
- **Clone mode**: a shallow clone and only the tools package's dependencies, a few seconds warm:

  ```bash
  dir="$(mktemp -d)"
  git clone --depth 1 --branch dev --single-branch https://github.com/leather-io/mono.git "$dir/mono"
  cd "$dir/mono"
  pnpm install --filter @leather.io/tools... --ignore-scripts
  pnpm --filter @leather.io/tools build
  pnpm lt feature-map generate --app extension
  ```

  Node 22.15 or later is required. Without `pnpm` on the path, use `corepack pnpm`, or
  `npx pnpm@<version>` with the version from `packageManager` in the root `package.json`.

The map lands in `.claude/skills/feature-map/extension.md`. If generation fails, say so, continue
with the route search in §5 and name the failure in the report.

## 3. Gather facts

- Invoked with no description after a working session: draft from the conversation. Use what was
  observed, run or read; do not invent steps that were not taken.
- Otherwise take the description given.
- Compare what you have with the **Version** and **Where** sections (screen or route · network ·
  account type). Ask one round of questions, only for what you cannot derive:
  the platform when the symptom could live in more than one place, the app version, the account
  type (software, Ledger, policy). Never ask for what the code, the feature map or the
  conversation already answers.
- For a bug, ask for the exact error text, as a free-text question and never a pick from options. If none comes back, put "error text not captured" in **Actual** and keep the cause suspect.

## 4. Classify

From `references/labels.md`: the type (`bug`, `enhancement`, or none for an idea), exactly one
`platform:*`, one to three `area:*`, and for bugs a proposed severity. In full mode cross-check
with `gh label list --limit 100` and use only labels that exist.

- **Severity is proposed in your report, never put in the labels.**
- **Critical stops the draft.** Funds at risk or a wallet compromised goes to the private channel,
  not a public issue: the Leather bug bounty on Immunefi, or for maintainers the private
  `leather-io/leather-security` repo. Say why and draft nothing public.

## 5. Anchor (full and clone mode)

Pin every permalink to one SHA: in full mode the local `git rev-parse origin/dev`, in clone mode
the clone's `git rev-parse HEAD`.
`https://github.com/leather-io/mono/blob/<sha>/<path>#L<n>`. In full mode never fetch; a fetch can
block on a hardware key. Confirm each cited line with `git show <sha>:<path>` before linking it, so
the permalink shows what you read, not a working tree.

- **Extension**: search `extension.md` for the route, a `RouteUrls` key, a selector or words from
  the screen, and follow the feature-map skill when it is available. Take the route, gate, flags,
  preconditions, page-object actions and covering spec from the entry.
- **Packages**: find the function and its co-located `*.spec.ts`; the repro is the test command.
- **Mobile and web**: search the routes (the `apps/mobile/src/app` file tree,
  `apps/web/app/routes.ts`) and the screen component for a UI string from the report.

A cause is `### Cause (proven)` only when a reproduction ran in this session: a failing test, or a
path you observed executing. Anything you only read is `### Cause (suspect)`.

## 6. Decisions and Verify (full and clone mode)

Both sections come from the research in §5, before drafting.

- **Verify**: fill it yourself from the anchors and the feature map: the unit command and the spec
  to extend or add, the covering E2E spec from the feature-map entry or "none covers this", an
  existing fixture or mock to reuse. Only the **Needs** line depends on the person.
- **Decisions**: list every point where more than one fix is reasonable and neither the code, the
  repo conventions (`CLAUDE.md`) nor an earlier issue picks one: drop or throw, this issue or a
  follow-up, which layer owns the fix. Skip choices the code already settles.
- **Ask once**: one round with `AskUserQuestion` when available, otherwise a numbered list. At most
  four questions: the decisions with the largest effect on the fix, each with two to four options
  and your recommendation first, plus the **Needs** line when the fix needs a device, Speculos, a
  funded account or a flag. Whatever is answered becomes `Settled: <choice> — <reason>`. Whatever
  is skipped or did not fit stays `Open:` with its options and your recommendation; never a
  second round.

## 7. Split

- **One platform per issue**, and the title prefix matches its label. A fix that lives in a shared
  package is one `platform:packages` issue even when both apps show the symptom.
- **A change each app implements separately** becomes one issue per app, each with a
  `### Sibling` section.
- **One issue per unit someone can own and close.** Propose the split with a title per issue; the
  person decides.

## 8. Dedup (full and clone mode)

- **Full mode**: `gh issue list --repo leather-io/mono --search "<2-3 keywords>" --state all --limit 10`.
- **Clone mode**:
  `curl -s "https://api.github.com/search/issues?q=repo:leather-io/mono+is:issue+<keywords>&per_page=10"`;
  unauthenticated search allows 10 requests a minute.

Show the closest matches with number, state and title as a hint. Do not decide for the person that
it is a duplicate.

## 9. Redact, draft, check

1. **Redact before drafting**: runs of 12 or 24 lowercase words that look like a mnemonic, xpub,
   xprv, zpub and other extended keys, 64-hex private keys, WIFs, emails, account and wallet
   names, API keys and tokens. Replace with `<redacted>` and say what you removed.
2. **Draft** each issue from `references/templates.md`, verbatim headings, in the order given.
   Title: `<Extension|Mobile|Web|Packages>: <what breaks, in the user's words>`. Drop empty
   sections. UI strings and error text verbatim in code. `references/examples.md` shows the target.
3. **Check the budget**: the core stays under 250 words of prose, not counting code blocks, links,
   Decisions, Verify and the details block. Move overflow (logs, long pointers, rationale,
   history) into `<details><summary>Evidence and pointers</summary>`. Done when has one to three
   checkboxes, each checkable by someone else: a spec that passes, a visible string, a number.
4. **Show everything**: per issue, the title, labels, full body, proposed severity, duplicate hints,
   what stays suspect and which decisions stay open. Wait for yes. Apply edits and show again.

## 10. Create

Only after yes, one issue at a time.

- **Title and body go through files**: write each to a temporary file with the file-writing tool, never through `echo`, `printf` or a heredoc, so the shell never expands `$(...)`, backticks or `$VAR` in reporter text; in clone and text mode, URL-encode from those files the same way.
- **Full mode**:
  `gh issue create --repo leather-io/mono --web --title "$(cat <title-file>)" --body-file <body-file> --label "<type>,<platform>,<areas>"`.
  It opens the browser with a new issue prefilled; the person adds screenshots and submits.
- **Clone and text mode**: give two things. A prefilled link, title and body URL-encoded:
  `https://github.com/leather-io/mono/issues/new?title=<title>&body=<body>&labels=<labels>`.
  Then the same Markdown body in one code block, ready to paste if the link fails. GitHub applies
  `labels` only for people with triage access; tell everyone else a maintainer labels it.
- An over-long URL fails with 414: leave the details block out of the link and tell the person to
  paste it from the code block once the issue is open.
- **Siblings**: open the first issue, ask for its number once submitted, then open the second with
  `### Sibling` set to `#<first>`, and offer the back-link line for the person to add to the first.

## 11. Report

The mode, the issue URLs or the links you handed over, the labels per issue, the proposed severity,
what stays suspect or unverified, which decisions stay open, what you redacted, which duplicates
were close, and whether the feature map generated.
