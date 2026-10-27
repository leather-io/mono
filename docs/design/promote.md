# Promote report

The promote report shows how far a Playground sketch is from the design system and what to do
about each difference. You run it when a sketch looks right and you want to move it into
product code. Every deviation that ships should be one somebody chose, with a reason written down.

It reads a Playground area or variant folder and checks five things. Any change from shipped UI
needs a reason, so each finding is either fixed or given a why in `DEVIATIONS.md`:

1. **Raw values.** Each colour literal (hex, `rgb()`, `hsl()`, named) is matched to the nearest
   semantic colour token. Each raw size (px or rem in a spacing, radius, font or dimension prop) is
   matched to the nearest spacing, radius, size or text-style token.
2. **Undefined tokens.** `textStyle`, colour, spacing and radius names that don't exist. Panda
   doesn't type-check these, so they silently render the browser default.
3. **Components.** Every React component defined in the folder is compared with the
   `@leather.io/ui` components. You get a proposal: reuse, extend, or new.
4. **Local primitives and duplicates.** A raw `<button>` or `styled.button`, `@radix-ui` imports,
   local tooltip copies, and local files named like a ui component. Plus **restyled ui
   components**: a style prop on a `@leather.io/ui` component or icon that changes how the shipped
   one looks (`color`, `textStyle`, `fontSize`, `fontWeight`, `opacity`, `size`; on icons and
   `IconButton` also `variant`, `width`, `height`). Key `Component.prop`, e.g. `Caption.color`,
   `Button.size`, `LockIcon.variant`. Layout props (margin, flex, gap) don't count. In round 2 this
   would have caught the home's `Button.size=md` (Transfer/Swap are `lg` in the product).
5. **The deviation ledger.** Everything above in one table, checked against the folder's
   `DEVIATIONS.md`.

It ends with a one-line drift score for the Playground dock badge.

The values come from the built `@leather.io/tokens` (`packages/tokens/dist`). Rules 2 and 4 reuse
the lab's ESLint rules in `eslint-rules/design-system/`, so the report and
`eslint.design.config.js` agree on what counts.

## Run it

```sh
pnpm design:promote apps/web/app/pages/playground/areas/<area>
node scripts/design/promote.ts apps/web/app/pages/playground/areas/<area>   # same thing
node scripts/design/promote.ts apps/web/app/pages/playground/areas/<area> --out /tmp/<area>-promote.md
```

| Flag                   | Does                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `--out <file.md>`      | Also writes the markdown to a file, and the JSON summary next to it (`<file>.json`)  |
| `--json <file>`        | Writes the JSON summary to this path. `--json -` prints the JSON to stdout instead   |
| `--system <file.json>` | Reads values from a `leather-system.json` snapshot instead of `packages/tokens/dist` |
| `--quiet`              | Prints only the drift line                                                           |

You need Node 22.18 or later, which runs the TypeScript directly. Node 22.15–22.17 also works if
you add `--experimental-strip-types`. If tokens
aren't built, run `pnpm --filter @leather.io/tokens build` first. The report takes about half a
second.

Tests: `node --test scripts/design/promote.test.ts`. They run against the deliberately off-system
fixture in `scripts/design/__fixtures__/off-system-sketch/`.

## Read the verdicts

**Colours** are compared with CIEDE2000 (ΔE00) as they render, in the mode the value is written
for. A value under `_dark` is compared with dark token values. A translucent value is composited
over `ink.background-primary` first. When a `{ base, _dark }` pair is given, the report also finds
the one token that fits both modes.

| ΔE00 | Verdict                       | What to do                                                                      |
| ---- | ----------------------------- | ------------------------------------------------------------------------------- |
| ≤ 2  | `same — swap to token`        | Nobody can see the difference. Swap it.                                         |
| ≤ 6  | `close — likely token, check` | Probably the token. Compare them side by side in both modes, then swap or keep. |
| > 6  | `new colour — deliberate?`    | A new colour. Keep it only with a reason, and consider proposing a token.       |

If a colour token fits the property's role, the report suggests it: a text token for `color`, a
background for `bg`, a border for `borderColor`. Same-valued tokens are listed together, for
example `ink.text-primary` and `ink.action-primary-default`.

**Sizes** use the same three verdicts by px difference: 0 means `same`, up to 2 means `close`, and
anything more is `off-scale — deliberate?`. Spacing props map to `space.*`, radii to
`xs`–`round`, `fontSize` and `lineHeight` to the nearest `textStyle`, and width and height to
`sizes`.

**Components** get a score from 0 to 1 against every ui export. The score is 0.35 name + 0.25
props + 0.25 structure + 0.15 meta, and the report prints the reasons for each part.

- **Name.** Shared words: `PillButton` shares "button" with `Button`.
- **Props.** The prop types, read with the TypeScript compiler API. The fraction of local props
  the ui component already accepts. A prop counts if it's an own prop, a DOM prop, or a known
  rename such as `loading` → `aria-busy`.
- **Structure.** Whether the component wraps the ui component, uses the same base element, or
  renders the same parts.
- **Meta.** The `replaces`, `useWhen` and `dontUseWhen` fields in `*.meta.shared.ts`.

