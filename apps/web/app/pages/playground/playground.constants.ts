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
export const playgroundEnabled = import.meta.env.CLOUDFLARE_ENV !== 'production';

export const playgroundPaths = {
  index: '/playground',
  area(slug: string) {
    return `/playground/${slug}`;
  },
};
