---
date: 2026-05-26
meeting: Fabricio + Edgar (proposal, pre-meeting)
status: two paths to discuss; no decision yet
audience: Edgar (multisig maintainer in mono), Fabricio, anyone catching up later
mode: discussion artifact — what we choose here we should write up post-meeting as the agreed shape
---

# Multisig prototype → leather/mono — Two paths

A slide-by-slide proposal for how to get the Leather Multisig prototype (`/Users/fabriciorosa/Work/local/Leather Multisig App/`) into `leather/mono`. Each `---` is a slide boundary. Italicized lines are speaker notes / context for the reader.

This deck deliberately mirrors the shape of the May 22 deck with Andres + Haydar (`bitcoin-staking-app/docs/decks/2026-05-22-design-to-code-workflow-deck.md`). The questions are the same; the answers are different because mono is a different environment.

---

## Slide 1 — Title

**Bringing the multisig prototype into leather/mono**

Two paths for getting a ~7k-line browser prototype into a Turborepo with CLEAN layers, Panda CSS, and three apps (extension, mobile, web).

Fabricio · with Edgar

*Speaker notes: This is a proposal deck, not a record. The goal of the meeting is to pick a path (or a hybrid) so I can stop sitting on the prototype and Edgar knows what shape the work will arrive in. The structure mirrors what worked with Andres + Haydar on the bitcoin-staking-app side; it's adapted because mono is a very different codebase.*

---

## Slide 2 — Where we are

**The prototype:**

- Lives at `/Users/fabriciorosa/Work/local/Leather Multisig App/` (local only, not in any repo)
- ~7,200 lines across `app.jsx`, `screens.jsx`, `flows.jsx`, `extension.jsx`, `components.jsx`, `data.jsx`, plus a tweaks/prototype-menu shell
- Loaded via `<script type="text/babel">` from `index.html` — no bundler, no TypeScript, no Panda
- Has its own `ds/` folder (colors, type, fonts, icons, illustrations, leather logomark)
- Covers: onboarding, dashboard, create-vault, vault-detail, account-detail, tx-detail, invite-accept, send-modal, settings, an extension popup, and reviewer presets via the tweaks panel

**What's already in mono:**

- `packages/services/src/multisig/multisig.service.ts` — domain beachhead, Edgar's work
- No multisig UI surface yet in `@leather.io/ui` or `@leather.io/features`
- No `design/` directory, no Storybook, no design sandbox app

