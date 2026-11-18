// The playground is a persistent, dev-facing design surface: one canvas per
// app, organized into areas (one per design topic or issue), each holding
// switchable variants. It exists so design iterations render with the real
// design system and real components, and can be shared for feedback via PR
// preview and staging links before any production code changes.
//
// Same gating rationale as multisig.constants.ts: CLOUDFLARE_ENV is the one
// reliable discriminator between the production deploy and everything else,
// so the playground is visible on local dev, PR previews, and staging, and
// 404s on app.leather.io.
import { playgroundAreas } from './playground-areas';

export const playgroundEnabled = import.meta.env.CLOUDFLARE_ENV !== 'production';

export const playgroundPaths = {
  index: '/playground',
  area(slug: string) {
    return `/playground/${slug}`;
  },
};

// Playground routes render on a bare canvas by default — no nav sidebar, no
// page padding, no footer — so an area can be anything up to a full app
// surface. Areas opt back into the website container via appShell in the
// registry. Consumed by the root layout.
export function isBareCanvasPath(pathname: string) {
  if (pathname !== '/playground' && !pathname.startsWith('/playground/')) return false;
  const slug = pathname.split('/')[2] ?? '';
  const area = playgroundAreas.find(candidate => candidate.slug === slug);
  return !(area?.appShell ?? false);
}
