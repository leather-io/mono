---
title: 'Biometric unlock U0 compatibility results'
type: spike-results
status: passed-macos-development-gate
date: 2026-08-06
---

# Biometric unlock U0 compatibility results

## Gate decision

The revised macOS development gate passes. The local U1-U6 implementation and automated production-flow verification are complete for the macOS working-version handoff.

The reusable extension-origin harness and all locally automatable checks described below pass. Manual testing in installed Chrome proves the core real macOS iCloud Keychain and Touch ID path, including stable PRF evaluation, input separation, mapped registration tags, multiple registrations, orphan safety, the encrypted-wallet fixture, toolbar-popup lifetime, cancellation settlement, missing-pinned-credential behavior, explicit retry, and local-only routing without QR or external security-key fallback. Production password-backed and biometric-only flows pass with a PRF-capable virtual platform authenticator. Real-provider production-flow qualification, release-version qualification, and Windows validation remain rollout work.

## Product scope decision

On 2026-08-06, product explicitly changed the development qualification requirement: a passing real macOS provider configuration is sufficient to continue implementation toward a working version. Windows validation is deferred until that working version is ready for an external tester. ChromeOS is not part of the current development gate. This decision does not claim Windows or ChromeOS compatibility and does not remove the remaining cryptographic, provider-behavior, popup-lifetime, cancellation, or recovery requirements.

After Apple Passwords proved that three generic-label registrations were indistinguishable, product approved a mapped non-identifying registration tag. Each new provider-visible user label uses `Leather biometric unlock test · XXXXXX`, where the six-character suffix is random and excludes ambiguous characters. Leather persists and displays the same tag with the pinned local credential. The tag contains no wallet, account, fingerprint, Chrome-profile, or Secret Key-derived data.

Product also approved `transports: ['internal']` for the macOS working version after real testing proved it succeeds through iCloud Keychain and avoids the omitted-transport QR/security-key fallback. Windows validation will reconsider this provisional routing hint before compatibility is claimed.

## U0 cryptographic decision

The implementation security review accepts the WebAuthn PRF's direct 32-byte output as the non-extractable AES-256-GCM key for version 1. The WebAuthn Level 3 specification defines each credential PRF as a uniformly selected 32-byte function output and explicitly identifies client-side symmetric encryption as a motivating use. WebAuthn also context-separates PRF inputs before authenticator evaluation. The wrapper uses one fresh random PRF input per credential, one fresh 12-byte IV per encryption, and versioned AAD binding the credential ID and approved registration tag. Adding a KDF would not add entropy or necessary domain separation for this single scoped use. The credential response and PRF bytes remain adapter-local and are never serialized or made extractable.

- WebAuthn PRF: <https://w3c.github.io/webauthn/#prf-extension>
- Web Crypto AES-GCM: <https://w3c.github.io/webcrypto/#aes-gcm>

Following this decision, the production implementation added the version-1 platform-unlock schema, atomic persisted authentication state, password-backed and biometric-only wallet modes, shared unlock/authentication UI, Settings enrollment and recovery, lifecycle handling, and production E2E coverage.

## Checkout

- Worktree: `/Users/alex/code/stacks-labs/leather-biometric-unlock`
- Branch: `feat/biometric-unlock`
- Base and initial `HEAD`: `4976c2a753617340411d115b49657b70219f9106`
- Node: `v22.23.2`
- pnpm: `10.33.0`

## Harness

The U0 harness is included only when `BIOMETRIC_UNLOCK_U0=true`.

