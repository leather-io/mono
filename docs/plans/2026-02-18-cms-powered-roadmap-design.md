# CMS-Powered Roadmap Page

## Overview

Move the roadmap page from hardcoded data to Sanity CMS, following the same patterns as the changelog.

## Sanity Schema

### `roadmapYear` (document)

| Field | Type | Notes |
|---|---|---|
| `year` | `number` | Required, used for ordering and display |
| `objectives` | `array` of `string` | Yearly goals shown in the objectives section |
| `projects` | `array` of `roadmapProject` | Inline project objects |

### `roadmapProject` (object, inline)

| Field | Type | Notes |
|---|---|---|
| `title` | `string` | Required |
| `description` | `text` | Required, plain text |
| `status` | `string` | Required, select: complete, in-progress, planning, planned, cancelled |
| `startDate` | `date` | Optional |
| `endDate` | `date` | Optional |

## GROQ Query

```groq
*[_type == "roadmapYear"] | order(year desc) { year, objectives, projects }
```

## Web App Changes

- Route loader fetches via `cmsClient.fetch(roadmapYearsQuery)`
- Page component receives CMS data as props
- Status/filter/timeline logic unchanged, operates on CMS data

## Files

1. `packages/cms/src/studio/schema-types/roadmap-year-type.ts` - new schema
2. `packages/cms/src/studio/schema-types/index.ts` - register schema
3. `packages/cms/src/studio/structure/structure.ts` - studio nav entry
4. `packages/cms/src/client/queries/roadmap-queries.ts` - GROQ query
5. `packages/cms/src/client/queries/index.ts` - export query
6. `apps/web/app/pages/roadmap/roadmap.route.tsx` - add loader
7. `apps/web/app/pages/roadmap/roadmap.page.tsx` - accept props, remove hardcoded data
