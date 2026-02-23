# Help Center Schema Migration + Breadcrumbs — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the legacy 30-field `post` Sanity schema with a purpose-built `helpCenterGuide` + `helpCenterCategory` schema, add breadcrumb navigation to help center pages, and delete dead code.

**Architecture:** New Sanity document types with guide-references-category relationship. New GROQ queries fetch category data alongside guides, enabling breadcrumbs in a single query. Web app route loaders swap to new queries; a new `Breadcrumb` component renders the navigation trail.

**Tech Stack:** Sanity CMS (schema + GROQ), React Router (loaders), Panda CSS (styling), TypeScript

**Design doc:** `docs/plans/2026-02-23-help-center-schema-migration-design.md`

**Worktree:** `/Users/will/src/mono/.worktrees/will/clean-up-posts` (branch: `will/clean-up-posts`)

---

### Task 1: Create `helpCenterCategory` Sanity schema type

**Files:**
- Create: `packages/cms/src/studio/schema-types/help-center/help-center-category-type.ts`
- Create: `packages/cms/src/studio/schema-types/help-center/index.ts`
- Modify: `packages/cms/src/studio/schema-types/index.ts`

**Step 1: Create the category schema type**

Create `packages/cms/src/studio/schema-types/help-center/help-center-category-type.ts`:

```typescript
import { FolderIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

import { slugField } from '../utils/slug-type';

export const helpCenterCategoryType = defineType({
  name: 'helpCenterCategory',
  title: 'Help Center Category',
  type: 'document',
  icon: FolderIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: rule => rule.required(),
    }),
    slugField('name'),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'image',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Controls display order on the help center page',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      order: 'order',
    },
    prepare(selection) {
      const { title, order } = selection;
      return {
        title: title || 'Untitled',
        subtitle: order !== undefined ? `Order: ${order}` : '',
      };
    },
  },
});
```

**Step 2: Create the barrel export**

Create `packages/cms/src/studio/schema-types/help-center/index.ts`:

```typescript
import { helpCenterCategoryType } from './help-center-category-type';

export const helpCenterTypes = [helpCenterCategoryType];
```

Note: We will add `helpCenterGuideType` to this array in Task 2.

**Step 3: Register in main schema index**

Modify `packages/cms/src/studio/schema-types/index.ts` — add import for `helpCenterTypes` and add `...helpCenterTypes` to the `schemaTypes` array.

**Step 4: Verify**

Run: `pnpm --filter @leather.io/cms typecheck`
Expected: PASS

**Step 5: Commit**

```
feat(cms): add helpCenterCategory Sanity schema type
```

---

### Task 2: Create `helpCenterGuide` Sanity schema type

**Files:**
- Create: `packages/cms/src/studio/schema-types/help-center/help-center-guide-type.ts`
- Modify: `packages/cms/src/studio/schema-types/help-center/index.ts`

**Step 1: Create the guide schema type**

Create `packages/cms/src/studio/schema-types/help-center/help-center-guide-type.ts`:

```typescript
import { DocumentTextIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

import { slugField } from '../utils/slug-type';

export const helpCenterGuideType = defineType({
  name: 'helpCenterGuide',
  title: 'Help Center Guide',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: rule => rule.required(),
    }),
    slugField('title'),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'helpCenterCategory' }],
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'markdown',
    }),
    defineField({
      name: 'disclaimer',
      title: 'Disclaimer',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'relatedGuides',
      title: 'Related Guides',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'helpCenterGuide' }] }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      categoryName: 'category.name',
      date: 'publishedAt',
    },
    prepare(selection) {
      const { title, categoryName, date } = selection;
      const dateFormatted = date ? new Date(date).toLocaleDateString() : 'No date';
      return {
        title: title || 'Untitled',
        subtitle: `${categoryName || 'Uncategorized'} • ${dateFormatted}`,
      };
    },
  },
});
```

**Step 2: Add to barrel export**

Modify `packages/cms/src/studio/schema-types/help-center/index.ts` — import `helpCenterGuideType` and add it to the array.

**Step 3: Verify**

Run: `pnpm --filter @leather.io/cms typecheck`
Expected: PASS

**Step 4: Commit**

```
feat(cms): add helpCenterGuide Sanity schema type
```