- Build: `pnpm --filter @leather.io/extension build:u0:biometric`
- Test: `pnpm --filter @leather.io/extension test:u0:biometric`
- Fixed development extension ID: `kdmjaicljefdpoacaidpmbigaecgohci`
- Full-page entry: `chrome-extension://kdmjaicljefdpoacaidpmbigaecgohci/index.html`
- Toolbar entry: `chrome-extension://kdmjaicljefdpoacaidpmbigaecgohci/action-popup.html`
- Dapp-window-shaped entry: `chrome-extension://kdmjaicljefdpoacaidpmbigaecgohci/popup.html`
- Development RP/user labels: `Leather biometric unlock test`
- RP ID: omitted from create/get options; Chromium bound the virtual credential to `chrome-extension://kdmjaicljefdpoacaidpmbigaecgohci`
- Creation options: platform attachment, discouraged resident key, required user verification, no attestation, no exclude list, fresh 32-byte challenge, fresh 32-byte user ID
- Assertion options: required user verification, fresh 32-byte challenge, exactly one local credential ID, optional operator-selected `internal` transport hint, no discovery fallback
- Ceremony timeout under test: 120 seconds

The harness never displays, logs, or persists a credential response, PRF output, random wallet encryption key, fixture mnemonic, or unwrapped key. The only durable harness values are credential IDs, PRF inputs, authenticated wrapper fields, fixture ciphertext, and explicit biometric-only fixture mode. The only session value used by the fixture is a non-secret readiness boolean.

## Automated environment

| Item                          | Value                                                                            |
| ----------------------------- | -------------------------------------------------------------------------------- |
| Host OS                       | macOS 27.0, build 26A5388g, arm64                                                |
| Installed Google Chrome       | 150.0.7871.187                                                                   |
| Real platform provider        | iCloud Keychain through Apple Passwords with Touch ID; Chrome signed into Google |
| Playwright Chrome for Testing | 145.0.7632.6                                                                     |
| Virtual authenticator         | CTAP 2.1, internal, resident-key capable, user verification enabled, PRF enabled |
| Extension origin              | Real unpacked `chrome-extension://` target with fixed development ID             |

## Passing automated evidence

| U0 property                            | Evidence                                                                                                                                                                                                                                                                                              |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stable extension identity              | The fixed public manifest key produces `kdmjaicljefdpoacaidpmbigaecgohci`; the E2E test asserts the ID.                                                                                                                                                                                               |
| No new permission                      | The U0 manifest retains `contextMenus`, `storage`, `unlimitedStorage`, and `notifications`; no permission was added.                                                                                                                                                                                  |
| Real extension target                  | CDP `WebAuthn.enable` and a PRF-capable virtual authenticator attach to the loaded `chrome-extension://.../index.html` page and complete create/get.                                                                                                                                                  |
| Fresh creation inputs                  | Unit tests prove challenges, user IDs, and PRF inputs differ between creation requests.                                                                                                                                                                                                               |
| Privacy-safe metadata                  | Unit and CDP tests prove generic labels and no explicit RP ID, wallet ID, address, fingerprint, account name, or Chrome-profile identifier.                                                                                                                                                           |
| Required user verification             | Every generated create/get option explicitly uses `userVerification: 'required'`.                                                                                                                                                                                                                     |
| PRF stability and separation           | Repeated get with the same credential/input returns identical output; a fresh input returns different output.                                                                                                                                                                                         |
| Creation-time PRF variance             | The adapter accepts creation output or performs exactly one pinned follow-up get when creation omits the result.                                                                                                                                                                                      |
| Multiple same-RP credentials           | Two distinct credentials coexist; every create has a fresh user ID and no exclude list.                                                                                                                                                                                                               |
| Failed replacement/orphan safety       | Forced failure after a third credential is created leaves the second local config byte-for-byte unchanged and the previous credential usable.                                                                                                                                                         |
| Exact local pinning                    | Assertions contain exactly one allowed credential. Removing the pinned credential does not adopt either remaining same-RP credential. Switching deliberately to the previous local config restores success.                                                                                           |
| Returned mismatch rejection            | A unit test proves a returned raw-ID mismatch fails before extension results are read.                                                                                                                                                                                                                |
| No credential serialization            | Credential doubles expose `toJSON()` spies; create/get success and mismatch paths never call them. No credential object crosses storage, Redux, worker, or logger boundaries in the harness.                                                                                                          |
| Direct PRF AES-GCM mechanics           | A 32-byte PRF result imports directly as a non-extractable AES-256-GCM key. Round trip succeeds; wrong PRF, credential-ID/AAD tampering, and ciphertext tampering fail.                                                                                                                               |
| Random biometric-only key fixture      | Each fixture uses 48 fresh random bytes encoded as 96 hex characters. The authenticated wrapper contains a 12-byte IV and a 112-byte GCM ciphertext/tag for the 96-character key.                                                                                                                     |
| Existing mnemonic cipher compatibility | The random key encrypts and decrypts a known fixture through `@stacks/encryption`. Separate transactions produce distinct IVs, wrappers, and mnemonic ciphertexts.                                                                                                                                    |
| Persistence ordering                   | The complete fixture mode, encrypted wallet, and wrapper are written together. The simulated session readiness value is written only after persistence succeeds and is not written after a forced persistence failure.                                                                                |
| Storage inspection                     | E2E inspection finds biometric-only mode and wrapped/ciphertext fields, but no mnemonic, password, salt, PRF output field, or wallet-encryption-key field. Session storage contains one readiness boolean only.                                                                                       |
| Popup classification                   | `chrome.extension.getViews({ type: 'popup' })` identity classifies an actual `chrome.action.openPopup()` action popup as true while the same `action-popup.html` URL opened in a tab is false. `runtime.getContexts()` evidence is displayed for comparison but is not used as the identity decision. |
| Remount marker                         | Unit coverage proves the history marker consumes once and preserves unrelated state such as `fingerprint`.                                                                                                                                                                                            |
| Normal Chromium isolation              | A normal testing build has no manifest key and contains no U0 harness copy or entrypoint.                                                                                                                                                                                                             |
| Firefox isolation                      | A `TARGET_BROWSER=firefox` testing build has no manifest key and contains no U0 harness copy or entrypoint.                                                                                                                                                                                           |