| Verdict                               | Meaning                                                                                                          |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `reuse X as-is`                       | Every local prop maps onto X. Delete the local component. A wrapper's presets move to the call site.             |
| `extend X with prop(s) a, b`          | X fits except for these props. First check whether X can already do it. If not, add the props to X and its meta. |
| `new component — needs a meta file …` | Nothing scores ≥ 0.45. If it gets promoted, it goes into packages/ui with a meta file and a gallery entry.       |
| `page scaffolding` / `providers only` | Pages, routes, layouts and context wrappers. Not assessed.                                                       |
| `screen composition`                  | A screen: what a `-screens.tsx` file exports, or a local screen body (takes `frame`, renders a page shell).      |

Rows, cards and buttons defined inside a `-screens.tsx` file are real components and are assessed
like any other, so they need a DEVIATIONS.md row too.

These verdicts are proposals. The scores are there so you can check the reasoning and overrule it.

**Ledger actions:**

- `swap`: a mechanical token swap.
- `decide`: keep it with a reason, or swap.
- `fix`: an undefined token. That's a bug and can't be justified.
- `reuse`, `extend`, `new`, `replace`: component work.

## DEVIATIONS.md

Put a `DEVIATIONS.md` in each folder that has deviations: `variants/<x>/` and the area's
`shared/`. Each row's key is the value from the ledger's **Key** column: a literal, a token, an
import, a construct or a component name. The report copies the reason into the ledger and marks
the row **documented**.

- Each deviation is checked against the **nearest** DEVIATIONS.md above its file. Running the
  report on a whole area reads every one of them.
- Running it on a variant folder (`<area>/variants/<x>`) also scans the area's `shared/` folder,
  so a piece moved into `shared/` still shows in every variant's report.

```md
| Deviation | Where                 | Why                                                         |
| --------- | --------------------- | ----------------------------------------------------------- |
| `#7A5CFA` | page, "Private" label | Private-mode accent; no purple in the palette yet (DES-210) |
| `13px`    | page, amount chip row | Optical: 12px looked cramped next to the 48px chips         |
```

Bullets work too: ``- `PillButton` — reason``.

- **Undocumented:** a deviation with no row, or with an empty, `TODO` or `?` reason.
- **Stale:** a row whose deviation is no longer in the code. Delete it.

The report prints starter rows for every undocumented deviation.

## The drift score

The last section and the JSON's `drift` field look like this:

```
drift 22 — colour 6 · size 6 · token 2 · component 4 · primitive 4 — 19 undocumented, 1 stale
```

`drift.badge` is the short form for the dock: `drift 22 · 19 undocumented · 1 stale`. You're ready
to promote when nothing is undocumented and nothing is stale. A drift above zero is fine if every
remaining deviation has a reason.

## Promoting a sketch

1. **Sketch in the Playground.** Use real components and tokens where you can. Raw values are fine
   while exploring.
2. **Run the report** on the winning variant's folder.
3. **Swap tokens.** Do every `same` swap. Check each `close` one in light and dark, then swap it or
   move it to step 6. Fix every undefined token.
4. **Extend components.** For each `extend X with …`, try X's existing props first. If X really
   needs the prop, add it in packages/ui, update X's `*.meta.shared.ts`, and delete the local copy.
   Replace each `reuse X as-is` with X.
5. **Create new components** with a meta file. For each `new component` that stays, move it to
   `packages/ui` and add `<name>.meta.shared.ts` with `useWhen`, `dontUseWhen`, `replaces` and
   `examples`. Add a Playground component gallery entry. Replace raw `<button>`, Radix imports and
   local copies with the ui components.
6. **Fill in the why lines in DEVIATIONS.md.** Run the report again. Every remaining deviation
   needs a reason, and no row can be stale.
7. **Move the code to the product folder.** Delete the Playground area in the same PR when it's
   an exploration area.
8. **Run lint at error level.** `pnpm exec eslint -c eslint.design.config.js <product folder>` must
   pass with no errors. If a rule still flags a documented deviation, disable it on that line and
   cite the DEVIATIONS.md row:
   `// eslint-disable-next-line design-system/no-raw-color -- DEVIATIONS.md: #7A5CFA`.
   Nothing else gets a disable comment.
9. **Designer review.** Fab reviews the moved screen against the sketch and signs off the ledger.

## Limits

- The code is analysed syntax-only. Props spread from other files, values computed at runtime and
  CSS inside template literals aren't seen.
- Colour detection follows `no-raw-color`, so it skips mask properties and plain strings outside
  style props. Shadows are included, with a hint to use `boxShadow="elevation"`.
- Positional offsets (`top`, `left`, `inset`), `borderWidth` and `calc()` aren't checked as sizes.
- Component matching knows only the components exported from `packages/ui/src/exports.web.ts`.
  `Button`, `IconButton`, `InlineIcon` and `Callout` have meta files, so meta evidence is thin. Compound components such as
  `Tooltip`, `Select` and `DropdownMenu` match on name only.
- Restyles are found only as props on ui components. A hand-built row whose second line is
  lighter than the product's (a `styled.span` instead of the product composition) isn't seen:
  that is what the recipes and the today-fidelity diff are for. Some restyles are routine
  (`variant="small"` on a chevron); give them a one-line why.
- Playground-only furniture (boards, section headers) shows up as `new`. Document it as
  "playground only" in DEVIATIONS.md, or leave it out of the promoted code.
