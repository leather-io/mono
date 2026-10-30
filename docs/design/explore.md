# Exploring a feature

This is the protocol for exploring a feature in the Playground, whether you're an agent or a
developer. The template is `apps/web/app/pages/playground/shared/exploration/`;
`areas/receive-example/` is a complete fixture-only worked example.

For a fixed feature brief, build one coherent feature with its required states, using the shared
[recipes](./recipes.md), shown next to the real flow it would replace. Explore multiple variants
only when there is a consequential workflow or UX trade-off to decide. Cosmetic spacing choices
come from the recipes, rather than A/B screens.

## Frames

The canvas draws three frames, read from the same tokens the extension uses (`?frame=`):

| `frame`          | Size     | What it is                                                           |
| ---------------- | -------- | -------------------------------------------------------------------- |
| `popup`          | 390×600  | The toolbar action popup: `popupWidth` × `dialogHeight`              |
| `request-window` | 390×756  | The app-request / approval window: `popupWidth` × `popupHeight`      |
| `tab`            | 1280×800 | The extension in a full tab, content in a 500px (`pageWidth`) column |

Screens get `frame: 'popup' | 'tab'` (the layout); the request window lays out like the popup.
The contact sheet always uses `popup`. `request-window` is opt-in by URL and joins the frame
switcher while selected. Use it for approval screens.

## 1. Capture today's flow first

- Screenshot the shipped flow from start to finish, in popup light, popup dark and tab. Save the
  files as `<step>-popup.png`, `<step>-popup-dark.png` and `<step>-tab.png` inside the area
  folder, e.g. `areas/<area>/today-actual/`, and reference captures in `areas/<area>/references/`.
  Not in `apps/web/public/`: the area stays one folder plus one registry line.
- Import them through Vite and pass the URLs to the config as they are:

  ```ts
  import { imageUrls } from '../../../shared/exploration/image-urls';

  const today = imageUrls(
    import.meta.glob<string>('../today-actual/*.png', {
      eager: true,
      query: '?url',
      import: 'default',
    })
  );
  // today.image(name, frame, theme) returns today[`${name}-${frame}${dark ? '-dark' : ''}.png`]
  // references: { app: 'Xverse', image: refs['xverse-1.png'], … }, and no references.path
  ```

- Capture at the current popup size, 390×600, without scaling.
- Write the steps as a list and give each one its jobs: `choose-asset`, `amount`, `fee`,
  `review`, `sent`.
- **Write each screen's entry points: "how you get here".** One line per screen: the taps from
  home, and every other path in (`Home → Transfer → Receive`, `Token details → Receive`,
  `Settings → All balances`). Variants keep each entry point or say where it went.
- **Inventory actions that skip a screen, too.** Direct copy, QR and hardware verification are
  part of the flow even when they are secondary actions on a row. Preserve them or name the
  deliberate product change. A fixed-scope kit transfer test may exclude them, but label those
  exclusions and do not present that test as a complete product-flow improvement. Receive review,
  26 Oct: the test forced chooser → detail → copy although the extension already offers direct copy
  (`pages/receive/components/receive-item.tsx`).
- Do this before sketching anything. In round 1 the variants quietly dropped "Choose asset",
  because nobody had written it down.

## 1b. Recreate today faithfully, then check it

- **Unchanged parts are the real thing, not a redraw.** Whatever your concept doesn't change
  comes from `@leather.io/ui` or mirrors the extension's composition exactly: the same component,
  props, text styles, ink and spacing. Use the product recipes first (page shells, the list-row presets and `review-sheet`), and read the extension file a recipe names in `mirrors`.
  If no recipe covers the part, copy the extension composition and cite its path in a comment.
- **Compare before you explore.** Recreate the today screen in the Playground, then run
  `pnpm design:fidelity --url "<playground url of the today screen>" --baseline <capture.png> --out <dir>`.
  It screenshots the frame, writes baseline | recreation | diff side by side, and lists each
  block (header, button row, tabs, rows) whose height or edges differ by more than 3px. Fix
  every difference in an unchanged part before sketching. Attach the side-by-side to NOTES.md.
