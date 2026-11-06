# Ledger inside the Handshake approval direction

Reviewed 7 October 2026. This is a design proposal grounded in the current repository and the two attached screenshots. See [the implementation audit](approval-ledger-flow-audit.md) for code evidence and capability boundaries.

## Recommendation

Keep the approval review independent of the signing method. Software and Ledger accounts use the same Handshake structure to review requester, account, network, message or transaction, fees and consequences. The normal **Sign** or **Approve** action opens a Ledger sheet only when the selected account requires the device. Avoid a separate Ledger section or preparation step before the user approves the reviewed request.

The sheet handles connecting, checking the selected signer/app, optional wallet-policy confirmation and device signing. It carries a compact summary of the already-reviewed request. Successful signing closes the sheet and returns to the shared result state; network submission, submission failure and confirmation also belong outside the sheet. Ledger is a signing method, not a second approval taxonomy.

Keep adding a Ledger wallet outside approvals. It is a wallet setup journey: connect, discover keys/accounts, choose any required address standard, and add the wallet. Receiving and verifying an address is another separate confirmation journey. All three can reuse device presentation, status language and recovery patterns. Shared presentation does not make them the same task.

The screenshot’s sign-message review contains the right ingredients, but the second screen replaces every ingredient with a large device illustration and three generic instructions. Retain the sheet as a focused device interaction while fixing that loss of context: concise summary, compact device guidance and one next action. An animation is secondary.

## Ledger signing sheet

Keep the shared Handshake review underneath the sheet. The sheet needs a compact request summary such as “Sign in to app.leather.io · Bitcoin message” or “Add your signature · Team Treasury · 0.1 BTC,” together with the requesting origin or internal task, selected signer and network. For a vault, distinguish the personal signing account from the vault spending account. Carry the amount and fee when relevant, and never invent a website requester for an internal action. Closing the sheet returns to the unchanged review; details can be reviewed again before restarting device signing.

Place a small Ledger/device symbol beside the guidance rather than dominating the sheet. Short phase labels provide orientation: **Connect → Check → Confirm on device**, with a separate wallet-policy confirmation when required. This is phase progress, not a percentage. Mark only phases backed by the actual operation state as complete. Results are shown in the shared approval screen after the sheet closes. A compact illustration may explain cable/device controls, but it must not remove the request summary or push the next action off the small-phone screen.

Within each phase, lead with one action:

| Phase | Main instruction | Action or status | Keep available |
| --- | --- | --- | --- |
| Prepare, after Sign/Approve | Connect and unlock your Ledger. Open the Bitcoin or Stacks app. | Connect Ledger | Close sheet and return to review |
| Browser selection | Choose your Ledger in the browser dialog. | Waiting for device selection | Close sheet; explain that the browser controls this dialog |
| Check | Checking the selected signer and app. | Checking Ledger | Request summary; no success claim yet |
| Wallet policy, when required | Check the policy and participant keys before accepting. | Waiting for policy confirmation | Policy details; accepting it does not sign the transaction |
| Device review | Review the message or transaction on your Ledger. Reject if the details differ. | Waiting for your Ledger | Request summary, exact comparison details, close sheet |

When a signature is received, dismiss the sheet and show the precise shared result: message signed, proposal commitment signed, partial signature added or transaction signed. A separate caller-controlled submission may follow. Do not keep a completed Ledger panel in the review or show network submission as a device phase.

Connection, app checks and signer checks must come from the operation. The cryptographic signer/account must match; a device name, cable connection or visual badge is insufficient. If the selected signer is wrong, block signing and offer reconnection to the correct account. Do not let elapsed time advance the operation to a signed result. Playground simulation controls must be labelled as such and represent hypothetical device events.

Move detailed troubleshooting into an accessible disclosure after the immediate corrective action. Keep a blocking cause visible. Use a single primary action for each recovery state, not a list of equally prominent options. Examples: “Open the Stacks app,” “Reconnect Ledger,” “Update the Stacks app,” or “Back to review.” Do not prescribe blind signing merely because a generic payload error occurred; the installed app, supported operation and reported error must determine the advice.

## Breadth of approval requests

