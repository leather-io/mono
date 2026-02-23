# Help Center Schema Migration + Breadcrumbs

## Problem

The help center uses a legacy `post` Sanity document type with 30+ fields, of which only 8 are rendered. The data model is one-directional (categories reference guides, not vice versa), making breadcrumb navigation impossible without reverse-lookup queries. The schema carries blog-oriented baggage (featured, hidden, prompt, earnProviders, etc.) that has nothing to do with help center guides.

## Decision

Create new purpose-built Sanity document types (`helpCenterGuide`, `helpCenterCategory`) with a guide-references-category relationship. This enables breadcrumbs from a single GROQ query and eliminates 22 unused fields.

## New Sanity Schema Types

### `helpCenterCategory`

| Field | Type | Notes |
|-------|------|-------|
| `name` | string (required) | Category display name |
| `slug` | slug (from `name`, required) | URL segment |
| `icon` | image (required) | Category icon |
| `order` | number | Controls display order on main page |

### `helpCenterGuide`

| Field | Type | Notes |
|-------|------|-------|
| `title` | string (required) | Guide title |
| `slug` | slug (from `title`, required) | URL segment |
| `category` | reference to `helpCenterCategory` (required) | Parent category, enables breadcrumbs |
| `body` | markdown | Main content |
| `disclaimer` | text | Optional legal/disclaimer text |
| `publishedAt` | datetime (required) | Publication date |
| `relatedGuides` | array of references to `helpCenterGuide` | Cross-links |

The singleton `legacyHelpCenterPage` document is no longer needed. The main page queries all categories directly.

## New GROQ Queries

### All categories (main help center page)

Replaces `legacyHelpCenterPageQuery`.

```groq
*[_type == "helpCenterCategory"] | order(order asc) {
  _id, name, slug, icon,
  "guideCount": count(*[_type == "helpCenterGuide" && references(^._id)])
}
```

### Category with guides (category page)

Replaces `legacyHelpCenterCategoryBySlugQuery`.

```groq
*[_type == "helpCenterCategory" && slug.current == $slug][0]{
  _id, name, slug,
  "guides": *[_type == "helpCenterGuide" && category._ref == ^._id] | order(publishedAt desc) {
    _id, title, slug
  }
}
```

### Single guide with breadcrumb data (guide page)

Replaces `legacyGuideBySlugQuery`.

```groq
*[_type == "helpCenterGuide" && slug.current == $slug][0]{
  ...,
  category->{ _id, name, slug },
  relatedGuides[]->{ _id, title, slug }
}
```

## Breadcrumb Component

New component at `apps/web/app/components/breadcrumb.tsx`.

Renders a trail like:

```
Help Center  >  Category Name  >  Guide Title
     |               |
  /support    /support/{slug}
```

Used on:
- Category page: `Help Center > {category.name}`
- Guide page: `Help Center > {category.name} > {guide.title}`

Styled with existing Panda CSS tokens.

## Web App Route Updates

Routes stay the same:
- `/support` - main help center
- `/support/:slug` - category page
- `/support/guide/:slug` - individual guide

Loaders switch from legacy queries to new queries. The guide loader now returns category data alongside the guide, enabling breadcrumbs without extra fetches.

## Cleanup

### Delete

- `apps/web/app/data/posts.json` (10K lines, never imported in app code)
- `failedToFetchPosts` message from `apps/web/app/content/messages.ts` (dead reference)

### Keep

- `apps/web/app/utils/post-link.ts` - actively used in 4 components (`page.tsx`, `sbtc-rewards-faq.tsx`, `stacking-faq.tsx`, `basic-page-hover-icon.tsx`) for backwards-compatible `leather.io/posts/{slug}` URLs
- Legacy Sanity schema types (`post-type.ts`, `legacy-help-center-category-type.ts`) - removed in a future PR after Sanity data migration

## Field Migration Reference

Fields from legacy `post` type and their fate:

| Field | Used in rendering | New schema |
|-------|-------------------|------------|
| `title` | Yes | `helpCenterGuide.title` |
| `slug` | Yes | `helpCenterGuide.slug` |
| `category` (string enum) | Yes (badge display) | `helpCenterGuide.category` (reference) |
| `body` | Yes | `helpCenterGuide.body` |
| `disclaimer` | Yes | `helpCenterGuide.disclaimer` |
| `createdTime` | Yes | `helpCenterGuide.publishedAt` |
| `relatedPosts` | Yes | `helpCenterGuide.relatedGuides` |
| `publishedAt` | No | Repurposed as `publishedAt` |
| `status` | No | Dropped |
| `subcategory` | No | Dropped |
| `summary` | No | Dropped |
| `sentence` | No | Dropped |
| `question` | No | Dropped |
| `prompt` | No | Dropped |
| `featured` | No | Dropped |
| `hidden` | No | Dropped |
| `images` | No | Dropped |
| `icons` | No | Dropped |
| `website` | No | Dropped |
| `order` | No | Dropped |
| `platform` | No | Dropped |
| `aliases` | No | Dropped |
| `dataPoint*` | No | Dropped |
| `views` | No | Dropped |
| `earnProviders` | No | Dropped |
| `log` | No | Dropped |
