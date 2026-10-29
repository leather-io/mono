# Labels

Snapshot of `gh label list --repo leather-io/mono --limit 100 --json name,description` taken
2026-10-29. Refresh this file whenever labels are added, renamed or removed. In full mode, check the
live list before applying a label; a label missing from the repo cannot be applied.

## Type

At most one per issue. An idea takes none.

| Label               | Description                                               |
| ------------------- | --------------------------------------------------------- |
| `bug`               | Something isn't working                                   |
| `enhancement`       | New feature or request                                    |
| `chore`             | Maintenance, cleanup, tooling                             |
| `community-request` | Raised by a user or the community, not planned internally |
| `for:design`        | Needs design before it can be built                       |

`community-request` and `for:design` go next to `bug` or `enhancement`, not instead of them.

## Platform

Exactly one per issue. The title prefix matches it.

| Label                | Title prefix | Description                           |
| -------------------- | ------------ | ------------------------------------- |
| `platform:extension` | `Extension:` | Browser extension                     |
| `platform:mobile`    | `Mobile:`    | iOS and Android app                   |
| `platform:web-app`   | `Web:`       | The web app at app.leather.io         |
| `platform:packages`  | `Packages:`  | Shared packages, services and tooling |

No automation sets the platform label. The skill applies it in full mode, and through the issue
link in clone and text mode for people with triage access; otherwise a maintainer adds it at
triage from the title prefix.

## Area

One to three per issue, most specific first.

| Label               | Description                                                             |
| ------------------- | ----------------------------------------------------------------------- |
| `area:accounts`     | Accounts and wallets: switching, naming, saved addresses                |
| `area:activity`     | Activity feed: history, filtering, transaction detail, synthetic events |
| `area:approvals`    | Approval, signing and transaction-preview surfaces                      |
| `area:balances`     | Balance display: spendable vs locked, visibility, network variants      |
| `area:bitcoin`      | Bitcoin protocol level: UTXOs, address types, PSBTs, fee rates          |
| `area:bns`          | BNS names: resolution, display and sending to names                     |
| `area:connect`      | Dapp connection: WalletConnect, Reown, account grants                   |
| `area:content`      | What it says: guides, posts, the archive, changelog copy, FAQ           |
| `area:earn`         | Earn discovery surface and provider registry                            |
| `area:fees`         | Fee estimation, editing and fee-service behavior                        |
| `area:ledger`       | Hardware wallets: Ledger devices, derivation paths, blind signing       |
| `area:multisig`     | Leather Multisig: vaults, accounts, co-signers, invitations             |
| `area:onboarding`   | First run: wallet creation, restore, derivation paths, pre-home         |
| `area:onramp`       | Buying and selling crypto through onramp providers                      |
| `area:quality`      | Everyday wallet jobs: send, receive, balances, activity, unlock         |
| `area:sbtc`         | sBTC: deposits, withdrawals, bridge and signer fees                     |
| `area:security`     | Security hardening, audit findings, key and secret handling             |
| `area:staking`      | Staking: enrollment, pools, signers, rewards, locked balances           |
| `area:swaps`        | Swap flows, quotes and provider integrations                            |
| `area:tokens`       | SIP-10 tokens: display, configurability, token details, trending        |
| `area:transfers`    | Send and receive flows: recipients, address types, amounts              |
| `area:web-presence` | The property: landing page, nav, redirects, domains, SEO, 404s          |
| `area:yieldfolio`   | Cross-ecosystem yield positions view                                    |

## Severity

Bugs only. Proposed in the report to the person, never applied by the skill; a maintainer sets it.

| Label               | Description                                                     |
| ------------------- | --------------------------------------------------------------- |
| `severity:critical` | Funds at risk or wallet compromised; fix immediately            |
| `severity:high`     | Serious impact with no safe workaround; fix before next release |
| `severity:medium`   | Real impact but a workaround exists; schedule normally          |
| `severity:low`      | Minor or cosmetic; fix opportunistically                        |
| `severity:info`     | No direct impact; informational or hardening suggestion         |

## Not for issues

`autorelease: pending`, `autorelease: tagged`, `release-please:force-run label`,
`build:mobile:simulator`, `dependencies`, `github_actions` and `stale` are applied by automation
or to pull requests. Never propose them.

## Rules

- **Exactly one `platform:*`**, and the title prefix matches it.
- **A fix that lives in a shared package** is one `platform:packages` issue even when both apps
  show the symptom.
- **A change each app implements separately** is one issue per app, each with a `### Sibling`
  section, created one at a time: the first is submitted, its number is asked for, the second
  opens with the link in place, and the back-link edit on the first is offered to the person.
- **One issue per unit someone can own and close.** The skill proposes a split; the person decides.
- **Severity is proposed, never labeled.** A critical finding (funds at risk, wallet compromised)
  is not drafted as a public issue: point to the Leather bug bounty on Immunefi, or for
  maintainers the private `leather-io/leather-security` repo.
- **Redact before drafting**: mnemonic-looking word runs, xpub, xprv, zpub and other extended
  keys, hex private keys, WIFs, emails, account and wallet names, API keys and tokens.
- **Nothing is created without an explicit yes** after the full drafts and labels are shown.
