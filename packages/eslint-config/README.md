# Sample repo for Leather monorepo setup

Here we review a few monorepo approaches and how they may fit into our codebase

# Motivation

As a largely single-product company, with a vision for being a multi-product company, we need a way to share code between our various projects. Consider how, when we begin work on the mobile wallet, much code needs to be refactored out of the Web Extension, into an environment-agnostic home. For use elsewhere, such as a React Native or Electron app.
