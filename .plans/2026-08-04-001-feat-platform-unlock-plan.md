---
title: 'feat: Add in-extension biometric unlock to the Chrome extension'
type: feat
status: proposed
date: 2026-08-04
---

# feat: Add in-extension biometric unlock to the Chrome extension

## Implementation qualification amendment

On 2026-08-06, product approved macOS with iCloud Keychain and Touch ID as the development provider for the working version. Windows qualification is deferred to an external tester after this handoff, and ChromeOS is outside this development gate. Product also directed the first-wallet setup screen to omit the four explanatory disclosure paragraphs; the Settings enrollment screen retains its disclosure copy. The multi-platform and mandatory onboarding-disclosure sections below remain the original rollout design and compatibility hypotheses; they are not prerequisites for this macOS implementation or claims that Windows or ChromeOS have been certified.

## Summary

Add an entirely in-extension biometric-unlock path to Leather's Chrome extension using WebAuthn's PRF extension. Whenever no software wallet exists in the current Leather profile, the existing Set a password experience remains the primary protection path and offers Use biometrics as a secondary alternative on the same screen. These are mutually exclusive current wallet-authentication methods, not a checkbox or post-onboarding upsell. A biometric-only setup has no Leather password; Leather generates a cryptographically random 48-byte wallet encryption key, encrypts the mnemonic with the existing cipher, and wraps that key with a PRF-derived AES-GCM key. A password-backed setup keeps the existing Argon2id-derived key path unchanged.

A user with an existing password-backed software-wallet state can enable biometric unlock from Settings by confirming the current Leather password. After enrollment, biometric unlock becomes the primary path anywhere Leather currently asks for the existing wallet password, while the password remains available as fallback for that profile. A biometric-only setup instead falls back to explicit biometric retry and guarded Secret Key reset/recovery because no Leather password exists. Opening locked Leather from its toolbar icon or Chrome keyboard shortcut is itself a high-intent action and starts one biometric-unlock attempt immediately unless an unambiguous operational failure has suppressed further automatic attempts for the current extension session. Existing protected actions such as View Secret Key and the final Add wallet action do the same without consulting that suppression. Dapp-created request windows, restored pages, direct URLs, and unmarked route renders remain prompt-free and present only the fallback methods actually configured for the profile.

The implementation is Chrome-only at launch but operating-system agnostic. It uses the same WebAuthn code on qualified macOS, Windows, and ChromeOS configurations, while recognizing that the PRF-capable provider may differ by platform:

- macOS is expected to qualify through iCloud Keychain on macOS 15+ or Google Password Manager rather than Chrome's profile-local Touch ID authenticator; the selected provider may still present Touch ID or another macOS-approved verification method.
- Windows is expected to qualify through a sufficiently recent Windows Hello implementation or Google Password Manager and may use fingerprint, face, or PIN.
- ChromeOS is expected to qualify through the Google Password Manager enclave and may use Chromebook fingerprint or PIN verification.
- If Chrome or the selected platform authenticator cannot return a PRF result, a user creating a first software wallet uses the password option and an existing password-backed setup continues to use the password flow without regression.

These are expected qualified paths, not launch guarantees. U0 certifies the exact Chrome, OS, provider, account-state, and managed-profile combinations before production implementation begins.

No Leather backend, hosted bridge, native messaging host, desktop application, browser companion, or new extension permission is required. The existing encrypted mnemonic format and cipher remain authoritative. The change adds a second secure way to provision the same shared wallet encryption key: password-backed setups derive it with Argon2id, while biometric-only setups generate it randomly and make it recoverable only through the PRF-protected wrapper.

The product and technical design intentionally avoid introducing per-wallet credentials, multiple registered devices, prompts from low-intent or unmarked renders, configurable reauthentication windows, a general credential-management system, or a new cross-app authentication framework.

Throughout this plan, **Vault** is reserved for Leather's multisig Vault product. This feature uses **software-wallet state**, **wallet encryption key**, and **wallet authentication mode** for the encrypted local wallet data and its protection method; new user-facing copy, modules, selectors, and identifiers must not reuse Vault terminology.

---

## Problem Frame

Leather currently protects software-wallet mnemonics with an Argon2id-derived encryption key. Unlocking requires the password to derive that key, after which the key is placed in `chrome.storage.session` and the decrypted mnemonic for each software wallet is held in a private in-memory store. The existing encryption helper already encrypts with an explicitly supplied wallet encryption key, so a biometric-only setup can use the same encrypted-mnemonic format with a random 48-byte key rather than weakening the design with an empty or synthetic password.

The current password is requested in three post-enrollment situations:

1. Unlocking Leather when software wallets are present.
2. Confirming access before showing a wallet's Secret Key.
3. Confirming the existing Leather password before adding another generated or restored software wallet.

The feature needs to improve all three situations consistently and also become a first-class protection option when the first software wallet is created. It must not create a weaker UI-only bypass, store a password, derive a key from an empty password and public salt, depend on a network service, or imply that a biometric-only setup has password recovery. It also needs to fit the extension's existing shared-encryption architecture: all software wallets use the same encryption key, so authentication mode is profile-level rather than wallet-level.

The core security requirement is therefore:

> Successful platform verification must recover the real wallet encryption key. Leather must never unlock or reveal sensitive material based only on a WebAuthn success boolean.

---

## Requirements

- **R1. Entirely in the extension.** Enrollment, persistence, authentication, encryption-key wrapping, and recovery run inside the Chrome extension. No native install, remote API, hosted iframe, or Leather account is introduced.
- **R2. Chrome across supported desktop operating systems.** One capability-driven implementation supports current Chrome on macOS, Windows, and ChromeOS when a user-verifying PRF-capable platform authenticator is available.
- **R3. Explicit wallet authentication mode.** When no software wallet exists, Leather presents the existing password form and Continue action as primary, with Use biometrics as a secondary alternative on the same screen. Password-backed setups preserve password fallback. Biometric-only setups have no Leather password and never render or imply a password fallback.
- **R4. Cover every protected wallet-authentication surface.** Once enabled, biometric unlock is used for main unlock, Secret Key reveal, and adding another software wallet to the existing software-wallet state. Each surface renders only the fallback methods configured for that profile.
- **R5. Preserve unsupported behavior without a dead end.** Users without PRF support can create a password-backed first software wallet, and existing password-backed users continue normally. In Chromium, a U0-proven definitive preflight failure makes the biometric entry point noninteractive and explains why with an accessible tooltip on the existing surface; it does not navigate to an unavailable page. Advisory or uncertain checks must leave setup available for real provider qualification. Firefox continues to compile the feature out. An unsupported capability can never produce a biometric-only setup or false success state.
- **R6. Cryptographically gate access.** WebAuthn PRF output unwraps the wallet encryption key using authenticated encryption. A returned assertion without a valid PRF output and a key validated against the current persisted software-wallet state cannot authorize an operation.
- **R7. One profile-level credential.** One optional platform-unlock config protects the one encryption key shared by all software wallets in the extension profile.
- **R8. No secret-bearing credential serialization.** Passwords, PRF outputs, unwrapped encryption keys, mnemonics, and Web Crypto `CryptoKey` material are never written to persisted Redux state, `chrome.storage.local`, logs, analytics, error reports, structured-clone messages, or serialized credential objects. The WebAuthn `PublicKeyCredential` response is handled only inside the platform adapter and is never logged, spread, passed through Redux, sent to a worker, or converted with `toJSON()` because its JSON representation includes PRF results.
- **R9. Intentional prompts without redundant clicks.** Opening locked Leather from the toolbar icon or Chrome keyboard shortcut, selecting View Secret Key, selecting the final Add wallet or Continue action, choosing Use biometrics for a first software wallet, and selecting an explicit biometric retry are high-intent actions. When biometric unlock is enrolled and usable, an eligible toolbar open and every explicit protected action start exactly one browser/OS verification ceremony without an intermediate Leather confirmation click. R14 may make a toolbar open ineligible for automatic prompting during the current session, but never blocks an explicit biometric action. When navigation or the toolbar fallback window separates the action from authentication, a one-shot start intent is consumed before the ceremony. Dapp-created request windows, restored pages, direct URLs, unmarked routes, and remounts are low-intent and never start WebAuthn automatically; they render the configured password and/or explicit biometric actions without promotional enrollment UI.
- **R10. Preserve current lock semantics.** This work does not add inactivity locking, per-transaction biometric approval, background reauthentication, or a reauthentication grace period.
- **R11. Clean lifecycle.** Signing out or removing the last software wallet clears the platform-unlock config, explicit authentication mode, password salt, and session suppression. Locking clears the session key and in-memory secrets while leaving the encrypted config and any current-session suppression available for the next unlock.
- **R12. No new Chrome permission.** The generated Manifest V3 permissions remain unchanged.
- **R13. Preserve destructive recovery.** Password-backed main unlock includes Forgot password? and biometric-only main unlock includes Can't use biometrics?. Both reuse Leather's guarded sign-out/reset behavior, require the existing Secret Key backup confirmations, and explain that the Secret Key—not the Leather password or a synced passkey—is required to restore on another device.
- **R14. Dampen deterministic failure loops.** After an unambiguous non-cancellation platform failure, Leather suppresses further automatic toolbar-open attempts for the remainder of the Chrome extension session. This is one session-only boolean, not a persisted preference or credential-health state. Any configured password unlock and explicit biometric actions remain available. Cancellation, timeout, and an ambiguous `NotAllowedError` never enable suppression.
- **R15. Generate biometric-only wallet encryption keys securely.** Biometric-only first-wallet creation uses a fresh random 48-byte key from `crypto.getRandomValues`; it never derives a key from an empty, generated, hidden, or persisted pseudo-password. The first wallet, explicit authentication mode, and complete platform wrapper persist atomically or not at all.
- **R16. Require the currently configured authenticator for changes.** No prior proof is needed when no software wallet exists. Existing password-backed setups require the current Leather password to add or replace biometrics. Existing biometric-only setups require the current biometric credential to replace it or set a password. An unlocked session alone is never sufficient.
- **R17. Validate proof against the persisted software-wallet state and repair stale sessions.** Main unlock validates all software wallets atomically before writing session or in-memory state. Already-unlocked Secret Key and add-wallet flows may use equality with the current session key as a fast path, but a mismatch is not final proof failure: fresh password or biometric proof must derive/unwrap a key, attempt authenticated decryption against the current persisted software-wallet state, and replace stale session/in-memory state on success. Before a biometric-only → password-backed flush the old persisted software-wallet state is authoritative; after the flush the new persisted software-wallet state is authoritative. No stale frame may encrypt or persist another wallet under the old key after that commit point.
- **R18. Keep Firefox password-only deliberately.** Enrollment and biometric-only creation require an explicit Chromium build/runtime gate in addition to WebAuthn capability detection. Firefox must not gain the feature merely because its API support changes.
- **R19. Use complete privacy-safe WebAuthn options.** Every `create()` and `get()` uses a fresh random challenge. Required RP and user display fields use generic environment-appropriate Leather labels and never include wallet addresses, fingerprints, account names, Chrome-profile identifiers, or other user data.

### Acceptance Examples

- **AE1 — biometric-only first software wallet:** With no software wallet present, including in a Ledger-only profile, a qualified Chrome user chooses Use biometrics, completes one platform ceremony, and Leather atomically stores the first encrypted mnemonic, explicit biometric-only mode, and wrapper around a random wallet encryption key. No Leather password or salt-derived key is created.
- **AE2 — existing-wallet enrollment:** An unlocked password-backed software-wallet user opens Settings → Biometric unlock, enters the correct Leather password, completes platform verification, and sees Biometric unlock marked On. No raw password or encryption key is persisted.
- **AE3 — main unlock:** After locking Leather, an enrolled user selects Leather's toolbar icon or keyboard shortcut and immediately receives one platform-verification prompt without clicking a second Leather button. Success reaches the original destination. Cancellation returns a password-backed setup to password plus Try biometric unlock again and Forgot password?, while a biometric-only setup shows Try biometric unlock again and Can't use biometrics? with no password control.
- **AE4 — Secret Key:** An enrolled, already-unlocked user selects View Secret Key, that action starts a fresh platform-verification prompt, and successful verification reveals only the requested wallet's mnemonic after the recovered key is validated against the current persisted software-wallet state. Cancellation reveals nothing and leaves only configured fallback methods available.
- **AE5 — add wallet:** An enrolled user selects the existing final Add wallet or Continue action. That action starts platform verification without an intermediate confirmation click, and the new mnemonic is encrypted with the existing shared wallet encryption key after success. A canceled or failed prompt adds nothing and preserves the in-progress flow for retry or any configured password fallback.
- **AE6 — unavailable authenticator:** A password-backed user whose platform credential was deleted can immediately use the password. A biometric-only user sees retry plus guarded Secret Key reset/recovery and no fictitious password option. Unambiguous operational failures suppress later automatic toolbar prompts for that extension session without deleting wallet data.
- **AE7 — unsupported platform/provider:** A user whose Chrome environment cannot produce a PRF result cannot choose biometric-only protection but can create or continue using a password-backed setup.
- **AE8 — sign-out:** Signing out clears encrypted mnemonics, password salt, explicit authentication mode, and the platform-unlock wrapper together. Creating a new wallet afterward cannot use the previous credential, salt, or wrapper.
- **AE9 — multi-wallet:** One platform verification unlocks every software wallet encrypted under the shared wallet encryption key, matching the existing software-wallet state behavior.
- **AE10 — set a password:** A biometric-only user proves control with the current biometric credential, creates a Leather password, and atomically transitions every encrypted software wallet plus the biometric wrapper to the new password-derived wallet encryption key. The user can then retain both methods or disable biometrics.

---

## User Experience Principles

### 1. Biometric unlock is an authenticator, not a wallet backup

The UI must consistently explain that Leather's wrapper and encrypted wallet data remain local to this Chrome profile even if Chrome or the operating system syncs the underlying platform credential. Reuse the existing password-flow model: the configured unlock method protects the Secret Key on this device, while the Secret Key is needed to access the wallet on another device. A password-backed setup can still unlock with its Leather password. A biometric-only setup has no Leather password, so an unavailable platform credential leaves guarded reset and restoration from the Secret Key as the recovery path. Do not add a biometric-specific loss warning when the same consequence already exists for a user who cannot use their password. Leather must never imply that a synced WebAuthn credential, the Leather password, or biometric unlock alone restores a wallet on another device.

### 2. Reuse the action the user already took

Opening Leather from its toolbar icon or Chrome keyboard shortcut clearly expresses the intent to unlock the wallet. If Leather is locked, biometric unlock is enrolled and usable, and automatic prompting is not session-suppressed, that opening action starts one platform-verification attempt immediately. Selecting View Secret Key or the final Add wallet action behaves the same way and never leads to a redundant confirmation button or consults toolbar suppression. If the toolbar action popup cannot survive the OS ceremony on a certified platform, the opening action hands off to a dedicated extension window and continues there without another click.

### 3. Distinguish opening the wallet from incidental window rendering

Only the initial locked `action-popup.html` entry created by the user selecting Leather's toolbar icon or Chrome keyboard shortcut counts as a high-intent wallet open. Dapp-created `popup.html` request windows, restored extension pages, direct URL visits, unmarked routes, and remounts are low-intent and never trigger WebAuthn on their own. A high-intent action that navigates or creates the dedicated toolbar fallback window passes a one-shot start intent that the destination consumes before starting the ceremony. Low-intent entries render only the configured fallback methods: password plus an explicit biometric action for password-backed enrolled setups, or explicit biometric retry and guarded recovery for biometric-only setups.

| Entry or action                                                                   | Intent | Biometric behavior                                                            |
| --------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------- |
| Toolbar icon or Chrome shortcut opens locked `action-popup.html`                  | High   | Start once immediately unless session-suppressed after an unambiguous failure |
| View Secret Key, final Add wallet/Continue, setup/replacement, or biometric retry | High   | Start from that action without another Leather click                          |
| Dedicated toolbar fallback window with a consumed one-shot intent                 | High   | Start once in the real window                                                 |
| Dapp-created `popup.html`, restored/direct page, unmarked route, or remount       | Low    | Show configured password and/or explicit biometric action; never auto-start   |

### 4. Cancellation is not an error

Closing an OS prompt or choosing Cancel returns the user to a predictable Leather confirmation surface without a red failure message. A password-backed main unlock shows the password field focused, Try biometric unlock again, and Forgot password?. A biometric-only main unlock shows Try biometric unlock again and Can't use biometrics? without a password field. Operational failures use the same mode-appropriate layout with neutral copy: Biometric unlock didn't work. Try again or use a configured recovery action.

### 5. Use accurate cross-platform language

WebAuthn guarantees user verification but does not reliably expose whether Chrome used fingerprint, face, device PIN, system password, or a password-manager verification method. Use **Biometric unlock** as the feature and Settings name, **Set up biometric unlock** for enrollment, **Unlock with biometrics** for an explicit first attempt on a low-intent screen, and **Try biometric unlock again** after cancellation or failure. Supporting copy should say **Use your device's fingerprint, face, PIN, or password.** It may also name examples such as Touch ID, Windows Hello, or Chromebook PIN/fingerprint.

This keeps the familiar language users expect while explicitly avoiding a fingerprint-only promise or user-agent-specific copy logic.

### 6. Do not hide recovery

When a high-intent action starts platform verification directly, cancellation or failure lands on a mode-appropriate confirmation screen without requiring a separate Use password click. Password-backed setups show their password fallback immediately. Biometric-only setups show biometric retry and Can't use biometrics?, which opens the existing guarded sign-out/reset confirmation and makes the need for a Secret Key backup explicit. Configured fallback and recovery actions are never buried in Settings or an overflow menu.

### 7. Keep rare management tasks simple

Biometric unlock still has only Off and On presentation states, but management actions depend on the profile's explicit authentication mode. A password-backed setup supports Set up biometric unlock, Set up again, and Disable. A biometric-only setup supports Set up again and Set a password; Disable is unavailable until another authenticator exists. There is no credential list, device name, last-used timestamp, automatic timeout, launch-prompt preference, or per-wallet toggle. Enabling biometric unlock implies automatic prompting on a high-intent toolbar open. Session-only suppression remains invisible and is not another durable user setting.

---

## User Flows

### Flow A — Create the first software wallet

**State:** No existing software wallet and no platform-unlock config.

