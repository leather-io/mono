# ADR: Changelog Page Implementation

## Date
2025-07-25

## Status
Proposed

## Overview of the Functionality

This ADR documents the implementation of a changelog page feature that allows users to view application updates and changes at `/changelog`. The feature displays multiple changelog entries stored as markdown files, merged into a single rendered page.

### Files to be Created
- `apps/web/app/routes/changelog.page.tsx` - Route component following React Router v7 patterns
- `apps/web/app/pages/changelog/changelog.tsx` - Main page component using existing Page wrapper
- `apps/web/app/changelogs/` - Directory for storing changelog entries
- `apps/web/app/changelogs/2024-01-15-initial-release.md` - Dummy changelog entry 1
- `apps/web/app/changelogs/2024-02-20-ui-improvements.md` - Dummy changelog entry 2
- `apps/web/app/utils/changelog.ts` - Utility functions for processing changelog entries

### Files to be Updated
- `apps/web/app/routes.ts` - Add new changelog route configuration

## Design Decisions

### Architectural Pattern
- **Route-Page Separation**: Following existing React Router v7 pattern with separate route and page components
- **File-Based Content Management**: Using markdown files for changelog entries instead of database or CMS integration
- **Utility Layer**: Creating dedicated utility functions for changelog processing to maintain separation of concerns

### Naming Conventions
- **Route Files**: `changelog.page.tsx` following existing `[name].page.tsx` pattern
- **Page Components**: `changelog.tsx` in dedicated directory following existing structure
- **Changelog Files**: `yyyy-mm-dd-changelog-slug.md` format for chronological ordering and SEO-friendly URLs
- **Utility Functions**: Snake case for file processing, camelCase for component utilities

### Folder Structure
- Changelog entries stored in `apps/web/app/changelogs/` to keep content alongside application code
- Following existing patterns where content lives within the app directory structure

### Metadata Structure
Each changelog entry will include frontmatter with:
- `title`: Display title for the entry
- `date`: Publication date in YYYY-MM-DD format
- `slug`: URL-friendly identifier
- `tags`: Array of categorization tags

## Challenges Encountered

### Markdown Processing
- **Challenge**: No existing markdown processor in the current tech stack
- **Uncertainty**: Choice between `marked`, `remark`, or other markdown libraries
- **Consideration**: Need to maintain consistency with existing `sanitizeContent` patterns

### Content Loading Strategy
- **Challenge**: Determining whether to load changelog entries at build time or runtime
- **Consideration**: Static generation vs. dynamic loading trade-offs

### Metadata Extraction
- **Challenge**: Parsing frontmatter from markdown files while maintaining type safety
- **Consideration**: Integration with existing Zod validation patterns

## Solutions Implemented

### Markdown Processing
- **Solution**: Use `marked` library for simplicity and performance
- **Integration**: Combine with existing `sanitizeContent` from `@leather.io/ui` for security
- **Pattern**: Process markdown at component level, following existing content rendering patterns

### Metadata Validation
- **Solution**: Use Zod schemas for changelog entry validation
- **Pattern**: Define `ChangelogEntry` interface with proper TypeScript typing
- **Validation**: Frontmatter validation at parse time to catch errors early

### Content Loading
- **Solution**: Static file reading at build time for performance
- **Implementation**: Utility functions to scan changelog directory and process all entries
- **Sorting**: Chronological ordering by date (newest first) for user experience

### Component Integration
- **Solution**: Use existing `Page` component wrapper for consistent layout
- **Styling**: Follow existing Panda CSS patterns and `@leather.io/ui` components
- **SEO**: Implement `meta()` function following existing route patterns

## Future Considerations

### Scalability
- **Pagination**: Consider implementing pagination if changelog entries grow beyond 20-30 items
- **Categories**: Potential for category-based filtering using the tags metadata
- **Search**: Future implementation of client-side search functionality

### Content Management
- **Automation**: Consider build-time validation of changelog format and metadata
- **RSS Feed**: Potential for RSS/Atom feed generation for changelog updates
- **Archive**: Consider archived/featured changelog entry system

### Performance
- **Lazy Loading**: Implement lazy loading for changelog content if entries become numerous
- **Caching**: Consider build-time caching strategies for changelog processing
- **Images**: Handle image assets in changelog entries if needed in the future

### Integration
- **Version Correlation**: Future integration with package.json version bumps
- **Release Notes**: Potential automation from git tags or release workflows
- **Internationalization**: Consider i18n support for changelog entries if needed

## Technical Debt Considerations
- Monitor bundle size impact of markdown processing library
- Ensure changelog processing doesn't significantly impact build times
- Maintain consistency with existing content sanitization patterns