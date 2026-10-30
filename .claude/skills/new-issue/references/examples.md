# Examples

Three finished issues at budget, rewritten from real ones. They show the target shape; the facts
come from the source issue, and the permalinks are pinned to the commit the facts were true at.

## Bug: from #2895

Labels: `bug`, `platform:extension`, `area:quality`. Proposed severity: medium (a password re-entry
is the workaround). Cause stays suspect: the race was read from the code, not reproduced. No
Decisions section: the report's fix is the only reasonable one, so there was nothing to ask.

**Title:** `Extension: an unlocked wallet intermittently opens on the Unlock screen`

```markdown
### Problem

A user with an unlocked session is sometimes sent back to the Unlock screen when they open the popup and has to re-enter their password.

### Version

6.115.0

### Where

popup boot → `/unlock` · any network · software wallet · dev @ d2a92e6

### Repro

1. Unlock a software wallet in the popup.
2. Close the popup and reopen it several times in a row.
3. On some opens the popup shows "Enter your password" although the session key is still in `chrome.storage.session`.

### Expected

Every popup open restores the session and lands on Home.

### Actual

Some opens land on `/unlock` with the "Enter your password" prompt.

### Cause (suspect)

[`restoreWalletSession`](https://github.com/leather-io/mono/blob/d2a92e6dd2a59b58e72c91763c71cffd41d665d3/apps/extension/src/app/store/session-restore.ts#L24-L30) calls `selectSoftwareKeys(store.getState())` without waiting for the [`persistor`](https://github.com/leather-io/mono/blob/d2a92e6dd2a59b58e72c91763c71cffd41d665d3/apps/extension/src/app/store/store.ts#L112) to rehydrate, so it can decrypt an empty key list.

### Done when

- [ ] A spec for `restoreWalletSession` that delays rehydration until after the session-key read passes and ends with the keys in the in-memory store.
- [ ] `apps/extension/tests/specs/settings/wallet-lock.spec.ts` passes unchanged.

### Verify

- Unit: `pnpm --filter @leather.io/extension test:unit session-restore` — add `session-restore.spec.ts` next to `session-restore.ts`
- E2E: `pnpm --filter @leather.io/extension build:test`, then `pnpm --filter @leather.io/extension test:integration tests/specs/settings/wallet-lock.spec.ts`
- Needs: nothing

### Out of scope

- Idle auto-lock; the wallet has no idle timer.

<details><summary>Evidence and pointers</summary>

Boot order: [`index.tsx`](https://github.com/leather-io/mono/blob/d2a92e6dd2a59b58e72c91763c71cffd41d665d3/apps/extension/src/app/index.tsx#L47) awaits `restoreWalletSession()`. The session key comes from `chrome.storage.session`; the encrypted keys reach the store only once redux-persist has bootstrapped from `chrome.storage.local`. When the session-key read wins, decryption yields nothing.

Suggested fix from the report: await rehydration before reading the keys, resolving at once when `persistor.getState().bootstrapped` is already true and otherwise subscribing until it is.

Feature map: `unlock` and `wallet-lock` entries; `HomePage.lock` and `HomePage.unlock` own the waits.

</details>
```

## Change: from #2828, split per app

The source issue covered both apps in one body. Each app implements its own list, so it becomes
two issues with Sibling links, created one at a time. Sharing the order constant with the swap
picker would move it into a package; propose that as a third `platform:packages` issue if the
person wants it, not as part of either app issue.

Labels on both: `enhancement`, `area:tokens`, plus `platform:extension` or `platform:mobile`.

**Title:** `Extension: pin sBTC third and USDCx fourth in the token list`

```markdown
### Problem

The home token list should open with BTC, STX, sBTC, USDCx in that order, but the extension sorts sBTC by fiat value with the other SIP-10 tokens and puts USDCx third.

### Where

Home → Tokens tab · mainnet · any account · dev @ aa8c75a

### Scope

- sBTC is the third row whenever the account holds it, regardless of fiat value.
- USDCx is the fourth row.
- A zero-balance USDCx row links to `https://bridge.stacks.co/` instead of showing a bare `0`.
- Rows after the four pinned ones stay sorted by fiat value.

### Decisions