1. User creates or restores the first software wallet.
2. After the existing Secret Key backup flow, Leather keeps the current Set a password screen as the primary path and adds a secondary Use biometrics action on that same screen. The existing password field, strength feedback, Continue action, and local-device/Secret-Key description remain primary. Supporting copy for the secondary action says Use your device's fingerprint, face, PIN, or password. The two paths create mutually exclusive current protection methods rather than a future-facing checkbox.
3. This flow applies whenever `hasSoftwareKeys` is false: first install, after sign-out/reset, or when a Ledger-only profile adds its first software wallet.
4. If the user enters a password and continues, Leather follows the current Argon2id-derived wallet-encryption-key path unchanged.
5. If the user chooses Use biometrics, the same click starts one WebAuthn ceremony. Leather generates a fresh random 48-byte wallet encryption key, obtains the PRF result, wraps the random key, encrypts the mnemonic with that key, and atomically persists the first software wallet, explicit biometric-only mode, and complete wrapper.
6. The first-wallet biometric transaction has no prior-authentication requirement because no software-wallet state exists yet. The user's active create/restore flow and selected protection method establish the new software-wallet state.
7. Cancellation or any failure returns neutrally to the Set a password screen with the mnemonic still only in existing React component memory. No software wallet, authentication mode, salt, session key, or partial wrapper is persisted.
8. If a U0-proven preflight result is definitively negative, the secondary Use biometrics action remains visible but noninteractive and explains why with the existing accessible tooltip convention; the password form remains fully functional and unchanged. Advisory or uncertain results leave the action enabled so the real ceremony can qualify the selected provider. Firefox keeps the current password-only screen.

**Decision:** The secondary action on first-wallet password setup is the permanent onboarding discovery path whenever a first software wallet is created. Do not add a separate choice screen, checkbox, promise of later enrollment, or second post-onboarding biometric upsell.

### Flow B — Enable biometric unlock

**Entry:** The enabled Settings → Biometric unlock row on an existing password-backed setup. The settings row is shown only when at least one software wallet exists.

1. The Biometric unlock page explains:
   - It uses this device's screen-lock verification.
   - It applies to all software wallets in this Leather profile.
   - The Leather password remains available as a fallback in this profile.
   - The Secret Key is still required to restore the wallet on another device.
   - Chrome or the operating system may sync the platform credential, but Leather's encrypted key wrapper and encrypted wallet data remain local to this extension profile.
   - Anyone who can unlock your user account will be able to unlock this wallet.
2. Before navigation, Leather applies the explicit Chromium gate and advisory capability checks proven by U0. A U0-proven definitive negative makes the Settings row noninteractive, removes its chevron, shows Unavailable as its right-side caption, and explains why through an accessible tooltip on hover and keyboard focus. It never opens a standalone unavailable page. Advisory or uncertain checks keep the row enabled so they cannot reject a qualified provider path.
3. If capability may be available, the user enters the current Leather password and selects Set up biometric unlock.
4. Leather validates the password before opening any system prompt.
5. Leather creates one platform WebAuthn credential with user verification required, attestation disabled, and the relying-party ID omitted so Chrome binds it to the extension origin. Every ceremony uses a fresh random challenge. Every enrollment and replacement uses a fresh random 32-byte WebAuthn `user.id`, generic non-identifying RP/user display fields, and no `excludeCredentials`; the user ID is not persisted.
6. Leather requests a PRF result during credential creation. If the authenticator reports PRF support but does not evaluate during creation, Leather performs one explicit follow-up assertion. The page should warn that setup may require a second device confirmation only if the hardware spike proves this occurs on a supported launch platform.
7. Leather uses the PRF result to wrap the already-derived wallet encryption key and persists the complete config atomically.
8. The password input, PRF bytes, and temporary encryption-key bytes are released immediately after completion.
9. Leather shows a success toast and the page state changes to On.

**Failure behavior:**

- Wrong password: inline password error; no WebAuthn prompt.
- User cancellation: remain Off with neutral retry UI.
- PRF unavailable: remain Off, explain that the selected credential provider did not supply the required capability, and offer retry guidance to choose another available save location/provider before concluding that the Chrome/device configuration is unsupported.
- Credential created but wrapping/persistence fails: remain Off; do not store a partial config. Because each enrollment uses a fresh user ID, the orphaned new credential cannot replace or invalidate an older working credential. After failure, Leather may best-effort signal the new credential as unknown when the Signal API, provider, and extension-origin RP ID support it, but cleanup is not a launch dependency.

### Flow C — Normal wallet unlock

**State:** Wallet is locked and a complete platform-unlock config exists.

1. The user selects Leather's toolbar icon or Chrome keyboard shortcut, opening the `action-popup.html` entrypoint.
2. If the wallet is locked, a complete usable config exists, and automatic prompting has not been suppressed for this extension session, that high-intent opening action starts exactly one `navigator.credentials.get()` attempt immediately. Leather does not first render an Unlock with biometrics button.
3. A valid PRF result unwraps the wallet encryption key, which Leather validates against the current persisted software-wallet state before authentication succeeds.
4. Leather decrypts all software-wallet mnemonics, fills the existing in-memory store, initializes `chrome.storage.session`, and returns to the original route using the current navigation behavior.
5. If the toolbar action popup cannot complete the ceremony on even one otherwise-qualified launch configuration, adopt one consistent toolbar-unlock fallback across the launch matrix: the initial toolbar opening creates a real `chrome.windows.create({ type: 'popup' })` extension window using the full-page `index.html#/unlock` entrypoint and closes or relinquishes the transient action popup. The new window receives and consumes a non-authorizing one-shot start intent, starts without another Leather click, and continues into the unlocked wallet using full-page navigation semantics.

The dedicated-window fallback applies only to the toolbar action popup. Dapp-request windows are already real `chrome.windows.create` windows using `popup.html`; they still require U0 certification but no additional handoff design.

**Fallback behavior:**

- Cancellation does not show an error. Password-backed setups settle on the normal Unlock Leather password form with Try biometric unlock again and Forgot password?. Biometric-only setups settle on Try biometric unlock again and Can't use biometrics? with no password field.
- Missing credential, empty PRF result, malformed config, key/wallet-data mismatch, or AES-GCM authentication failure uses the same mode-appropriate screen with Biometric unlock didn't work. Try again or use the configured fallback. Do not identify which persisted field failed.
- After an unambiguous non-cancellation failure, Leather writes one boolean suppression flag to `chrome.storage.session`. Further toolbar opens in that extension session bypass automatic WebAuthn and show the mode-appropriate fallback screen; they do not show a fresh failure because no new attempt occurred.
- Cancellation, timeout, and any `NotAllowedError` that Chrome does not distinguish from those outcomes never set suppression. Leather must not infer credential loss from an ambiguous browser error.
- Try biometric unlock again is high-intent and starts one new attempt even when automatic prompting is suppressed. Closing and deliberately reopening Leather from the toolbar or shortcut starts one new automatic attempt after cancellation or another non-suppressing result; a remount within the same open does not.
- Explicit biometric retry ignores suppression. Biometric success, successful Set up again, successful Set a password, Disable, sign-out, and extension-session reset clear it. Password success does not clear it, so locking and reopening in the same session cannot immediately recreate the broken-credential loop.
- Forgot password? for password-backed setups and Can't use biometrics? for biometric-only setups open Leather's existing guarded sign-out/reset confirmation. It requires confirmation that every software wallet's Secret Key is backed up and removes wallet state only after the user completes that destructive flow.
- A low-intent locked entry does not auto-prompt. It renders password plus Unlock with biometrics for a password-backed enrolled setup, biometric retry/recovery only for a biometric-only setup, and password only for a password-only setup.
- A successful password unlock does not automatically overwrite or delete a failing biometric config. The user can choose Set up again from Settings.

### Flow D — Confirm before revealing a Secret Key

**State:** Wallet is already unlocked. The user opens Settings → Secret Key or the corresponding wallet action.

1. The user selects the existing View Secret Key action for a specific wallet.
2. When biometric unlock is enrolled and usable, that same high-intent action starts platform verification. If the action navigates, it passes only a one-shot start intent to the shared confirmation component; Leather does not navigate to a second Confirm with biometrics button first.
3. Platform authentication must unwrap the real wallet encryption key; the UI does not accept an assertion boolean.
4. Leather uses the authenticated result to authorize only the existing local reveal state. It displays the specific wallet selected by the action/current fingerprint, preserving multi-wallet behavior.
5. If the user cancels or platform authentication fails, Leather shows the mode-appropriate configured fallback. No secret is revealed.
6. The confirmation component consumes and clears any start intent before invoking WebAuthn. When the intent came through React Router navigation state, consumption replaces the current history entry with the same state minus the intent field, preserving unrelated fields such as the selected wallet `fingerprint`. Back/forward navigation, route restoration, or retry cannot replay it.
7. If the user reaches the confirmation route directly, restores it after a browser restart, or opens it without the originating action, the route renders only configured explicit authentication methods and does not prompt on mount.
8. Every new reveal action continues to require confirmation. No reusable five-minute approval window is added.

**Reasoning:** A grace period would be a new security policy and additional state machine. It is unnecessary to meet the request and could make Secret Key reveal less predictable.

### Flow E — Add or restore another software wallet

**State:** At least one software wallet exists and the software wallets are unlocked.

1. User completes the existing generate/backup or restore-mnemonic steps.
2. The user selects the existing final Add wallet or Continue action that currently advances to existing-password confirmation.
3. When biometric unlock is enrolled and usable, that same high-intent action stores a one-shot start intent in the existing page's React component state and conditionally renders the shared existing-wallet confirmation component, which starts platform verification without navigation or an intermediate confirmation click.
4. On successful platform authentication, Leather uses the returned existing wallet encryption key to encrypt the new mnemonic.
5. On cancel or failure, Leather shows or retains an existing-wallet confirmation screen with only configured fallback methods. No wallet or keychain state is written, and the entered/generated mnemonic remains only in the current React component's in-memory state. A mnemonic must never be placed in React Router state, browser history, Redux, or Chrome storage.
6. When a password fallback exists, successful password authentication derives and verifies the same key before adding the wallet. A biometric-only setup never renders a Leather password control.
7. The component clears its local start intent before invoking WebAuthn, preventing a remount, retry, or state transition from replaying it.
8. If the existing-wallet confirmation component renders without the originating final action's intent, it renders only configured explicit authentication methods and does not prompt on mount.

**Decision:** Split the existing first-wallet password-creation UI from the existing-wallet confirmation UI. The current `hasSoftwareKeys` conditional makes one component serve two materially different jobs; this feature is the point where keeping them visually combined becomes more confusing than a small explicit component split. `BackUpSecretKeyPage` is mounted under both `OnboardingGate` and `AccountGate`, while `SignIn` is onboarding-only, so the create-versus-existing-wallet branch must follow actual route/gate context or `hasSoftwareKeys` rather than assuming the component has one mode.

### Flow F — Disable or replace biometric unlock

**State:** Biometric unlock is On.

- A password-backed biometric setup shows status On, plus Set up again and Disable.
- For a password-backed setup, Set up again requires the current Leather password, generates a fresh random WebAuthn user ID and challenge, omits `excludeCredentials`, and replaces the persisted config only after the new credential and wrapper are complete.
- A biometric-only setup shows status On, plus Set up again and Set a password. It does not offer Disable while biometrics is the only configured authenticator.
- For a biometric-only setup, Set up again requires a successful assertion from the current biometric credential before creating the replacement credential. An unlocked session alone is insufficient.
- Set a password requires current biometric authentication, asks for a new Leather password through the existing password-strength form, derives a new wallet encryption key with the existing Argon2id path, decrypts and re-encrypts every software-wallet mnemonic atomically, and updates the biometric wrapper to wrap the new key. On success the authentication mode becomes password-backed with biometrics still On; the user may then Disable biometrics.
- If current biometric authentication is unavailable, a biometric-only user cannot replace it or set a password. The guarded Secret Key reset/restore path remains available.
- After the new config is durably persisted, Leather may best-effort signal the old credential as unknown when supported. Cleanup failure does not roll back or invalidate the new config, and the old config remains authoritative until the atomic replacement succeeds.
- Disable on a password-backed setup shows a lightweight confirmation explaining that the password will be required next time, then removes only the platform-unlock config.
- Disable does not require another authentication ceremony. It cannot expose wallet secrets or create future access; requiring authentication would make recovery from a broken credential unnecessarily difficult. Password fallback already protects subsequent unlocks.
- Disabling does not lock the currently unlocked wallet. The existing Lock action remains separate and explicit.

### Flow G — Device credential is lost or unavailable

Examples include deleting the passkey/credential locally or from another device through a synced provider, disabling Windows Hello, removing Chromebook PIN/fingerprint, changing Chrome profiles, or a provider ceasing to support PRF.

1. Biometric unlock fails without altering persisted wallet data.
2. A password-backed setup shows the password form immediately with Try biometric unlock again. A biometric-only setup shows retry plus Can't use biometrics? and never presents a password input.
3. If Chrome returns an unambiguous non-cancellation failure, Leather suppresses later automatic toolbar-open attempts for the current extension session; explicit Try biometric unlock again remains available.
4. After password unlock, a password-backed Settings page shows Biometric unlock On with Set up again and Disable. A biometric-only user must authenticate with the current credential to replace it or set a password; if that credential is unavailable, recovery requires the existing Secret Key.
5. Leather does not attempt to infer permanent credential loss from a single `NotAllowedError`, because that exception also represents user cancellation and timeout.

### Flow H — Sign-out, wallet removal, and extension lifecycle

- Manual Lock clears the session key and in-memory mnemonics but preserves the device wrapper and any current-session automatic-prompt suppression for the next unlock.
- Chrome restart, extension reload, or extension update clears `chrome.storage.session`, including any automatic-prompt suppression; the persisted wrapper remains and can unlock the software wallets again.
- Sign out removes the entire persisted wallet state, including the device wrapper. The OS or password-manager credential may remain as a cosmetic orphan when the provider does not support cleanup; support copy must not imply Leather can always remove it.
- Removing one of several software wallets keeps the wrapper because remaining wallets use the same key.
- Removing the last software wallet removes the wrapper, explicit authentication mode, and password salt. A remaining Ledger-only wallet does not need biometric unlock; adding a new first software wallet presents password-first setup with the secondary biometric alternative again.
- Extension updates retain the same Web Store extension ID, so the credential's extension-origin binding remains stable. Development, preview, and production extension IDs have independent credentials.

---

## Scope Boundaries

- **Chrome extension only.** Firefox remains password-only. `apps/mobile` and `apps/web` are untouched.
- **Launch operating systems:** At least one reasonable, documented macOS, Windows, and ChromeOS configuration must pass the hardware spike. Support remains capability-qualified rather than a promise that every hardware, account, managed-profile, or outdated OS combination works.
- **Capability support, not OS-name trust.** OS detection never substitutes for a successful PRF result.
- **No native messaging or desktop app.** The manifest does not gain `nativeMessaging`.
- **No Leather server or hosted origin.** Random WebAuthn challenges and all wrapping data remain local.
- **No weakened pseudo-password.** Biometric-only setups use a random wallet encryption key and never an empty, generated, hidden, or persisted password.
- **No general password-change feature.** This plan adds only the guarded biometric-only → password-backed transition required to avoid an inescapable sole-authenticator state; changing an existing password remains out of scope.
- **No per-transaction device prompt.** Signing and sending continue to use the current unlocked-session model.
- **No auto-lock changes.** Existing manual/browser-session lock behavior is preserved.
- **No multiple device credentials.** One config exists per Chrome extension profile.
- **No per-wallet configuration.** One shared wallet encryption key means one shared biometric-unlock setting.
- **No credential backup or sync UI.** Chrome or the OS may sync the platform credential, but Leather's encrypted wrapper and wallet data remain local. Leather explains this distinction but does not manage provider sync.
- **No general authentication framework in shared packages.** The feature stays in `apps/extension` because it depends on Chrome extension origins, browser WebAuthn, and the extension's software-wallet state.
- **No new cross-window merge protocol.** The implementation uses the extension's existing persistence synchronization and tests normal sequential propagation. Redesigning whole-slice conflict resolution for simultaneous writes is outside this feature.
- **No recovery-nudge state machine.** Permanent discovery is limited to the secondary biometric action on first-software-wallet password setup and Settings. A launch-only marketing interstitial for existing users is owned separately by Marketing and is not implemented here.
- **No persisted credential-health model.** Broken-credential damping is one boolean in `chrome.storage.session`; there are no counters, timers, health classifications, automatic disablement, or new Settings state.

### Deferred Follow-Up Work

- The launch-only marketing interstitial and campaign for existing users.
- Certified Linux support after evidence from PRF-capable Chrome/Linux configurations.
- Firefox support when Firefox/macOS and other target configurations meet the same PRF requirements.
- Mobile biometric unlock using native secure storage; this is a separate architecture and should not reuse the browser credential implementation.
- Optional inactivity locking, evaluated as its own security/product change.
- Device-specific marketing copy if Chrome eventually exposes a reliable verification-method label.
- Multiple registered credentials or cross-profile portability if a demonstrated user need emerges.

---

## Context & Research

### Existing Leather Architecture