---

### Task 3: Create new GROQ queries

**Files:**
- Create: `packages/cms/src/client/queries/help-center-queries.ts`
- Modify: `packages/cms/src/client/queries/index.ts`

**Step 1: Create the new queries file**

Create `packages/cms/src/client/queries/help-center-queries.ts`:

```typescript
import { defineQuery } from 'groq';

export const helpCenterCategoriesQuery = defineQuery(`*[
  _type == "helpCenterCategory"
] | order(order asc) {
  _id, name, slug, icon,
  "guideCount": count(*[_type == "helpCenterGuide" && references(^._id)])
}`);

export const helpCenterCategoryBySlugQuery = defineQuery(`*[
  _type == "helpCenterCategory" && slug.current == $slug
][0]{
  _id, name, slug,
  "guides": *[_type == "helpCenterGuide" && category._ref == ^._id] | order(publishedAt desc) {
    _id, title, slug
  }
}`);

export const helpCenterGuideBySlugQuery = defineQuery(`*[
  _type == "helpCenterGuide" && slug.current == $slug
][0]{
  ...,
  category->{ _id, name, slug },
  relatedGuides[]->{ _id, title, slug }
}`);
```

**Step 2: Export from queries barrel**

Modify `packages/cms/src/client/queries/index.ts` — add line:

```typescript
export * from './help-center-queries';
```

**Step 3: Generate types**

Run: `pnpm --filter @leather.io/cms build`

This runs `sanity schema extract` + `sanity typegen generate` + `tsdown`, producing new TypeScript types for the queries in `packages/cms/src/generated/types.ts`.

Expected: Build succeeds. New types like `HelpCenterCategoriesQueryResult`, `HelpCenterCategoryBySlugQueryResult`, `HelpCenterGuideBySlugQueryResult` appear in generated types.

**Step 4: Verify**

Run: `pnpm --filter @leather.io/cms typecheck`
Expected: PASS

**Step 5: Commit**

```
feat(cms): add GROQ queries for new help center schema
```

---

### Task 4: Create Breadcrumb component

**Files:**
- Create: `apps/web/app/components/breadcrumb.tsx`

**Step 1: Create the Breadcrumb component**

Create `apps/web/app/components/breadcrumb.tsx`:

```tsx
import { Link } from 'react-router';

import { Flex, styled } from 'leather-styles/jsx';

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  segments: BreadcrumbSegment[];
}

export function Breadcrumb({ segments }: BreadcrumbProps) {
  return (
    <Flex
      alignItems="center"
      gap="space.02"
      textStyle="label.03"
      color="ink.text-subdued"
      my="space.04"
    >
      {segments.map((segment, i) => (
        <Flex key={segment.label} alignItems="center" gap="space.02">
          {i > 0 && <styled.span aria-hidden>/</styled.span>}
          {segment.href ? (
            <Link to={segment.href}>
              <styled.span _hover={{ textDecoration: 'underline' }}>
                {segment.label}
              </styled.span>
            </Link>
          ) : (
            <styled.span color="ink.text-primary">{segment.label}</styled.span>
          )}
        </Flex>
      ))}
    </Flex>
  );
}
```

**Step 2: Verify**

Run: `pnpm --filter leather.io typecheck` (web app)
Expected: PASS

**Step 3: Commit**

```
feat(web): add Breadcrumb component for help center navigation
```

---

### Task 5: Update help center main page to use new queries

**Files:**
- Modify: `apps/web/app/pages/support/help-center.route.tsx`
- Modify: `apps/web/app/pages/support/help-center.tsx`

**Step 1: Update the loader**

In `apps/web/app/pages/support/help-center.route.tsx`:

- Replace import of `LegacyHelpCenterPageQueryResult, legacyHelpCenterPageQuery` with `HelpCenterCategoriesQueryResult, helpCenterCategoriesQuery`
- Update loader to fetch with `helpCenterCategoriesQuery` (no params needed)
- Update the `LoaderResult` type to use `HelpCenterCategoriesQueryResult`

Note: The query returns an array directly (no `.categories` wrapper), so the loader shape changes from `{ categories }` (from a singleton document) to the array itself.

**Step 2: Update the component**

