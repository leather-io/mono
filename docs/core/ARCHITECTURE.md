# Leather monorepo setup

We reviewed a few monorepo approaches and how they may fit into our codebase and decided upon starting with `npm workspaces` and `nx`

# Motivation

As a largely single-product company, with a vision for being a multi-product company, we need a way to share code between our various projects. We also need to ensure high code standards and have the best developer experience we can

## Requirements

- Well organised monorepo
- Automated package releases
  - Publishing to npm
    - [with NX](https://nx.dev/concepts/more-concepts/buildable-and-publishable-libraries)
- Enable developers to easily create new packages
- Easy to work with in local development
- Easy to set up package-specific CI jobs

## Basic Leather monorepo architecture

This is a basic blueprint of the monorepo. We will begin with a package based monorepo and then decide whether to also host `apps` here too

```md
leather-mono
├─ apps
│ ├─ extension
│ ├─ mobile
│ ├─ desktop
│ ├─ storybook <-- replaces test-app, place to view UI components with context + tests
├─ docs
├─ packages
│ ├─ api <-- leather API / wrapper interface to other libs: here / under apps,
│ ├─ eslint-config
│ ├─ prettier-config
│ ├─ tsconfig-config
│ ├─ lib
│ ├─ utils <-- shared utils,
│ ├─ ui <-- using definePreset(), contains the theme base (tokens.colors, semantic tokens, etc)
│ │ └─ button <-- consuming the preset, provides a button recipe (in a buttonPreset)
│ │ └─ some-component <-- consuming the preset, provides a component using internal `css` calls, ships a panda.json extract result
```

## Items for further consideration

- upgrading from `webpack` to [`esbuild`](https://esbuild.github.io/)

# Useful references

- https://nx.dev/getting-started/intro
- https://medium.com/reactbrasil/reuse-your-eslint-prettier-config-in-a-monorepo-with-lerna-54c1800cacdc
- https://github.com/muravjev/configs/
- https://www.raulmelo.me/en/blog/replacing-lerna-and-yarn-with-pnpm-workspaces
- https://medium.com/@guysenpai89/nx-monorepo-publish-your-libraries-to-github-packages-with-github-actions-semantic-release-fa9822467b24
- https://www.javierbrea.com/blog/pnpm-nx-monorepo-01/