The device sheet is shared, while its comparison details and the result outside it depend on the request. The prototype retains 13 interactive journeys covering Bitcoin messages with Native SegWit and Taproot, Stacks plain and structured messages, internal Stacks and Bitcoin sends, external contract calls, contract deployment, external PSBTs, Stacks and Bitcoin vault co-signing, and Stacks and Bitcoin proposal commitments.

| Request | Origin | Device stage and outcome |
| --- | --- | --- |
| Bitcoin message/sign-in | External site, including Leather web sign-in | Show the exact message and signing address. The existing BIP-322 implementation uses a synthetic PSBT, so explain a transaction-like device prompt when relevant while clearly stating that no bitcoin moves and no network fee is charged. Result: message signed. |
| Stacks plain or SIP-018 structured message | External site; vault proposal commitment | Show the actual plain message or structured domain/message data and any device comparison data supported by the app. Result: message or commitment signed, not a transaction submitted. |
| Bitcoin transfer or marketplace PSBT | Internal send or external request | Show spend, outputs, change, fees and signing scope. For signing-only requests, return the signed copy; for internal send, represent broadcast as a separate actual operation. |
| Stacks transfer/contract call/deploy | Internal send, swap, deposit or staking; external request | Retain the asset movement, fee, nonce and contract/post-condition review. Device-specific rows must match the app version actually supported. |
| Bitcoin vault co-sign | External coordinator or Leather web | Keep vault and member key distinct. Include registered policy, outputs, fee and partial signing scope. Policy registration, when required, is an explicit device substep. Result: signature added; wait for threshold or return to coordinator. |
| Stacks vault co-sign | Leather web or supported external coordinator | Keep the assigned nonce and exact unsigned transaction visible. Result: signature added; remaining members still sign before separate broadcast. |
| Fee bump or cancellation transaction | Internal activity | Preserve the replacement transaction’s effect and fee changes. A cancellation still requires signing a transaction; merely closing an approval does not cancel an existing transaction. |
| Bitcoin-to-sBTC bridge | Internal swap | Use the same signing stage, but retain the existing Ledger recovery warning: a failed bridge cannot currently be recovered through Ledger without software access to the key. Shared layout must not hide operation-specific restrictions. |
| Account/policy registration and receive-address verification | Wallet setup, receive, or account verification RPC | Use the same visual device language in a separate utility journey. Name the address or policy being confirmed. Result: account/policy added or address verified. |

These cover the supported paths identified in the code audit. Some detailed comparison screens are design explorations, not promises that every Ledger model/app can display the same fields. In particular, confirm Stacks multisig device fields and Bitcoin message prompts on physical devices before finalising copy. Consistent proactive signer verification is an implementation requirement for the proposed device-check phase; the current code has mismatch handling but does not establish that every signing path performs that check. Keep any missing-chain key discovery in wallet setup before returning to the request.

## Recovery and completion

Handle connection unavailable, browser unsupported, browser chooser cancelled, device disconnected, wrong chain app, app update required, wrong signer, user rejection and invalid/unsupported payload in the device sheet. Chooser cancellation returns to a retryable sheet state; it does not cancel the original approval. Closing the sheet interrupts the device attempt and returns to review. Preserve the original request during retry where it is still valid. If the transaction or coordinator state has changed, return to a fresh review rather than silently reusing the approval. Broadcast failure belongs in the shared result/submission screen after a signature has been received, outside the sheet.

Use precise outcomes:

- **Message signed:** signature returned to the requester; no network transaction submitted.
- **Proposal created:** commitment signed; transaction signatures are still needed.
- **Signature added:** member co-signature returned; state whether more signatures are needed.
- **Transaction signed:** signed transaction returned; it may be broadcast later.
- **Transaction submitted:** network submission succeeded; confirmation is still pending.
- **Not signed:** the current attempt produced no signature. Keep broadcast errors separate when signing succeeded but submission failed.

Cancellation during device review needs careful operation handling. The UI must not promise that closing the window revokes a signature already delivered to the requester. A late hardware response must not accidentally submit an operation the user believes was cancelled.

## Form factors and accessibility

On extension, open the Ledger sheet within the approval window after Sign/Approve. The operating system or browser device chooser remains outside the wallet’s visual control. Keep the compact request summary and current action/status visible while device details scroll. On web, use the same focused sheet and attribution within a readable approval panel; signing through the extension remains an explicit handoff.

