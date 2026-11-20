# Upgrade smoke flows

Three Maestro flows that drive a development build end to end. They exist to catch what static checks cannot: native compile failures, launch crashes and broken navigation after an Expo SDK or React Native upgrade.

- `fresh-install.yaml` clears app state and the keychain, opens the dev client against Metro and creates a wallet without device security.
- `tabs-and-sheets.yaml` runs on the wallet the first flow created. It opens and closes the Send, Receive and Swap sheets, visits Activity and Browser, and walks Settings.
- `restore-wallet.yaml` clears app state and restores a wallet from the secret key passed as `SECRET_KEY`.

All three passed on iOS (iPhone 17, iOS 26.4 simulator) on Expo SDK 58. On Android (Pixel 9 Pro emulator) `tabs-and-sheets.yaml` passes up to the Browser step and then fails: the page loads, but its text is not in the hierarchy Maestro reads, so the `GROW YOUR` assertion never matches. The other two flows have not been run on Android.

## Run them

From `apps/mobile`, with a simulator booted and the debug app installed:

```bash
pnpm run expo:prebuild
npx expo run:ios --no-bundler --device <udid>
npx expo start --dev-client --port 8081

maestro --udid <udid> test \
  -e DEV_CLIENT_URL='exp+leather-wallet-mobile://?__expo_url=http%3A%2F%2Flocalhost%3A8081&__expo_disable_fab=1&__expo_disable_onboarding=1' \
  maestro/upgrade-smoke/fresh-install.yaml \
  maestro/upgrade-smoke/tabs-and-sheets.yaml
```

`restore-wallet.yaml` also needs `-e SECRET_KEY='<24 words>'`. Generate a throwaway key for it; never pass a key that holds funds.

Install Maestro with `brew install mobile-dev-inc/tap/maestro`. The Homebrew cask named `maestro` is a different product.

Use a simulator that holds no real wallet. `fresh-install.yaml` and `restore-wallet.yaml` wipe the app's data and keychain.

## What the flows do not cover

- The Buy sheet. It needs `EXPO_PUBLIC_ONRAMPER_API_KEY`, `EXPO_PUBLIC_ONRAMPER_SIGNING_SECRET` and `EXPO_PUBLIC_ONRAMPER_WIDGET_HOST`. Without the key the sheet throws during render and the whole app falls to the error screen.
- Anything that moves funds. The flows never reach a review or approve step.
- The device-security path, release builds and dApp requests. Each was checked by hand during the SDK 58 upgrade; the recipes are below.

## Checks to run by hand

- **Device security on iOS.** Enrol Face ID with `xcrun simctl spawn <udid> notifyutil -s com.apple.BiometricKit.enrollmentChanged 1` followed by `notifyutil -p com.apple.BiometricKit.enrollmentChanged`. Turn on Settings, Security, App authentication, then answer each Face ID prompt with `xcrun simctl spawn <udid> notifyutil -p com.apple.BiometricKit_Sim.pearl.match`. Relaunch the app and match again to confirm it unlocks.
- **dApp requests.** Run `pnpm --filter @leather.io/test-app dev` and open `http://localhost:3000` in the wallet's Browser tab. The page should show "Leather detected". "Load account" raises the Connect sheet, and the `signMessage (p2wpkh)` card should end in `PASS` after approval.
- **Deep links.** `xcrun simctl openurl <udid> 'leather://browser?url=https%3A%2F%2Fexample.com'` should land on that page in the Browser tab.
- **Release builds.** `npx expo run:ios --configuration Release --no-bundler --device <udid>` and `npx expo run:android --variant release --no-bundler`, both with `SENTRY_DISABLE_AUTO_UPLOAD=true`. Launch a release build with `xcrun simctl launch <udid> io.leather.mobilewallet`; it has no dev client, so the `DEV_CLIENT_URL` flows do not apply.
- **A baseline to compare against.** Check out `dev` into a second worktree, build it for another simulator, run its Metro on port 8082 and repeat the same steps. This is what tells a regression from behaviour that was already there.

## Things that will trip you up

- **Sheet content was invisible to Maestro on iOS until the sheet got `accessible={false}`.** Before that change the accessibility tree showed only `Bottom Sheet`. Rows inside a sheet can now be matched by text or id, but a row label that also appears on the screen behind the sheet (an asset name on Home) still matches both, so the flows keep `point:` taps for those rows.
- **A text selector is a full-match regex.** `tapOn: 'Bitcoin'` does not match a row whose label is `Bitcoin BTC $80.44`. Use `'.*Bitcoin.*'`. Parentheses in a label must be escaped or replaced with `.`.
- **The system passcode prompt is not in the hierarchy.** When secure store asks for the device passcode, `visible:` conditions never match it. Send `inputText` then `pressKey: enter` unconditionally; on a simulator with no passcode set, any text is accepted.
- **The keyboard covers the Continue button on the restore screen.** `restore-wallet.yaml` presses enter to dismiss it before tapping.
- **Percent coordinates must be whole numbers.** `84.5%` fails the tap.
- **On Android, a swipe that starts above about 10% pulls down the notification shade.** Start sheet-dismiss swipes at 14%.
- **Android hardware back inside a sheet closes the whole sheet**, by design: the sheet registers its own back handler. A second press leaves the app.
- **The dev client shows extra screens on first launch**: an `Open in "Leather"?` prompt for the deep link, then the dev menu. The flows dismiss both.
- **`launchApp` alone does not load the bundle after `clearState`.** The dev launcher forgets its last URL, so the flows follow with `openLink: ${DEV_CLIENT_URL}`.
- **The Browser tab remembers its last page.** `tabs-and-sheets.yaml` asserts on the start page, so it fails if an earlier step navigated elsewhere.
- **Xcode 27 has no Simulator.app.** Boot with `xcrun simctl boot <udid>` and capture with `xcrun simctl io <udid> screenshot`; everything works headless.
- **An older SDK may not build on a newer Xcode.** The SDK 54 Expo CLI fails on Xcode 27 with "Can't determine id of Simulator app", and its pods carry deployment targets the simulator SDK rejects. Building `ios/Leather.xcworkspace` with `xcodebuild` directly, after raising every pod's `IPHONEOS_DEPLOYMENT_TARGET` to 15.1 in a `post_install` hook, worked.
- **Screenshots land in Maestro's output directory**, not the path given to `takeScreenshot`. Pass `--test-output-dir` and collect the PNGs from there.
- **Watch Metro's log as well as the screen.** Unhandled promise rejections and render errors show up there as `ERROR` lines even when the screenshot looks fine.
- **Disk fills fast.** A cold iOS debug build took about 4 GB of derived data, a release build about 5 GB more, Android debug plus release about 5 GB, and a baseline checkout with its build about 7 GB. `pod install` fails with "No space left on device" well before the disk reads zero.