## Passing real macOS evidence

| U0 property                   | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Preflight                     | Installed Chrome reported WebAuthn present, UVPAA `true`, and `extension:prf` `true`. The full-page entry reported action path false, real popup view false, and zero popup contexts. These values remain advisory.                                                                                                                                                                                                                                         |
| Provider and account state    | Chrome 150 was signed into Google, but credential creation and evaluation selected iCloud Keychain through Apple Passwords and required Touch ID.                                                                                                                                                                                                                                                                                                           |
| Required-verification PRF     | Creation succeeded from the real extension origin with one Touch ID prompt, proving iCloud Keychain returned the creation-time PRF result without a follow-up assertion. Pinned evaluation succeeded; repeated evaluation with the same input was stable; alternate input produced a different output.                                                                                                                                                      |
| Transport routing             | Pinned evaluation succeeded with both the transport hint omitted and `transports: ['internal']`.                                                                                                                                                                                                                                                                                                                                                            |
| Multiple registrations        | iCloud Keychain accepted three distinct registrations for the extension origin. The active and previous local registrations remained present.                                                                                                                                                                                                                                                                                                               |
| Provider management           | Apple Passwords displayed three separate passkeys, but every entry had the same extension origin and `Leather biometric unlock test` username. The only visible creation/modified metadata was `Today`; no entry exposed a distinguishing registration or device label. The active, previous, and orphan registrations could not be told apart.                                                                                                             |
| Registration tag              | A rebuilt enrollment displayed the same random six-character tag beside Leather's active local registration and in the Apple Passwords username. The tagged entry was distinguishable from all three original generic entries and could be deleted precisely.                                                                                                                                                                                               |
| Orphan safety                 | A forced failure after the third credential creation left the prior active credential usable. Swapping back to the previous local credential also succeeded.                                                                                                                                                                                                                                                                                                |
| Biometric-only fixture        | Real Touch ID evaluation created and persisted the encrypted fixture, then unwrapped and validated it successfully with `Fixture wallet validation: true`.                                                                                                                                                                                                                                                                                                  |
| Toolbar action popup          | Opening the real action popup from the harness and clicking the Leather toolbar icon both auto-started exactly one Touch ID ceremony without another Leather click. The popup remained alive and completed pinned evaluation.                                                                                                                                                                                                                               |
| Non-toolbar entries           | `action-popup.html` opened in a normal tab reported action path true and real popup view false without auto-prompting. `popup.html` opened directly reported real popup view false and did not auto-prompt. The full-page `index.html` entry also remained non-automatic.                                                                                                                                                                                   |
| Cancellation and retry        | Cancelling the initial iCloud Keychain sheet opened Chrome's passkey chooser. The chooser showed the `Leather biometric unlock test` Apple Passwords registration under `On this device` and a `Use a phone, tablet, or security key` route under `On other devices`. Cancelling that chooser settled to the neutral unusable-PRF message without closing the extension popup or auto-retrying. Explicit pinned evaluation then succeeded through Touch ID. |
| Missing pinned credential     | After deleting only the tagged active passkey, pinned evaluation did not offer or adopt any of the three remaining same-origin generic Leather passkeys. Chrome offered only phone/tablet QR and security-key routes. Cancelling left the assertion unsuccessful.                                                                                                                                                                                           |
| Local-only missing credential | Repeating the deleted pinned-credential assertion with `transports: ['internal']` failed without displaying the phone/tablet QR or external security-key fallback.                                                                                                                                                                                                                                                                                          |

