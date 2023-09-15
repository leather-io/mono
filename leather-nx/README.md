# demo PNPM + Nx monorepo

This builds on `leather-pnpm` but now adds Nx to help improve the setup. 

# Install Nx
Install Nx with: `pnpm add nx -D -w`

Pass `-D` for dev dependancy
Pass `-w` to install at root of workspace

# Running with Nx

Nx is now setup and we can use those commands to run our monorepo apps
- `npx nx build ui`
- `npx nx start extension`

# Nx with caching

A main benefit of Nx is build caching. It's setup by adding `tasksRunnerOptions` in the `nx.json`

It's possible to add `"targetDefaults"` to the configuration to exclude some files. For example we don't want `README.md` updates to invalidate the cache