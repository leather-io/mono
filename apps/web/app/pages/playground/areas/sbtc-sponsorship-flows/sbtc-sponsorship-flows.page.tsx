import { Stack, styled } from 'leather-styles/jsx';

import { Board, Section } from '../staking-states/staking-surface';
import { SbtcSendFlow } from './sbtc-send-flow';
import { SponsoredContractCallFlow } from './sponsored-contract-call-flow';

export function SbtcSponsorshipFlowsPage() {
  return (
    <Stack gap="space.11" pb="space.11">
      <Stack gap="space.03" maxWidth="70ch">
        <styled.h1 textStyle="heading.03">sBTC sponsorship flows</styled.h1>
        <styled.p textStyle="body.02" color="ink.text-subdued">
          How a wallet that holds sBTC and no STX gets a transaction on chain. A Leather sponsor
          pays the STX fee and takes its own fee in sBTC inside the same call. Both boards are
          click-through mocks of the extension with dummy data: nothing is signed, quoted or
          submitted. The panel next to each frame narrates what the wallet and the sponsorship
          service do at every step.
        </styled.p>
      </Stack>

      <Section
        title="Phase 1 · sBTC transfer, one transaction"
        description="What ships today. Plain sBTC sends go through the token's transfer-many with two entries, the transfer and the fee, so the sponsor is paid inside the very transaction it sponsors. The quote is a signed rate plus a fee range and the wallet prices its usual Low, Standard and High tiers in sBTC."
      >
        <Board
          label="Send sBTC with an sBTC fee"
          note="The send form only offers the sBTC fee when the account cannot cover the lowest STX fee and has some sBTC. Pick a tier, continue to the review, confirm, and watch the Sent summary move from Pending to Confirmed. Edit the amount to see the balance check (amount plus fee must fit the 0.0025 sBTC balance)."
          route="/send/sbtc"
        >
          <SbtcSendFlow />
        </Board>
      </Section>

      <Section
        title="Phase 2 · contract call, two transactions"
        description="Planned and open for discussion. A contract call can abort on chain and the sponsor would still have paid its STX fee, so the fee moves into its own transaction that pays first: tx 1 is a transfer-many fee entry at the origin's next nonce, tx 2 is the call at the nonce after it, and the quote is bound to the call's payload hash. The user signs two transactions in one approval and pays the fee even if the call aborts, like gas."
      >
        <Stack gap="space.07">
          <Board
            label="Approve a dApp contract call with an sBTC fee"
            note="The approval looks like any other contract-call request, with a callout explaining that the fee is paid in sBTC through two transactions and a fee row that covers both. Approve to see the submitted state: the fee payment confirms first and the call follows."
            route="/rpc/stx_callContract"
          >
            <SponsoredContractCallFlow />
          </Board>

          <Board
            label="Same call from a Ledger account"
            note="A hardware account cannot sign both transactions in one go: Approve opens the Ledger sheet, the device is connected once, and the Stacks app then asks for two approvals in a row, transaction 1 of 2 (the fee payment) and 2 of 2 (the call), each showing the origin, nonce, fee 0 and the call details the device displays. Nothing is submitted until both are approved, and closing the sheet at any point cancels the whole bundle. Click Approve on device to simulate each device confirmation."
            route="/rpc/stx_callContract"
          >
            <SponsoredContractCallFlow signer="ledger" />
          </Board>
        </Stack>
      </Section>
    </Stack>
  );
}
