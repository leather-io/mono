# demo NX monorepo

Using (this tutorial)[https://www.youtube.com/watch?v=ngdoUQBvAjo]

Choosing the `app-centric` path for demo but we could choose a more `package-centric` approach that other OS libraries use

# Apps - Extension 

Tutorial uses remix so I just spun up a create-react-app instead with 
`pnpm create react-app extension --template typescript`


I gave the react app the name `extension` so it can then be started from mono-repo root with `pnpm --filter extension start`

# Packages - UI

I initialised the UI package by creating a new folder `packages/ui` then initialising with `pnpm init`

Next I  set it up with TS as a dev dependancy by running this command at the root of the monorepo
`pnpm add --filter ui typescript -D`

