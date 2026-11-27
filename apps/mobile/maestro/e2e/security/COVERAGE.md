# Device security coverage

Face ID flows for the iOS simulator. They are not ports of extension tests: the extension has no device security. Run them with `run-security.sh`, which enrols Face ID and answers each prompt; `run-e2e.sh` does not answer prompts.

## Tags

| Tag                  | Meaning                                                                              |
| -------------------- | ------------------------------------------------------------------------------------ |
| `faceid-match`       | Face ID is enrolled for the flow and every Face ID scan is answered with a match.    |
| `faceid-nomatch`     | Face ID is enrolled for the flow, the first scan fails and every later scan matches. |
| `faceid-prompts-<n>` | The flow fails unless exactly n Face ID scans started while it ran.                  |

## Flows

| Flow                                 | Tags               | What it proves                                                                                                                                                                                                               |
| ------------------------------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| create-wallet/enable-device-security | match, prompts 0   | Choosing Enable device security creates the wallet, lands on Home, and Settings > Security shows App authentication Enabled.                                                                                                 |
| lock/relaunch-unlocks-with-match     | match, prompts 1   | A cold relaunch of a secured app shows the Face ID prompt or the lock screen before Home (the flow fails if Home shows first) and asks for Face ID once; after a match the lock screen is gone and Settings opens from Home. |
| lock/background-within-timeout       | match, prompts 0   | Going to the home screen and back within the 60 second lock timeout returns to Home, as the lock timeout is designed to.                                                                                                     |
| lock/failed-match-stays-locked       | nomatch, prompts 2 | After a failed match and Cancel the lock screen shows Unlock and a tap on Home Settings does not get through; Unlock and a match then unlock.                                                                                |
| settings/toggle-app-authentication   | match, prompts 3   | For a wallet created with Skip for now, turning App authentication on asks for Face ID and locks the next relaunch; turning it off asks again and the next relaunch has no prompt.                                           |
| settings/toggle-failed-match         | nomatch, prompts 1 | A failed match when turning App authentication on shows Failed to authenticate and leaves it Disabled.                                                                                                                       |
| send/send-stx                        | match              | A mocked STX send from a wallet created with device security shows the amount, fee and recipient on review and reaches the broadcast success state.                                                                          |
| wallets/add-wallet                   | match              | With device security on, a second wallet can be created and becomes the active wallet on Home.                                                                                                                               |
| wallets/add-account                  | match              | Adding an account to a wallet created with device security lists Account 2 next to Account 1.                                                                                                                                |
| wallets/remove-wallet                | match, prompts 1   | Removing a wallet with device security on asks for Face ID once and a match removes it.                                                                                                                                      |
| wallets/remove-wallet-failed-match   | nomatch, prompts 1 | A failed match when removing a wallet shows Authentication failed and keeps the wallet.                                                                                                                                      |

## Not covered

- Locking after the app stays in the background past the 60 second timeout: a flow would need a fixed wait. The relaunch flows cover the locked path.
- Enable device security on a device without Face ID or a passcode: the simulator always reports a passcode, so the App is not protected error cannot be reached.
- Android: the flows use the iOS Face ID prompt and simulator notifications.
