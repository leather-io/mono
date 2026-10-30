# Approval overhaul: focus on Handshake

Reviewed 7 October 2026. Source: [the complete Slack thread, including all seven replies](https://stackslabs.slack.com/archives/C09U43UADGU/p1790832028191359).

## Assessment

Develop Handshake as the working direction and pause active refinement of the other concepts. Keep them in the playground as references. The differences are mostly presentation choices around the same approval structure; maintaining every direction would multiply work on copy, states and responsive layouts without answering a distinct product question.

Handshake has a useful organising idea: the requester and approving account form a recognisable pair. That helps people answer who is asking and whose funds or key are involved before reviewing the action. The persistent total and action footer gives the structure a stable ending. Those benefits apply to routine approvals and shared vaults, without relying on the introductory animation.

This is a design recommendation, not evidence that users perform better with Handshake. The Slack feedback is positive about specific elements but does not establish a preference between directions. Compare against the current product on comprehension and mistakes before shipping.

## Feedback and response

| Feedback                                                              | Response                                                                                                                                                                        |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Alex likes the persistent total and approval buttons.                 | Preserve the footer outside the scrolling review body. Check it at short heights with long content and opened details.                                                          |
| Alex likes the site logo and wallet address in the header.            | Preserve requester, actual origin, signing account and network. A logo must not imply verification; vault funds and the personal signing key need separate identification.      |
| Alex asks for shorter warnings and explanations.                      | Lead with the consequence. Keep blocking explanations visible; offer secondary explanation on demand. Continue a focused copy pass over Handshake scenarios.                    |
| Alexis asks for fewer labels.                                         | Remove repeated headings and generic guarantee prefixes where the content already explains itself. Keep labels that distinguish amount limits, estimates, fees and permissions. |
| Alex prefers attribution within sentences.                            | Use inline attribution rather than a separate Source label. Use the actual origin of each claim; an app quote is not a Leather guarantee.                                       |
| Alexis suggests floating footnotes; Alex supports them.               | Prototype an explanation popover usable with keyboard and click/tap as well as mouse hover. Essential risk and action consequences stay in the review.                          |
| Alexis’s initial response is positive but says more review is needed. | Treat it as encouragement, not a separate design requirement or approval to ship.                                                                                               |
| Fabricio notes excess text and crowded layouts.                       | Limit the next iteration to one direction and a compact test set; add detail only when it changes the decision or supports verification.                                        |

## Form factors

The interactive Viewer now offers Extension (390 × 756), Phone (390 × 844), Small phone (360 × 640) and Web panel (560 × 756). These are browser layout previews. Overview thumbnails and current-product captures remain extension-sized.

On extension, keep the compact identity pair, independent content scroll and visible fee/action area. On mobile, carry the same order into the existing full-height native approval sheet, with the native scrolling container and bottom safe-area footer. A small screen increases the value of concise copy and progressive disclosure. Details and footnotes must open on tap; hover cannot be required. On web, constrain the approval to a readable panel instead of stretching the information across the viewport.

Before a native implementation is accepted, validate iOS and Android safe areas, larger text, long addresses, screen-reader order, keyboard focus, return to the requesting app, cancellation and hardware-signing support. A scaled browser frame cannot prove any of those. The current inspected mobile approval/account paths have no vault implementation; mobile vault capability is a separate delivery dependency.

## Vault approvals

Use one visual structure with verbs that describe the actual step:

| Step                | What the user must understand                                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Propose             | Signs a proposal commitment. It does not move funds or count as a transaction signature. Show the vault, intended movement, proposer and policy threshold.                     |
| Queued              | Waiting behind the active proposal. A queued Stacks proposal has no transaction signature or assigned nonce; review it again after promotion.                                  |
| Sign                | Adds this member’s transaction signature. Show the vault being spent from separately from the personal signer, existing signatures, threshold and eventual fee payer.          |
| Broadcast           | Sends a transaction that has the required signatures. Show the exact transaction, spending account, fee and current state again; reaching threshold alone is not confirmation. |
| Blocked or declined | Explain ineligible signer, wrong network, stale payload or rejection. Closing the approval and recording a decline are different actions.                                      |

Keep Stacks and Bitcoin semantics explicit. Stacks account nonces and ordered public keys differ from Bitcoin inputs and PSBT/policy review. A competing-nonce example is an external-coordinator exploration; Leather’s current coordinator queues Stacks proposals. Neither a global wallet selection nor whole-vault membership is sufficient to identify an eligible signer for a particular account.

## Next steps

1. Finish a Handshake copy and hierarchy pass on six representative reviews: connect, simple transfer, contract call with enforced limits, unrestricted/high-risk call, vault signature and threshold-ready broadcast. Include one blocked state. Keep the other directions unchanged unless a concrete gap requires borrowing a pattern.
2. Run a short task-based review on extension and small phone. Ask people to identify the requester, signer, asset movement, fee payer, protection limits and what happens after the primary action. Compare to the current product, with task errors and comprehension taking priority over aesthetic preference.
3. Resolve RPC/coordinator gaps before production UI work: rich proposal data beside the commitment, exact payload/state validation, signer eligibility, nonce/promotion handling and native vault support. Do not let a polished prototype imply these capabilities already exist.
4. Implement one shared approval contract and platform shells. Keep chain decoding and verification in domain/application layers, and put platform layout and disclosure interactions in presentation code. Roll out routine approvals first, then high-risk and vault flows with the same acceptance criteria.

Advance when users can correctly state whose funds/key are involved, what is signed now, whether funds move now, and who pays the fee. Reopen another direction only if Handshake fails a concrete task that the alternative demonstrably handles better.

## Local review and verification

Working branch: `codex/approval-handshake-review`, based on `claude/approval-ui-design-overhaul-5f44fa` (already checked out in another worktree).

- [Handshake overview](http://127.0.0.1:5178/playground/approval-flows)
- [Small-phone vault broadcast review](http://127.0.0.1:5178/playground/approval-flows?view=viewer&direction=handshake&screen=vault-ready-to-broadcast&form=small-phone)
- [Phone warning explanation](http://127.0.0.1:5178/playground/approval-flows?view=viewer&direction=handshake&screen=contract-call-likely-fail&form=phone)

Restart the preview with `pnpm --filter @leather.io/web dev --host 127.0.0.1 --port 5178` from the repository root.

All required commands passed: `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm knip`, and `pnpm --filter @leather.io/extension lint:unused-exports`. Knip prints nine existing advisory tag notices and exits successfully. Existing code comments were checked against the branch base and preserved.

Browser checks confirmed actual 360 × 640 and 560 × 756 frame dimensions without horizontal overflow, a stationary action footer while content scrolls, an initially disabled high-risk approval, click and keyboard explanation opening, and Close/Escape dismissal. Escape closes the explanation while retaining the viewer. Physical touch, native screens and signing hardware remain to be validated.
