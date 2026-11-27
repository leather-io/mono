# Mobile end-to-end flows

Maestro flows ported from the extension's Playwright suite (`apps/extension/tests/specs`). They run against a development build whose network is mocked inside the app by MSW (`apps/mobile/e2e`), so no flow touches mainnet and no flow needs a secret key. The one exception to the mocking is `accounts/settings/support-page.yaml`, which loads the live support site in the in-app browser, needs network access and asserts only the address bar host. They run on iOS simulators and Android emulators.

## Layout

- `shared/` holds subflows: `start.yaml` (wipe the app, apply mock scenarios, create a wallet in code with one deep link, land on Home), `start-ui.yaml` (the same, but creates the wallet by tapping through onboarding), `open-app.yaml`, `set-scenario.yaml`, `create-wallet.yaml`, `assert-broadcasts.yaml` (check how many transactions the mocks accepted, see `apps/mobile/e2e/README.md`).
- One folder per area: `home/`, `send/`, `accounts/`, `rpc-bitcoin/`, `rpc-stacks/`. Inside, one folder per extension spec file, one flow per extension test.
- `security/` holds the device-security flows (Face ID). They are iOS only and run through their own wrapper, described below.
- Each area has a `COVERAGE.md` that lists every extension test it covers: the flow that ports it, or why it is skipped or blocked.

## Run

Start Metro with mocks on, from `apps/mobile`:

```bash
EXPO_PUBLIC_E2E_MOCKS=true npx expo start --dev-client --port 8081
```

Then, with a simulator booted and the debug app installed:

```bash
maestro --udid <udid> test \
  -e DEV_CLIENT_URL='exp+leather-wallet-mobile://?__expo_url=http%3A%2F%2Flocalhost%3A8081&__expo_disable_fab=1&__expo_disable_onboarding=1' \
  -e TEST_APP_URL='http://localhost:3100' \
  maestro/e2e/home
```

The `rpc-*` flows also need the test dApp: `VITE_TEST_APP_MOBILE_E2E=true npx vite --port 3100 --strictPort` from `apps/test-app`.

Several simulators can run at once, one `maestro` process each.

## Run the whole suite

`run-e2e.sh` runs every flow except `shared/` subflows, the `security/` area, and flows tagged `blocked` or `blocked-<platform>`, with Metro and the test dApp already running:

```bash
maestro/e2e/run-e2e.sh --device <udid or emulator-5554> --output /tmp/e2e
```

- Each flow runs in its own `maestro test`. A failed flow runs once more: passing on the retry counts as flaky, failing twice counts as failed and makes the script exit 1.
- `--shard 2/6` runs one part of the sorted flow list, `--area send` runs one area, `--tag ios-ci` runs only the flows with that tag (repeat or comma-separate for several; a flow with any of them is selected), and `--include-blocked` runs only the blocked flows. They combine, and `--list` prints what they select.
- It picks the iOS or Android dev-client link from `--platform`, or from the device id: `emulator-*` and any serial `adb devices` lists are Android, anything else is iOS.
- An unknown `--area` is an error, and so is a selection with no flow in it. One shard of a non-empty selection may be empty.
- The output folder gets `summary.json`, one JUnit file per flow, and logs and screenshots for flows that failed at least once.
- `--help` lists every option. CI runs every flow on Android emulators in `.github/workflows/mobile:integration-tests.yml` and the `ios-ci` subset on iOS simulators in `mobile:integration-tests-ios.yml` (see below). Each workflow fails when the shards together ran fewer flows than `run-e2e.sh --list` selects for that platform (with `--tag ios-ci` on iOS), when Metro logged `UNKNOWN SCENARIO`, when Metro logged an `UNHANDLED` request that no regular expression in `unhandled-allowlist.txt` matches, or when the Metro log lacks the mock server's `mocks started` line (the app's console output did not reach the log). The job summary lists flaky flows first.
- On Android, first run `adb reverse tcp:8081 tcp:8081` and `adb reverse tcp:3100 tcp:3100`.
- Expect about one flow in ten to need its retry when several devices run at once.
- Android only: set `E2E_DEVICE_RECOVER_CMD` to a command that restarts the emulator, installs the app and sets the reverses, and the runner checks before each flow attempt that the device is still connected and booted. When it is not, it saves evidence (emulator log tail, memory, largest processes, `dmesg` where `sudo` works) to `recovery-<n>/` in the output folder, runs the command and goes on, so a flow whose attempt lost the device gets its retry on the new one. At most `E2E_DEVICE_RECOVER_MAX` (default 2) recoveries per run; after that the flows fail. `summary.json` counts them in `deviceRecoveries`. The Android workflow passes the `recover-emulator.sh` it writes in its `start-emulator` step, because GitHub's Linux emulators sometimes vanish mid-flow, and its summary lists the shards that recovered.

