# Funded wallet flows

Flows that sign and broadcast real transactions from a development build. They cover what `upgrade-smoke` stops short of: restoring a real wallet, sending, swapping and signing dApp requests. Run them after an Expo SDK, React Native or secure-store change, before a release.

They move real funds. Use a wallet you can afford to lose a few dollars from, send only tiny amounts, and send only to an address the same secret key controls.

## What is here

- `restore-from-keychain.sh <udid> <keychain service>` wipes the app on that simulator and restores the wallet whose secret key is stored in the macOS keychain. The key goes from the keychain into the app without being printed, logged or captured in a screenshot.
- `send-to-review.yaml` builds a send of `0.0001` of one asset and stops on the review screen.
- `approve.yaml` approves whatever is on the review screen, waits for the broadcast and copies the transaction ID to the simulator clipboard.
- `dapp-connect.yaml` opens `apps/test-app` in the Browser tab and connects Account 1.
- `dapp-card.yaml` runs one test-app card and approves its request.

## Run them

Store the secret key once. Copy it, then run this in your own terminal:

```bash
security add-generic-password -U -a "$USER" -s leather-test-wallet -w "$(pbpaste)"
```

Do not use the interactive `-w` prompt: it cuts the value at 128 characters, which drops the end of a 24-word key.

With Metro on port 8081, the debug app installed and the test app on port 3000:

```bash
cd apps/mobile/maestro/upgrade-smoke/funded-wallet

./restore-from-keychain.sh <udid> leather-test-wallet

maestro --udid <udid> test \
  -e ASSET_ROW='30%, 30%' -e FIRST_MATCH='40%, 30%' \
  -e RECIPIENT=<an address from the same wallet> \
  send-to-review.yaml
```

Read the review screenshot. Check the recipient and the amount, then:

```bash
maestro --udid <udid> test approve.yaml
xcrun simctl pbpaste <udid>

maestro --udid <udid> test dapp-connect.yaml
maestro --udid <udid> test -e CARD='.*signMessage .p2wpkh.*' dapp-card.yaml
```

`ASSET_ROW` is the row in the Send sheet's asset list. On an iPhone 17 simulator the rows sit at `30%, 22%` (Bitcoin), `30%, 30%` (Stacks), `30%, 39%` (sBTC) and `30%, 47%` (the next token). `FIRST_MATCH` is the first row of the recipient search results.

On a Pixel 9 Pro emulator pass `-e KEY_0='50%, 87%' -e KEY_DOT='16%, 87%' -e KEY_1='16%, 70%'` and `-e ASSET_ROW='30%, 27%'` for Stacks.

## Which recipient to use

- **Bitcoin** can be sent to the account's own address. The review screen then shows only the fee as the amount leaving the wallet.
- **Stacks and SIP-10 tokens** cannot be sent to the sending account. Add a second account under Settings, Wallets and accounts, and send to it. Type `Account 2` or its address as `RECIPIENT`.
- An address the wallet has not sent to before raises a `Verify full address` sheet. The flow confirms it.

## dApp cards that are safe to run

`signMessage (p2wpkh)`, `signMessage (p2tr)`, `stx_signMessage (utf8)` and `stx_signStructuredMessage` sign without broadcasting and end in `PASS`.

Do not run cards tagged `funds` against a funded wallet unless you have read what they send and to whom. `stx_signTransaction (SIP-30)` signs a real transfer to a fixed third-party address. `signPsbt (native segwit)` sends two requests back to back and stalls on the second one.

`dapp-card.yaml` scrolls to the top of the page before looking for the card, so cards can be run in any order.

## Upgrade over an existing install

This is the check that catches a build which can no longer read what the previous build stored.

1. Install the old build and create or restore a wallet in it.
2. Open Receive and copy each address: tap the copy icon, then `xcrun simctl pbpaste <udid>`.
3. Install the new build on top without removing the old one: `xcrun simctl install <udid> <path to .app>` or `adb install -r <path to .apk>`.
4. Open the app. The wallet must still be there, and the addresses must be identical.
5. Sign something. A `signMessage` card is enough; a send proves more.

On Android, booting an emulator with `-no-snapshot-save` discards everything installed during the session, so the next boot returns to the build in the snapshot. That makes a snapshot of an old release build a reusable starting point for this check.

## What passed on Expo SDK 58

- iOS, fresh restore: Bitcoin self-send, STX send, SIP-10 send, a swap, and the four signing cards above.
- iOS, SDK 58 installed over SDK 54: wallet kept, addresses identical, `signMessage` returned `PASS`.
- Android, SDK 58 installed over a build from three months earlier: wallet kept, same address as the iOS restore, STX send confirmed on chain.

Not covered: signing with app authentication turned on, a Bitcoin send on Android, the Buy sheet and Ledger.

## Things that will trip you up

- **Never screenshot the restore screen.** `restore-from-keychain.sh` closes the app if the restore fails, because the key may be on screen.
- **Maestro logs typed text.** The script points Maestro's output at a temporary folder and deletes it, along with anything new under `~/.maestro/tests`.
- **Activity does not update on its own.** A confirmed token send or swap appears after a pull to refresh.
- **Home has to be scrolled to the top** for the Send button to be found. `send-to-review.yaml` scrolls up first.
- **The account switcher on Home is disabled with one account.** Add accounts from Settings.
- **After cancelling an address warning, picking the same kind of address again does nothing.** Close the recipient sheet and open it again.
- **Two Maestro runs on two simulators at once interfere with each other.** Run them one after another.
- **Check the chain, not only the screen.** `https://api.hiro.so/extended/v1/tx/0x<txid>` returns `tx_status`.
