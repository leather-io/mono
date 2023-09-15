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

`namedInputs` can be defined to share settings between steps

We can use a `^` to specify for all dependant projects `"^noMarkdown"`

# Nx cache exclusions 

We want to exclude some items from the cace that aren't depended on. Nx has a nice graph feature which gives a visual UI of what depends on what

# Nx graph

Behind the scenes Nx creates a graph of how all the packages link together which can be viewed running `npx nx graph` which shows an interactive version of our project graph

In a larger monorepo this is useful to show all the paths between packages and their links