## iOS CI subset

GitHub's macOS runners are about three times slower than a developer Mac and only five run at once, so the iOS workflow runs only the flows tagged `ios-ci`, five shards of five or six flows. Android CI runs every flow and covers the shared logic. Run the whole iOS suite on a Mac when a change touches iOS: `run-e2e.sh --device <udid>`.

The subset covers what behaves differently on iOS:

- Keychain and relaunch: creating, restoring and signing in to wallets, sign out, lock and unlock, names surviving a relaunch.
- Clipboard and secret key: viewing and copying the secret key.
- Keyboard and sheets: renaming wallets and accounts, the send form preview.
- Native signing and broadcast: BTC with mixed UTXOs, send max, SIP-10, a swap.
- The in-app browser bridge: Bitcoin getAddresses, signPsbt, sendTransfer and message signing; Stacks message signing (approved and rejected), an STX transfer and a SIP-30 transaction.
- Navigation: Home tabs, STX token details, one Activity flow.

To add a flow to the subset, add `ios-ci` to its `tags:`. Keep the subset near 30 flows; the shard count and job timeout in the workflow assume about six flows per shard.

## Device-security flows

`security/run-security.sh --device <udid> --quiet` runs the Face ID flows on an iOS simulator. It is not part of CI: on GitHub's hosted macOS runners these flows are too slow for the Face ID timing to hold, so run it on a local machine. Maestro cannot answer a Face ID prompt, so the wrapper enrols Face ID, watches the simulator log for each scan and answers it.

- `faceid-match` answers every scan with a match. `faceid-nomatch` fails the first scan and matches the rest.
- Each scan is answered `--answer-delay` seconds after it starts (3 by default). On a slow machine pass a larger value so the prompt stays on screen long enough to be seen.
- `faceid-prompts-<n>` makes the flow fail unless exactly `n` scans happened. That is how a flow proves an action asked for Face ID. It works with or without a match mode.
- `blocked` and `blocked-ios` flows are skipped unless `--include-blocked` is given.
- Use `--quiet`: these flows show a secret key during wallet creation, and without it Maestro keeps screen dumps of failed steps. With it, a failed flow keeps only Maestro's console output (the steps and the failure message, no screen content) and the Face ID logs, and the workflow uploads them.

## CI test builds

Both workflows test a debug development build that loads its JavaScript from Metro, so only native inputs change it. The `build` job caches the APK or simulator app under a key from `.github/actions/mobile-test-build-key`: the platform, a build revision, the runner OS and CPU, the target architecture (`x86_64` APK, `arm64` simulator app), on iOS the Xcode version and `fastlane/Gemfile.lock` (CocoaPods), and the `@expo/fingerprint` hash of `apps/mobile` for that platform.

