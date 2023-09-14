# Sample repo for Leather monorepo setup

Here we review a few monorepo approaches and how they may fit into our codebase

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


## Further consideration

- migration from `yarn` to `pnpm`
 