**Edgar (and Edgar's on-call) own multisig in mono.** Same North Star as the bitcoin-staking-app conversation: whatever lands must be something Edgar is comfortable owning and maintaining. The two paths below are different answers to "how do we get there without dumping prototype JSX on him."

*Speaker notes: This slide exists to make the starting state explicit so Edgar and I share the same picture. The prototype being a Babel-in-browser sketch (not a real build) is the single most important fact on this slide — it means **neither path can be "copy the files in."** Whatever we do, the code crosses a translation boundary: untyped JSX → typed React + Panda + cross-platform-aware. The two paths differ in **who** crosses that boundary and **when**.*

---

## Slide 3 — Constraints specific to mono

These are the things that change the answer vs. the bitcoin-staking-app version:

- **Five migration targets, not one.** A single "vault card" pulls types from `@leather.io/models`, domain logic from `@leather.io/services/multisig`, queries from `@leather.io/queries`, atoms from `@leather.io/ui`, and composition from `@leather.io/features`. There is no single `src/components/` to migrate into.
- **Panda CSS + design tokens.** `@leather.io/ui` is Panda-based with a generated `leather-styles`. Prototype uses raw CSS variables in `ds/colors_and_type.css`. Tokens have to be reconciled before anything ships.
- **Multi-platform.** mono runs `apps/extension`, `apps/mobile` (Expo / React Native), and `apps/web`. The prototype is web-DOM-only. Anything that migrates needs a story for mobile or an explicit "web-only" carveout.
- **No Storybook.** Adding it is a real decision (build config, who maintains it, does it ship). The bitcoin-staking-app workflow leaned on Storybook as the component-review surface — mono will need an answer to "what surface replaces it" before Path A is workable.
- **CODEOWNERS exists but is minimal.** Adding a `design/` ownership entry is trivial. Not a blocker.
- **Multisig service work has already started.** Whichever path we pick has to land alongside, not on top of, `packages/services/src/multisig/`.

*Speaker notes: The bitcoin-staking-app workflow was relatively clean because the target was a Next.js app with one `src/`. mono is harder. The five-migration-targets point is the one I most want Edgar to react to — if his answer is "I'll handle the routing across packages, just give me the component," that pushes us toward Path B. If his answer is "I want to see the designer iterate and migrate piece by piece with me," that pushes us toward Path A.*

---

## Slide 4 — Path A — In-repo design sandbox (the bitcoin-staking-app analog)

**Shape:** a dedicated workspace inside `leather/mono` for design exploration; CODEOWNERS-segregated; components migrate into the real packages when ready.

**Concrete proposal:**

- New workspace: `apps/design/` (Vite or Next.js, designer's call) — a non-shipping app, never bundled for users
- Inside it: `components/` for atomic components, `pages/` for composed preview screens
- `CODEOWNERS` entry: `apps/design/ @<designer>` — designer can self-merge inside; anything outside surfaces a warning
- Storybook (or Ladle — lighter) installed inside `apps/design/` only; previews component states; doesn't bleed into other packages
- Existing `@leather.io/ui` components imported into the sandbox so design work composes against real atoms
- **Components are the unit of migration.** When a vault card is ready, Edgar moves it from `apps/design/components/<thing>` to `packages/ui/src/components/<thing>` (or `@leather.io/features/multisig/<thing>` if feature-shaped). Designer reviews the migration PR.
- **Preview pages don't migrate.** Production routes are Edgar's territory — wrappers, providers, real data, error/loading states.

**Daily loop (designer):**

1. Pull tokens + atoms from `@leather.io/ui` into the sandbox
2. Rebuild a prototype screen as components against real tokens
3. Compose into a preview page in `apps/design/pages/<screen>`
4. Iterate visually with `pnpm dev` from `apps/design/`; review on Storybook (or equivalent)
5. When a component feels right, hand it to Edgar for migration

**What this borrows from the bitcoin-staking-app deck:** the CODEOWNERS-based segregation; components-as-unit-of-migration; pages-as-scratch-space; same repo as the single source of truth so foundation updates flow into design work.

**What's different vs. that workflow:**

- Needs a new `apps/design/` workspace + Storybook decision before anything else can happen (real upfront cost, ~couple days of Edgar's setup time, similar to what Haydar took on)
- Migration target isn't one folder — it's five packages. Edgar decides per-component which package gets the migration.
- Mobile parity is an open question (see slide 6)

*Speaker notes: This is the heavier-investment path. It pays off if the multisig surface keeps evolving (new flows, refinements, follow-on features) and the designer wants ongoing iteration in code instead of bouncing back to Figma. It does NOT pay off if the multisig PRs are mostly one-shot and Edgar would rather not learn a new sandbox tool. Honest read: this is the path I'd default to if Edgar wants ongoing collaboration; it's overkill if he wants a clean handoff.*

---

## Slide 5 — Path B — One-shot prototype PR

**Shape:** one PR adds the prototype as code under `docs/design/multisig/` (or similar); devs rebuild against the real packages; the prototype directory gets deleted when production lands.

**Concrete proposal:**

- Single PR: `feat(docs): add multisig prototype as visual contract`
- Adds the prototype files as-is under `docs/design/multisig/` — `index.html`, `*.jsx`, `app.css`, `ds/`
- README at the root explains: "This is the visual + interaction contract for the multisig surface. Implementation goes against `@leather.io/ui` atoms, `@leather.io/features` composition, and `packages/services/src/multisig/`. This folder is reference, not source — delete when production ships."
- `CODEOWNERS` entry for `docs/design/multisig/` keeps the designer as the touch-point for design questions
- Prototype runs locally with a `python3 -m http.server` (or equivalent) — no build needed
- **Designer is hands-off after the PR merges.** Subsequent design changes go through Figma sketches, written notes, or sync calls with Edgar — same as today's pre-prototype world.
- Edgar (or whoever does the multisig UI work) reads the prototype as a spec, splits it into PRs against the real packages, owns the rebuild end-to-end.

**Daily loop (designer):**

- After the PR: nothing. The prototype is the deliverable. If something needs to change, that's a sync with Edgar + an updated sketch, not a code PR.

**What this is good for:**

- Zero new infrastructure — no `apps/design/`, no Storybook decision, no design CI to maintain
- Edgar's review surface doesn't change — he reads the prototype once, then works in mono normally
- Clean time boundary — when the rebuild ships, the prototype directory gets deleted in the same PR
- No "is the designer about to PR something into mono" ambient worry

**What this loses:**

- No designer iteration in code. The prototype is frozen at the moment of PR; if the rebuild surfaces UX issues, the prototype doesn't reflect them.
- No incremental component review. Edgar sees the rebuild in chunks, not the design alongside.
- Prototype drifts from production fast (the moment Edgar makes a sensible tweak, the two diverge).

*Speaker notes: This is the lower-investment, higher-clarity path. It treats the prototype as a one-way handoff, the same way a Figma file is a one-way handoff today — except in code, which is better than Figma for state coverage and interaction. Honest read: this is the path I'd default to if Edgar's instinct is "let me own the rebuild without a designer in the PR loop." It maps cleanly onto how multisig UI work would otherwise have happened, just with a much better spec than Figma alone.*

---

## Slide 6 — Side-by-side

| Dimension | Path A — design sandbox | Path B — one-shot PR |
|---|---|---|
| **Upfront cost** | New `apps/design/` workspace + Storybook decision (~2-3 days Edgar) | None — single content PR |
| **Designer ongoing role** | Iterates components in code, hands off piece by piece | Hands-off after PR; sync calls for changes |
| **Edgar's review burden** | Component-by-component migration PRs over time | Reads prototype once; owns rebuild |
| **Mobile parity** | Has to be solved (web-only sandbox by default) | Edgar decides per-component during rebuild |
| **Panda CSS / token translation** | Happens incrementally in the sandbox | Happens during rebuild, all in one cycle |
| **Risk if prototype is "almost final"** | Low — designer keeps refining in repo | Medium — prototype-vs-rebuild drift |
| **Risk if multisig priorities shift** | Higher — sandbox infrastructure paid for, but unused | Low — single PR, easy to revert or ignore |
| **Comparable to bitcoin-staking-app workflow** | Yes, with mono-specific adaptations | No — this is the "Figma-replacement-via-code" alternative |
| **Where it lives** | `apps/design/` (new workspace) | `docs/design/multisig/` (single folder) |

**A hybrid worth considering:**

Path B now, Path A later if the multisig surface keeps generating design work. The one-shot PR doesn't preclude standing up `apps/design/` next quarter; it just doesn't pay for the infrastructure until we know we need it.

*Speaker notes: I genuinely don't know which is right without Edgar's reaction. My weak prior: hybrid. Ship Path B for multisig — it's well-defined, mostly one-shot, and Edgar prefers to own UI rebuilds. Then if a second surface (e.g., a follow-up multisig feature, or a new product area) wants the iteration loop, we stand up `apps/design/` for that. The bitcoin-staking-app workflow proved the sandbox shape works, so we'd be importing a validated pattern instead of inventing one.*

---

## Slide 7 — What doesn't transfer from the prototype either way

Independent of path, the prototype crosses these boundaries on the way to production:

- **`ds/colors_and_type.css` → Panda tokens.** The prototype's raw CSS variables need a 1:1 reconciliation against `@leather.io/tokens` and `@leather.io/ui`'s Panda theme. If a token doesn't exist yet (the chain pill's logo glyph color, the squircle avatar's chain dot, the status-pill background tints), it needs adding to the token package first.
- **`<script type="text/babel">` JSX → typed TSX.** No `as` casts, no `!` assertions, no enums (project rules in CLAUDE.md). Function declarations for top-level, interfaces for prop shapes, `function` not arrow for components.
- **`Icon = ({ name }) => <img src={\`./ds/icons/${name}.svg\`} />` → `@leather.io/ui` icon system.** Prototype loads icons by filename; mono uses a structured icon set. Icons need an audit + import.
- **`localStorage` persistence → Redux Toolkit slices.** Prototype persists vaults to localStorage; production goes through `state/` (extension) or `*.write.ts`/`*.read.ts` (mobile).
- **Tweaks panel + reviewer presets → dropped.** Useful for the prototype's "show this state to a reviewer" loop, not for production. If we want a state-explorer surface long-term, that's Storybook's job (Path A) or a debug menu (Path B).
- **`flows.jsx` (multi-step orchestration) → React Query + service layer.** The prototype simulates network states with timers and local state; production uses `@leather.io/queries` against real APIs and the `multisig.service.ts` domain layer.
- **Single-platform → cross-platform.** Web-DOM-only JSX needs splitting into `.web.tsx` / `.native.tsx` shared files, or an explicit "this surface is web-only" decision per-component.

**Why this matters for path choice:** Path A spreads this translation work over weeks of small migrations. Path B concentrates it into Edgar's rebuild cycle. Same total work, different distribution.

*Speaker notes: This is the slide that argues against a naive "just copy the files in." Even Path B isn't a copy-paste — it's "land the prototype as reference, then rebuild." Worth being explicit about this so neither of us underestimates the rebuild effort regardless of path.*

---

## Slide 8 — Open questions for Edgar

1. **Multisig roadmap shape.** Is this a one-shot ship (build the surface, done for a while) or a sustained track (multiple follow-on releases)? Sustained tilts Path A; one-shot tilts Path B.
2. **Designer collaboration appetite.** How much designer involvement do you want during the build? "Just give me a clear spec and leave me alone" → Path B. "I want the designer in code review on each piece" → Path A.
3. **Storybook / component-preview surface.** Independent of multisig: does mono want one at all? If you've been wanting it anyway, Path A is a good forcing function. If it's overhead you'd rather avoid, that's another Path B vote.
4. **Mobile timing.** Is multisig coming to mobile this cycle, next cycle, or undecided? If this cycle, both paths need a mobile parity answer up front. If later, web-first is fine.
5. **Token gaps in `@leather.io/ui`.** Anything the prototype uses that you already know we'd need to add to Panda? (e.g., the chain-pill logo glyph, status-pill tints, squircle avatar treatment.)
6. **Who does the rebuild?** You? Another engineer? Both? Affects how granular the handoff needs to be.

*Speaker notes: These are the actual decision inputs. I don't need answers to all six to pick a path — answers to (1) and (2) basically determine it. The rest are scoping questions that matter after we've chosen.*

---

## Slide 9 — Recommended next steps under each path

**If we pick Path A (design sandbox):**

1. Edgar — scaffold `apps/design/` (Vite is fine; Next.js if we want SSR previews); add to `pnpm-workspace.yaml`
2. Edgar — install Storybook (or Ladle) inside `apps/design/`; configure to import `@leather.io/ui` atoms
3. Edgar — add `CODEOWNERS` entry: `apps/design/ @<designer>`
4. Edgar — share setup notes with me
5. Fabricio — first port: smallest screen from the prototype (probably the vault list cards or the invite-accept modal), built as atomic components first, composed into a preview page
6. **First real PR is a sample** — small, scoped, validates the sandbox + migration loop before doing larger ports
7. Reconvene after first migration to look for friction

**If we pick Path B (one-shot PR):**

1. Fabricio — write the prototype's README (visual contract, how to run it locally, what's in scope, what's out of scope)
2. Fabricio — open the PR adding `docs/design/multisig/` and the README; tag Edgar for review
3. Edgar — review for "is this enough spec to rebuild from"; flag anything ambiguous
4. Merge
5. Edgar — break the rebuild into PRs against the real packages on his own schedule
6. Designer is hands-off; questions go through DM / sync calls; flag a check-in once the first rebuild PR is up so I can sanity-check token + interaction fidelity
7. Delete `docs/design/multisig/` in the PR that ships the last rebuilt surface

**Cross-cutting (either path):**

- Reconcile the prototype's `ds/colors_and_type.css` against `@leather.io/tokens` early — this is a blocker for either path and not coupled to the path choice
- Decide mobile scope (this cycle / next / undecided)

*Speaker notes: Concrete, owned, time-bounded — same shape as the bitcoin-staking-app deck's closing. The "first PR is a sample" idea is worth keeping even on Path A: it's a low-stakes way to find out where the workflow leaks before the surface area gets big.*

---

## Slide 10 — How we'll know whichever path we picked is working

**Path A working:**

- Edgar feels the sandbox is cleanly segregated; on-call doesn't get paged for design experiments
- Migrations land in focused PRs Edgar can review without rebuilding from scratch
- Designer iterates fast: tokens flow from `@leather.io/ui`, components compose locally, comparison variations are easy
- After 2-3 component migrations, the sync question (slide 5 of the bitcoin-staking-app deck) has a real answer instead of a hypothetical one

**Path B working:**

- Edgar reads the prototype once and has a clear spec — no "what did the designer mean here" Slacks
- Rebuild PRs are well-scoped and ship on Edgar's normal cadence
- The prototype directory disappears in the same PR that ships the last rebuilt surface
- Total handoff effort (designer + Edgar) is less than what the equivalent Figma-based handoff would have cost

**Either path failing:**

- Token drift between prototype and production becomes a recurring source of churn → fix by reconciling tokens once, not per-component
- Mobile becomes an afterthought → fix by picking mobile scope up front, not at rebuild time
- The prototype's flow logic (`flows.jsx`) doesn't survive contact with the real service layer → fix by walking through one flow with Edgar end-to-end before committing to a path

*Speaker notes: Closing slide. Same spirit as the bitcoin-staking-app deck's closer: name what success looks like, name what failure looks like, frame either path as something we adjust as we go. The "either path failing" bullets are the ones I'd most want us to actively watch for — they're the ones least path-dependent.*

---

## Appendix — References

**The prototype:**

- `/Users/fabriciorosa/Work/local/Leather Multisig App/` — Babel-in-browser React, ~7,200 lines across 8 files + `ds/` folder
- `index.html` loads `tweaks-panel.jsx`, `prototype-menu.jsx`, `data.jsx`, `components.jsx`, `screens.jsx`, `flows.jsx`, `extension.jsx`, `app.jsx` in that order
- Screens covered: onboarding · dashboard · create-vault · vault-detail · account-detail · tx-detail · invite-accept · send-modal · settings · extension popup
- State surfaces via Tweaks panel: `btc`/`stx` connection, `homeState` (zero/current), `membersState` (fresh/joined), `showExtension`

**The parallel workflow (informs Path A):**

- `~/Work/repos/bitcoin-staking-app/docs/decks/2026-05-22-design-to-code-workflow-deck.md` — Andres + Haydar agreed shape on the staking app side
- Workflow there: `design/` directory, CODEOWNERS, components as unit of migration, Storybook, preview pages don't migrate

**Existing multisig surface in mono:**

- `packages/services/src/multisig/multisig.service.ts` — Edgar's domain beachhead
- No multisig UI surface yet in `@leather.io/ui` or `@leather.io/features`
- No `apps/design/`, no Storybook, no design CODEOWNERS entry

**mono conventions that constrain either path:**

- `CLAUDE.md` (root) — CLEAN architecture layers, no enums, function declarations for components, kebab-case files, Panda CSS via `@leather.io/ui`, conventional commits, branches against `dev` not `main`
- `.github/CODEOWNERS` — currently minimal (two entries); adding a `design/` or `docs/design/` entry is straightforward

*Note: this deck is a proposal, not an agreed shape. The agreed shape gets written up after we talk — same convention as the bitcoin-staking-app deck.*