- [`apps/extension/scripts/generate-manifest.js`](../apps/extension/scripts/generate-manifest.js) generates Manifest V3 with a Chromium service worker. Current permissions are `contextMenus`, `storage`, `unlimitedStorage`, and `notifications`; WebAuthn does not require adding a manifest permission.
- [`apps/extension/src/shared/workers/decryption-worker.ts`](../apps/extension/src/shared/workers/decryption-worker.ts) derives a 48-byte encryption key using Argon2id.
- [`apps/extension/src/shared/crypto/generate-random-hex.ts`](../apps/extension/src/shared/crypto/generate-random-hex.ts) already generates cryptographically random 16-byte hex strings for wallet salts. Parameterize and reuse it for the 48-byte biometric-only wallet encryption key rather than adding a second random-hex implementation; preserve 16 bytes as the default for existing callers.
- [`apps/extension/src/shared/crypto/mnemonic-encryption.ts`](../apps/extension/src/shared/crypto/mnemonic-encryption.ts) encrypts mnemonics and supports the legacy-to-Argon2 migration path.
- [`apps/extension/package.json`](../apps/extension/package.json) already depends directly on `@scure/base`, whose `base64urlnopad` codec covers the persisted WebAuthn and AES-GCM binary fields. Reuse it rather than implementing a feature-local base64url codec.
- [`apps/extension/package.json`](../apps/extension/package.json) pins `@stacks/encryption` 7.0.2. Its wallet cipher passes the password string directly into PBKDF2 without normalization, so a random hex wallet encryption key is compatible; it accepts plaintext only as a valid English BIP39 mnemonic. The v7.0.2 implementation contains only the PBKDF2/AES path and no triplesec fallback, so this plan's “legacy” path means Leather's pre-Argon2 PBKDF2-format path: [`@stacks/encryption` 7.0.2 `wallet.ts`](https://github.com/hirosystems/stacks.js/blob/v7.0.2/packages/encryption/src/wallet.ts).
- [`apps/extension/src/app/store/software-keys/software-key.slice.ts`](../apps/extension/src/app/store/software-keys/software-key.slice.ts) persists the wallet salt and encrypted mnemonic per software wallet.
- [`apps/extension/src/app/store/software-keys/software-key.actions.ts`](../apps/extension/src/app/store/software-keys/software-key.actions.ts) reuses one encryption key across all software wallets and unlocks all encrypted software keys together.
- [`apps/extension/src/app/store/session-restore.ts`](../apps/extension/src/app/store/session-restore.ts) stores the active encryption key in `chrome.storage.session` and restores decrypted mnemonics into memory.
- [`apps/extension/src/app/store/in-memory-key/in-memory-storage.ts`](../apps/extension/src/app/store/in-memory-key/in-memory-storage.ts) keeps decrypted mnemonics outside Redux persistence.
- [`apps/extension/src/app/components/request-password.tsx`](../apps/extension/src/app/components/request-password.tsx) is shared by main unlock and Secret Key confirmation. It currently renders the password form but no Forgot password? link.
- [`apps/extension/src/app/features/settings/sign-out/sign-out-confirm.tsx`](../apps/extension/src/app/features/settings/sign-out/sign-out-confirm.tsx) and [`apps/extension/src/app/features/settings/sign-out/sign-out.tsx`](../apps/extension/src/app/features/settings/sign-out/sign-out.tsx) already implement the destructive reset/sign-out action with a warning and per-software-wallet Secret Key backup acknowledgements. Main unlock should reuse that behavior rather than create a weaker reset path.
- [`apps/extension/src/app/pages/onboarding/set-password/set-password.tsx`](../apps/extension/src/app/pages/onboarding/set-password/set-password.tsx) handles both initial password creation and existing-password confirmation when adding a wallet.
- [`apps/extension/src/app/pages/onboarding/back-up-secret-key/back-up-secret-key.tsx`](../apps/extension/src/app/pages/onboarding/back-up-secret-key/back-up-secret-key.tsx), [`apps/extension/src/app/pages/onboarding/sign-in/sign-in.tsx`](../apps/extension/src/app/pages/onboarding/sign-in/sign-in.tsx), and [`apps/extension/src/app/pages/add-wallet/add-wallet.tsx`](../apps/extension/src/app/pages/add-wallet/add-wallet.tsx) keep generated/restored mnemonic data and the transition to password confirmation in React component state rather than router state.
- [`apps/extension/src/app/routes/app-routes.tsx`](../apps/extension/src/app/routes/app-routes.tsx) mounts `BackUpSecretKeyPage` under both onboarding and account gates, so the shared page cannot infer one authentication mode from its component identity alone.
- [`apps/extension/src/app/pages/settings/menu-buttons.tsx`](../apps/extension/src/app/pages/settings/menu-buttons.tsx) is the natural settings entry point for Biometric unlock.
- [`apps/extension/scripts/generate-manifest.js`](../apps/extension/scripts/generate-manifest.js) assigns `action-popup.html` to the user-opened toolbar action, while dapp-request windows use the distinct `popup.html` entrypoint. [`apps/extension/src/app/common/utils.ts`](../apps/extension/src/app/common/utils.ts) currently classifies only `index.html` as full-page mode; [`apps/extension/src/app/pages/unlock.tsx`](../apps/extension/src/app/pages/unlock.tsx) uses that distinction to choose explicit-route navigation instead of popup-mode `navigate(-1)` after unlock. U4 adds the smallest local entrypoint classification needed to require both the `action-popup.html` path and confirmation that the current foreground view is Chrome's extension-popup view. U0 compares `chrome.runtime.getContexts({ contextTypes: ['POPUP'] })`, available to Manifest V3 extensions from Chrome 116, with the older identity-comparable `chrome.extension.getViews({ type: 'popup' })`; filename alone is insufficient because the URL can be opened directly in a tab: [Chrome `runtime.getContexts()` API](https://developer.chrome.com/docs/extensions/reference/api/runtime#method-getContexts), [Chrome `extension.getViews()` API](https://developer.chrome.com/docs/extensions/reference/api/extension#method-getViews).
- [`apps/extension/tests/specs/security/password-memory-leak.spec.ts`](../apps/extension/tests/specs/security/password-memory-leak.spec.ts) provides an existing security-test pattern for sensitive input lifetime.
- [`apps/extension/tests/specs/settings/wallet-lock.spec.ts`](../apps/extension/tests/specs/settings/wallet-lock.spec.ts) covers cross-window lock propagation and session-key clearing.

### Platform Findings

- Chromium allows WebAuthn directly from `chrome-extension://` origins. Extension pages should omit RP ID to accept the extension-origin default: [Chromium WebAuthn origin documentation](https://chromium.googlesource.com/chromium/src/+/main/content/browser/webauth/origins.md).
- WebAuthn PRF returns 32 bytes and is explicitly designed for client-side symmetric encryption use cases: [WebAuthn Level 3 PRF extension](https://www.w3.org/TR/webauthn-3/#sctn-prf-extension).
- Chromium's PRF API has been enabled by default since Chrome 116: [Chromium PRF flag cleanup](https://chromium.googlesource.com/chromium/src/+/d27c4ca3c982d333dcdcbb896733c6b88b6eaa03%5E%21/).
- Chrome contains a profile-local macOS Touch ID authenticator, but current Chromium implements PRF for iCloud Keychain rather than that profile authenticator. The expected macOS PRF paths are iCloud Keychain on macOS 15+ or Google Password Manager, and provider selection must be certified in U0: [Chromium macOS authenticator](https://chromium.googlesource.com/chromium/src/+/HEAD/device/fido/mac/authenticator.mm), [Chromium iCloud Keychain implementation](https://chromium.googlesource.com/chromium/src/+/HEAD/device/fido/mac/icloud_keychain.mm), [Chrome passkeys on iCloud Keychain](https://developer.chrome.com/blog/passkeys-on-icloud-keychain/).
- Windows exposes WebAuthn through Windows Hello and current Windows headers include the HMAC-secret/PRF salt structures: [Microsoft WebAuthn API](https://learn.microsoft.com/en-us/windows/win32/webauthn/-webauthn-portal), [Microsoft PRF salt structure](https://learn.microsoft.com/en-us/windows/win32/api/webauthn/ns-webauthn-webauthn_hmac_secret_salt).
- Current Chromium's Windows path sends PRF input during credential creation only when the native Windows WebAuthn API reports version 8 or later, so browser-level PRF availability alone is not enough to certify a Windows configuration. A recent Windows Hello implementation is an expected path, while the exact qualifying Windows and Chrome versions remain U0 outputs: [Chromium Windows WebAuthn implementation](https://chromium.googlesource.com/chromium/src/+/master/device/fido/win/webauthn_api.cc).
- ChromeOS's legacy platform authenticator supports Chromebook PIN or fingerprint but does not expose a PRF path in current Chromium. Chromium's Google Password Manager enclave authenticator has explicit create/get PRF coverage and is the expected ChromeOS path; U0 must still certify actual enclave enrollment, managed-profile, and account-state behavior: [Chromium ChromeOS authenticator](https://chromium.googlesource.com/chromium/src/+/HEAD/device/fido/cros/authenticator.cc), [Chromium enclave PRF tests](https://chromium.googlesource.com/chromium/src/+/b7fa44643b64d4ff234b12ddeae2a48ae017fe66/chrome/browser/webauthn/enclave_authenticator_browsertest.cc), [ChromeOS enclave launch cleanup](https://chromium.googlesource.com/chromium/src/+/18efe5c7166f2fa58902e1232dce370b4320abd5).
- WebAuthn authenticators may create discoverable credentials even when `residentKey: 'discouraged'`, and discoverable credentials may replace another credential with the same RP ID and user handle. Leather therefore uses a fresh random user handle for every enrollment and never depends on non-discoverability: [WebAuthn Level 3 user accounts and resident-key requirements](https://www.w3.org/TR/webauthn-3/#user-account).
- Chrome DevTools Protocol virtual authenticators can advertise PRF support, enabling deterministic browser tests: [Chrome DevTools WebAuthn domain](https://chromedevtools.github.io/devtools-protocol/tot/WebAuthn/).

---

## Key Technical Decisions

### KTD-1. Use WebAuthn PRF, not WebAuthn assertion success

The credential's PRF output is the cryptographic input to AES-GCM key unwrapping. Every `navigator.credentials.get()` sets `userVerification: 'required'`; this is a normative Leather requirement even though the WebAuthn PRF extension uses a user-verification-capable PRF. The extension validates that the returned credential ID matches the stored credential and that `getClientExtensionResults().prf.results.first` exists with the expected 32-byte length.

The assertion signature does not need a Leather server because Leather is not using WebAuthn to authenticate an account. Chrome performs the WebAuthn client checks for the supplied options; Leather does not add a second manual parser/verifier for `clientDataJSON`, authenticator-data flags, origin, type, challenge, or the assertion signature. The ability to reproduce the PRF output, pass AES-GCM authentication, and validate the recovered key against the current persisted software-wallet state is the local proof needed to recover the wallet encryption key. U0 must verify that PRF results are stable across repeated `get()` calls that explicitly require user verification and that no certified provider silently falls back to a non-user-verifying ceremony.

### KTD-2. Keep the existing encrypted mnemonic format

The existing mnemonic cipher accepts an explicit 48-byte encryption key. Existing password-backed setups keep deriving that key with Argon2id. Enabling biometrics on such a setup wraps the existing derived key and does not re-encrypt mnemonics. A new biometric-only setup instead generates the 48-byte key uniformly at random and uses the same cipher and encrypted-mnemonic format.

The only planned re-encryption is the user-initiated biometric-only → password-backed transition. After current biometric proof, Leather derives a new key from the new password, decrypts and re-encrypts all software wallets atomically, and replaces the biometric wrapper to protect the new key. A failed transition leaves the original biometric-only setup authoritative.

This avoids:

- Two encrypted copies of every mnemonic.
- Per-wallet encryption modes.
- Per-wallet biometric migrations.
- New recovery semantics.

### KTD-3. Store explicit authentication mode and one optional config inside `softwareKeys`

Add one optional field to the existing persisted software-key slice rather than creating a new Redux slice:

```typescript
interface PlatformUnlockConfig {
  version: 1;
  credentialId: string;
  prfInput: string;
  iv: string;
  wrappedEncryptionKey: string;
}

type WalletAuthenticationMode = 'password' | 'biometric-only';
```

All binary values are base64url encoded for persistence. Config presence means Biometric unlock is On; no separate `enabled` boolean is stored. Add an optional `authenticationMode` field normalized by selectors so existing state with no field remains password-backed. New first-software-wallet creation always writes an explicit mode. Biometric-only mode is valid only with a complete platform config; password mode retains the existing optional salt/legacy migration semantics and may have the optional platform config.

This is the smallest safe state model because the wrapper and mode have the same lifecycle and scope as the shared software-wallet keys. Authentication mode must not be inferred from a missing salt because salt absence already identifies pre-Argon2 legacy wallet records. Making the new mode/config fields optional allows existing persisted state to rehydrate without an eager migration or persistence-version bump.

### KTD-4. Use AES-256-GCM directly with the PRF result

The WebAuthn PRF specification defines a uniformly random 32-byte output intended for use as symmetric key material. Import that result directly as an AES-256-GCM key using Web Crypto. Do not add HKDF unless the security review identifies a concrete need. The security review must explicitly accept direct PRF-key use during U0 before U1 fixes the version-1 schema; do not defer this decision until after implementation: [WebAuthn Level 3 PRF extension](https://w3c.github.io/webauthn/#prf-extension).

Use:

- A fresh 32-byte random PRF input created at enrollment.
- A fresh 12-byte AES-GCM IV, matching the 96-bit IV construction recommended for GCM: [NIST SP 800-38D](https://csrc.nist.gov/pubs/sp/800/38/d/final).
- A fixed versioned additional-authenticated-data value that includes `leather-platform-unlock-v1` and the credential ID.
- AES-GCM authentication failure as a hard biometric-unlock failure.

Do not persist the PRF output or imported `CryptoKey`.

### KTD-5. Capability detection culminates in real enrollment evidence

Static feature checks improve messaging but do not establish support and must not produce false negatives for otherwise-qualified password-manager or enclave providers. Leather may use:

- `window.PublicKeyCredential` presence.
- `PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()`.
- `PublicKeyCredential.getClientCapabilities()` and `extension:prf` where available. Chromium currently reports `extension:prf` as a browser capability rather than evidence about the selected platform provider, so a positive result is advisory only and can never qualify a provider by itself: [Chromium `PublicKeyCredential::OnGetClientCapabilitiesComplete`](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/modules/credentialmanagement/public_key_credential.cc).

The authoritative enrollment check is still a credential response reporting PRF support and a successful PRF evaluation. A supported OS name is never enough. U0 must identify which preflight results, if any beyond WebAuthn absence and the explicit non-Chromium gate, are definitive enough to disable Chromium setup entry points without excluding a qualified provider. A definitive negative changes only entry-point interaction and explanation; it never creates an unavailable destination page.

### KTD-6. Require the currently configured authenticator before changing the wrapper

No prior proof exists or is required when `hasSoftwareKeys` is false; choosing Use biometrics creates the new software-wallet state and its first authenticator atomically. An existing password-backed setup requires the current Leather password before creating or replacing a biometric route. An existing biometric-only setup requires a fresh assertion from its current credential before replacement or before setting a password. An already-unlocked session alone is insufficient because someone with temporary access to an unattended extension could otherwise enroll their own credential.

### KTD-7. One shared hook returns the authenticated wallet encryption key

Introduce a small extension-specific hook or action interface with two methods:

- `authenticateWithPassword(password)`
- `authenticateWithPlatformCredential()`

Both return the verified wallet encryption key or a typed expected-failure result. Platform authentication does not report success from AES-GCM unwrap alone: locked main unlock decrypts and validates every software wallet before session/in-memory writes, while already-unlocked protected actions require equality with the current session wallet encryption key or equivalent persisted-wallet validation. The methods do not return only booleans and do not own navigation or purpose-specific side effects.

Callers decide what to do with the key:

- Main unlock decrypts all software wallets and initializes the session.
- Secret Key confirmation authorizes reveal of the selected wallet.
- Add wallet encrypts and persists the new mnemonic under the existing key.

### KTD-8. Separate first-wallet protection setup from existing-wallet authentication

When `hasSoftwareKeys` is false, keep `SetPasswordPage` as the first-wallet setup surface: its existing password form and Continue action remain primary, and a secondary Use biometrics action branches directly to biometric-only creation. Introduce a separate existing-wallet confirmation presentation for add-wallet flows. This removes the current `hasSoftwareKeys` existing-wallet UI mode switch from `SetPasswordPage`; calling pages choose first-wallet setup or existing-wallet confirmation from actual route/gate context and software-wallet state. Main unlock, Secret Key confirmation, and add-wallet confirmation then share mode-aware authentication without turning one component into a multi-purpose wizard.

### KTD-9. Invoke WebAuthn only from a classified high-intent entry or action

WebAuthn create/get calls start from a user action that logically requests the protected result. The initial locked `action-popup.html` entry created by the toolbar icon or Chrome keyboard shortcut is one such action only when Chrome also classifies the current foreground view as an extension popup and R14 has not suppressed automatic prompting. Before starting WebAuthn, main unlock synchronously records a non-sensitive consumed marker in the current document's history state so React remounts cannot replay the attempt; a new eligible toolbar open creates a new document and can start once. Reuse existing View Secret Key, Add wallet, Continue, Set up biometric unlock, Set up again, and biometric retry actions rather than adding a redundant confirmation click. Explicit actions ignore toolbar suppression. When navigation separates an action from the shared confirmation component, pass only a one-shot start intent. The destination clears the intent before starting WebAuthn and guards against replay. If the intent is carried in React Router navigation state, clearing means replacing the current history entry with the same state minus the intent field, preserving unrelated state such as a selected wallet `fingerprint`; a component ref alone is insufficient. Add/restore-wallet flows do not navigate at this boundary: their start intent and mnemonic remain in React component memory, and the mnemonic is prohibited from router/history state. The entry classification, consumed marker, or start intent is not proof of authentication and never authorizes reveal, unlock, or persistence; only the real PRF-derived wallet encryption key can do that.

Low-intent dapp-created request windows, restored pages, direct URLs, unmarked confirmation routes, and remounts render only configured explicit authentication methods and never invoke WebAuthn on their own. If Chrome refuses or cannot start a marked post-navigation ceremony without transient user activation, the component clears the intent and remains on that mode-appropriate confirmation screen; it does not retry automatically or treat the intent as authentication.

If U0 proves that the toolbar action popup cannot survive an OS ceremony on even one otherwise-qualified launch configuration, the initial toolbar open uses the dedicated-window handoff consistently across the launch matrix rather than adding OS detection. That window loads `index.html#/unlock`, consumes a non-authorizing one-shot start intent before invoking WebAuthn, and continues with full-page navigation semantics without another Leather click. Opening a dapp-request window or an unmarked dedicated/full-page window never prompts. Use the smallest entrypoint check local to main unlock; do not introduce an authenticated ticket, wallet-encryption-key navigation payload, global prompt-policy service, reusable handoff framework, or generalized prompt policy.

### KTD-10. Keep the code extension-specific

Place browser interaction, wrapping, state, UI, and actions under `apps/extension/src`. Do not add code to `@leather.io/services`, `@leather.io/models`, `@leather.io/state`, or `@leather.io/crypto` unless implementation proves a genuinely cross-app primitive is needed. The feature's storage and origin model is specific to the extension.

### KTD-11. Do not gate existing enrolled unlocks on a remote flag

Capability detection is sufficient for the technical feature. If LaunchDarkly is used for rollout, it may hide new enrollment and the first-wallet biometric option, but an existing persisted config must always leave biometric unlock and its configured fallback/recovery reachable. A remote flag must never strand a biometric-only user or make persisted config unusable.

### KTD-12. Do not depend on credential discoverability

Leather stores the credential ID and supplies it in `allowCredentials`, so Leather does not need a discoverable credential. It also cannot require a provider to create a non-discoverable credential. The hardware spike should start with `residentKey: 'discouraged'`, `authenticatorAttachment: 'platform'`, and `userVerification: 'required'`, but treat `discouraged` only as a preference.

Every enrollment invokes `create()` with a fresh user handle and never discovers or adopts an existing Leather credential from the provider. Every unlock supplies exactly one `allowCredentials` descriptor containing the credential ID from that installation's local config. A missing configured credential must fail to mode-appropriate fallback/recovery and must never trigger an empty-`allowCredentials`, discoverable-credential, or conditional-selection fallback. The platform adapter rejects any returned credential ID that does not exactly match the configured ID before using PRF output or attempting key unwrapping. Other stale, foreign-installation/profile, synced-from-another-installation, or orphaned credentials under the same RP remain ineligible and inert.

Choose one credential-creation option set that passes the full launch matrix and accept that qualifying providers may create discoverable, synced, or enclave credentials regardless of the preference. Document the resulting Chrome UI. Enrollment copy must remain accurate whether the provider stores the credential locally or syncs it: the platform credential may sync, but Leather's wrapper and wallet data do not. Do not implement two credential modes in product code.

### KTD-13. Give every enrollment a fresh WebAuthn user handle

Every initial enrollment and Set up again operation generates a fresh random 32-byte `user.id`, uses no personally identifying input, and omits `excludeCredentials`. Leather does not persist the user ID because runtime authentication and best-effort unknown-credential signaling use the credential ID.

This prevents a discoverable credential provider from replacing the old credential before the new wrapper has been durably persisted. It also prevents an independent Leather installation or Chrome profile enrolling under the same extension RP from potentially replacing another installation's synced credential through reuse of the same RP/user-handle pair. The old config and credential remain authoritative until the complete replacement succeeds. A failed create/wrap/persist sequence can leave a cosmetic orphan in the provider, but it cannot invalidate the old Leather unlock path.

### KTD-14. Suppress repeated automatic prompts only for the current extension session

An unambiguous non-cancellation result such as a malformed/invalid config, missing PRF output, or AES-GCM authentication failure sets one `biometricAutoPromptSuppressed: true` value in `chrome.storage.session`. An explicitly distinguishable missing-credential result may do the same. A `NotAllowedError` does not because Chrome may use it for cancellation, timeout, or an unavailable credential. U0 owns the provider-specific result mapping; uncertainty resolves to no suppression.

The flag affects only automatic main-unlock attempts from new toolbar/shortcut opens. Any configured password authentication and explicit Unlock with biometrics or Try biometric unlock again actions ignore it. Biometric success, successful replacement, successful Set a password, Disable, sign-out, extension reload/update, and browser-session end clear it; password success deliberately leaves it set for the current session. Do not add counters, timestamps, cooldowns, persisted local state, credential-health inference, or automatic enrollment changes.

### KTD-15. Generate a random wallet encryption key for biometric-only creation

Use `crypto.getRandomValues` to generate exactly 48 random bytes and encode them in the same hex form the existing encryption library expects. Do not run Argon2id with an empty password, a public salt, or a hidden generated password. The random wallet encryption key exists only in tightly scoped memory, encrypts the first mnemonic through the existing cipher, and is wrapped by the PRF-derived AES-GCM key. All credential/crypto promises must settle before any persistence-affecting Redux dispatch. Then one synchronous dispatch block writes the encrypted wallet, explicit mode, and complete wrapper as one software-key-slice state, followed by one `persistor.flush()`; only after that flush succeeds may the key enter `chrome.storage.session` or decrypted state enter the in-memory store. Failure before or during the flush leaves no session/in-memory key and no intentionally committed partial biometric-only setup.

### KTD-16. Use fresh challenges and non-identifying provider-visible metadata

Every WebAuthn create/get ceremony uses a fresh unpredictable challenge. Required `rp.name`, `user.name`, and `user.displayName` values use generic Leather/environment labels and never include wallet addresses, fingerprints, account names, Secret Key-derived data, or Chrome-profile identifiers. U0 records how multiple current and orphaned Leather credentials appear in Chrome, iCloud Keychain, Google Password Manager, Windows Hello, and ChromeOS provider UI, including any creation-time or device context the provider already supplies. If any certified launch provider leaves registrations indistinguishable enough that a user cannot determine which credential is safe to delete, product must decide before GA whether to add a non-identifying registration tag and the corresponding Leather-side mapping. Do not add or persist that metadata before the U0 evidence and product decision.

### KTD-17. Gate the feature explicitly to Chromium builds

Do not rely on current Firefox API gaps. Expose `TARGET_BROWSER` to extension code through webpack's existing `EnvironmentPlugin`, default it to `chromium` for local builds, and export the normalized value from `apps/extension/src/shared/environment.ts`. First-wallet biometric creation, Settings enrollment, and biometric authentication require that explicit Chromium build/runtime signal before capability checks. CI Firefox builds continue to set `TARGET_BROWSER=firefox`. Add regression coverage that a Firefox build remains password-only when `WALLET_ENVIRONMENT=testing` and WebAuthn globals are mocked as PRF-capable.

### KTD-18. Fail closed on unknown or inconsistent authentication state

Selectors normalize absent `authenticationMode` to password for existing software-wallet states. An unknown mode, biometric-only mode without a complete wrapper, password-backed state that cannot follow its current legacy/salt rules, or a wrapper whose key does not validate against the active persisted software-wallet state is invalid configuration. Password-backed users retain password unlock; biometric-only inconsistent state exposes only guarded reset/recovery. Unknown fields are not silently deleted or overwritten without successful configured-authenticator proof.

---

## Security Posture and Accepted Tradeoffs

- Biometric unlock makes any OS-approved user-verification method for the selected credential, including a screen-lock PIN or password, sufficient to recover Leather's wrapped wallet encryption key. It is an authentication path with the effective strength of the device's screen lock, not fingerprint-only enforcement; for a biometric-only setup it is the sole configured authenticator until the user sets a Leather password. Enrollment copy states that anyone who can unlock the user's account will be able to unlock the wallet.
- A synced platform credential may make the PRF capability available on another device controlled through the provider account. The synced credential alone cannot restore Leather because the encrypted wrapper and wallet data remain local, but compromise of the provider account together with a copy of the extension's persisted wallet state can weaken the password-only threat model. Enrollment and support copy must disclose the local-wrapper/synced-credential distinction.
- Independent machines and Chrome profiles enroll distinct credentials and never adopt another installation's synced credential. Each local config pins one exact credential ID, so other same-RP credentials are not unlock candidates. This normal-installation isolation does not make a stronger claim than the copied-state tradeoff above: a byte-copy of matching Leather state plus access to its synced credential may unlock elsewhere.
- A biometric-only setup deliberately has no Leather-password fallback. If its credential is unavailable while locked, the existing guarded reset and Secret Key restoration flow applies, as it does when a password-backed user cannot use their password. First-wallet setup reuses and minimally adapts the existing password copy about local protection and Secret Key restoration rather than adding a biometric-specific loss warning. Recovery UI must never suggest that a synced credential alone restores the wallet.
- Compromise of trusted extension execution remains outside what this design can protect. Access to an already-unlocked wallet retains the extension's current session capabilities but does not bypass current-authenticator confirmation that protects enrollment, replacement, Set a password, and the covered reauthentication surfaces. The feature adds no plaintext persisted secret and preserves mode-appropriate fallback plus Secret Key recovery.

---

## High-Level Technical Design

### Naming Glossary

- **`platformUnlock` / `PlatformUnlockConfig`:** the versioned persisted mechanism and schema. This is a compatibility-sensitive storage name and should not be renamed casually.
- **Wallet authentication mode / `WalletAuthenticationMode`:** the profile-wide choice between password-backed and biometric-only protection for the encryption key shared by all software wallets. This does not describe Ledger authentication or Leather's multisig Vault product.
- **`wallet-authentication`:** the extension-local code boundary that coordinates the configured password and platform-credential methods for one software-wallet state.
- **Biometric unlock:** the user-facing product language for the platform-credential method, including device-approved fingerprint, face, PIN, or password verification. It is not a separate cryptographic system from platform unlock.

### Persisted State

```text
chrome.storage.local / persisted Redux root
└── softwareKeys
    ├── authenticationMode?          explicit on newly created software-wallet state; absent existing state normalizes to password
    ├── salt?                        password-backed/legacy semantics only
    ├── ids
    ├── entities
    │   └── fingerprint → encryptedSecretKey
    └── platformUnlock?              one optional profile-level config
        ├── version: 1
        ├── credentialId: base64url
        ├── prfInput: base64url
        ├── iv: base64url
        └── wrappedEncryptionKey: base64url
```

### Session-Only State

```text
chrome.storage.session
├── encryptionKey?                        existing unlocked-session secret
└── biometricAutoPromptSuppressed?: true  non-secret UX damping; never durable
```

### First Software Wallet — Password

```text
new password + fresh salt
          │
          ▼
Argon2id derives 48-byte wallet encryption key
          │
          ├── encrypt first mnemonic with existing cipher
          └── persist password mode + wallet atomically
```

### First Software Wallet — Biometric-only

```text
Use biometrics action
          │
          ├── crypto.getRandomValues → random 48-byte wallet encryption key
          └── WebAuthn create/get → 32-byte PRF result
                                      │
                                      ▼
                            AES-256-GCM wrapping key
                                      │
random wallet encryption key ─────────────────────┘
          │
          ├── encrypt first mnemonic with existing cipher
          └── persist biometric-only mode + wallet + complete wrapper atomically
```

### Existing Password Setup Enrollment

```text
existing password
      │
      ▼
Argon2id(password, existing salt)
      │
      ├── must equal current session/wallet encryption key
      │
      ▼
WebAuthn create/get from chrome-extension:// origin
      │
      ├── fresh random challenge every ceremony
      ├── fresh random user.id per create; no excludeCredentials
      ├── generic non-identifying RP/user labels
      │
      ▼
32-byte PRF result ──import──► AES-256-GCM wrapping key
      │                              │
      │                              ▼
      └──────────────────── wrap existing encryption key
                                     │
                                     ▼
                         persist complete config atomically
```

### Biometric-only → Password-backed Transition

The transition has one observable commit point: completion of the persisted software-key-slice flush. Before that flush completes, the old biometric-only ciphertexts, mode, wrapper, and random wallet encryption key are authoritative. After it completes, the new password-backed ciphertexts, salt, mode, wrapper, and password-derived wallet encryption key are authoritative. Session and in-memory replacement happens only after the flush.

A live frame holding the old session key must not turn a fresh correct password or biometric proof into a false failure after the commit. Session-key equality is a fast path only. On mismatch, the authentication boundary validates the freshly derived/unwrapped key by decrypting the current persisted software-wallet state; success repairs `chrome.storage.session` and in-memory state. Until that repair succeeds, the stale frame is forbidden from encrypting or persisting an added wallet. The implementation does not add a general cross-window transaction protocol; it enforces this security boundary around the only feature-specific key transition.

### Runtime Authentication

```text
Protected user intent
├── toolbar icon or Chrome shortcut opens locked action popup
│   ├── automatic prompts allowed → in-place WebAuthn get or certified window handoff
│   │   └── PRF → AES-GCM unwrap → wallet encryption key
│   └── automatic prompts session-suppressed → mode-appropriate explicit fallback
├── existing high-intent protected action
│   └── consumed one-shot start intent
│       └── WebAuthn get → PRF → AES-GCM unwrap → wallet encryption key
└── low-intent entry or post-attempt fallback
    └── RequestWalletAuthentication
        ├── configured password form → Argon2id → verify against persisted wallet/session → wallet encryption key
        ├── Unlock with biometrics / Try biometric unlock again
        │   └── WebAuthn get → PRF → AES-GCM unwrap → validate against persisted wallet data → wallet encryption key
        ├── Forgot password? (password-backed main unlock) → guarded sign-out/reset
        └── Can't use biometrics? (biometric-only main unlock) → guarded sign-out/reset

wallet encryption key
├── main unlock → decrypt all mnemonics + session restore
├── Secret Key → authorize selected mnemonic reveal
└── add wallet → encrypt new mnemonic under existing wallet encryption key
```

### Expected Failure Results

Expected user/platform failures should not throw through React rendering. Use a small typed result vocabulary such as:

- `cancelled`
- `unavailable`
- `credential-not-found`
- `prf-unavailable`
- `authentication-failed`
- `invalid-config`

Unexpected Web Crypto or state-invariant failures may throw within actions and be converted to a generic UI error at the boundary. Never include credential output, PRF bytes, encryption keys, passwords, or mnemonics in error metadata.

The platform adapter may return `credential-not-found` only when Chrome/provider behavior distinguishes it from user cancellation and timeout. An ambiguous `NotAllowedError` maps to the neutral cancellation/timeout path and never changes automatic-prompt suppression. Suppression is enabled only by an allowlist of typed, unambiguous operational results; unknown results fail safe to mode-appropriate explicit fallback without suppression.

---

## Implementation Units

### U0. Validate the cross-platform WebAuthn contract

**Goal:** Remove platform/provider uncertainty before persisted production state is introduced.

**Requirements:** R1, R2, R5, R6, R9, R12, R14–R19

**Dependencies:** None

**Approach:**

- Build the smallest temporary extension-page harness or isolated development route needed to exercise create/get PRF from Leather's real `chrome-extension://` origin.
- Give Chromium spike builds a dedicated, non-secret fixed development manifest `key`, injected only for this harness/build mode, so unpacked reloads reproduce the same development extension ID. Do not reuse production identity material or infer production behavior from a changing unpacked ID.
- Start with `authenticatorAttachment: 'platform'`, `residentKey: 'discouraged'`, `userVerification: 'required'`, `attestation: 'none'`, and omitted RP ID.
- Generate a fresh random challenge for every create/get and use generic environment-appropriate Leather RP/user labels. Inspect both the ceremony UI and provider credential-management UI to ensure no wallet/account identifiers leak and that production, preview, and development credentials are understandable.
- Test the exact preflight gate against every qualified provider. Treat `isUserVerifyingPlatformAuthenticatorAvailable()` and `getClientCapabilities()` as advisory unless the complete matrix proves a result is definitive; a false-negative gate that disables a working Google Password Manager, iCloud Keychain, Windows Hello, or ChromeOS enclave path fails U0. Verify each approved definitive negative produces a noninteractive, focusable, explained entry point rather than navigation or a dead-end page.
- Treat the source-backed expected paths as starting hypotheses: iCloud Keychain or Google Password Manager on macOS, recent native WebAuthn API-v8 Windows Hello or Google Password Manager on Windows, and the Google Password Manager enclave on ChromeOS. Certify rather than infer each actual launch configuration.
- Confirm whether create returns a PRF value or requires a follow-up get.
- Confirm returned PRF bytes remain stable for the same credential/input across repeated `get()` calls with explicit `userVerification: 'required'`, differ for a different input, and are never returned from a non-user-verifying ceremony.
- Create two credentials with distinct random user IDs and no `excludeCredentials`; confirm the second creation leaves the first credential usable. Force failure after the second credential is created and confirm the old config/credential path remains usable.
- Populate the same extension RP with the locally configured credential plus stale, foreign-installation/profile, synced-from-another-installation, and failed-enrollment/orphan credentials. Confirm setup always creates a distinct credential, unlock sends exactly one locally configured ID in `allowCredentials`, and other credentials remain ineligible regardless of provider UI. Simulate a missing target and a mismatched returned `rawId`; confirm neither case issues an empty-allowlist/discoverable fallback or reaches PRF unwrapping.
- With the pinned credential unavailable locally but reachable through another device, record whether Chrome offers hybrid/QR authentication, whether PRF evaluation can complete, and how dismissal settles. Compare an omitted transport hint with a hardcoded `transports: ['internal']` descriptor; do not persist `getTransports()` output. Treat `transports` as a UI-routing hint rather than an authentication boundary, verify that it does not break any qualified local provider, and require an explicit product decision on whether hybrid use is acceptable.
- Record the exact Chrome and OS versions, prompt sequence, authenticator/provider selected, and whether Chrome was signed in.
- Verify prompt timing from Leather's real flows: opening the locked `action-popup.html` entry from the toolbar icon or Chrome keyboard shortcut starts exactly one ceremony, an existing high-intent protected action may supply a consumed one-shot start intent, and a dapp-created request window, restored page, direct URL, unmarked route, or remount never starts a ceremony.
- Explicitly test whether `navigator.credentials.get()` can open the platform ceremony after navigation when the originating click is no longer on the JavaScript stack. Test the actual marked Secret Key and add/restore flows rather than only a same-page harness button.
- Force or simulate post-navigation auto-start rejection and confirm graceful degradation: the marked route clears its intent, remains usable, shows the configured explicit authentication methods, and never retries automatically.
- Test WebAuthn from the toolbar action popup separately from the existing dapp-request `chrome.windows.create` window. If even one otherwise-qualified configuration cannot complete in the toolbar popup, validate and adopt one matrix-wide fallback: the initial toolbar open hands off to a dedicated `chrome.windows.create({ type: 'popup' })` window loading `index.html#/unlock`. Confirm it consumes its one-shot intent, requires no additional Leather click, continues into the wallet, and never prompts from bare dedicated-window opening.
- Prove the action-popup classifier identifies the actual toolbar/shortcut popup but rejects `action-popup.html` opened directly in a normal tab, the dapp-created `popup.html` window, the dedicated fallback window, and full-page extension routes. Test both `chrome.runtime.getContexts({ contextTypes: ['POPUP'] })` and `chrome.extension.getViews({ type: 'popup' })` with the entrypoint check. Prefer `runtime.getContexts` only if it can unambiguously identify the calling context, including when a direct tab and real action popup coexist; otherwise use the identity-comparable `getViews` result. Choose one proven permission-free implementation, not a permanent dual-path abstraction.
- Measure cancellation, explicit OS-dialog close, timeout, and operational-failure settlement on every certified provider. After Chrome settles the request, Leather must leave loading immediately and make mode-appropriate retry/recovery usable. Record any provider that leaves a canceled request pending, define the acceptable wait at U0, and do not ship an indefinite spinner.
- Characterize which provider results are unambiguously non-cancellation failures. Prove that one such failure sets session-only automatic-prompt suppression, the next toolbar open shows mode-appropriate fallback without an OS ceremony, explicit biometric retry still prompts, and cancellation/timeout/ambiguous `NotAllowedError` never suppresses. Verify all specified clear conditions.
- Validate a throwaway biometric-only first-wallet transaction with a random 48-byte key: create credential, wrap key, encrypt a fixture mnemonic, persist all pieces together, unlock, and force failures at every boundary to prove no partial wallet/config/session state survives.
- Obtain security sign-off during U0 on direct 32-byte PRF output as the AES-256-GCM key or choose a versioned KDF before U1 begins.
- Verify that a positive `getClientCapabilities()['extension:prf']` can coexist with a provider that fails real PRF enrollment/evaluation and therefore remains advisory rather than a positive qualification signal.
- Prove the explicit Chromium gate implemented through webpack `EnvironmentPlugin` and `shared/environment.ts` keeps a Firefox build password-only even when `WALLET_ENVIRONMENT=testing` and WebAuthn globals are mocked as PRF-capable. Confirm the local-build default is `chromium` and the CI Firefox value is `firefox`.
- Prove that a CDP PRF-capable virtual authenticator can attach to and exercise Leather's actual `chrome-extension://` Playwright page target. Do not make U6 depend on this harness until the check passes.

**Required matrix:**

- macOS with each offered platform provider relevant to the expected iCloud Keychain/Google Password Manager path and Touch ID where available.
- Windows 11 with recent Windows Hello/native WebAuthn API support and Google Password Manager where offered, using PIN and at least one biometric method when hardware is available.
- Current ChromeOS with Google Password Manager enclave enrollment, PIN, and fingerprint when hardware is available.
- Chrome signed-in and signed-out where the platform permits both.
- Toolbar action popup, existing dapp-request window, and full-page extension tab; if any toolbar configuration requires the fallback, certify the dedicated fallback window across the full launch matrix.
- Automatic action-popup start, marked post-navigation auto-start, and mode-appropriate explicit-button degradation in both presentation modes.
- Password-backed and biometric-only fallback presentations.
- Credential deletion followed by get.
- Multiple same-RP credentials from independent installations/profiles and failed or replaced enrollments, with only the locally pinned credential eligible.
- Pinned credential unavailable locally but reachable through hybrid/QR, tested with omitted transports and `transports: ['internal']`.
- Repeated toolbar opens after both an unambiguous operational failure and an ambiguous `NotAllowedError`.
- Extension reload/update with a stable ID.

**Exit criteria:**

- All three launch operating systems have at least one supported, documented platform configuration that returns PRF successfully.
- The team chooses one credential-creation option set for all platforms.
- The team approves exact privacy-safe RP/user labels, fresh-challenge generation, and the preflight conditions that may definitively disable Chromium biometric entry points without excluding qualified providers.
- Minimum supported Chrome/OS versions and any required Chrome account state are documented.
- Distinct-user-ID replacement has been demonstrated without invalidating the old credential, including a forced failure before the new config is persisted.
- Independent same-RP enrollments coexist without replacement or adoption. Unlock targets exactly one local credential ID, rejects a returned mismatch, and never falls back to an empty allowlist or credential discovery when the target is missing.
- Provider-management UI for multiple Leather credentials is recorded on every certified provider. If any provider lacks sufficient creation-time or device context to make destructive credential management understandable, product explicitly decides before GA whether the feature needs a persisted/displayed non-identifying registration tag.
- Hybrid/QR behavior for a locally unavailable pinned credential is characterized with omitted transports and the `internal` hint. Product explicitly accepts the observed cross-device behavior or certifies a matrix-wide descriptor that suppresses it without breaking qualified local paths.
- On each certified platform, a consumed post-navigation intent either starts one WebAuthn ceremony successfully or degrades deterministically to the configured explicit authentication methods without replay, looping, or loss of recovery.
- Toolbar action popup unlock auto-starts and completes in place on every certified configuration, or the team adopts and certifies the same deterministic dedicated-window handoff across the full matrix. The handoff starts from the toolbar opening action, requires no additional Leather click, and leaves dapp-request and unmarked window opening prompt-free.
- The permission-free action-popup classifier distinguishes real toolbar/shortcut popup views from direct tabs and other extension windows on the complete matrix, and its consumed marker prevents replay within one document while allowing a deliberate close/reopen to start once.
- Cancellation and failure settle into mode-appropriate retry/fallback/recovery in the acceptable time recorded by U0; no certified configuration can leave an indefinite loading state.
- At least one unambiguous operational failure path proves session-only suppression prevents a second automatic OS ceremony while leaving explicit biometric retry and any configured password functional. Ambiguous cancellation/timeout paths never suppress, and every clear condition behaves as specified.
- A biometric-only fixture proves random-key generation, complete atomic persistence, wallet-encryption-key validation, and the absence of password/salt-derived key material.
- Repeated `get()` calls prove stable PRF output only with explicit required user verification on every certified provider.
- Security explicitly accepts direct PRF output as the AES-GCM key or a versioned KDF is chosen before U1.
- Chromium's browser-level `extension:prf` capability is documented as advisory, and qualification still requires a real provider create/get result with PRF evaluation.
- The concrete `TARGET_BROWSER` gate, Chromium local default, and Firefox password-only regression under the testing harness are approved.
- The CDP virtual-authenticator fixture works against the real extension page target, or U6 is replanned with an explicit alternative before U1 begins.
- If ChromeOS support depends on Google Password Manager/enclave enrollment, product copy and support documentation say so before implementation proceeds.
- A macOS-only result does not satisfy the agreed product scope. If Windows or ChromeOS cannot produce PRF in a reasonable, current configuration, stop and return for an explicit product-scope decision; do not silently narrow launch or add an insecure boolean or plaintext-storage fallback.

### U1. Add platform-unlock crypto and persisted config

**Goal:** Implement the minimal, testable cryptographic wrapper, biometric-only random-key path, explicit profile-level authentication state, and prerequisites needed for safe concurrent authentication.

**Requirements:** R6–R8, R11, R15–R19

**Dependencies:** U0

**Files:**

- Create: `apps/extension/src/shared/crypto/platform-unlock.ts`
- Create: `apps/extension/src/shared/crypto/platform-unlock.spec.ts`
- Create: `apps/extension/src/app/common/wallet-authentication/platform-authenticator.ts`
- Create: `apps/extension/src/app/common/wallet-authentication/platform-authenticator.spec.ts`
- Modify: `apps/extension/src/shared/crypto/generate-random-hex.ts`
- Create: `apps/extension/src/shared/crypto/generate-random-hex.spec.ts`
- Modify: `apps/extension/src/shared/crypto/generate-encryption-key.ts`
- Create: `apps/extension/src/shared/crypto/generate-encryption-key.spec.ts`
- Modify: `apps/extension/webpack/webpack.config.base.js`
- Modify: `apps/extension/src/shared/environment.ts`
- Create: `apps/extension/src/shared/environment.spec.ts`
- Modify: `apps/extension/src/app/store/software-keys/software-key.slice.ts`
- Modify: `apps/extension/src/app/store/software-keys/software-key.selectors.ts`
- Modify: `apps/extension/src/shared/crypto/mnemonic-encryption.ts`
- Modify/test: the co-located software-key slice specs

**Approach:**

- Before any U2 path can run concurrent password derivations, fix `deriveEncryptionKey`'s shared-worker response correlation. The current singleton worker registers an enduring listener per call, so two in-flight calls can both resolve from the first response. Use a request-ID protocol, explicit serialization, or a per-call worker, remove/settle each listener exactly once, and add a regression test proving concurrent derivations resolve to their own outputs and failures.
- Define the versioned `PlatformUnlockConfig` and optional `WalletAuthenticationMode` in the extension software-key module. Selectors normalize absent mode on existing state to password without mistaking missing legacy salt for biometric-only mode.
- Make `selectWalletAuthenticationCapabilities` the sole pure Redux interpretation of mode/config combinations. It derives whether password and biometrics are usable and whether persisted authentication state is valid or inconsistent. Any convenience hook must be a thin wrapper over that selector; do not persist redundant capability booleans or put navigation, recovery actions, UI copy, or side effects in it.
- Add reducers/actions that atomically save the first biometric-only wallet plus mode/config, save/replace a complete config, complete biometric-only → password-backed transition, and remove a config only when another authenticator remains.
- Extend `resetWallet` handling and last-software-wallet removal to clear mode/config/salt together. Clearing only mode/config would leave the next first-software-wallet flow with stale password metadata.
- Encode and decode persisted binary config fields with `base64urlnopad` from the extension's existing direct `@scure/base` dependency. Keep any `ArrayBuffer`/`Uint8Array` conversion narrow and do not implement another base64url codec.
- Parameterize the existing `generateRandomHexString` helper as `generateRandomHexString(byteLength = 16)` and use a named 48-byte length for biometric-only wallet encryption keys. Preserve the 16-byte default used by existing salt generation. Generate PRF input, AES-GCM IV, and every WebAuthn challenge/user ID as typed random bytes with `crypto.getRandomValues` where no hex representation is needed.
- Refactor mnemonic encryption narrowly so it accepts an explicit validated wallet encryption key without requiring a meaningless password argument; preserve password and legacy behavior.
- Generate a fresh random 32-byte WebAuthn user ID for every credential creation, use generic non-identifying RP/user labels, omit `excludeCredentials`, and do not persist the user ID or challenge.
- Wrap/unwrap both existing password-derived and new random encryption-key strings with Web Crypto AES-GCM and versioned AAD.
- Validate decoded lengths and version before calling Web Crypto.
- Keep browser credential creation/get separate from pure wrapping functions so crypto tests do not need navigator mocks.
- Require `userVerification: 'required'` in every get option built by the platform adapter. Keep `extension:prf` and `isUserVerifyingPlatformAuthenticatorAvailable()` results advisory; only a real credential result with PRF evaluation proves provider support.
- For biometric-only first-wallet creation, await credential creation/evaluation, random-key generation, wrapping, and mnemonic encryption before any persistence-affecting dispatch. Commit the encrypted wallet, explicit mode, and complete config in one synchronous Redux dispatch block and one persistence flush. Initialize `chrome.storage.session` and the in-memory wallet only after that flush succeeds. Do not copy the current software-wallet thunk ordering that initializes session/in-memory state before persistence.
- Keep the `PublicKeyCredential` object inside the platform adapter. Extract only validated credential ID and PRF bytes; never spread, serialize, structured-clone, send, log, or call `toJSON()` on the credential response.

**Test scenarios:**

- Wrap/unwrap round trip returns the exact encryption key.
- Same PRF result with tampered ciphertext, IV, AAD, or credential ID fails authentication.
- Wrong PRF result fails authentication.
- Invalid base64url, incorrect lengths, and unknown version return invalid-config behavior.
- Two enrollments produce different PRF input and IV.
- Two enrollments produce different challenges and user IDs, omit `excludeCredentials`, use non-identifying labels, and do not persist challenge/user ID.
- The parameterized random-hex helper preserves its 16-byte default and produces an exact 48-byte/96-character hex result when requested. Random biometric-only wallet encryption keys differ across creations and never derive from password/salt input.
- Concurrent `deriveEncryptionKey` calls with different inputs resolve only to their corresponding outputs; one request's success or failure cannot settle another request.
- First biometric-only wallet/mode/config uses exactly one persistence commit/root write after all crypto promises resolve; forced failure before dispatch or during flush leaves no session/in-memory key and no intentionally committed partial wallet, config, mode, or salt.
- Credential-response tests fail if the adapter calls `toJSON()`, passes the credential through structured clone/Redux, or exposes PRF output to logger/error metadata.
- Every get option explicitly requires user verification; mocked positive client capabilities without a successful credential PRF result cannot produce supported/enabled state.
- Every get option contains exactly one `allowCredentials` entry for the configured credential. Missing config never emits a credential-discovery request, and a returned credential-ID mismatch fails before PRF output is used or key unwrapping begins.
- `TARGET_BROWSER` defaults to `chromium` locally, is exposed through the extension environment module, and forces password-only behavior for a testing-environment Firefox build even with mocked WebAuthn/PRF globals.
- Missing mode normalizes existing state to password; unknown or inconsistent mode/config fails closed without deleting data.
- The central capability selector covers absent-mode legacy password state, current password-only state, password plus biometric config, biometric-only state, and unknown/incomplete combinations without duplicating interpretation in consumers.
- Config and mode persist/select correctly.
- `resetWallet` and last-software-wallet removal clear mode/config/salt.
- Removing one of multiple software wallets preserves config.
- Password-backed state cannot remove its salt semantics accidentally, and biometric-only state cannot exist without a complete config.

### U2. Introduce a shared wallet-authentication boundary

**Goal:** Let password and platform-credential authentication return the same verified wallet encryption key without duplicating purpose-specific behavior.

**Requirements:** R3, R4, R6, R8, R14–R18

**Dependencies:** U1

**Files:**

- Create: `apps/extension/src/app/common/wallet-authentication/use-wallet-authentication.ts`
- Create: `apps/extension/src/app/common/wallet-authentication/use-wallet-authentication.spec.ts`
- Modify: `apps/extension/src/app/store/software-keys/software-key.actions.ts`
- Modify: `apps/extension/src/app/store/software-keys/software-key.actions.spec.ts`
- Modify: `apps/extension/src/app/store/software-keys/utils.ts`
- Create: `apps/extension/src/app/store/software-keys/utils.spec.ts`
- Modify: `apps/extension/src/app/store/software-keys/software-key.hooks.ts`
- Modify: `apps/extension/src/app/common/hooks/use-key-actions.ts`
- Modify: `apps/extension/src/app/store/session-restore.ts`
- Create or modify: the co-located session-restore spec

**Approach:**

- Preserve the current legacy/pre-Argon2 password unlock and fingerprint migration logic.
- Route salt-dependent behavior by explicit authentication mode. The existing additional-wallet guard in `software-key.actions.ts` must not reject a valid biometric-only setup merely because it has no salt; `useCheckPassword` must not be the biometric-only authentication gate; and `unlockWalletAction` must enter its missing-salt legacy migration branch only for password mode. A missing salt is never sufficient to infer biometric-only mode.
- Add an action that unlocks encrypted software keys from an already-authenticated encryption key.
- Extract one pure `decryptAllSoftwareKeys` helper that decrypts every current-format software-key ciphertext with an explicit encryption key and returns the complete fingerprint/Secret Key results only after all decryptions succeed. Reuse it from session restore, authenticated-key unlock/validation, and current-format password validation where applicable. Keep the pre-Argon2 password migration branch separate.
- Keep `decryptAllSoftwareKeys` free of store reads, session or in-memory writes, analytics, `identifyUser`, logging, navigation, and error presentation. Session repair and unlock completion remain in the surrounding wallet-authentication orchestration.
- Extract only the smallest common completion operation needed to initialize `chrome.storage.session`, populate the in-memory store, clear/rebuild keychain selector caches as appropriate, and identify the user.
- Limit session-restore refactoring to adopting the pure decrypt-all helper and the exact shared completion operation; do not redesign session persistence.
- Split first-wallet creation from additional-wallet encryption at the action boundary:
  - Password initial creation derives a new key from the new password.
  - Biometric-only initial creation accepts a newly generated random key only as part of the atomic wallet/mode/config operation.
  - Additional wallet creation accepts an already-authenticated existing encryption key.
- `authenticateWithPassword` derives/verifies and returns the encryption key.
- `authenticateWithPlatformCredential` invokes WebAuthn, validates the PRF result, unwraps, validates the key against current persisted software-wallet state/session state, and only then returns it.
- On locked main unlock, decrypt and validate every software key before any session or in-memory write. On already-unlocked Secret Key/add-wallet flows, use equality with the current session key only as a fast path. If it differs, validate the freshly derived/unwrapped key by attempting authenticated decryption against the current persisted software-wallet state; on success, repair `chrome.storage.session` and in-memory state before authorizing the caller.
- Add one guarded transition action for biometric-only → password-backed: current biometric proof, new password derivation, all-wallet decrypt/re-encrypt, biometric rewrap, and complete mode/salt/config/entity preparation occur before one synchronous persisted-state commit and flush. The old persisted software-wallet state is authoritative until the flush succeeds; the new persisted software-wallet state is authoritative afterward. Only then replace session/in-memory state. Do not copy the current thunk ordering that installs a new session key before durable persistence.
- Treat the post-flush key boundary as a write invariant, not only an unlock check. A live frame holding the old key may not encrypt or persist another wallet after the transition. It must obtain fresh password or biometric proof, validate that key against the new persisted ciphertexts, repair its session/in-memory state, and only then continue.
- When `restoreWalletSession` cannot decrypt the current persisted software-wallet state with the stored session key, clear that stale session key before returning locked/fallback state. This fixes later boots but does not replace the live-frame validation/repair rule above.
- Keep cancellation/timeout/ambiguous `NotAllowedError` distinguishable from the allowlisted operational results that may suppress later automatic toolbar attempts; the authentication boundary returns typed results but does not mutate suppression itself.

**Test scenarios:**

- Password unlock continues to cover current and legacy wallets.
- Platform-credential unlock decrypts one and multiple software wallets.
- The pure decrypt-all helper covers one and multiple wallets, preserves each fingerprint, rejects a wrong key without returning partial results, and has no session, store, analytics, or logging side effects.
- A wrong unwrapped key cannot partially populate in-memory state.
- A stale but internally valid wrapper for another persisted software-wallet state cannot authorize Secret Key reveal or add-wallet persistence.
- Biometric-only add-wallet and unlock paths remain valid without a salt, while legacy missing-salt password records still follow the existing migration path.
- No session key is written until every encrypted software key decrypts successfully.
- Additional-wallet encryption with a platform-authenticated key preserves the profile's configured mode: biometric-only remains biometric-only, while password-backed remains unlockable by both methods.
- Biometric-only → password-backed transition re-encrypts every wallet atomically, updates session/config consistently, remains unlockable by both methods, and preserves the original biometric-only state after any forced failure before the persisted commit.
- In a two-live-window transition test, the stale window is forced through both password-authenticated and biometric-authenticated add-wallet paths after the other window flushes the new software-wallet state. Neither path may write under the old key. Fresh proof against the current persisted software-wallet state repairs the stale window, after which the add-wallet write succeeds under the new key; decrypting all persisted wallets with one key proves no mixed-key wallet state was created.
- Session restore with a stale key clears `chrome.storage.session.encryptionKey`, returns to locked/mode-appropriate authentication, and can be repaired by fresh proof.
- Expected cancellation/unavailability results do not throw.
- Ambiguous `NotAllowedError` returns the neutral non-suppressing result, while malformed config, missing PRF, AES-GCM failure, and any provider-proven missing-credential signal retain distinct typed results.
- No sensitive values appear in logger calls.

### U3. Add the Settings enrollment and management page

**Goal:** Provide one permanent management surface to enable, replace, disable, or add a password as allowed by the current persisted software-wallet state mode.

**Requirements:** R2, R3, R5, R9, R11, R14, R16, R18, R19

**Dependencies:** U1, U2

**Files:**

- Modify: `apps/extension/src/shared/route-urls.ts`
- Modify: `apps/extension/src/app/routes/app-routes.tsx`
- Modify: `apps/extension/src/app/pages/settings/menu-buttons.tsx`
- Modify: `apps/extension/src/app/pages/settings/components/settings-button.tsx`
- Create: `apps/extension/src/app/pages/settings/biometric-unlock/biometric-unlock.tsx`
- Create co-located component/spec files only where behavior warrants them
- Modify: `apps/extension/tests/selectors/settings.selectors.ts`

**Approach:**

- Add `/settings/biometric-unlock` under `AccountGate`.
- Add a Biometric unlock settings row gated on `hasSoftwareKeys` and the explicit Chromium gate; hide it for Ledger-only and Firefox state, and keep it visible in mixed Ledger + software state even when the active wallet is Ledger.
- Extend the app-local `SettingsButton` only enough to show a concise right-side status or caption: On, Off, or Unavailable. A definitively unavailable row has no chevron and cannot navigate. Explain it by reusing the existing `BasicTooltip` behavior on hover and keyboard focus; keep the trigger focusable with `aria-disabled` or an equivalent wrapper because a native disabled control cannot expose the tooltip reliably. Do not add a new shared UI primitive or standalone unavailable route state.
- Keep enrollment on one page rather than creating a multi-step wizard.
- Require the correct current password before creation/replacement on password-backed setups. Require current biometric authentication before replacement or Set a password on biometric-only setups. Never accept unlocked session state alone.
- Persist only after PRF evaluation and AES-GCM wrapping both succeed.
- Implement Set up again as atomic replacement using a fresh random challenge/user ID and no `excludeCredentials`; keep the old config authoritative until the complete new config is durably persisted.
- If create completes without a PRF result, offer provider-aware retry guidance rather than declaring the entire device unsupported immediately.
- Implement Disable as a simple confirmed removal only for password-backed setups.
- On biometric-only setups replace Disable with Set a password. After current biometric proof, collect the password through the existing password-strength form and invoke the atomic transition; keep biometrics On afterward so the user may separately disable it.
- Clear session automatic-prompt suppression after successful initial setup/replacement, Set a password, and Disable.
- Clear password field state after every attempt and on unmount.

**Test scenarios:**

- Settings row appears only when software keys exist.
- Settings row and all enrollment entry points remain absent in Firefox even with mocked PRF support.
- Off and On rows navigate and render accurately. A definitively Unavailable row is noninteractive, has no chevron, exposes its explanation to pointer and keyboard users, and never reaches the biometric settings page.
- Wrong password never invokes `navigator.credentials.create()`.
- Biometric-only replacement and Set a password require current biometric proof; session-only access cannot invoke durable changes.
- Cancel leaves state Off and retryable.
- Unsupported PRF leaves state Off with provider-aware retry copy and password behavior unchanged.
- Successful enrollment stores one complete config and no raw secret fields.
- Set up again uses a distinct user ID, omits `excludeCredentials`, and preserves the old working credential/config until replacement succeeds or after a forced replacement failure.
- Successful replacement may best-effort signal the old credential only after the new config persists; unsupported or failed cleanup leaves the new config working.
- Disable removes only config, not wallets or the current session.
- Biometric-only mode never offers Disable without another authenticator.
- Set a password succeeds atomically and changes the mode to password while keeping biometric unlock On; any failure preserves the prior biometric-only setup.
- Successful setup/replacement, Set a password, and Disable clear automatic-prompt suppression; failed or canceled operations do not mutate it.

### U4. Add first-wallet biometric alternative and a shared authentication experience

**Goal:** Let users choose password or biometric-only protection when creating the first software wallet, make biometric unlock automatic from high-intent actions, and keep only configured fallback methods visible.

**Requirements:** R3–R5, R9, R13–R19

**Dependencies:** U2, U3

**Files:**

- Replace/refactor: `apps/extension/src/app/components/request-password.tsx`
- Create: `apps/extension/src/app/components/request-wallet-authentication.tsx`
- Create: `apps/extension/src/app/components/request-wallet-authentication.spec.tsx`
- Create: `apps/extension/src/app/common/wallet-authentication/biometric-auto-prompt.ts`
- Create: `apps/extension/src/app/common/wallet-authentication/biometric-auto-prompt.spec.ts`
- Modify: `apps/extension/src/app/pages/unlock.tsx`
- Modify: `apps/extension/src/app/common/utils.ts`
- Modify: `apps/extension/src/app/pages/view-secret-key/locked-view-secret-key.tsx`
- Modify: `apps/extension/src/app/pages/view-secret-key/view-secret-key.tsx`
- Modify: `apps/extension/src/app/pages/settings/menu-buttons.tsx`
- Modify: `apps/extension/src/app/features/dialogs/switch-account-sheet/switch-account-sheet.tsx`
- Reuse/modify if needed: `apps/extension/src/app/features/settings/sign-out/sign-out-confirm.tsx`
- Reuse/modify if needed: `apps/extension/src/app/features/settings/sign-out/sign-out.tsx`
- Modify: `apps/extension/src/app/features/settings/sign-out/sign-out.utils.ts`
- Modify: `apps/extension/src/app/features/settings/sign-out/sign-out.utils.spec.ts`
- Modify: `apps/extension/src/app/pages/onboarding/set-password/set-password.tsx`
- Modify: `apps/extension/src/app/pages/onboarding/back-up-secret-key/back-up-secret-key.tsx`
- Verify/modify: `apps/extension/src/app/pages/onboarding/sign-in/sign-in.tsx`
- Modify: `apps/extension/src/app/pages/add-wallet/add-wallet.tsx`
- Create: an existing-wallet confirmation component colocated with the add-wallet/set-password flow
- Modify: callers and selectors affected by the component rename

**Approach:**

- When `hasSoftwareKeys` is false, preserve the existing Set a password screen, password field, strength feedback, and solid Continue action as the primary path. Add Use biometrics as a visually secondary action on the same screen. This is an immediate alternative protection method, not a checkbox or promise about a later step. The flow applies on first install, after reset, and from Ledger-only state.
- Apply the same capability presentation used by Settings before first-wallet setup: a U0-proven definitive Chromium negative leaves Use biometrics visible but noninteractive with an accessible tooltip, while advisory or uncertain checks leave it enabled for real provider qualification. Firefox remains password-only. Do not navigate to or render an unavailable page.
- Use biometrics starts create/get from that action without a second Leather click. Cancellation/failure returns to the password-first screen with the mnemonic only in existing component memory and no partial software-wallet state. Continuing with a password follows the current password creation path unchanged.
- Reuse the existing Set a password description and minimally adapt it where generic wording is needed: the configured unlock method protects the Secret Key on this device, and the Secret Key is needed to access the wallet on another device. Do not add a biometric-only credential-loss warning to setup or Settings.
- Preserve the current password form, Enter-key behavior, and Continue action wherever password is configured.
- Main unlock, Secret Key confirmation, add-wallet confirmation, Settings, and mode-aware recovery/sign-out presentation consume the central wallet-authentication capability selector or its thin hook. Do not repeat mode/config interpretation in those surfaces.
- Let each caller decide whether a high-intent action supplies the shared confirmation component with a one-shot start intent. For main unlock only, use the permission-free action-popup classifier proven in U0: require both the `action-popup.html` entrypoint and Chrome's actual extension-popup view context so that the same URL opened in a tab remains low intent. Do not add a global prompt-policy state machine.
- Before the automatic action-popup attempt, synchronously mark the current history entry as consumed while preserving unrelated router state. A React ref may guard duplicate calls within one mount but is not the cross-remount control. The marker is local, non-authorizing, non-secret, and naturally disappears with the popup document.
- When locked Leather opens through `action-popup.html` with usable enrollment and no session suppression, consume that high-intent entry once and start biometric unlock immediately. Do not render an intermediate Unlock with biometrics button and do not add an Ask on launch preference.
- Keep session suppression in one tiny extension-local helper over `chrome.storage.session`; do not place it in persisted Redux, a shared package, or a general prompt-policy service. Read it before the automatic toolbar attempt only. Explicit biometric actions do not consult it.
- If U0 requires the toolbar action fallback, the initial action-popup open creates one dedicated real Chrome window using `index.html#/unlock`, passes only a consumed one-shot start intent, and lets the full-page-mode success route continue into the wallet. Do not load `popup.html` or `action-popup.html` in that fallback window because their popup-mode unlock completion uses history-back behavior.
- View Secret Key and final add/restore-wallet actions pass a one-shot start intent to the existing shared confirmation behavior when enrolled. They do not authenticate independently in each originating component.
- The shared confirmation component consumes and clears the start intent before invoking WebAuthn, then owns success, cancellation, retry, configured password fallback, and guarded recovery exactly as it does after an explicit Unlock with biometrics or Try biometric unlock again action.
- For React Router state, consume by replacing the current history entry with the same state minus the intent before starting the asynchronous ceremony. Preserve unrelated state, especially the selected wallet `fingerprint`. A ref may prevent duplicate work within one mount but does not replace history and is not sufficient replay protection.
- For add/restore wallet, keep the one-shot intent and mnemonic in existing React component memory. Clear the intent before WebAuthn and prohibit the mnemonic from React Router state, history, Redux, or Chrome storage.
- Account for `BackUpSecretKeyPage` being mounted under both `OnboardingGate` and `AccountGate`, and for `SignIn` being onboarding-only. Select first-wallet password setup with its biometric alternative versus existing-wallet authentication from actual route/gate context and `hasSoftwareKeys`, then use persisted authentication mode only after a software-wallet state exists.
- If post-navigation invocation is rejected or cannot open the Chrome/OS ceremony without transient activation, clear the intent and keep the confirmation screen mounted with the configured explicit methods. Do not automatically retry from the original intent.
- A start intent is not authenticated state. It never bypasses the PRF result, never crosses persisted Redux or Chrome storage, and never carries a password, PRF result, wallet encryption key, mnemonic, or success boolean.
- Use the smallest local prop or transient navigation-state shape needed by the existing flow. Do not create a reusable authorization ticket, global grant registry, or authentication-handoff framework.
- Directly opened or restored confirmation routes render only configured explicit authentication methods and never invoke WebAuthn on mount.
- After cancellation, a password-backed setup shows/focuses its password field and labels retry Try biometric unlock again. A biometric-only setup shows Try biometric unlock again without a password field. Neither uses error styling or invalid-password copy.
- After a non-cancellation platform failure, use the same mode-appropriate layout with neutral failure copy. Keep technical details out of the UI. Set suppression only for allowlisted unambiguous results.
- On password-backed main unlock show Forgot password?. On biometric-only main unlock show Can't use biometrics?. Both reuse the existing guarded `SignOut`/`SignOutSheet` flow and per-wallet Secret Key backup confirmations.
- Make each sign-out backup acknowledgement mode-aware. Password-backed wallets preserve the existing password wording; biometric-only wallets use equivalent biometric wording and never claim that a Leather password exists. Keep the same unchecked acknowledgements, disabled-until-complete destructive action, and multi-wallet behavior rather than creating a second recovery flow.
- Treat reopening Leather from the toolbar icon or Chrome shortcut as one new high-intent opportunity. Start a new automatic attempt only when session suppression is absent. Do not replay on rerender, remount within the same open, browser history, or route restoration.
- When usable config exists, biometric unlock is automatic only for high-intent entry/actions; mode-appropriate explicit methods are primary after cancel/failure and on low-intent entries.
- When config is absent or unusable before prompting, password-backed setups render the password form. Inconsistent biometric-only state fails closed to guarded recovery without inventing a password path.
- Keep prompt copy purpose-specific through props:
  - Main unlock: Unlock Leather.
  - Secret reveal: Confirm it's you to view your Secret Key.
  - Add wallet: Confirm it's you to add this wallet.
- Treat user cancellation neutrally.
- Keep Unlock with biometrics or Try biometric unlock again available on mode-appropriate fallback screens.
- Explicit biometric success clears session suppression. Password success leaves it unchanged. Successful Set up again, Set a password, Disable, and sign-out also clear it through their existing lifecycle actions.
- Ensure loading state prevents double WebAuthn requests.
- Start at most one WebAuthn ceremony per qualifying action and abort or settle it before another can begin.
- Preserve route return, popup/full-page behavior, keyboard submit, accessibility labels, and focus management.

**Test scenarios:**

- Opening locked Leather through `action-popup.html` starts exactly one biometric-unlock ceremony without an intermediate Leather click when session suppression is absent.
- With no software wallet, first-install, post-reset, and Ledger-only add-wallet flows show the same password-first setup: the password form and Continue are primary, while Use biometrics is secondary and starts one ceremony.
- A U0-proven definitive Chromium negative leaves both permanent enrollment entry points visible but noninteractive with accessible tooltip copy; neither can navigate to an unavailable page. Advisory results remain actionable, and Firefox renders neither entry point.
- Cancel/failure during first-wallet biometric setup returns to the password-first setup screen with no persisted wallet/mode/config/session key and no mnemonic in route/history/Redux/storage.
- Existing View Secret Key and final add/restore actions start one platform ceremony without a redundant intermediate click.
- Opening a dapp request window, restored/direct page, or unmarked confirmation route does not start a ceremony until the user selects Unlock with biometrics.
- When U0 requires it, the toolbar opening action hands off to one `index.html` dedicated window, starts one ceremony there, and continues into the wallet without another Leather click; opening the same window without a consumed intent remains prompt-free.
- A marked navigation consumes its start intent once; back/forward navigation, route restoration, remount, and retry do not replay the ceremony.
- Consuming a navigation-backed intent replaces only the intent field before `navigator.credentials.get()` runs and preserves the selected wallet `fingerprint`.
- Rejection caused by unavailable post-navigation activation clears the intent and renders configured explicit methods without a loop or error dead end.
- A forged or stale start intent cannot reveal a Secret Key or add a wallet without a valid PRF result and wallet encryption key.
- Cancel returns password-backed setups to password plus Try biometric unlock again/Forgot password?, and biometric-only setups to Try biometric unlock again/Can't use biometrics? without a password field; cancellation has no error styling.
- Operational failure returns to the same screen with neutral failure copy.
- Password submission and Enter-key behavior continue to succeed without a separate Use password action.
- Forgot password? and Can't use biometrics? open the existing guarded sign-out/reset confirmation and cannot delete wallet state without the current backup acknowledgements.
- Sign-out acknowledgements use password wording only for password-backed setups and biometric wording for biometric-only setups; both require every software wallet acknowledgement before Sign out is enabled.
- Password-only existing software-wallet states remain password-first; no-software-wallet flows present password-first setup with a secondary biometric alternative; invalid biometric-only state fails closed to guarded recovery.
- After cancellation, closing and reopening the toolbar popup starts one new attempt; rerenders and remounts within the same open do not.
- An unambiguous operational failure sets session suppression, and subsequent toolbar opens show mode-appropriate explicit methods without WebAuthn until the flag is cleared.
- Ambiguous `NotAllowedError`, cancellation, and timeout do not set suppression.
- Explicit Try biometric unlock again bypasses suppression; success clears it, while password success leaves it set.
- Repeated clicks cannot create overlapping credential requests.
- Secret reveal still targets the selected non-active wallet in multi-wallet flows.
- Add-wallet cancellation writes no wallet state, leaves the mnemonic flow retryable in component memory, and never puts the mnemonic in router/history state.
- First-wallet create/restore through `BackUpSecretKeyPage` and `SignIn` presents password-first setup with a secondary biometric alternative, while existing-wallet create/add routes use the shared mode-aware authentication component.

### U5. Add analytics, lifecycle handling, and safe recovery behavior

**Goal:** Make support and rollout observable without collecting authentication material or adding state complexity.

**Requirements:** R8, R11, R14

**Dependencies:** U3, U4

**Files:**

- Modify: `packages/analytics/src/events.ts`
- Modify: extension analytics call sites
- Modify/test: software-wallet removal and sign-out paths if U1 cannot contain all lifecycle behavior

**Approach:**

- Add all new events to the `Events` object-action framework in `packages/analytics/src/events.ts`, not `HistoricalEvents`, and follow the repository's `{object}_{action}` naming convention.
- Record coarse events only:
  - Biometric unlock enrollment started/completed/failed.
  - Biometric unlock attempt started/completed/canceled/failed.
  - Password fallback used.
  - Biometric unlock disabled or replaced.
- Enrollment-started events may include one allowlisted source: `first_software_wallet` or `settings`. Do not implement launch-interstitial analytics in this scope.
- Failure properties use a small allowlisted category, never raw DOMException messages or credential metadata.
- Do not include OS biometric type, credential ID, PRF availability bytes, password data, encryption data, wallet fingerprints, or Secret Key information.
- Confirm sign-out and last-wallet removal clear config, explicit authentication mode, and salt; a later first software wallet presents password-first setup with the biometric alternative again and cannot inherit stale password metadata.
- Confirm sign-out and last-wallet removal clear automatic-prompt suppression; manual Lock preserves it for the current extension session.
- Document that sign-out or replacement may leave a cosmetic provider credential when best-effort Signal API cleanup is unavailable; cleanup failure never blocks local state removal or replacement.
- Confirm lock leaves config intact.
- Confirm password success after biometric-unlock failure never silently changes enrollment state.
- Confirm a biometric-only setup cannot remove its only authenticator and that Set a password requires current biometric proof.
- Do not add a separate suppression analytics event or property; the existing allowlisted failure category and later password/biometric outcome are sufficient.

### U6. Complete automated and hardware verification

**Goal:** Prove security, compatibility, and regression behavior before rollout.

**Requirements:** All

**Dependencies:** U0–U5

**Files:**

- Extend: `apps/extension/tests/specs/settings/settings.spec.ts`
- Extend: `apps/extension/tests/specs/settings/wallet-lock.spec.ts`
- Extend: `apps/extension/tests/specs/security/password-memory-leak.spec.ts`
- Extend: `apps/extension/tests/specs/switch-account/multiwallet-integrity.spec.ts`
- Modify page objects/selectors as needed
- Add a focused biometric-unlock E2E spec and WebAuthn virtual-authenticator fixture

**Approach:**

- Use co-located Vitest specs for pure crypto, state, actions, hooks, and UI behavior.
- Mock only browser WebAuthn boundaries in unit tests.
- Use Chrome DevTools Protocol's virtual authenticator with PRF support for end-to-end enrollment and authentication.
- Reuse the CDP-on-`chrome-extension://` target approach proven by U0; if U0 cannot prove it, use the explicit alternative recorded at the gate rather than assuming the fixture works.
- Retain manual testing on real hardware because a virtual authenticator cannot validate system-dialog UX, provider selection, or actual OS capability.
- Extend security coverage to confirm raw password and known PRF/encryption-key sentinel values are not present after lock and garbage collection, where heap-test stability permits.
- Inspect `chrome.storage.local` and `chrome.storage.session` directly in E2E to prove only expected wrapped/session values exist.

**Automated scenarios:**

- After the user enters a password and continues, existing first-wallet password creation and encryption behavior remain unchanged.
- No-software-wallet flows present password creation as primary and Use biometrics as secondary on first install, after reset, and from Ledger-only state; Firefox and definitively unsupported Chromium configurations remain on the existing password-only screen.
- Biometric-only first-wallet creation uses a random 48-byte key, atomically persists wallet/mode/config, unlocks without a Leather password, and leaves no partial state after failures at every boundary.
- WebAuthn create/get uses fresh challenges and non-identifying RP/user labels and never persists challenge/user ID.
- Enrollment rejects wrong password.
- Enrollment succeeds with a PRF-capable virtual authenticator.
- Replacement uses a distinct user ID with no exclude list and a forced failure preserves the old credential/config.
- Lock then opening `action-popup.html` starts one biometric-unlock attempt and succeeds without an intermediate click.
- Cancel and operational failure settle on the mode-appropriate explicit methods with correct neutral copy; password fallback succeeds only when configured.
- An unambiguous operational failure sets only the session suppression boolean; the next toolbar open skips WebAuthn, explicit retry bypasses suppression, biometric success clears it, and password success preserves it.
- Cancellation, timeout, and ambiguous `NotAllowedError` never set suppression.
- Dapp-created request windows, restored/direct routes, and remounts do not auto-prompt.
- `action-popup.html` opened in a normal tab does not auto-prompt; the actual toolbar/shortcut popup does.
- Forgot password? and Can't use biometrics? open the same guarded sign-out/reset confirmation and preserve all backup acknowledgements.
- Secret Key reveal requires and accepts platform confirmation.
- Additional wallet can be authorized by biometric unlock and preserves password-backed or biometric-only mode.
- A stale wrapper that unwraps successfully but does not match the active persisted software-wallet state/session cannot authorize unlock, Secret Key reveal, or add-wallet persistence.
- Biometric-only Set up again requires current biometric proof; Set a password rekeys every wallet and rewraps biometrics atomically; the old state survives forced failures.
- A biometric-only setup cannot Disable its sole authenticator.
- Multi-wallet state, custom names, and hidden accounts survive biometric unlock.
- Cross-window lock clears session state and both windows show locked authentication UI.
- Enrollment or replacement persisted in one extension window becomes available in another live extension window through the existing cross-frame storage synchronization, without reload or duplicate enrollment.
- Sequential cross-window propagation is covered; simultaneous conflicting writes to the whole `softwareKeys` slice remain an acknowledged pre-existing storage limitation and do not trigger a new merge framework in this feature.
- Missing/tampered/unknown/inconsistent config falls back safely according to mode without silently deleting state or inventing a password path.
- Sign-out clears config/mode/salt and a newly created wallet cannot reuse them.
- Removing the final software wallet clears config/mode/salt; creating the next first software wallet presents password-first setup with the biometric alternative.
- Replacement, Set a password, Disable, sign-out, and final software-wallet removal clear suppression; extension-session reset clears it naturally.
- Unsupported PRF never shows a successful enrollment.

**Manual scenarios:**

- macOS provider selection, Touch ID, and provider-aware retry behavior across the certified iCloud Keychain/Google Password Manager paths.
- Windows Hello PIN, fingerprint, and face where hardware is available.
- ChromeOS PIN and fingerprint where hardware is available.
- Current Chrome stable and the oldest Chrome version chosen in U0.
- Chrome signed-in/signed-out or managed-profile constraints found in U0.
- Automatic toolbar action popup, no-additional-click dedicated `index.html` fallback when required, full-page options route, and existing dapp-request window.
- Cancel/failure settlement timing, password-backed autofocus/fallback, biometric-only retry/recovery, and guarded reset behavior on every certified provider.
- Browser restart and extension update.
- Credential deletion from the OS/password manager.
- Repeated toolbar opens after credential deletion, covering both providers that return an unambiguous failure and those that collapse it into `NotAllowedError`.
- OS user-verification lockout and recovery.
- Screen-reader announcement, keyboard navigation, focus return, and high zoom.

---

## Test Strategy

### Unit tests

- Co-locate `*.spec.ts`/`*.spec.tsx` with each new module.
- Prefer function-reference `describe` blocks and behavioral `test` names.
- Test pure AES-GCM wrapping without mocking Web Crypto.
- Mock only `navigator.credentials`, `PublicKeyCredential` capability methods, Chrome storage, and analytics boundaries.
- Cover both success and every expected failure result.

### Integration/action tests

- Extend the existing software-key action tests rather than building a parallel software-wallet fixture system.
- Verify atomicity: partial multi-wallet decryption cannot create a partially unlocked in-memory store or session.
- Verify password and biometric-unlock paths produce equivalent unlocked post-state.
- Instrument persistence to verify biometric-only first-wallet creation performs one complete software-key-slice commit/root write after all crypto awaits and initializes session/in-memory state only after flush.
- Verify biometric-only first-wallet creation and biometric-only → password-backed transition preserve all-or-nothing wallet/mode/config/session state.
- Run the biometric-only → password-backed transition with two live frames. After the new software-wallet state flushes, force the stale frame through password and biometric add-wallet authorization; assert no old-key write occurs, fresh proof repairs the frame, and every persisted wallet decrypts under the single new key.
- Verify biometric-only paths bypass password/salt-only guards, legacy missing-salt password paths retain migration behavior, and last-wallet removal clears salt/mode/config together.
- Verify concurrent Argon2 derivations cannot cross-resolve worker results.
- Verify existing legacy encryption migration still occurs only through password unlock before device enrollment.

### Playwright E2E

- Add one reusable PRF-capable virtual-authenticator fixture through CDP.
- Use the extension-target fixture shape proven in U0 rather than introducing a second WebAuthn harness.
- Keep selectors role-based where possible and extend existing Settings selectors only for stable page-level hooks.
- Reuse current onboarding and multi-wallet page objects.
- Reuse the existing cross-frame persistence behavior to test that a platform-unlock config written in one live extension page is adopted by another live page.
- Do not use `force: true` for WebAuthn or fallback UI interactions.
- Keep real-OS prompt validation out of headless CI and in the recorded hardware checklist.

### Security assertions

- No raw password in persisted storage.
- No empty, hidden, generated, or persisted pseudo-password is used for biometric-only key generation.
- No PRF output in persisted or session storage.
- No `PublicKeyCredential` response is serialized, structured-cloned, logged, or passed through Redux; `toJSON()` is never called on a response containing PRF results.
- No unwrapped key in persisted storage.
- Biometric-only wallet encryption key comes from 48 random bytes and is recoverable only through the complete platform wrapper.
- Wrapped key cannot be decrypted with a different PRF result or modified metadata.
- A successfully unwrapped key cannot authorize any protected result until it validates against the active persisted software-wallet state/session.
- After a wallet-encryption-key transition commits, a stale session key cannot encrypt or persist another wallet; fresh proof against persisted ciphertext repairs the session instead of falsely failing.
- A fresh user ID plus omitted `excludeCredentials` prevents replacement enrollment from invalidating the old credential before durable persistence.
- Lock clears `chrome.storage.session.encryptionKey` and all in-memory mnemonics.
- Automatic-prompt suppression is absent from persisted local/Redux state; when present in `chrome.storage.session`, it is exactly one boolean and never contains a credential identifier or failure detail.
- Content scripts cannot invoke the extension-origin credential; credential operations originate from trusted extension pages.
- Analytics and logging contain only allowlisted event categories.
- Firefox remains password-only under `WALLET_ENVIRONMENT=testing` independently of mocked WebAuthn capability, while local builds default `TARGET_BROWSER` to `chromium`.

### Required repository verification after implementation changes

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm knip
pnpm --filter @leather.io/extension lint:unused-exports
```

Run focused extension tests during each implementation unit, followed by relevant Playwright suites and the full required verification before handoff.

---

## System-Wide Impact

### Extension manifest

- No new permission.
- No native host.
- No CSP exception.
- No externally connectable origin.
- A `minimum_chrome_version` is added only if U0 shows that capability detection alone produces unacceptable UX on an older supported Chrome version.

### Persisted data

- One optional explicit authentication-mode field and one optional versioned platform config are added inside the already-persisted `softwareKeys` slice.
- Existing users require no data migration.
- Existing state with no mode normalizes to password-backed without confusing pre-Argon2 missing-salt state with biometric-only state.
- Password-backed unlock remains able to ignore an unknown/invalid biometric-unlock config. Inconsistent biometric-only state fails closed to guarded reset/recovery and is not silently deleted.
- Sign-out removes mode/config through existing wallet reset.
- Provider credential cleanup is best-effort and may leave a cosmetic orphan after sign-out, replacement, or a failed enrollment without retaining Leather wallet access.
- Automatic-prompt suppression is not persisted with wallet data. It exists only as one optional boolean in `chrome.storage.session` and disappears with the extension session.

### Bundle/runtime

- Uses built-in WebAuthn and Web Crypto APIs; no new cryptographic dependency.
- Password Argon2 behavior and the encrypted mnemonic cipher/format remain unchanged. Biometric-only setups supply a random 48-byte key to that existing cipher.
- Platform authentication runs only in visible extension pages, not the service worker.

### Other Leather applications

- No mobile changes.
- No web-app changes.
- No shared package API changes unless implementation uncovers a concrete reusable primitive.

---

## Alternative Approaches Considered

### A. Native macOS/Windows helper via native messaging

Rejected by product requirement. It would provide deeper OS-specific control but require a signed installer, native host registration, update channel, new extension permission, and platform-specific support burden.

### B. Hosted HTTPS WebAuthn bridge or Leather backend

Rejected. Chrome extension origins can call WebAuthn directly. A hosted bridge would add network availability, server trust, privacy, account/recovery design, and a new attack surface without solving a current limitation.

### C. Treat a successful WebAuthn assertion as authorization

Rejected. A boolean success cannot decrypt the local encrypted wallet data. Storing an unprotected encryption key and revealing it after a boolean check would let extension-storage access bypass user verification. PRF-backed authenticated unwrapping is required.

### D. Store the Leather password in a browser or OS password manager

Rejected. Chrome extensions do not have a portable API to retrieve an arbitrary password only after platform verification, and this would retain the password rather than minimize its use.

### E. WebAuthn `largeBlob`

Rejected for the initial design. PRF directly produces wrapping material and is explicitly intended for client-side encryption. `largeBlob` support and storage semantics vary by authenticator and would introduce another persistence mechanism.

### F. Per-wallet device credentials or wrapped keys

Rejected. Leather deliberately shares one encryption key across all software wallets. Per-wallet credentials would create extra prompts, state, removal edge cases, and inconsistent unlock behavior.

### G. A new Redux slice, shared service, or cross-app package

Rejected as unnecessary. The config belongs to the existing extension software-wallet state, and browser WebAuthn orchestration is app-specific.

### H. Automatically open the OS prompt from every window or route

Rejected as a global policy. The initial locked `action-popup.html` entry from the toolbar icon or Chrome keyboard shortcut is deliberately classified as high intent and auto-prompts when it has not been session-suppressed after an unambiguous failure; existing View Secret Key and final Add wallet actions remain explicit and always prompt. Dapp-created request windows, restored pages, direct URLs, unmarked routes, and remounts stay prompt-free and require an explicit Unlock with biometrics action. This narrow entrypoint distinction plus one session boolean avoids a general launch-prompt state machine.

### I. Reuse a recent biometric result for several minutes

Rejected for the initial version. It adds timers and a new security policy while weakening the existing expectation that each Secret Key visit requires confirmation.

### J. Add a future-facing biometric checkbox to password creation or unlock

Rejected. When no software wallet exists, password creation remains primary and biometrics is a secondary alternative current protection method, not a promise to enable something later. Existing password-backed users manage biometrics intentionally in Settings.

### K. Derive biometric-only encryption from an empty or hidden password plus salt

Rejected as insecure or misleading. Salt is public, so an empty password would make the wallet encryption key reproducible from persisted state. A hidden generated password would either need unsafe persistence or become an unrecoverable proxy for a random key. Generate the 48-byte wallet encryption key directly with `crypto.getRandomValues` and wrap it with PRF instead.

---

## Risks & Mitigations

### Risk 1 — PRF capability differs by platform authenticator/provider

**Mitigation:** U0 validates real devices and account states. Production enables only after actual PRF evidence, not OS detection. Password remains available for password-backed creation and fallback, while biometric-only creation is hidden when capability is not qualified.

### Risk 2 — Biometric language could imply fingerprint-only enforcement

**Mitigation:** Use Biometric unlock in product UI, pair it with Use your device's fingerprint, face, PIN, or password, and mention OS examples in explanatory copy. Never claim fingerprint-only enforcement.

### Risk 3 — Credential is deleted or becomes inaccessible

**Mitigation:** Keep configured fallback visible and preserve config after individual failures. Password-backed users retain password plus Set up again/Disable. Biometric-only users get retry, guarded recovery, and Set up again/Set a password only after current biometric proof. Setup reuses the existing local-protection and Secret Key restoration message without a biometric-specific loss callout. Never suppress from ambiguous `NotAllowedError`, cancellation, or timeout.

### Risk 4 — Extension ID changes

**Mitigation:** Production Web Store updates preserve ID. Treat preview/dev builds as independent. Include stable-ID reload/update testing in U0.

### Risk 5 — Synced passkey semantics confuse local wallet recovery

**Mitigation:** Explain that the system credential may be synced by Chrome, the OS, or a password manager, while biometric unlock still works only where Leather's local encrypted wrapper and wallet state exist. It does not replace Secret Key backup. Do not promise local-only or non-discoverable credential storage; use one creation option set and write enrollment copy that remains accurate for a discoverable synced credential.

### Risk 6 — A temporary unlocked-session user enrolls their own credential

**Mitigation:** Require the currently configured authenticator: password for password-backed enrollment/replacement and current biometric credential for biometric-only replacement/Set a password. Never accept unlocked session state alone.

### Risk 7 — Partial multi-wallet unlock

**Mitigation:** Decrypt and validate every software key before writing session/in-memory post-state. Treat any failure atomically.

### Risk 8 — Sensitive data retained in JS memory

**Mitigation:** Avoid React/Redux state for passwords, PRF outputs, and encryption keys; scope buffers tightly; import PRF bytes into a non-extractable Web Crypto key; clear references immediately; extend heap/storage security tests. Acknowledge that JavaScript cannot guarantee physical memory zeroization.

### Risk 9 — Remote rollout disables an enrolled path

**Mitigation:** Do not remotely gate authentication for existing configs. A flag may control only new enrollment visibility.

### Risk 10 — Last-wallet removal leaves stale wallet-protection metadata

**Mitigation:** Tie config, explicit mode, and salt lifecycle to the `softwareKeys` entity count and test last/non-last removal explicitly, including a remaining Ledger-only profile.

### Risk 11 — Recovery copy implies the wrong secret restores another device

**Mitigation:** State that the Leather password is only a configured fallback in this profile and the Secret Key is required to restore elsewhere. Password-backed main unlock uses Forgot password?; biometric-only uses Can't use biometrics?. Both reuse guarded reset and backup acknowledgements. Never advertise password, biometric unlock, or a synced passkey as wallet backup.

### Risk 12 — System prompt UX differs between popup and full-page mode

**Mitigation:** Test toolbar action popup, existing dapp-request window, and full-page mode on all launch platforms. The toolbar opening action auto-starts once; other calls remain attached to existing high-intent actions through a consumed one-shot intent or to explicit biometric actions. If a toolbar popup cannot survive the OS ceremony, that opening action hands off once to a dedicated real Chrome window loading `index.html#/unlock`; no additional Leather click is required, and dapp-request or unmarked window rendering remains prompt-free. Duplicate or replayed requests are prevented, and cancellation/failure settlement is certified so no mode remains indefinitely blocked.

### Risk 13 — Replacement credential creation invalidates the old credential before persistence

**Mitigation:** Generate a fresh random user ID for every enrollment/replacement, omit `excludeCredentials`, and keep the old config authoritative until the new config is durably persisted. U0 and automated tests force failure between create and persist and prove the old credential still works.

### Risk 14 — Device PIN or synced provider account weakens the password-only threat model

**Mitigation:** Treat any OS-approved screen-lock method as sufficient platform verification, avoid fingerprint-only claims, show the accurate fingerprint/face/PIN/password supporting copy, and disclose that the credential may sync while Leather state remains local. Password exists only for password-backed setups; Secret Key recovery remains required for all setups.

### Risk 15 — Concurrent extension frames write the same persisted slice

**Mitigation:** Use and test the existing cross-frame synchronization for normal sequential enrollment, replacement, and wallet operations. Whole-slice concurrent-write conflict resolution is a pre-existing limitation; do not add a new persistence protocol to this feature.

### Risk 16 — Biometric-only creation persists a partial or unrecoverable wallet state

**Mitigation:** Complete every credential and crypto await before persistence, dispatch the encrypted wallet/mode/config as one complete software-key-slice state, perform one persistence flush, and initialize session/in-memory secrets only after it succeeds. Instrument the persistence boundary and force every boundary to fail in tests; no earlier step may expose success or a usable session.

### Risk 17 — Biometric-only → password-backed transition partially rekeys a multi-wallet state

**Mitigation:** Require current biometric proof, decrypt/validate all wallets first, prepare every replacement ciphertext and new wrapper in memory, commit mode/salt/entities/config together, flush, and only then replace session/in-memory state. The old persisted software-wallet state is authoritative before flush and the new software-wallet state afterward. A stale frame cannot write with its old key; fresh proof validates against persisted ciphertext and repairs the frame. Two-window tests assert that both password and biometric add-wallet paths refuse old-key writes and that every final ciphertext uses the new key.

### Risk 18 — Authentication mode conflicts with legacy missing-salt state

**Mitigation:** Use an explicit mode field normalized by selectors; never infer biometric-only from salt absence. Test legacy/no-mode, current password, biometric-only, unknown mode, and incomplete wrapper combinations.

### Risk 19 — Capability checks or Firefox accidentally expose an unsupported path

**Mitigation:** Feed `TARGET_BROWSER` through webpack with a local `chromium` default and gate before advisory capability checks. U0 proves which checks can definitively disable Chromium biometric entry points, treats `extension:prf` as browser-only advisory evidence, and runs Firefox regressions under the testing environment with mocked PRF support while requiring password-only behavior.

### Risk 20 — Concurrent password derivations resolve with the wrong worker result

**Mitigation:** Fix the existing singleton Argon2 worker's request correlation before U2 can introduce additional concurrent derivations. Each request must receive exactly its own success/failure result and release its listener or worker; a concurrent-resolution regression test lands with the fix.

---

## Open Questions

### Resolved During Planning

- Desktop/native companion → prohibited; extension-only.
- Browser support → Chrome only at launch.
- OS intent → macOS, Windows, and ChromeOS minimum supported configurations.
- U0 failure posture → U1 does not begin and launch pauses for an explicit product-scope decision; a partial macOS-only or passing-OS launch is not pre-authorized.
- First software-wallet protection → whenever `hasSoftwareKeys` is false, preserve password creation as the primary path and offer Use biometrics as a secondary alternative on the same screen; this is independent of install age or Ledger presence.
- Password fallback → preserved only for password-backed setups. Biometric-only setups have no Leather password and use guarded Secret Key reset/recovery if the credential is unavailable.
- Enrollment authorization → no prior proof when creating the first software wallet; current Leather password for an existing password-backed setup; current biometric credential for biometric-only replacement or Set a password; unlocked session alone is insufficient.
- Reauthentication coverage → main unlock, Secret Key reveal, and additional software-wallet authorization.
- Credential scope → one per Leather profile's shared software-wallet state, not per wallet.
- Prompt timing → the toolbar icon/Chrome shortcut opening locked `action-popup.html`, View Secret Key, final Add wallet/Continue, and biometric retry are high-intent. Eligible toolbar opens and every explicit protected action start one attempt; dapp-created request windows, restored/direct pages, unmarked routes, and remounts are low-intent and never auto-prompt.
- Broken-credential damping → one `chrome.storage.session` boolean suppresses only later automatic toolbar attempts after an unambiguous operational failure; there are no counters, timers, durable health state, or effect on explicit retry/configured password.
- Toolbar popup fallback → if required by any otherwise-qualified U0 configuration, use the same no-additional-click real extension window and full-page entrypoint across the launch matrix rather than adding OS detection; existing dapp-request windows need certification but no special handoff.
- Replacement identity → fresh random WebAuthn `user.id` for every enrollment, no `excludeCredentials`, no persisted user ID, and old config authoritative until durable replacement.
- Credential discoverability → Leather does not depend on non-discoverability and implements only one creation mode; the provider may create or sync a discoverable credential.
- Expected qualified paths → iCloud Keychain/Google Password Manager on macOS, recent API-v8 Windows Hello/Google Password Manager on Windows, and Google Password Manager enclave on ChromeOS; U0 certifies exact configurations.
- Authentication cache/grace period → no.
- Launch behavior → enabling Biometric unlock implies one automatic attempt when the user opens locked Leather from the toolbar icon or Chrome shortcut unless a deterministic failure has suppressed automatic attempts for the current extension session; do not add an Ask on launch preference.
- Cancellation/failure fallback → password-backed setups show password, biometric retry, and Forgot password?; biometric-only setups show retry and Can't use biometrics? without a password field; cancellation is neutral and operational failure gets concise non-technical copy.
- Additional unlock-screen impression metric → no for this feature; existing password-unlock events plus the planned biometric-attempt and fallback events cover rollout, while auto-lock remains a separate product decision.
- Product language → Biometric unlock; Set up biometric unlock; Unlock with biometrics; Try biometric unlock again; Use your device's fingerprint, face, PIN, or password.
- Permanent discovery → the secondary biometric action on first-software-wallet password setup plus Settings only. The launch marketing interstitial is separate and temporary.
- Biometric-only key source → fresh random 48-byte wallet encryption key, never empty/hidden password plus salt.
- Biometric-only opt-out → current biometric proof followed by Set a password and an atomic all-wallet rekey; Disable is unavailable while biometrics is the sole authenticator.
- Chrome-only behavior → explicit Chromium gate; Firefox stays password-only regardless of future/mocked PRF capability.
- Recovery language → password unlocks only a password-backed local profile; the Secret Key restores on another device.
- New backend or permission → no.

### Must Be Resolved by U0

- Exact minimum Chrome, Windows, macOS, and ChromeOS versions.
- Which advisory capability/preflight results, if any, are definitive enough to disable Chromium biometric entry points without excluding a qualified provider.
- Exact generic `rp.name`, `user.name`, and `user.displayName` values and how they appear in provider credential-management UI.
- Whether every launch provider supplies enough creation-time or device context to distinguish multiple Leather registrations safely; if not, whether a non-identifying registration tag and Leather-side mapping are required before GA.
- Whether `residentKey: 'discouraged'` works as the one harmless preference across the complete launch matrix; Leather does not rely on the result being non-discoverable.
- Whether any supported platform requires a second verification prompt during enrollment to evaluate PRF.
- The exact signed-in, enclave-enrollment, and managed-profile conditions under which the expected ChromeOS Google Password Manager path works.
- Whether each toolbar action popup can complete the automatically started ceremony in place or must use the predefined no-additional-click dedicated-window fallback.
- Whether `runtime.getContexts({ contextTypes: ['POPUP'] })` can identify the calling popup unambiguously across the impostor/concurrent-context matrix; otherwise use the proven `extension.getViews({ type: 'popup' })` identity comparison.
- Acceptable cancellation/failure settlement latency for each certified provider and whether any provider requires a bounded UI timeout or abort treatment to avoid an indefinite loading state.
- The exact allowlist of provider results that are unambiguously safe to use for session-only automatic-prompt suppression; ambiguity must remain non-suppressing.
- Whether the CDP PRF virtual authenticator works against the actual extension page target used by Playwright.
- The exact Chrome prompt text and whether the extension's name is displayed clearly for its RP identity.
- Whether a locally unavailable pinned credential causes hybrid/QR presentation, whether hardcoded `transports: ['internal']` suppresses it without breaking qualified local providers, and whether product accepts any remaining cross-device behavior.
- Security acceptance of direct PRF output as the AES-GCM key; if rejected, the versioned KDF choice before U1.
- Proof that fresh random challenges are used and discarded for every create/get.
- Proof that the explicit Chromium gate keeps Firefox password-only.
- Proof that biometric-only first-wallet atomicity and the Set a password all-wallet rekey fail safely at every persistence boundary.

### Non-Blocking Implementation Details

- Final icon for the Settings row, using an existing `@leather.io/ui` icon.
- Final short tooltip copy for each definitively unavailable entry-point reason and final set-up-again copy.
- Whether password-backed Disable uses an inline confirmation or existing confirmation-sheet primitive; it should remain one lightweight confirmation, not authentication.
- Whether an enrollment-only LaunchDarkly flag is operationally useful.

---

## Delivery & Rollout

### Phase 0 — Compatibility spike

Complete U0 and publish the support matrix before introducing persisted user state. U1 does not start until all three required OS families have a passing qualified configuration or product explicitly changes the requirement.

### Phase 1 — Internal implementation

Implement U1–U4 with unit and virtual-authenticator coverage. Use local/development builds only.

### Phase 2 — Security and hardware validation

Complete U5–U6, including real macOS, Windows, and ChromeOS verification and storage/heap inspection.

### Phase 3 — Limited enrollment rollout

If a staged rollout is required, gate only new Settings enrollment and the first-wallet Use biometrics option. Existing enrolled configs, especially biometric-only setups, must continue to render biometric unlock and configured recovery regardless of flag state.

Monitor only aggregate enrollment completion, biometric-attempt success/cancellation/failure category, and password-fallback use. Do not collect credential or wallet identifiers.

### Phase 4 — General availability

Enable Settings enrollment and the first-wallet secondary biometric alternative for all capability-qualified Chrome users on the certified OS matrix. Publish support copy explaining the actual fingerprint/face/PIN/password possibilities, password-backed versus biometric-only fallback, Secret Key recovery, local/profile limitations, and that deleting a synced provider credential from another device may disable biometric unlock on the installation that owns it.

### Rollback

- Stop new enrollment first.
- Leave existing biometric unlock operational whenever possible.
- Stop offering biometric-only creation before disabling any runtime path. Password fallback protects password-backed setups; biometric-only setups must retain working biometric authentication or guarded Secret Key recovery.
- Never delete the platform config merely because a remote flag changes or one assertion fails.
- If the config schema itself must be retired, require successful currently configured authentication and ensure a biometric-only setup is transitioned to password-backed or reset/restored before removing its sole wrapper.

---

## Estimated Scope

| Workstream                                                                                               |                                                                Estimate |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------: |
| Cross-platform extension-origin PRF and biometric-only atomicity spike                                   |                                                    5–7 engineering days |
| Crypto wrapper, explicit mode, random-key path, Argon2 worker correlation, validation, and rekey actions |                                                   8–11 engineering days |
| First-wallet biometric alternative and Settings mode management                                          |                                                    5–8 engineering days |
| Shared mode-aware authentication UI and protected surfaces                                               |                                                    6–8 engineering days |
| Unit, integration, and virtual-authenticator E2E                                                         |                                                   7–10 engineering days |
| Hardware QA, security review, rollout hardening                                                          |                                                    5–8 engineering days |
| **Total**                                                                                                | **Approximately 8–11 engineer-weeks, plus hardware/release scheduling** |

The approximately 8–11 engineer-week estimate reflects the 36–52 engineering-day line-item range and assumes U0 passes on all three required OS families. The increase over the password-backed-only design covers first-wallet biometric creation, explicit mode handling, mode-specific recovery, wallet-encryption-key validation, and the failure-safe Set a password rekey. Calendar duration may be shorter only through parallel staffing; that does not reduce engineering effort. If Windows or ChromeOS fails the compatibility gate, implementation stops after the 5–7 day spike and the delivery estimate is suspended until product changes scope or the external capability changes.

The scope assumes one experienced extension engineer with review support and access to representative macOS, Windows, and ChromeOS hardware. It does not include a native helper, mobile work, auto-lock redesign, or a formal third-party security audit.

---

## Definition of Done

- A complete, reviewed U0 support matrix covers macOS, Windows, and ChromeOS.
- U0 uses a stable dedicated development extension ID and records the exact qualified Chrome, OS, provider, and account-state combinations.
- U0 approves direct PRF output or a versioned KDF before U1, proves fresh challenges and required-user-verification PRF stability, treats browser-level `extension:prf` as advisory, certifies preflight checks without false-negative qualified providers, and proves the concrete Chromium/Firefox gate.
- U0 proves biometric-only random-key creation and all-or-nothing persistence, fresh-user-ID replacement leaves the old credential working, validates the toolbar-popup ceremony or predefined no-additional-click fallback, selects a permission-free popup classifier, and proves the CDP virtual authenticator against the real extension target.
- Biometric unlock is implemented entirely inside the Chrome extension without new manifest permissions or network dependencies.
- Whenever no software wallet exists, including post-reset and Ledger-only state, the existing password form and Continue action remain primary and Use biometrics is available as a secondary alternative on the same screen. No separate choice screen, checkbox, or post-onboarding enrollment prompt is introduced.
- U0-proven definitive Chromium capability failures make Settings and first-wallet biometric entry points noninteractive and accessible with explanatory tooltips on their existing surfaces; they never navigate to an unavailable page. Advisory results do not disable setup, and Firefox remains password-only.
- Password first-wallet creation preserves the current Argon2id behavior. Biometric-only creation uses a fresh random 48-byte key and the existing mnemonic cipher, never an empty/hidden/generated password plus salt.
- Concurrent Argon2 derivations are request-correlated before U2; one worker result cannot resolve another derivation.
- No prior proof is required when creating the first software wallet. Existing password-backed setups require the current password for enrollment/replacement; biometric-only replacement and Set a password require current biometric proof; unlocked session alone is insufficient.
- Explicit authentication mode and one optional platform config are stored with the software-wallet state. Existing absent-mode state normalizes to password without confusing legacy missing-salt state.
- One pure capability selector owns mode/config interpretation for every authentication surface; no consumer persists or independently derives redundant capability state.
- Leather's existing random-hex helper and `@scure/base` codec are reused; no parallel random-key or base64url utility is introduced. One pure decrypt-all helper centralizes current-format all-wallet validation while legacy password migration remains separate.
- Main unlock, Secret Key reveal, and additional-wallet authorization all offer biometric unlock when enrolled.
- Selecting the toolbar icon or Chrome shortcut to open locked `action-popup.html` starts exactly one biometric attempt without an intermediate Leather click when not session-suppressed. Cancellation/failure settles on password/retry/Forgot password? for password-backed setups and retry/Can't use biometrics? without a password field for biometric-only setups.
- An unambiguous operational failure sets only a `chrome.storage.session` suppression boolean, later toolbar opens skip automatic WebAuthn, and explicit retry/configured password remain functional. Ambiguous `NotAllowedError`, cancellation, and timeout never suppress; all clear conditions are covered.
- Existing high-intent Secret Key and add/restore-wallet actions supply a consumed one-shot start intent to the shared confirmation behavior, while dapp-created request windows, restored/direct pages, unmarked routes, and remounts never trigger a prompt by themselves.
- Start intent cannot replay on navigation or substitute for the real PRF-derived wallet encryption key.
- Navigation-backed intent is removed from current history before WebAuthn starts without dropping unrelated state such as wallet `fingerprint`, and a rejected post-navigation auto-start degrades to configured explicit authentication methods without retrying automatically.
- Add/restore-wallet intent and mnemonic remain in React component memory; no mnemonic enters router/history state.
- Every create/get uses a fresh random challenge. Every enrollment/replacement uses a fresh random user ID, generic non-identifying RP/user labels, omits `excludeCredentials`, and keeps old config authoritative until durable replacement.
- Independent installations and profiles always create distinct credentials. Unlock supplies exactly one locally configured credential ID, rejects mismatches before PRF use, and never falls back to discovering or selecting another same-RP credential.
- Duplicate-credential and provider-management tests cover the locally configured, stale, foreign-installation/profile, synced-from-another-installation, and orphaned registrations. U0 resolves whether existing provider metadata is sufficient or a mapped non-identifying registration tag is required before GA.
- U0 records hybrid/QR behavior for an unavailable pinned credential and product explicitly accepts it or certifies an `internal`-hint configuration that suppresses it without breaking qualified local providers.
- Password fallback remains reachable and preserves current submission, keyboard, and navigation behavior only where a password is configured. Biometric-only UI never implies or renders one.
- Main unlock's Forgot password? and Can't use biometrics? actions reuse the existing guarded sign-out/reset confirmation and Secret Key backup acknowledgements.
- Every platform-recovered key validates against the current persisted software-wallet state before unlock, reveal, or persistence; a stale but internally valid wrapper cannot authorize another persisted software-wallet state. Session-key mismatch falls back to persisted-wallet validation and repairs stale session/in-memory state on successful fresh proof.
- Biometric-only Set up again requires current biometric proof. Set a password atomically re-encrypts every software wallet under the new password-derived key, updates mode/salt/wrapper/session consistently, keeps biometrics On, and preserves old state before the commit point. After commit, no stale frame can write with the old key; two-window password and biometric add-wallet tests prove repair without a mixed-key wallet state.
- A biometric-only setup cannot Disable its sole authenticator.
- Unsupported or missing PRF capability cannot produce an enabled or successful state.
- No raw password, PRF result, mnemonic, or unwrapped encryption key is persisted or logged. WebAuthn credential responses containing PRF output are never serialized, structured-cloned, passed through Redux, or converted with `toJSON()`.
- No credential metadata beyond the required credential ID is persisted; no user handle, challenge, failure detail, counter, timestamp, or suppression state enters durable wallet storage. Session suppression is one non-secret boolean only.
- Sign-out and last-software-wallet removal clear mode/config/salt; lock preserves configured mode/config. Creating the next first software wallet presents password-first setup with the biometric alternative again.
- Guarded sign-out uses mode-aware acknowledgements: password wording for password-backed setups and biometric wording for biometric-only setups, with the same per-wallet backup requirements.
- Existing password, legacy migration, session restore, multi-wallet, Ledger, and Firefox behavior remain green.
- Automated Vitest and Playwright coverage passes, including PRF virtual-authenticator flows.
- Cross-window coverage proves a config persisted in one live extension frame is adopted by another.
- Manual hardware verification passes on the certified macOS, Windows, and ChromeOS matrix.
- Security review approval is complete before U1 and the implemented version-1 crypto matches that approved direct-PRF or KDF design.
- All required repository verification commands pass.
