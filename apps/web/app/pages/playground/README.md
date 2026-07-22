# Playground

A persistent, dev-facing design surface: one canvas, organized into **areas**. Design
iterations render with the real design system, real components, and mock data — so a
direction can be explored, compared, and shared for feedback before any production
code changes.

Visible on local dev, PR previews (`pr-<N>` alias), and staging. 404s on the
production deploy (`playgroundEnabled` gates the layout loader, same pattern as
multisig).

## Anatomy

| Level      | What                                      | Maps to (Figma) |
| ---------- | ----------------------------------------- | --------------- |
| Playground | `/playground` — this directory            | The file        |
| Area       | `/playground/<slug>` — one topic or issue | A page          |

Conventions for iterations/variants inside an area are deliberately undecided —
areas experiment; a shared convention gets extracted once one earns it.

## Chrome

Areas render on a **bare canvas** by default: no nav sidebar, no page padding, no
footer (the root layout skips the website container via `isBareCanvasPath`). An area
that wants to sit inside the real website container opts in with `appShell: true` in
the registry. The playground's own chrome is a single floating dock (bottom-center
pill) that expands into area navigation — new playground-level controls belong in the
dock, not in page furniture around areas.

## Adding an area

Each area contributes exactly two things (keeps parallel area PRs conflict-free):

1. A folder: `areas/<slug>/` with `<slug>.route.tsx` (plus boards/components as needed)
2. One entry in `playground-areas.ts`

Routes are derived from the registry (`areas/<slug>/<slug>.route.tsx` is the required
module path) — the playground's own code never changes when areas come and go.

Area PRs are branched off — and based against — the playground branch while it is in
flight, and against `dev` afterwards.

## Lifecycle & pruning

- **exploration** — tied to an initiative or issue (set `issue` in the registry).
  When the winning variant is promoted into real app code, the area is deleted —
  ideally in the same PR that promotes it. The playground is means, not artifact.
- **living** — permanent reference surfaces (component galleries, token sheets).
  Curated, kept intentionally small.

If an exploration area has been dormant for a while, delete it; the git history and
its PR remain as the record.
