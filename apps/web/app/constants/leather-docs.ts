/**
 * Leather Docs, the GitBook site that replaces the in-app help center (/support) and the
 * /developers page. It has two sections: Guides (help center, explainers, blog) and Developers.
 *
 * TODO(docs.leather.io): the GitBook site is not published yet and docs.leather.io does not
 * resolve. Werner plans to publish it on docs.leather.io; confirm the hostname, and that the
 * Guides section (the site's default section) is served at the root and Developers under
 * /developers, before this ships. Every Leather Docs URL in the app derives from this constant.
 */
export const LEATHER_DOCS = {
  guides: 'https://docs.leather.io',
  developers: 'https://docs.leather.io/developers',
} as const;
