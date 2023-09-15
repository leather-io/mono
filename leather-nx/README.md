# demo NX monorepo

Using (this tutorial)[https://www.youtube.com/watch?v=ngdoUQBvAjo]

Choosing the `app-centric` path for demo but we could choose a more `package-centric` approach that other OS libraries use

# Apps - Extension 

Tutorial uses remix so I just spun up a create-react-app instead with 
`pnpm create react-app extension --template typescript`


I gave the react app the name `extension` so it can then be started from mono-repo root with `pnpm --filter extension start`

# Packages - UI

I initialised the UI package by creating a new folder `packages/ui` then initialising with `pnpm init`

Next I  set it up as a react project with TS as a dev dependancy by running this command at the root of the monorepo
`pnpm add --filter ui react`
`pnpm add --filter ui typescript -D`

I then added a tsconfig and updated the `package.json` and setup the project to be built with `pnpm --filter ui build`. 

I added the `tsconfig` here for now but this will move up the hierarchy to be shared between packages

# Consuming UI in extension

The next step is to consume the UI package in extensions

`pnpm add ui --filter extension --workspace`

The `--workspace` flag is passed to make sure package exists in workspace, if not `pnpm` will error