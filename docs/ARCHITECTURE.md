# Leather monorepo setup

We reviewed a few monorepo approaches and how they may fit into our codebase

# Motivation

As a largely single-product company, with a vision for being a multi-product company, we need a way to share code between our various projects. Consider how, when we begin work on the mobile wallet, much code needs to be refactored out of the Web Extension, into an environment-agnostic home. For use elsewhere, such as a React Native or Electron app.

## Requirements

- Well organised monorepo
- Automated package releases
  - Publishing to npm
    - [with NX](https://nx.dev/concepts/more-concepts/buildable-and-publishable-libraries)
- Enables developers to easily create new packages
- Easy to work with in local development
- Easy to set up package-specific CI jobs
- monorepo vs. one big npm package?

Ideally we want to:

- not change the existing extension too much
- facilitate sharing of code between platforms - web, native, desktop
- re-use our new panda + radix system as much as possible
- extract shared library code
- allow independant publishing of packages
- solution must work with panda css
- storybook for UI lib demos
- storybook to replace test-app also?

## Basic Leather monorepo architecture

```md
leather-mono
├─ apps
│ ├─ extension
│ ├─ mobile
│ ├─ desktop
│ ├─ storybook <-- replaces test-app, place to view UI components with context + tests
│ ├─ website <-- maybe we can get rid of Framer and just host our site ourself, keeping code here?
├─ docs -> should we host out dev docs here?
├─ packages
│ ├─ api <-- leather API / wrapper interface to other libs: here / under apps,
│ ├─ tsconfig
│ ├─ lib
│ ├─ utils <-- shared utils,
│ ├─ ui <-- using definePreset(), contains the theme base (tokens.colors, semantic tokens, etc)
│ └─ button <-- consuming the preset, provides a button recipe (in a buttonPreset) + a ShadcnButton component
│ └─ some-component <-- consuming the preset, provides a component using internal `css` calls, ships a panda.json extract result
```

## Items for further consideration

- migration from `yarn` to [`pnpm`](https://pnpm.io/)
- upgrading from `webpack` to [`esbuild`](https://esbuild.github.io/)
- Can use Nx + Lerna or just Nx
- for HTML Ordinals, do we want to use SSR so we can show them? Maybe we can have a library/package using Next.js just to render those that gets imported?
- how do we manage our documentation? could we host that here also?

# Useful references

https://medium.com/reactbrasil/reuse-your-eslint-prettier-config-in-a-monorepo-with-lerna-54c1800cacdc

https://github.com/muravjev/configs/
https://github.com/muravjev/monorepo/pull/1/commits/d84f969f97d8caaa448e0ef80dc2f426bd6f9e91

https://www.raulmelo.me/en/blog/replacing-lerna-and-yarn-with-pnpm-workspaces

https://medium.com/@guysenpai89/nx-monorepo-publish-your-libraries-to-github-packages-with-github-actions-semantic-release-fa9822467b24