- **What drifted in round 2** (all in parts no concept changed): Transfer/Swap drawn as `md`
  buttons (the product's are `lg` outline, and the tab shows Send/Receive/Swap); the
  Tokens/Collectibles/Activity tabs inset by the page padding (they run edge to edge in the
  popup); a scrollbar in the frame (the extension hides scrollbars); asset second lines in
  subdued `caption.01` (the product's are `label.03` in `ink.text-primary`); a lock icon at 24px
  beside 13px text. The recipes now carry the product versions, and frames hide scrollbars.

## 2. Name the structure explicitly

- When a consequential choice remains, name the structural axes in one line each, for example
  "asset first or recipient first", or "review as a sheet or as a page". Say which axis each
  variant takes. A fixed brief needs no invented alternative.
- For every step today, say whether it's **kept**, **changed** or **cut**. In the config:
  - Each screen has a `job`.
  - A variant can override a job (`jobs`).
  - A step that is removed is listed in `cuts` with a why.
  - A step left exactly as it is gets `kept: true` (or `kept: '<why>'`) on the step, or goes in
    a variant's `kept` list when only that variant keeps it.
- The canvas labels each real step as one of these:
  - `≈ concept <screen>`
  - `Kept (unchanged)` or `Kept · <why>`
  - `Cut · <why>`
  - `Not covered: say why`
- Nothing should still read "Not covered" when you show the work.
- **List the navigation consequences.** For each variant, list the existing paths it changes
  or breaks, using the entry points from step 1: what used to open from here, where it opens
  now, and what is gone. In round 2, Balances B's in-list dropdown took the tap that opens token
  details, and Balances C's sheet replaced token details with no path explained. A broken path
  is either redrawn in the variant or written in the concept's trade-off.

## 3. Unknowns become assumptions, not screens

If the product answer isn't known (for example, whether private and public balances are
separate), write it as a labelled assumption in the config's `assumptions`. It shows under the
frame in the information rail. Build a screen for an unknown only when the screen is the question. Then
say so in the concept's open questions.

## 4. References from the same platform

- Use high-quality products on the same platform as your frame:
  - **Popup:** extension wallets, such as the Rabby, Phantom and Rainbow extensions.
  - **Tab or web:** desktop web products.
- Use mobile apps for ideas only, never for layout or density.
- Every reference gets one line on what you took ("source → our version") and the screens it
  shaped. It goes in `references.byVariant` and shows under "Pulled from".

## 5. One coherent feature; variants for consequential choices

- A fixed brief produces one feature with the required loading, empty, error, pending and success
  states where applicable. Use the existing variant folder/config structure for that one result.
- Make two or more variants only to compare a consequential workflow or UX trade-off. State the
  choice and its consequence. Do not create cosmetic variants to reach a count. The Receive
  review on 26 Oct fixed address spacing in `ReceiveAddressBlock`; those gaps are recipe defaults,
  not an A/B decision.
- Compose screens from [recipes.md](./recipes.md) and `@leather.io/ui`, so the quality matches
  across the feature and any meaningful alternatives. Use typed `actions` and `notice` on page
  shells, `actions` and `callout` on the inline `ReviewSheet`, and the shared spacing recipes.
  Use real `Sheet` for production modal behavior, with `PageActions` in its footer where it fits.
  `customFooter` is a deliberate escape hatch, not the ordinary button composition.
- Keep screen components in `variants/<x>/<x>-screens.tsx` and a variant's own pieces in
  `<x>-layout.tsx`. Pieces two or more variants share go in the area's `shared/` folder, with
  its own `DEVIATIONS.md`.
- The promote report treats the screens a `-screens.tsx` file exports as compositions. Rows,
  cards and buttons defined in it are real components and are assessed like any other.

## 6. Required outputs per variant

| Output              | Where                                                                         |
| ------------------- | ----------------------------------------------------------------------------- |
| Rationale           | `concepts[variant]`: bet, why, trade-off, open questions, each line sourced\* |
| Pulled-from         | `references.byVariant[variant]`: image and one line on what was taken         |
| Compare-with-today  | Screen jobs and cuts in the config. Check `?compare=1` on every screen        |
| Words per screen    | `variants/<x>/NOTES.md`: words and numbers per screen, before and after cuts  |
| Deviations with why | `variants/<x>/DEVIATIONS.md`: one row per promote-ledger key, each with a why |
| Navigation          | `variants/<x>/NOTES.md`: entry points kept, moved or broken, per screen       |
| Today fidelity      | NOTES.md: the `design:fidelity` side-by-side for each recreated today screen  |

\* `source` is one of `notes`, `brief`, `inspiration`, `baseline` or `our read` (typed as
`ConceptSource`), optionally followed by a pointer: `brief §4`, `baseline #3`.

To write DEVIATIONS.md, run `pnpm design:promote <variant folder>` and copy its starter rows. A
variant's report also scans the area's `shared/` folder, and a report on the whole area reads the
DEVIATIONS.md in every folder (each row is checked against the nearest one above its file).

- The first column must be the ledger's **Key**, such as `64px`, `InlineSheet` or `#7A5CFA`,
  and not a description. The report only matches the exact key.
- **Any change from shipped UI needs a reason.** Style changes to existing patterns count, not
  only raw values: a lighter second line, a smaller button, a bigger icon. The report lists
  style props on ui components as restyles (`Caption.color`, `Button.size`, `LockIcon.variant`);
  each one is reverted or gets a row with a why.
- Product decisions and mock-data notes go in NOTES.md or `assumptions`, not in DEVIATIONS.md.
  Rows that aren't deviations come back as stale.
- You're done when the report shows 0 undocumented and 0 stale.

## 7. Quality pass before showing

1. Screenshot every screen in popup light and dark with the contact sheet (`?sheet=1&v=<x>`),
   and in tab light one screen at a time (`?v=<x>&screen=<s>&frame=tab`; the sheet is
   popup-only). Approval screens also get `frame=request-window`.
2. Critique it against [review-checklist.md](./review-checklist.md) steps 2–5, and the copy budget
   in the `leather-ui` skill.
3. Count the words, then remove repetition and optional background that does not change a
   decision. Keep needed decision and safety context visible; disclosures are for optional
   background. Preserve label hierarchy and don't repeat the task heading in the body. Count again
   and record before and after; a sentence quota must not hide required information.
4. From the repository root, run `pnpm --filter @leather.io/web typecheck`,
   `pnpm --filter @leather.io/web lint`, and
   `pnpm design:check apps/web/app/pages/playground/areas/<area>`, then the promote report.
   Ordinary lint enforces design rules only on the owned recipes, recipe gallery and Receive
   example; a new area needs the explicit design check too. A typecheck catches imports that
   don't exist on web (see `apps/web/AGENTS.md`); in the browser, a crash names the variant and
   screen, and a module that fails to load names its file.

## 8. When no pattern fits

If no recipe and no row in [i-need-to.md](./i-need-to.md) fits, don't ship a one-off.

1. Describe the missing pattern and the workflow it must support in the variant's NOTES.md under
   "Needs design".
2. Build a focused proposal with its required states. Add alternatives only when they expose a
   consequential workflow or UX trade-off.
3. Raise the proposal and any consequential choices with design (Fab, or `#design-system`).

The answer becomes a recipe or a component, and the variant then uses it.

## Tools

**Today fidelity.** Screenshots a recreated today screen and diffs it against the baseline:

```sh
pnpm design:fidelity --url "<dev>/playground/<area>?v=today&screen=home&frame=popup" \
  --baseline areas/<area>/today-actual/home-popup.png --out /tmp/fidelity
```

It writes `<name>-fidelity.png` (baseline | recreation | diff in red) and `<name>-fidelity.md`:
the share of pixels that differ, and the blocks (runs of rows with ink) aligned by shape, each
with its height and edge differences. A 390px frame is scaled to a 360px capture.

**Template.** Write `<area>.config.ts` as an `ExplorationConfig`, and render
`<ExplorationCanvas config={…} />`. It deep-links with
`?v=&screen=&theme=&frame=popup|request-window|tab&sheet=1&compare=1`.

**Words per screen.** Counts the visible words in every `[data-frame]`, and lists numbers and
addresses separately:

```sh
pnpm design:words "<dev>/playground/<area>?sheet=1&v=b&theme=light"
node scripts/design/words-per-screen.ts --urls urls.txt --json /tmp/words.json
```

- It prints a table, and writes JSON with `--json <file>`, or to stdout only with `--json -`.
- Frames are labelled by `data-variant`, `data-screen`, `data-frame` and `data-theme`.
- Visually hidden text and punctuation-only tokens are excluded.
- Address-like tokens (`bc1…`, `SP…`, `sbtc…`, `0x…`, truncated `SP2J…9EJ7`) count as
  `addresses`, not words. An address shown in groups (`AddressDisplayer`) counts once.
- When a sheet is open (`role="dialog"`, as `ReviewSheet` renders), only the sheet is counted;
  the dimmed screen behind it is not. The table marks those screens `(sheet)`.
- `primaries` counts the solid buttons visible per frame (an opaque fill at 3:1 or more against
  its surface, light or dark, danger included). A frame with more than one is listed by name
  after the table and the script exits 1 (`--max-primaries` to change the limit).

**Alignment.** Checks the one-gutter rule on the render:

```sh
pnpm design:align "<dev>/playground/<area>?sheet=1&v=b&frame=popup"
```

- Rails are the `[data-gutter]` regions the page shells mark (body, pinned, review sheet), or,
  for a screen built without them, the outermost containers with equal side padding.
- Each direct child's ink (text, icons, painted boxes; not hover bleeds) must start on the rail
  ±1px when it starts within 16px of it, and end on it likewise. Centred content and ragged
  left-aligned text are skipped.
- All rails in a frame share one inset, and the header's first and last icon glyphs sit the
  same distance from each edge, on the rail.
- Findings print per frame; any finding exits 1. Round 3 surfaced: an 8px asymmetric header
  (back vs settings), the review "To" address 8px past the rail, the review rows on a 32px rail
  while the page used 24px, and row `+` actions 8px inside the rail.
