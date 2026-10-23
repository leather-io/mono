import { Stack, styled } from 'leather-styles/jsx';

import { Board, Section } from './playground-board';
import { SendTransferPreview } from './send-transfer-preview';
import { mixedAddressTypesScenario, taprootAvoidableScenario } from './spending-sources-mock-data';

export function SpendingSourcesPage() {
  return (
    <Stack gap="space.11" px="space.07" py="space.09">
      <Stack gap="space.03" maxWidth="70ch">
        <styled.h1 textStyle="heading.03">Spending sources</styled.h1>
        <styled.p textStyle="body.02" color="ink.text-subdued">
          Design record for showing, and choosing, which address types a Bitcoin send spends from on
          the sendTransfer approval (issue #2738). Leather keeps Taproot out on its own whenever
          Native SegWit covers the transfer, so most sends look like today; one that has to reach
          into Taproot says so, breaks the spend down by type and offers Edit sources. Every board
          is live: Edit sources opens the sheet, the switches re-run the wallet's largest-first coin
          selection, a type the transfer cannot do without is locked on with the reason instead of
          letting the user switch into an error, and Apply commits. Real components, mock coins.
        </styled.p>
      </Stack>

      <Section
        title="Approval screen"
        description="The sendTransfer approval as the sBTC bridge triggers it. The app only asks for an amount and a recipient; which addresses pay for it is the wallet's call, so the screen has to say so."
      >
        <Board
          label="Native SegWit covers it"
          note="Native SegWit covers the deposit alone, so Leather leaves Taproot out before the user sees anything, even here where the single largest coin sits on Taproot and today's largest-first selection would spend it. The screen is today's approval plus Edit sources in the You'll send header. No callout, no breakdown."
        >
          <SendTransferPreview scenario={taprootAvoidableScenario} />
        </Board>
        <Board
          label="Mixed address types"
          note="Native SegWit runs short, so coin selection reaches into Taproot: the incident case. The callout names the risk and always shows, with Edit sources as its one action; the account caption stops naming a single address, and You'll send breaks the spend down by type. Amounts are the inputs consumed; change returns to the account."
        >
          <SendTransferPreview scenario={mixedAddressTypesScenario} />
        </Board>
      </Section>

      <Section
        title="Edit sources sheet"
        description="Opened from Edit sources in either place. It lists what each address type holds and lets the user keep a type's coins untouched."
      >
        <Board
          label="Taproot needed"
          note="The incident case. Native SegWit alone cannot cover the deposit, so Taproot is locked on, and a red callout says why and gives the way out: go back to the app and use a smaller amount. Taproot alone cannot cover it either, so Native SegWit is locked too."
        >
          <SendTransferPreview scenario={mixedAddressTypesScenario} sheet={{ excluded: [] }} />
        </Board>
        <Board
          label="Taproot switched back on"
          note="Opened from the Native SegWit covers it approval. Leather had Taproot off, and the user has switched it back on: the switch is free because Native SegWit covers the deposit either way. Native SegWit stays locked, since Taproot alone falls short. Apply, and the big Taproot coin gets spent, so the callout and breakdown come back."
        >
          <SendTransferPreview scenario={taprootAvoidableScenario} sheet={{ excluded: [] }} />
        </Board>
      </Section>
    </Stack>
  );
}