## Final focused command results

```text
pnpm --dir apps/extension exec vitest run src/u0-biometric-unlock-harness/entry-classifier.spec.ts src/u0-biometric-unlock-harness/webauthn-prf.spec.ts src/u0-biometric-unlock-harness/fixture-transaction.spec.ts
3 files passed, 16 tests passed

pnpm --filter @leather.io/extension typecheck
passed

pnpm --filter @leather.io/extension lint
passed

pnpm --filter @leather.io/extension test:u0:biometric
1 Playwright test passed; U0 extension build completed with existing size warnings

pnpm --filter @leather.io/extension test:biometric
3 Playwright tests passed: password-backed enrollment/unlock/disable, first-wallet biometric-only creation/unlock, and a two-live-page biometric-only-to-password transition

pnpm --filter @leather.io/extension test:unit
106 files passed, 712 tests passed

pnpm --filter @leather.io/extension exec vitest run src/app/store/software-keys/software-key-state.spec.ts src/app/store/software-keys/software-key.actions.spec.ts src/app/store/cross-frame-persistence.spec.ts
3 files passed, 51 tests passed

pnpm --filter @leather.io/extension build:ext:test
normal Chromium build passed; no U0 key or harness content

pnpm --dir apps/extension exec playwright test tests/specs/settings/wallet-lock.spec.ts
2 Playwright tests passed

TARGET_BROWSER=firefox pnpm --filter @leather.io/extension build:ext:test
Firefox build passed; no U0 key or harness content
```

## Repository verification

```text
pnpm format
passed

pnpm lint
passed

pnpm typecheck
passed

pnpm knip
passed

pnpm --filter @leather.io/extension lint:unused-exports
passed; 0 modules with unused exports
```

## Real-provider matrix

| OS         | Chrome/provider configuration                                                      | Account state             | Result                               | Blocking evidence still required                                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------- | ------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| macOS      | Chrome 150.0.7871.187; iCloud Keychain through Apple Passwords with Touch ID       | Chrome signed into Google | Development gate passed              | Real-provider production-flow qualification, minimum release versions, and Windows reconsideration of the provisional `internal` routing policy                          |
| Windows 11 | Recent Windows Hello/native WebAuthn API and Google Password Manager where offered | Unknown                   | Deferred to working-version handoff  | PIN plus biometric where available, API/provider version, signed-in/out state, real popup behavior, cancellation/failure mapping, replacement/orphan and hybrid behavior |
| ChromeOS   | Current Google Password Manager enclave enrollment                                 | Unknown                   | Outside the current development gate | Enclave/account prerequisites, PIN plus fingerprint where available, real popup behavior, cancellation/failure mapping, replacement/orphan and hybrid behavior           |

## Deferred rollout and implementation follow-ups

