# Extension Development

The extension will heavily rely on monorepo packages. Soon, we will need to apply changes to these packages as part of the work on the extension repository, thus necessitating a way to test changes made to the monorepo within the extension.

### Hard Linking

#### Initialization

One method to achieve this is through hard linking. Here is a step-by-step guide to help you set it up correctly:

1. Clone the repositories:

   ```
   $ git clone https://github.com/leather-io/mono
   $ git clone https://github.com/leather-io/extension
   ```

   For simplicity, do this in the same folder so that `mono` and `extension` are sibling directories.

2. In the extension's `package.json`, update the version of a dependency from the semver version (e.g., `1.0.0`) to a `file:` protocol like this:

   ```json
   "dependencies": {
       ...
       "@leather.io/query": "file:../mono/packages/query"
       ...
   }
   ```

   This change will copy all files from `../mono/packages/query` into the extension's `node_modules` and automatically run `pnpm i`.

3. When `pnpm i` runs, it will attempt to find the package's dependencies that are set with the `workspace:` protocol. This will fail because the `extension` repository is not part of the monorepo. To fix this, override all of the dependency versions at the end of the extension's `package.json` like this:

   ```json
   ...
   "pnpm": {
     "overrides": {
       "@leather.io/bitcoin": "file:../mono/packages/bitcoin",
       "@leather.io/constants": "file:../mono/packages/constants",
       "@leather.io/models": "file:../mono/packages/models",
       "@leather.io/utils": "file:../mono/packages/utils",
       "@leather.io/types": "file:../mono/packages/types"
     }
   }
   ```

4. Now that the setup is complete, let's install the packages:
   - In the monorepo:
     1. Run `pnpm i`.
     2. Run `pnpm build` to build all of the packages.
     3. Run `pnpm dev` to watch for changes in the repository.
   - In the extension, just run `pnpm i`, and it should install everything else.

That's it; the setup should now be fully functional.

#### Development Workflow

Now, when we update a package in the `mono` repo, it doesn't automatically move the changes to the `extension`'s `node_modules`. To do this, run the following command in the extension each time you update a package in the monorepo:

```
pnpm i
```

**BEWARE:** Always check if the `pnpm dev` watcher in the `mono` repo throws errors before running `pnpm i` in the extension. Currently, the watcher does not compile TypeScript files when there are errors, so all issues with TypeScript must be resolved before running `pnpm i` in the extension.