In `apps/web/app/pages/support/help-center.tsx`:

- Update `useLoaderData` destructuring to match new shape
- Update the `categories.map` to use `category.name` instead of `category.categoryName`
- Update `category.slug.current` to `category.slug.current` (same)

**Step 3: Verify**

Run: `pnpm --filter leather.io typecheck`
Expected: PASS

**Step 4: Commit**

```
refactor(web): update help center main page to new schema queries
```

---

### Task 6: Update category guides page with breadcrumbs

**Files:**
- Modify: `apps/web/app/pages/support/category-guides/category-guides.route.tsx`

**Step 1: Update imports and loader**

- Replace import of `LegacyHelpCenterCategoryBySlugQueryResult, legacyHelpCenterCategoryBySlugQuery` with `HelpCenterCategoryBySlugQueryResult, helpCenterCategoryBySlugQuery`
- Add import of `Breadcrumb` from `~/components/breadcrumb`
- Update loader to use `helpCenterCategoryBySlugQuery`
- Update return type

**Step 2: Add breadcrumb to rendered output**

In the component, add `<Breadcrumb>` after the hero image div and before `<Page.Title>`:

```tsx
<Breadcrumb
  segments={[
    { label: 'Help Center', href: '/support' },
    { label: data.name },
  ]}
/>
```

Update `data.categoryName` references to `data.name`.

**Step 3: Verify**

Run: `pnpm --filter leather.io typecheck`
Expected: PASS

**Step 4: Commit**

```
refactor(web): update category guides page with new queries and breadcrumbs
```

---

### Task 7: Update guide page with breadcrumbs

**Files:**
- Modify: `apps/web/app/pages/support/guide/guide.route.tsx`

**Step 1: Update imports and loader**

- Replace import of `LegacyGuideBySlugQueryResult, legacyGuideBySlugQuery` with `HelpCenterGuideBySlugQueryResult, helpCenterGuideBySlugQuery`
- Add import of `Breadcrumb` from `~/components/breadcrumb`
- Update loader to use `helpCenterGuideBySlugQuery`

**Step 2: Add breadcrumb and update field names**

Add `<Breadcrumb>` inside the main content area, before the category badge. The guide now has `guide.category` as an object with `{ name, slug }`:

```tsx
<Breadcrumb
  segments={[
    { label: 'Help Center', href: '/support' },
    { label: guide.category.name, href: `/support/${guide.category.slug.current}` },
    { label: guide.title },
  ]}
/>
```

Update the category badge to use `guide.category.name` instead of `guide.category` (which was a string, now an object).

Update `guide.createdTime` to `guide.publishedAt`.

Update `guide.relatedPosts` to `guide.relatedGuides`.

**Step 3: Verify**

Run: `pnpm --filter leather.io typecheck`
Expected: PASS

**Step 4: Commit**

```
refactor(web): update guide page with new queries and breadcrumbs
```

---

### Task 8: Delete dead code

**Files:**
- Delete: `apps/web/app/data/posts.json`
- Modify: `apps/web/app/content/messages.ts`

**Step 1: Delete posts.json**

Delete the file `apps/web/app/data/posts.json` (10,245 lines, never imported in app code).

**Step 2: Remove dead error message**

In `apps/web/app/content/messages.ts`, remove the line:

```typescript
  failedToFetchPosts: 'Failed to fetch posts.json',
```

**Step 3: Verify**

Run: `pnpm --filter leather.io typecheck`
Expected: PASS

Grep to confirm no remaining references:
```bash
grep -r "posts\.json" apps/web/app/ --include="*.ts" --include="*.tsx"
grep -r "failedToFetchPosts" apps/web/app/ --include="*.ts" --include="*.tsx"
```

Expected: No matches in app code (test mock files in `apps/web/tests/` may still reference the S3 URL, which is fine — those mock a remote endpoint, not the local file).

**Step 4: Commit**

```
chore(web): remove unused posts.json and dead error message
```

---

### Task 9: Full verification

**Step 1: Run full verification suite from worktree root**

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm build
```

All four must pass.

**Step 2: Fix any issues found**

If any step fails, fix the issue and re-run.

**Step 3: Final commit (if formatting/lint changed anything)**

```
chore: format and lint fixes
```
