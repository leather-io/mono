# Playground

A persistent, dev-facing design surface: one canvas, organized into **areas**, each
holding switchable **variants**. Design iterations render with the real design system,
real components, and mock data — so a direction can be explored, compared, and shared
for feedback before any production code changes.

Visible on local dev, PR previews (`pr-<N>` alias), and staging. 404s on the
production deploy (`playgroundEnabled` gates the layout loader, same pattern as
multisig).

## Anatomy

| Level      | What                                      | Maps to (Figma) |
| ---------- | ----------------------------------------- | --------------- |
| Playground | `/playground` — this directory            | The file        |
| Area       | `/playground/<slug>` — one topic or issue | A page          |
| Variant    | `?v=<id>` within an area — one iteration  | A frame/variant |

The active variant lives in the URL, so a share link points at exactly one iteration.

## Chrome

The playground adds no visible structure of its own — an area may render anything up
to a full app surface, so the canvas must dominate. The only chrome is a floating
dock (bottom-center pill) that expands into area navigation. Keep it that way: new
playground-level controls belong in the dock, not in page furniture around areas.

## Adding an area

Each area contributes exactly three things (keeps parallel area PRs conflict-free):

1. A folder: `areas/<slug>/` with `<slug>.route.tsx` (plus boards/components as needed)
2. One `route()` line in `playground.routes.ts`
3. One entry in `playground-areas.ts`

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
