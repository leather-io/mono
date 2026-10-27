# Web app UI: platform notes

Read with the root `CLAUDE.md` and the `leather-ui` skill. These notes cover only what differs
on the web app.

- **Layout.** Content sits in a 1200px max-width column (`app/root.tsx`). From `md` (768px) up,
  it's offset by the 164px `navbar`, with `space.07` side padding. Below `md`, the padding is
  `space.04`. The breakpoints are `sm` 398, `md` 768, `lg` 1024 and `xl` 1280.
- **Check widths.** Check 390, 768 and 1280 for any page change.
- **Playground.** Explore and review UI at `/playground` (`app/pages/playground/README.md`).
  - An area is a folder under `areas/` plus one entry in `playground-areas.ts`.
  - Feature explorations use the exploration template in `shared/exploration/`, and follow
    `docs/design/explore.md`.
  - Screens are composed from `shared/recipes/` (`docs/design/recipes.md`).
  - **Native-only imports break web.** Some `@leather.io/ui` exports exist only in the native
    entry (`@leather.io/ui/native`), for example icons with only a `*.native.tsx` file in
    `packages/ui/src/icons/` (`UsersTwoIcon`). Importing one from `@leather.io/ui` on web is a
    module error: the area doesn't load at all, and on a deep link the page was blank. The
    Playground's load guard now names the failing file, but run
    `pnpm --filter @leather.io/web typecheck` before you look, and pick icons from
    `packages/ui/src/icons/index.web.ts`.
- **Sketch mode.** The release example and recipes enforce design lint. Other features opt in with
  `pnpm design:check <path>`; document each intentional deviation in `DEVIATIONS.md` (`docs/design/promote.md`).
- **Production.** The Playground 404s on the production deploy. Nothing in `areas/` ships.
  Promote what you want to keep into product code instead.