- The fingerprint covers the resolved Expo config (`app.config.ts`, including the app version), the files it points at (icon, splash images, fonts), the name and version of every autolinked native module and config plugin, and the `package.json` scripts. `fingerprint.config.cjs` adds what it cannot see: the root `patches/` folder and the alternate app icons.
- A JavaScript-only change restores the cached build in a minute or two (the fingerprint needs `pnpm install` first). A native change, an app version bump, an Xcode update or a new CocoaPods lock builds again (about 18 minutes on Android, 25 on iOS).
- Caches are scoped by branch: a pull request reads its own and `dev`'s, never another pull request's. Each workflow therefore also runs only its `build` job on a push to `dev` that touches a native input, so pull requests start from a warm `dev` cache. A pull request that changes native inputs builds once (later pushes to it reuse that build), and `dev` builds the same app once more after the merge. GitHub drops a cache unused for 7 days.
- `pnpm --silent native:fingerprint --platform android` in `apps/mobile` prints the fingerprint and its sources locally.
- To force a rebuild, bump `build-revision` in the workflow's `test-build-key` step. Do that whenever the Gradle or `xcodebuild` command or its flags change.

## Rules for a flow

- Start with `shared/start.yaml` and pass `SCENARIO` (empty string for the funded baseline). Scenario names are defined in `apps/mobile/e2e/scenarios`; several can be combined with commas. A misspelt name fails the flow.
- To change scenarios mid-flow, run `shared/set-scenario.yaml` with `SCENARIO`. It fails unless the app reports exactly that list as active.
- Use `shared/start-ui.yaml` instead only when the flow is about getting a wallet (onboarding, restore, adding a wallet) or about device security: it taps through the real create-wallet screens and takes about 10 seconds longer on iOS and 30 on Android.
- Only Account 1 of the first wallet has the baseline balances. Other accounts and wallets get their own (see `apps/mobile/e2e/README.md`), so do not assert the baseline numbers on them.
- A flow must not depend on another flow having run first.
- Wait with `extendedWaitUntil`. No fixed sleeps.
- Keep checks that are usually false out of the normal path. A `when: visible`, `when: notVisible` or `repeat: while: notVisible` check costs about seven seconds each time it is false. Do the action, wait for the expected element, and put the handling of stray dialogs inside a `retry` block, as `shared/create-wallet.yaml` does.
- Do not assert on toasts that vanish after a few seconds. Assert the state they announce. To prove a transaction went out, run `shared/assert-broadcasts.yaml`.
- After typing into a field, check the field holds the text before moving on; under load some keystrokes are lost. `accounts/shared/rename-account.yaml` shows the pattern.
- Select by `id:` first. Add a `testID` to the component when one is missing: add the constant to `apps/mobile/src/shared/test-id.ts` and use it in the component. Fall back to visible text, then to `point:` only for rows that have neither.
- Text selectors are full-match regular expressions: `'.*Bitcoin.*'`, not `'Bitcoin'`.
- End with an assertion.
- Give the flow a `name:` of the form `<area> - <extension test title>` and `tags:` with the area name.
- A flow that fails because of an app bug stays in the suite with the tag `blocked`, and its `COVERAGE.md` row says what the flow expects and gives an internal tracking id (for example send-4). Bug details are tracked outside this repository. Use `blocked-android` or `blocked-ios` when the bug exists on one platform only.
- The `rpc-*` flows can open the test dApp with `FILTER` set to card ids, so the wanted cards are on screen without scrolling.

## Things that will trip you up

- **Android shows a clipboard overlay after any copy.** It covers the bottom-left of the screen for a few seconds, and a tap there opens Nearby Share. `accounts/shared/copy-secret-key.yaml` dismisses it first.
- **Android labels differ.** A row's accessibility label leaves out the text of buttons nested in it, so some assertions have an Android block.
- **A starved emulator crashes.** Start the Android emulator from a normal terminal. Started from a low-priority shell under load, Android's system process can die and every flow then fails within seconds.
- **Memory runs out before CPU.** Each booted simulator holds a few gigabytes; shut down the ones not in use.
- **Any edit under `apps/mobile/e2e` reloads the app on every connected device**, which fails whatever flow is running there.

## When a request is not mocked

Metro prints `[e2e <device name>] UNHANDLED <method> <url>` and the app receives a 404, and CI fails. Add a handler: to the baseline in `apps/mobile/e2e/handlers` if every test needs it, or to a scenario if only some do. Add a regular expression to `unhandled-allowlist.txt` only for a request that cannot be mocked: one extended regular expression per line, matched against `UNHANDLED <method> <url>`.