On phone, this layout is a visual exploration. The inspected mobile code has no Ledger integration, and the current extension transport is WebHID. Do not imply USB or Bluetooth works on mobile by showing a Connect button that pretends to succeed. Offer an honest “Continue on a supported desktop” fallback until native transport, supported devices and return-to-app behaviour are established. If native signing is later added, present the device stage as a modal sheet after the shared review’s Sign/Approve action, carry the compact request summary, honour safe areas and test interruption/resumption. Return to the shared result outside that sheet.

The open Ledger sheet is the active modal: contain keyboard focus, make the underlying review inert and give the sheet an accessible title. On dismissal, restore focus to Sign/Approve; on successful signing, announce and focus the shared result. Status changes should be announced once using a polite live region; avoid continuously announcing a spinner. Use focus movement on an explicit step change, not on every render. Browser chooser cancellation must restore focus to Connect Ledger inside the sheet. Keep text labels for done/current/upcoming phases, so colour and icons are supplementary. Respect reduced motion, allow details on tap and keyboard, and verify large text, long origins, long device errors and a 360 × 640 viewport. Never require a decorative animation or hovered explanation to understand the next action.

## Next steps

1. Test the sign-in flow from the screenshots as the first coherent journey: shared review → Sign → Ledger sheet for connect/check/device review → shared signed result. Check rejection, chooser cancellation and sheet dismissal against the existing overlay.
2. Use the same component for one internal transfer and one vault co-sign. Verify that users distinguish personal signer from vault, signature from broadcast, and device rejection from network failure.
3. Validate Bitcoin BIP-322, Bitcoin policy signing, Stacks messages and Stacks transaction comparisons against physical devices and supported app versions. Replace predictions with observed behaviour before production.
4. Apply the same device presentation to wallet setup and address verification as separate flows. Avoid expanding the approval taxonomy with unrelated onboarding screens.
5. Resolve native transport and capability scope before mobile implementation. Continue browser form-factor review to improve hierarchy without treating it as hardware validation.

## Local prototype and verification

The preview reuses the extension’s original Ledger artwork from a shared UI source: the bright cable Lottie for connection, and the existing signing, success, rejection, disconnect and connection-error illustrations. The extension also consumes that source. SVG masks have instance-specific IDs so comparison frames cannot interfere with one another. Connection playback uses frames 0–93, before the animation’s Stacks-specific gestures; reduced motion, account checking, browser selection and noninteractive frames hold the connected pose at frame 90. Dark mode inverts the monochrome Lottie while retaining the static illustrations’ coloured status accents. Artwork is decorative; text and simulated device events determine progress.

Open [the Ledger message journey](http://127.0.0.1:5178/playground/approval-flows?view=viewer&screen=ledger-flow-message), [internal send](http://127.0.0.1:5178/playground/approval-flows?view=viewer&screen=ledger-flow-transfer), or [Bitcoin vault policy and co-sign](http://127.0.0.1:5178/playground/approval-flows?view=viewer&screen=ledger-flow-btc-vault&form=small-phone). The Ledger signing journeys section contains 13 interactive requests. The shared review’s Sign/Approve action opens the device sheet; wallet buttons handle its connection/recovery steps, and the explicitly labelled **Simulated Ledger** panel supplies browser, device and node events. Successful signatures return to the result outside the sheet. No hardware, signature or network submission occurs.

The prototype preserves a signed result through submission failure and prevents wallet navigation from describing it as unsigned. **Restart review** in the simulator deliberately resets the demonstration. Completed states use a disabled status action; production dismissal and return-to-requester behaviour remain part of integration.

The playground sheet blocks its underlying review while allowing keyboard access to the external simulator. It uses a contained nonmodal dialog for that purpose; production should use a modal focus trap within the approval window. Simulator events announce state changes without taking keyboard focus away from the simulator, and filmstrip copies cannot autofocus.

Verification includes all five required repository checks and 24 behavioural tests covering confirmation guards, held confirmation, interrupted requests, sheet labelling, Escape isolation, focus restoration, external simulator interaction, connection playback and reduced-motion changes. Browser review covers signing-to-sheet entry, return to the shared result, the separate Bitcoin policy step and the 360 × 640 layout. Code comments remain unchanged. Physical-device and native-mobile validation are still future work.