- The core iCloud Keychain provider path, including missing-pinned-credential non-adoption and local-only routing without hybrid fallback, passes on this Mac.
- Minimum supported Chrome and OS versions are not chosen.
- Chrome signed-in, signed-out, managed-profile, enclave-enrollment, and provider-account prerequisites are not characterized.
- Apple Passwords proves the original generic-label registrations are indistinguishable. The approved mapped random six-character non-identifying tag is visible and consistent in Leather and Apple Passwords; production Settings persists and presents the mapped tag.
- Both omitted transports and `transports: ['internal']` succeed on the tested iCloud Keychain provider. With transports omitted, cancelling iCloud Keychain exposes Chrome's phone/tablet/security-key route. Product approved `internal` for the macOS working version and deferred reconsideration to Windows validation.
- The tested iCloud Keychain provider returns PRF output during creation; enrollment required one Touch ID prompt and no follow-up assertion.
- `isUserVerifyingPlatformAuthenticatorAvailable()` and `getClientCapabilities()['extension:prf']` remain advisory. No provider-tested Chromium preflight negative beyond absent WebAuthn and the explicit non-Chromium boundary is approved as definitive.
- Actual toolbar action-popup ceremony lifetime and direct-entry non-auto-start behavior pass on the tested macOS provider. Automated production tests cover marked Secret Key activation and explicit unlock retry paths.
- iCloud-to-Chrome-chooser cancellation settles promptly and explicit retry succeeds. Missing pinned credentials settle without hybrid fallback when restricted to `internal`. Production cancellation remains retryable, while only allowlisted operational failures suppress the next automatic action-popup attempt for the session.
- The virtual-authenticator test proves CDP attachment to the extension target, but a virtual authenticator cannot approve real Chrome/OS prompt behavior.
- Direct PRF output is accepted as the version-1 AES-256-GCM key after specification review and real-provider/tamper testing.
- Production Redux persistence, authoritative coupled-slice wallet transactions, delayed-frame password and biometric additions, flush ordering and full-state restoration, session initialization and repair, legacy password compatibility, and Argon2/decryption worker request correlation have automated coverage.
- The production `TARGET_BROWSER` environment export defaults to Chromium locally, and Firefox remains password-only even when WebAuthn globals are mocked as PRF-capable.

## Manual continuation checklist

For every candidate real-provider configuration:

1. Build the U0 harness and load `apps/extension/dist` unpacked in the target Chrome profile.
2. Record Chrome version, OS version, provider, account/managed state, extension ID, and whether the provider offers local, synced, or hybrid choices.
3. Run preflight and record UVPAA plus `extension:prf` without treating either positive as provider qualification.
4. Create two credentials with the transport hint omitted; confirm distinct provider registrations and that the first remains usable.
5. Force an orphan after creation; confirm the current local config and credential remain usable.
6. Evaluate the same input twice with required user verification and confirm stable output; evaluate the alternate input and confirm different output.
7. Delete the pinned credential while other Leather credentials remain; confirm there is no adoption or discovery fallback.
8. Repeat with `transports: ['internal']`; record local-provider compatibility and hybrid/QR changes.
9. Record provider-visible RP/user labels and whether provider credential-management metadata is understandable.
10. Run the throwaway fixture create/persist/unlock flow and inspect local/session storage.
11. Test direct `action-popup.html`, a real toolbar/shortcut action popup, `popup.html`, and `index.html` independently.
12. Test cancellation, dialog close, timeout, missing credential, UV lockout, and recovery timing. Record exact DOMException categories without raw messages or credential metadata.
13. Determine whether any launch platform needs the dedicated `index.html#/unlock` window handoff and, if so, certify that one behavior across the full matrix.
14. Confirm whether the approved hybrid behavior, registration labeling, definitive preflight negatives, and minimum versions need platform-specific revision.
15. Confirm each additional provider satisfies the approved version-1 direct PRF-to-AES-256-GCM design and record any provider-specific deviation.

Product authorized the macOS working-version implementation after the revised development gate passed. The completed local implementation does not claim Windows compatibility or complete the deferred real-provider rollout qualifications above.