- Settled: USDCx shows at zero, with the bridge link — the source issue asks for it.
- Open: should sBTC show at zero with a path into the BTC to sBTC swap? Options: hide at zero / show with a swap link. Recommended: hide at zero, matching the other SIP-10 tokens.

### Out of scope

- Web portfolio and multisig vault asset lists.
- Hiding sBTC in Manage tokens.

### Done when

- [ ] A Tokens tab spec with sBTC and USDCx balances asserts the first four rows are BTC, STX, sBTC, USDCx.
- [ ] With zero USDCx on mainnet the USDCx row shows the bridge link, not `0`.

### Verify

- E2E: `pnpm --filter @leather.io/extension build:test`, then `pnpm --filter @leather.io/extension test:integration tests/specs/tokens/tokens-tab.spec.ts` — the `home-tokens` feature-map entry's first covering spec
- Needs: nothing

### Sibling

#<mobile issue> (Mobile)

<details><summary>Rationale and pointers</summary>

[`token-list.tsx`](https://github.com/leather-io/mono/blob/aa8c75a6fa6a0b87a720b3fbb0ed596af0aeef56/apps/extension/src/app/features/asset-list/token-list.tsx#L138) renders BTC, STX and USDCx as fixed rows, then hands the rest to `Sip10TokenAssetList`, which filters out only USDCx. sBTC needs a fixed row and must be filtered out of the SIP-10 list. Zero balances are dropped in `packages/services/src/balances/sip10-balances.service.ts`; USDCx is fetched separately so it survives at zero, sBTC does not.

The swap picker's [`assetOrderPriority`](https://github.com/leather-io/mono/blob/aa8c75a6fa6a0b87a720b3fbb0ed596af0aeef56/packages/state/src/swap/utils/asset-selection.ts#L23) already encodes the target order.

Part of #2746.

</details>
```

**Title:** `Mobile: pin sBTC third and USDCx fourth in the token list`

```markdown
### Problem

The home token list should open with BTC, STX, sBTC, USDCx in that order, but mobile puts USDCx above sBTC.

### Where

Home → token list and the send asset picker · mainnet · any account · dev @ aa8c75a

### Scope

- sBTC is the third row whenever the account holds it.
- USDCx is the fourth row.
- Rows after the four pinned ones stay sorted by fiat value.

### Out of scope

- Configurable displayed tokens, tracked in #2601.

### Done when

- [ ] `sort-sip10-balances.spec.ts` asserts sBTC sorts before USDCx and both before higher-value tokens.

### Verify

- Unit: `pnpm --filter @leather.io/mobile test:unit sort-sip10-balances` — extend `sort-sip10-balances.spec.ts`
- Needs: nothing

### Sibling

#<extension issue> (Extension)

<details><summary>Rationale and pointers</summary>

[`sortSip10Balances`](https://github.com/leather-io/mono/blob/aa8c75a6fa6a0b87a720b3fbb0ed596af0aeef56/apps/mobile/src/features/balances/assets/utils/sort-sip10-balances.ts#L7-L9) gives USDCx priority 0 and sBTC priority 1; swapping them changes both the home list and the send asset picker, which share the sort.

Part of #2746.

</details>
```

## Idea: from #2783

Labels: `platform:packages` (release tooling spanning every app). No type label, no Done when.

**Title:** `Packages: generate release-log entries and assets at ship time`

```markdown
_Idea capture, not scoped work._

The user-facing changelog in Sanity is hand-written and drifts (#2745, #1955), the web app ships continuously and never appears in it, and the new in-app update surfaces will need per-version copy nobody owns. Hang a draft entry off each ship moment (extension store submission, mobile build promotion, web production deploy), generated from the commits, PRs and issues that shipped using `tools/src/changelog/` and the `leather-changelog` skill. A human edits the draft before it publishes, and the update UI and post-update toast read the published entry for their version. A small template system for changelog graphics and short loops would make the entries look consistent.

### Open questions

- Does the trigger run in CI on release and deploy, or as a command at ship time?
- Who reviews drafts, and where: a PR or a Sanity draft?
- Does the Sanity model need app and version fields, and how does the web app, which has no versions, map onto them?
- Which releases deserve an entry?
- Is the graphics system a prerequisite or a second phase?
```
