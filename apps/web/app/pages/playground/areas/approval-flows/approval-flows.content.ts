interface DecisionOption {
  label: string;
  recommended?: boolean;
}

export interface Decision {
  id: string;
  question: string;
  options: DecisionOption[];
  why: string;
  seeAlso?: string;
}

export const decisions: Decision[] = [
  {
    id: 'title-type',
    question: 'Which type carries the approval title?',
    options: [
      {
        label: 'Keep heading.03 (32px Marche, uppercase) and see it in the new layout first',
        recommended: true,
      },
      { label: 'heading.05 (21px Diatype), sentence case' },
      { label: 'heading.04 (26px Diatype), as in the earlier Approver-view designs' },
      { label: 'Marche at 24px without uppercase, as the swap review already does' },
    ],
    why: 'Marche is the most branded thing on the screen, so the canvas now runs on it by default. Watch two things: uppercase turns sBTC into SBTC, and long proposal titles take three lines in a 390px window. heading.05 is the fallback if either becomes a problem. Compare all four with the Title type toggle.',
    seeAlso: 'contract-call-known',
  },
  {
    id: 'headline',
    question: 'Does the amount live in the headline?',
    options: [
      { label: 'Yes: “Send 1,234,999 STX”, written by Leather', recommended: true },
      { label: 'No: an amount-free title (“Send STX”), the amount once, in the rows' },
    ],
    why: 'In the headline, the amount is the first thing read and sits at the top, where support feedback asked for it. The amount-free title avoids saying the number twice and cannot go stale after a fee edit. Either way, no separate large amount.',
    seeAlso: 'transfer-stx-large',
  },
  {
    id: 'account-placement',
    question: 'Where does the signing account live?',
    options: [
      {
        label: 'A “With account” block right after what moves, as activity details does',
        recommended: true,
      },
      { label: '“Signing with” just above the buttons, as Rabby, Rainbow and Safe do' },
      { label: 'A second line in the header' },
    ],
    why: 'The header keeps one job: who is asking, on which network, with a second line only for exceptions (inside another site, not connected). After what moves, the account reads as part of what is being approved and matches the block people see again in activity details. Above the buttons is the proven alternative but competes with the total. Screens without a what-moves block show it above the buttons. Use the Account toggle to compare all three.',
    seeAlso: 'pattern',
  },
  {
    id: 'verbs',
    question: 'What do the buttons say?',
    options: [
      {
        label: 'Cancel, plus the verb: Send, Approve, Sign, Connect, Deploy, Propose',
        recommended: true,
      },
      { label: 'Cancel and Approve everywhere' },
      { label: 'Keep today’s mix (Deny/Confirm, Cancel/Approve, Cancel/Sign, Cancel/Confirm)' },
    ],
    why: 'The verb repeats the headline at the moment of commitment. Cancel stays constant so muscle memory is never punished.',
  },
  {
    id: 'network-label',
    question: 'Is Mainnet labelled too?',
    options: [
      { label: 'Always, Mainnet in a quiet outline', recommended: true },
      { label: 'Only when off mainnet' },
    ],
    why: 'A label that only appears on testnet is a label nobody learns to read. Use the Network label toggle to see both.',
  },
  {
    id: 'details-default',
    question: 'The first time, are details open or closed?',
    options: [
      { label: 'Closed, with the fee on the summary line', recommended: true },
      { label: 'Open' },
    ],
    why: 'Either way Leather remembers the choice for the next request. Closed keeps what moves and the buttons in the first view; the fee is still on the summary line and inside the total.',
    seeAlso: 'transfer-stx-large',
  },
  {
    id: 'switching',
    question: 'Remove account switching from every signing screen?',
    options: [
      {
        label:
          'Yes, including PSBT and message signing, and decouple connect from the wallet’s active account',
        recommended: true,
      },
      { label: 'Keep it on message signing only' },
    ],
    why: 'Follows the rule agreed for connect and signing, and removes the path where a signature comes from an account the site never saw.',
    seeAlso: 'sign-mismatch',
  },
  {
    id: 'repeat-connect',
    question: 'A connected site asks for addresses again',
    options: [
      { label: 'Answer silently with the connected account, no popup', recommended: true },
      { label: 'Show the reconnect screen every time, as today' },
    ],
    why: 'Sites call getAddresses before each action to learn the account, so users see Connect several times per flow, sometimes minutes later with nothing on screen. Changing account stays possible from Leather or when the site asks to connect anew.',
    seeAlso: 'connect-reconnect',
  },
  {
    id: 'account-events',
    question: 'You switch account in Leather while sites are connected',
    options: [
      {
        label: 'Sites stay on their account; the switch offers to move each one, off by default',
        recommended: true,
      },
      { label: 'Every connected site follows the switch and is told, as in MetaMask' },
    ],
    why: 'SIP-030 lets sites listen for account changes, and Leather sends none today. Keeping sites where they are matches connect being decoupled from the active account, so a switch never silently changes who signs on a site.',
    seeAlso: 'sip030-account-change',
  },
  {
    id: 'network-switch-request',
    question: 'Can a site ask Leather to switch network?',
    options: [
      {
        label: 'Yes: it moves only this site’s connection, with switching Leather as an opt-in',
        recommended: true,
      },
      { label: 'No: sites only name a network on each request, as SIP-030 does today' },
    ],
    why: 'It makes testing and moving between networks easier for people and developers, like MetaMask’s network switch. SIP-030 has no request method for it, only the network-changed event, so it needs a SIP amendment or a Leather method.',
    seeAlso: 'sip030-network-change',
  },
  {
    id: 'app-storage-key',
    question: 'Should Leather hand sites a key for their own storage?',
    options: [
      {
        label: 'Yes, behind its own connect screen that names the key and what it can’t do',
        recommended: true,
      },
      { label: 'No, answer stx_getAccounts with an access-denied error' },
    ],
    why: 'stx_getAccounts returns a private key made for that one site plus a Gaia storage hub. It can’t spend, but it is more than an address, so it shouldn’t ride on the normal connect screen. Which hub Leather hands out needs an engineering call.',
    seeAlso: 'sip030-get-accounts',
  },
  {
    id: 'gaia-methods',
    question: 'Keep stx_getAccounts and stx_updateProfile?',
    options: [
      { label: 'Implement both, behind their own screens, until Sign in with Stacks lands' },
      {
        label: 'Drop both: answer method not found and propose marking them optional in SIP-030',
      },
    ],
    why: 'They are the last two SIP-030 methods Leather doesn’t handle, and both come from the Gaia era: one hands a site a storage key, the other writes a public profile. These two screens show what implementing them would take. Dropping them fits the move away from Gaia, but sites that still use them lose them before a replacement exists.',
    seeAlso: 'sip030-update-profile',
  },
  {
    id: 'source-checks',
    question: 'How does Leather tell people who is asking?',
    options: [
      {
        label:
          'A short list of checks that collapses when all is clear and opens when something needs a look',
        recommended: true,
      },
      { label: 'Say nothing unless something is wrong' },
      { label: 'One trust level per request, like Rabby’s Safe, Warning, Danger and Forbidden' },
    ],
    why: 'The site name alone says little: lookalike domains and copied contracts look right. Collapsing when clear keeps normal requests calm, and stating unknown as neutral keeps small and new apps from looking dangerous. A single score hides which check failed.',
    seeAlso: 'source-contract-confirmed',
  },
  {
    id: 'contract-origin',
    question: 'Should Leather confirm who owns a contract?',
    options: [
      {
        label:
          'Yes: read on-chain ownership claims from vouchers Leather recognises, as in the Origin hackday project',
        recommended: true,
      },
      { label: 'No: rely on Leather’s own list of known contracts only' },
    ],
    why: 'A site proves it controls a contract’s deployer with a signed file on its domain, and a recognised voucher records that on chain. Leather reads the contract from the decoded transaction, so the site can’t claim a name for itself, and it catches contracts that copy a known name. It is a testnet proof of concept today: voucher keys, how Leather updates its voucher list, and vaults are still open.',
    seeAlso: 'source-contract-lookalike',
  },
  {
    id: 'scam-list-override',
    question: 'A site is on a public scam list',
    options: [
      { label: 'Block, with no way to continue from the approval', recommended: true },
      { label: 'Block, with continue anyway behind a confirmation' },
    ],
    why: 'Scam lists are the one check precise enough to stop a request. An override helps when a list is wrong but is exactly what a scam site coaches people to press. Needs a list provider, which Leather does not have.',
    seeAlso: 'source-site-flagged',
  },
  {
    id: 'address-mismatch',
    question: 'A request names an account that is not the connected one',
    options: [
      { label: 'Reject with the standard address-mismatch error', recommended: true },
      { label: 'Honour it and show it prominently' },
    ],
    why: 'Rejecting keeps one rule for every method and gives the site an error it can act on.',
    seeAlso: 'sign-mismatch',
  },
  {
    id: 'app-fee',
    question: 'The app set the fee',
    options: [
      {
        label: 'Keep it, label it “Set by app”, offer Leather’s estimate as an edit',
        recommended: true,
      },
      { label: 'Replace it with the Leather estimate, as today' },
    ],
    why: 'What is shown is what is signed, and a low fee can still be raised. For multisig co-signing the fee is read-only and shown.',
    seeAlso: 'sign-transaction-app-fee',
  },
  {
    id: 'pending-nonce',
    question: 'The app’s nonce is already used by a pending transaction',
    options: [
      {
        label:
          'Keep the app’s nonce, name the pending transaction it replaces in a caution, and ask for a switch',
        recommended: true,
      },
      { label: 'Swap in Leather’s next free nonce' },
      { label: 'Say nothing, as today' },
    ],
    why: 'Only one of the two can confirm, so signing quietly cancels a payment you already sent. Swapping the nonce hands the app a different transaction than it built, the same problem as replacing its fee. A nonce that leaves a gap only waits, so it gets a quiet note instead.',
    seeAlso: 'sign-transaction-nonce-pending',
  },
  {
    id: 'spend-source',
    question: 'Which coins pay for a Bitcoin send?',
    options: [
      {
        label:
          'Native SegWit by default, Taproot only when you choose it, protected coins never without an explicit choice',
        recommended: true,
      },
      { label: 'Both addresses, Native SegWit first, with the Taproot caution when it reaches in' },
      { label: 'Both addresses, largest coins first, as today' },
    ],
    why: 'Leather puts collectibles on the Taproot address and everyday bitcoin on Native SegWit, but today one pool holds both, so a send can quietly spend a coin carrying an inscription. Defaulting to Native SegWit keeps that from happening without a warning to read, and the sheet still lets Taproot funds be spent, which people ask for. Leather can’t yet see which coins hold collectibles, so until it can, Taproot coins under 10,000 sats are protected by rule. Whether a site can pin the source is a follow-up.',
    seeAlso: 'send-transfer-edit-sources',
  },
  {
    id: 'fee-guardrail',
    question: 'When does a Bitcoin fee get a caution?',
    options: [
      {
        label:
          'Above 10% of what’s sent, or 3 times Fast or more, with a switch that names the fact',
        recommended: true,
      },
      { label: 'Show the percentage on the fee row, no caution' },
      { label: 'No check, as today' },
    ],
    why: 'Fees depend on size, not amount, so small sends and typos in a custom rate are where people overpay. A fixed rule is easy to explain, and the switch is the same one used for other cautions, so it only appears when something is actually off.',
    seeAlso: 'send-transfer-high-fee',
  },
  {
    id: 'multi-recipient-addresses',
    question: 'How are several recipients shown?',
    options: [
      {
        label:
          'One row per recipient with a shortened address and its amount, full addresses in details',
        recommended: true,
      },
      { label: 'Every address in full on the main screen' },
    ],
    why: 'Three full addresses push the fee and the guarantee off the screen. Shortened rows keep the amounts comparable at a glance; the cost is that the middle of each address is one tap away, which matters for address poisoning.',
    seeAlso: 'send-transfer-multi',
  },
  {
    id: 'recipient-names',
    question: 'How do names show on a recipient?',
    options: [
      {
        label:
          'The name above the full address, with where Leather found it; “yours” only from Leather’s own accounts',
        recommended: true,
      },
      { label: 'The name instead of the address, full address in details' },
      { label: 'The address only, as today' },
    ],
    why: 'The address is what gets signed, so it never leaves the row; the name makes it readable and the source line says how far to trust it. BNS names can change owner, which gets its own caution, while “yours” is matched against keys Leather holds and can’t be spoofed by a site. One shared treatment means every direction shows names the same way.',
    seeAlso: 'transfer-bns-name',
  },
  {
    id: 'sighash-none',
    question: 'A site asks you to sign your own coins with SIGHASH_NONE',
    options: [
      {
        label: 'Always block for your own inputs, even when the site lists it in allowedSighash',
        recommended: true,
      },
      { label: 'Allow it when the site lists it, behind a blocking-tone caution and a hold' },
    ],
    why: 'A NONE signature covers your coin but none of the outputs, so anyone who holds it can send the coin anywhere. allowedSighash is written by the site itself, so it says nothing about whether the site is honest. Everyday trades use SINGLE|ANYONECANPAY, which keeps the payment to you fixed and stays allowed.',
    seeAlso: 'sign-psbt-sighash-none',
  },
  {
    id: 'post-condition-modes',
    question: 'How do post-condition modes read?',
    options: [
      {
        label:
          'The mode as the first word of one sentence: Strict, Your account only, Unrestricted',
        recommended: true,
      },
      { label: 'Use the protocol names: deny, originator, allow' },
    ],
    why: 'Originator currently reads exactly like deny. Plain words avoid exposing protocol jargon, and Unrestricted keeps the list visible under the caution instead of replacing it.',
    seeAlso: 'contract-call-originator',
  },
  {
    id: 'simulation',
    question: 'Does Leather dry-run Stacks calls and show the result?',
    options: [
      {
        label:
          'Yes: dry-run results appear as estimates next to the guaranteed limits, tagged Estimate with their source, and never styled like a limit',
        recommended: true,
      },
      { label: 'Only warn when the dry run says the call will fail' },
      { label: 'No dry run; post conditions only' },
    ],
    why: 'Post conditions are the only thing the chain enforces, but they are often loose (originator mode sets none for what arrives) and a failed call still costs its fee. A dry run fills both gaps: an expected amount where there is no limit, and a warning before a doomed call. It is a guess about one moment of the chain, so it has to look like one: ≈, an Estimate tag and a source, and it never counts toward the footer total. Open questions: a third-party service such as stxer sees each unsigned transaction first, a Leather-run node costs infrastructure, and either way the screen must work when the dry run is unavailable.',
    seeAlso: 'contract-call-estimated',
  },
  {
    id: 'slippage-guardrail',
    question: 'When does a swap’s allowed price drop get a caution?',
    options: [
      {
        label:
          'Over 5% between the expected amount and the minimum, with a switch that names the percentage',
        recommended: true,
      },
      { label: 'Always show the percentage, never a caution' },
      { label: 'No check, as today' },
    ],
    why: 'The minimum is the only amount the chain guarantees, and a loose minimum is how a swap gets sandwiched or fills at a bad price. Most swaps allow 0.5 to 1%, so 5% catches settings that are almost never intended while leaving normal swaps quiet. The expected amount comes from the app or a dry run, so it always carries the estimate treatment and its source.',
    seeAlso: 'swap-high-slippage',
  },
  {
    id: 'sbtc-bridge-framing',
    question: 'How do sBTC deposits and withdrawals read?',
    options: [
      {
        label:
          'As a bridge: what leaves one chain, what arrives on the other and at which of your addresses, the maximum fee, the wait, and the way back if it fails',
        recommended: true,
      },
      { label: 'As the plain Bitcoin send and contract call they are underneath' },
    ],
    why: 'Underneath, a deposit is a send to an unfamiliar Taproot address and a withdrawal is a contract call with a byte tuple, so today neither says where the money ends up. The bridge framing depends on data Leather can check itself: the app has to send the deposit and reclaim scripts so Leather can rebuild the address, and the withdrawal tuple decodes to a Bitcoin address Leather can match to your accounts. When those checks fail, the screen falls back to the plain send or call.',
    seeAlso: 'sbtc-deposit',
  },
  {
    id: 'staking-postconditions',
    question: 'How do calls that only change staking read?',
    options: [
      {
        label:
          'A Staking action line from the new staking and PoX post conditions, next to the usual limits, saying what the call must or may change',
        recommended: true,
      },
      { label: 'Only a staking section below; the guarantee stays “only the fee”' },
    ],
    why: 'Unstaking and announcing an early exit move no assets, so the current wording (“only fees will be transferred”) hides the one thing they do. Since Epoch 4.0 the chain refuses, in Strict mode, any staking change the post conditions don’t list, so the post condition is the honest source for this line. Bond entry is different: it is a Bitcoin send whose meaning only shows once Leather rebuilds the lock address from the bond’s terms.',
    seeAlso: 'stake-unstake',
  },
  {
    id: 'standing-permissions',
    question: 'How do staking permissions that last beyond one transaction read?',
    options: [
      {
        label:
          'One block on grant and on revoke: who, up to how much, until when, how to end it, and what it can’t do',
        recommended: true,
      },
      { label: 'Only the usual what-moves rows, as for any contract call' },
      { label: 'Keep them out of approvals and list them in Settings only' },
    ],
    why: 'A pool arrangement keeps working after the window closes, so the approval is the one moment to say its limits. PoX-5 changes the mechanics: allow-contract-caller gives way to staking post conditions and one stake covers all its cycles, so the block describes the stake rather than an open-ended grant. Revoking reads the same rows back with the new end date, and starts from Leather, not the pool’s site.',
    seeAlso: 'permission-delegate-stx',
  },
  {
    id: 'confirm-friction',
    question: 'Which requests need more than one tap to approve?',
    options: [
      {
        label:
          'Match it to the risk: press and hold for Unrestricted, a switch that names the fact for cautions, typing the middle of the address for lookalike recipients, one tap for everything else',
        recommended: true,
      },
      { label: 'One tap everywhere, with the caution text doing the work' },
      { label: 'A confirmation dialog after the tap for anything risky' },
    ],
    why: 'People click through warnings they only have to read, and a second dialog becomes a habit within days. Friction works when it is rare and points at the one thing to check: holding makes an unlimited approval deliberate, the switch names the fact the caution is about, and typing four characters makes you read the middle of an address, which is exactly what address poisoning relies on you skipping. Cancel never has friction. Routine screens stay one tap so the extra steps keep their meaning.',
    seeAlso: 'source-recipient-lookalike',
  },
  {
    id: 'click-guard',
    question: 'Should the primary button ignore clicks right after it appears?',
    options: [
      {
        label:
          'Yes, always: about 600ms after the screen opens, the button enables or a fact changes',
        recommended: true,
      },
      { label: 'Only on risky screens' },
      { label: 'No guard' },
    ],
    why: 'A site can open the popup under a click or a double click the person meant for the page, so their second press lands on Approve. Browsers ignore input on their own permission prompts for about half a second for this reason. The button fades in from slightly muted over the guard time, with no text, and does nothing on Enter; with reduced motion it skips the fade but stays guarded.',
    seeAlso: 'pattern',
  },
  {
    id: 'request-queue',
    question: 'What happens when requests pile up, or a site keeps asking?',
    options: [
      {
        label:
          'One window with a queue bar (which one, from which site, previous and next, Reject all), and a one-hour block offered after repeated cancels',
        recommended: true,
      },
      { label: 'One window per request, as today' },
      { label: 'Queue them, but no block' },
    ],
    why: 'Today each request opens its own window at the same spot, so they stack and the one on top may not be the one you think; a site can also reopen a request until someone gives in. One window keeps the order visible, the New site badge stops a second tab from hiding behind a familiar one, and the block turns a pattern of pressure into one tap. Cancel still answers only the request on screen.',
    seeAlso: 'queue-multiple-requests',
  },
  {
    id: 'domain-display',
    question: 'How does the header show a long site address?',
    options: [
      {
        label:
          'Keep the registered domain in full weight and cut anything in front of it from the left',
        recommended: true,
      },
      { label: 'The full host in one weight, as today, cut at the end when it doesn’t fit' },
      { label: 'Show the registered domain only' },
    ],
    why: 'The registered domain is the only part a scammer cannot copy, and cutting from the end hides exactly that part: app.bitflow.finance.secure-login-verify.com would read as app.bitflow.fin… in a narrow header. Browsers keep the registered domain visible for the same reason. Keeping the subdomain, subdued and cut from the left, still shows which part of a site is asking.',
    seeAlso: 'source-long-subdomain',
  },
  {
    id: 'embedded-unknown',
    question: 'Leather can’t tell whether a request comes from inside another site',
    options: [
      {
        label: 'Show the normal header, and warn only when a frame check confirms another site',
        recommended: true,
      },
      { label: 'Show a quiet line that Leather couldn’t confirm the page' },
    ],
    why: 'A page the browser prepares in the background has no tab address until it is shown, which is not the same as sitting inside another site. A caution that fires on ordinary pages teaches people to skip the one that matters.',
    seeAlso: 'state-embedded',
  },
  {
    id: 'registry',
    question: 'Recognise well-known contracts?',
    options: [
      {
        label: 'A Leather-owned list for the most used contracts, function name as fallback',
        recommended: true,
      },
      { label: 'Always describe by function name' },
    ],
    why: 'Faithful but unreadable previews make correct transactions look wrong. The sentence stays Leather’s, never the site’s.',
    seeAlso: 'contract-call-unknown',
  },
  {
    id: 'risk-tiers',
    question: 'How loud can a warning get?',
    options: [
      {
        label: 'Quiet note, caution callout, blocking state, each naming its source',
        recommended: true,
      },
      { label: 'One warning style for everything' },
    ],
    why: 'Separates “you should know” from “this cannot be undone” from “we could not read this”, so the loud state keeps its meaning.',
  },
  {
    id: 'sign-in-with-stacks',
    question: 'Where does Sign in with Stacks happen?',
    options: [
      {
        label: 'On the Connect screen: one approval connects and signs the sign-in message',
        recommended: true,
      },
      { label: 'On its own message screen, right after Connect' },
    ],
    why: 'Connecting and then signing in is two windows for one intent. One screen that names the account, the network and the sign-in fields keeps it to one decision, as Phantom does with Sign In With Solana. It needs the message format settled, and Connect has to carry the sign-in request.',
    seeAlso: 'message-sign-in',
  },
  {
    id: 'proposal-signing',
    question: 'Multisig proposals: sign a hash, or see the proposal?',
    options: [
      {
        label:
          'Show the proposal (vault, amount, recipient); needs the payload sent alongside the hash',
        recommended: true,
      },
      { label: 'Keep the generic message screen with the hash' },
    ],
    why: 'Today the first popup of a proposal shows 64 hex characters and nothing about what is proposed.',
    seeAlso: 'message-multisig-proposal',
  },
  {
    id: 'proposal-steps',
    question: 'Does proposing a vault transaction include your own signature?',
    options: [
      { label: 'Yes, one approval: the commitment and your signature together', recommended: true },
      { label: 'No, a commitment first and your signature in a second popup' },
    ],
    why: 'Proposals from the multisig web app take two popups back to back, and proposals from other sites go out unsigned, to be signed later somewhere else. One step matches what the proposer means.',
    seeAlso: 'result-proposed',
  },
  {
    id: 'stx-key-order',
    question: 'Stacks vault keys: keep the order they arrive in, or sort them?',
    options: [
      {
        label: 'Keep the order, number the keys and say that order is part of the address',
        recommended: true,
      },
      { label: 'Sort them, so the order never matters' },
    ],
    why: 'On Stacks the order of the keys changes the vault address, so two members adding the same keys in a different order end up with different vaults. Sorting removes that trap but only works if the web app and every other wallet sort the same way; until then, numbering the keys makes the order something people can compare.',
    seeAlso: 'account-stx-add-vault',
  },
  {
    id: 'vault-message',
    question: 'A site connected with a vault asks to sign a plain message',
    options: [
      { label: 'Refuse and say why; vault proposals are the one exception', recommended: true },
      { label: 'Sign with the personal key and say so plainly' },
    ],
    why: 'Today the personal key signs without saying so. Refusing is honest but blocks sign-in on sites connected with a vault, which is why it needs a call.',
    seeAlso: 'vault-method-refused',
  },
  {
    id: 'message-format',
    question: 'A site asks for a legacy signature from a Taproot address',
    options: [
      { label: 'Refuse before any screen, with an error the site can act on', recommended: true },
      { label: 'Sign with BIP-322 instead and say so on the screen' },
      { label: 'Always sign BIP-322 without saying, as today' },
    ],
    why: 'The legacy format can’t sign for Taproot keys, and a BIP-322 signature handed to a site that asked for legacy may not verify, which reads as a Leather bug. Refusing is predictable for developers; the format and address type rows then only ever show combinations that work.',
    seeAlso: 'message-bip322-taproot',
  },
  {
    id: 'vault-queue',
    question: 'Two open proposals on a vault use the same nonce, or the same coins',
    options: [
      {
        label: 'Warn before signing, name the other proposal and let the signer pick',
        recommended: true,
      },
      { label: 'Let the coordinator keep one open proposal per nonce' },
      { label: 'Say nothing; the one that loses fails at broadcast' },
    ],
    why: 'On Stacks the nonce is fixed when a proposal is made, and on Bitcoin two spends of the same coins can’t both confirm, so signing one quietly kills the other. Naming the other proposal, with who proposed it and when, turns a surprise failure into a choice. A one-per-nonce queue avoids the clash but blocks urgent proposals behind slow ones.',
    seeAlso: 'vault-nonce-clash',
  },
  {
    id: 'vault-decline',
    question: 'How does a co-signer say no to a proposal?',
    options: [
      {
        label: 'Decline as its own recorded action; Cancel only closes the window',
        recommended: true,
      },
      { label: 'Cancel also declines' },
      { label: 'No decline; proposals wait until they pass or expire' },
    ],
    why: 'Closing the window and rejecting the proposal are different intents, and other signers need to know which happened. A recorded decline also lets a proposal close once it can no longer reach the threshold, which the stale state then explains.',
    seeAlso: 'vault-decline-confirm',
  },
  {
    id: 'vault-hash-compare',
    question: 'Show a hash to compare when a vault co-sign goes to a hardware device?',
    options: [
      { label: 'Always, grouped the way the device shows it', recommended: true },
      { label: 'Only under Details, for those who look' },
      { label: 'No, the device’s own rows are enough' },
    ],
    why: 'Vault funds are large and shared, and a site can show one transaction while the device is asked to sign another. A short hash worked out by Leather and checked on the device catches that in seconds, which is what Safe now asks its signers to do.',
    seeAlso: 'vault-ledger-hash',
  },
  {
    id: 'ledger-preflight',
    question: 'Does Leather list the Ledger screens before you press Sign?',
    options: [
      {
        label:
          'Yes, a short numbered list whenever the device will show a warning, and one hint line above the button',
        recommended: true,
      },
      { label: 'Only the hint line' },
      { label: 'No, the device speaks for itself, as today' },
    ],
    why: 'Device warnings (blind signing, external inputs, a non-default sighash) arrive with no word from the wallet and look like something went wrong. Leather can predict them from the unsigned transaction, and naming them first turns a scare into a step people expected. The list needs checking against each app version.',
    seeAlso: 'ledger-btc-preflight',
  },
  {
    id: 'brand',
    question: 'Keep the Leather wordmark band at the top?',
    options: [
      { label: 'Drop it; the requesting site comes first', recommended: true },
      { label: 'Keep a small mark in the header' },
    ],
    why: 'The window is already titled Leather, and the band spends 70px of a 756px window on branding instead of the site asking.',
  },
  {
    id: 'launch-moment',
    question: 'Does Leather mark the moment an approval opens?',
    options: [
      {
        label: 'Handshake on connect, then a brief L mark as every later request loads',
        recommended: true,
      },
      { label: 'Handshake on connect, then the site and account pair docking into the header' },
      { label: 'An L splash before every approval, connect included' },
      { label: 'No launch motion' },
    ],
    why: 'Connect is the one moment the site and Leather meet, so it gets a slow handshake: the L draws itself, the site arrives, a dotted line links them, and the L becomes the account the site will see from then on. Later requests open with a short L mark instead, a quiet brand moment like the logo flash other wallets show while they load. In the product the mark should only cover time the screen really spends loading, and cut short when everything is ready, so it never adds a delay of its own. The primary button stays guarded until the motion ends, and reduced motion swaps it for a short crossfade.',
    seeAlso: 'connect-first',
  },
  {
    id: 'results',
    question: 'What happens after you approve?',
    options: [
      {
        label: 'A result state in the same window: sent, signed, proposed or failed',
        recommended: true,
      },
      { label: 'Close the window and leave the outcome to Activity' },
    ],
    why: 'Today most requests close instantly, errors land on different pages, and a proposal reads as “Submitted”. One result state per outcome makes the promise match what happened.',
    seeAlso: 'result-signed-not-broadcast',
  },
  {
    id: 'speed-up',
    question: 'What does Speed up ask you to approve?',
    options: [
      {
        label:
          'Its own approval: fee now and new fee, what stays the same, and the extra cost as the total',
        recommended: true,
      },
      { label: 'A fee picker only, as today’s Increase fee' },
    ],
    why: 'A replacement is a new signature over a new transaction, so it deserves the same review: people should see that the amount and recipient are unchanged and what the speed up costs. When replace-by-fee isn’t possible on Bitcoin, the same entry offers child-pays-for-parent as its own send.',
    seeAlso: 'speed-up-bitcoin',
  },
  {
    id: 'reversibility-line',
    question: 'Does every approval say whether it can be undone?',
    options: [
      {
        label: 'Yes, one quiet line in a fixed spot above the buttons, set per request',
        recommended: true,
      },
      { label: 'Only on permanent actions, as a caution' },
      { label: 'No, leave it to the notes and cautions' },
    ],
    why: 'People assume a crypto approval is either fully reversible or fully final, and each screen is one or the other in a different way: a connection can be removed in Settings, a send can be sped up while pending but not undone once confirmed, a signed transaction stays valid until it is used, a deploy is permanent. One line in the same place makes that a habit to glance at, without adding a caution to screens that are routine.',
    seeAlso: 'transfer-stx-large',
  },
  {
    id: 'fiat-display',
    question: 'How do USD values say they are approximate?',
    options: [
      {
        label:
          'Plain “$812.40” in quiet type, with one “Priced 1 min ago” line under the total; ≈ stays for estimated amounts',
        recommended: true,
      },
      { label: '≈ before every USD value' },
      { label: 'Plain USD values with no price time, as today' },
    ],
    why: 'In this pattern ≈ already marks a token amount that is an estimate, such as a dry-run result. Putting it on every USD value would turn it into noise and blur that one signal. A price time next to the total says what a USD value is, a conversion at a moment, gives the re-checked state something to update, and disappears when there is no price.',
    seeAlso: 'state-price-unavailable',
  },
  {
    id: 'measurement',
    question: 'How does the team know the approval screens work?',
    options: [
      {
        label:
          'Ship the event spec with the pattern, review click-through on cautions monthly, and A/B test directions in the field',
        recommended: true,
      },
      { label: 'Ship the pattern first and add events later' },
      { label: 'Rely on support tickets and user interviews' },
    ],
    why: 'Six events answer the questions that matter: do people read (time to decide, details opened), do cautions change behaviour (approve rate after a caution, by source), does friction hold people up without stopping them, and what actually happened after. None of them carries an address, amount, message, transaction ID or site, so the data is safe to keep. The Viewer lists the events each screen sends.',
    seeAlso: 'pattern',
  },
  {
    id: 'approval-activity-continuity',
    question: 'Are activity details built from the approval’s parts?',
    options: [
      {
        label:
          'Yes, one component set: activity details are the approval in the past tense, same order and slots, with a status strip where the buttons were',
        recommended: true,
      },
      { label: 'Share the order and tokens only, with separate components for each screen' },
      { label: 'Keep them separate, as today' },
    ],
    why: 'Built with Then in activity, most of the screen carries over unchanged: the title slot and its type, the asset, recipient and fee rows, the guarantee line, With account after what moved, the signers block and the details rows, so each direction restyles both screens at once. What changes is small but real. Limits become facts: “At least 0.00735 sBTC” becomes the 0.00741 sBTC received, with the minimum as a caption, and ≈ estimates drop out. The fee is paid instead of editable, with Increase fee and Cancel in the status strip while pending. The requester header becomes a back arrow and a “Requested by” line, and the total and buttons become View in explorer. Pending screens mix tenses: an sBTC deposit has sent its BTC but can still only promise a minimum. The chain gives the actual amounts but not the site, the approved limits, the dry run or who signed a vault spend, so Leather has to keep those with the txid when it broadcasts. Activity details today put the fee in the table; this keeps it in what moved, as the approval does.',
    seeAlso: 'transfer-stx-large',
  },
  {
    id: 'scope',
    question: 'Does this pattern also cover in-wallet confirmations?',
    options: [
      {
        label: 'Yes, send review and swap review use the same shell, after the dApp requests',
        recommended: true,
      },
      { label: 'No, dApp requests only' },
    ],
    why: 'The large display-type amount lives on the in-wallet send summary, not on dApp approvals. Mobile already renders its send review and its dApp approvals through one layout.',
  },
];
