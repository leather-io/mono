# E2E testing

Leather mobile wallet utilizes [detox](https://github.com/wix/Detox) to E2E test the app.

Currently it is only iOS specific.

Now, to run it:

1. `pnpm i` at the monorepo root
2. `pnpm ts:build` to build the packages
3. `cd apps/mobile` and `pnpm ios:build` to download and build cocoapods
4. Then run `pnpm e2e:build:ios-release`. That will build the release testing app that detox would use for automation testing.
5. Run `pnpm e2e:test:ios-release`, kickback and enjoy!

All of the tests are stored in the `apps/mobile/e2e` directory. You can either edit the `*.test.ts` files or create one with your e2e test.
