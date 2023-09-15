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

An example of this working to help devs:
- checkout a new branch
- make some changes
- run `npx nx affected:graph` will show you what projects are affected by your change

# Affected build

The `affected` command can also be used when building to help speed things up, for example only building packages affected by your change and serving others from the cache

`npx nx affected:build`

# Parallel

Builds can be run in parallel using: `npx nx run-many --target=build --all`

# Plugins

An advantage of Nx is that it comes with various plugins which can be used to scaffold out apps and libraries

They can be installed using:
`pnpm add -Dw @nx/react`

The `w` is passed to specify at the root

Available generator options can then be viewed using `npx nx list @nx/react`

(Tutorial)[https://www.youtube.com/watch?v=OQ-Zc5tcxJE]

Plugins can be initialised with `npx nx g @nx/react:init`

# VSCODE Plugin

Better yet Nx comes with a Vscode plugin you can use to help generate various things
(Nx Console)[https://nx.dev/core-features/integrate-with-editors#nx-console-for-vscode]

