# Leather CMS Posts Integration

This directory contains the integration with Leather's CMS system for blog posts and other content.

## Overview

The system fetches posts from the CMS API at https://cms.leather.io/posts and stores them as a static JSON file in the repository. This allows the application to access the content without making API calls at runtime.

## Files

- `content.ts` - The main content file that exports all content including posts and stacking explainer step data
- `posts.json` - The static JSON file containing all posts from the CMS
- `post-types.ts` - TypeScript type definitions for post data

## Posts Sourcing

At build time, posts are downloaded from [https://leather-cms.s3.amazonaws.com/posts.json](https://leather-cms.s3.amazonaws.com/posts.json) using a script. The file is saved as `apps/web/app/data/posts.json`, which is ignored by git and not committed to the repo. This allows synchronous imports for fast local and SSR usage.

To fetch the latest posts before building, run:

```bash
node scripts/fetch-remote-posts.cjs
```

This is run automatically in the `prebuild` step.

## Stacking Explainer Content

The `content.ts` file now exports two additional arrays for use in stacking explainers:

- `stackingExplainer`: An array of step objects for the pooled stacking explainer.
- `liquidStackingExplainer`: An array of step objects for the liquid stacking explainer.

Each step object has the following structure:

```ts
{
  title: string;         // Step title (e.g. "Get STX")
  postKey: string;       // Key to look up the related post in content.posts
  description: string;   // Description for the step
}
```

These arrays are used to render the stacking explainers in the UI, ensuring all step data is sourced from a single location.