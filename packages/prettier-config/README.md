# Set up pnpm workspaces

We will setup a package centric monorepo with pnpm workspaces

- Create a new project 'mono' and add it to GIT
- enter it and initialise a pnpm project with `pnpm init`
- delete the `main` entry point as it's not needed
- next add a .gitignore with the standard ignores 


- create a new packages folder `mkdir packages`
- add a new `pnpm-workspace.yaml` file to indicate workspaces will be used
- configure it as follows: 
```
packages:
  - 'packages/*'
```

# Set up a shared prettier config with pnpm workspaces

- create a new folder in `packages/` for the `prettier` package
- `cd` there and run `pnpm init` to set it up
- from the monorepo root then run the following
    - Install prettier to prettier package `pnpm add --filter prettier prettier`
    - Install a prettier package we will use `pnpm add --filter prettier @trivago/prettier-plugin-sort-imports`