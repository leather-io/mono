import type { ReactNode } from 'react';

import { Stack } from 'leather-styles/jsx';
import { ByosmContractEntry } from '~/features/bitcoin-staking/byosm/byosm-contract-entry';
import type { ByosmSignerManagerState } from '~/features/bitcoin-staking/byosm/use-byosm-signer-manager';
import { Pox5TxStatusScreen } from '~/features/bitcoin-staking/components/pox5-tx-status-screen';
import { StakingActiveInfo } from '~/features/bitcoin-staking/staking-active/staking-active-info';
import { StartStaking } from '~/features/bitcoin-staking/start-staking/start-staking';
import { UpdateStaking } from '~/features/bitcoin-staking/update-staking/update-staking';
import { Page } from '~/layouts/page/page';
import { stakingPaths } from '~/pages/bitcoin-staking/bitcoin-staking.constants';
import { StakingProviderTable } from '~/pages/bitcoin-staking/components/staking-provider-table';
import { StakingTopSection } from '~/pages/bitcoin-staking/components/staking-top-section';
import { Staking } from '~/pages/bitcoin-staking/staking';

import {
  byosmContractIds,
  claimableCycles,
  createEarnedRewards,
  createStakerInfo,
  listedSignerManagerContractId,
  mockBtcPayoutPreference,
  mockCurrentCycleId,
  mockTrackedTx,
  pendingStakeSeed,
  stackingDaoSignerManagerContractId,
} from './staking-mock-data';
import { Board, Section, StakingPlaygroundShell, StakingSurface } from './staking-surface';

const listedPosition = createStakerInfo({
  signerManagerContractId: listedSignerManagerContractId,
});

const unlistedPosition = createStakerInfo({
  signerManagerContractId: byosmContractIds.valid,
  amountMicroStx: 41_800_000_000n,
});

const stackingDaoPosition = createStakerInfo({
  signerManagerContractId: stackingDaoSignerManagerContractId,
  amountMicroStx: 3_200_000_000n,
});

const earnedRewards = createEarnedRewards(claimableCycles);

const routes = {
  index: '/staking',
  pool: '/staking/pool/:slug',
  byosm: '/staking/pool/byosm',
  active: '/staking/pool/:slug/active',
  update: '/staking/pool/:slug/update',
};

const byosmStates: Record<string, ByosmSignerManagerState> = {
  empty: { status: 'missing' },
  checking: { status: 'checking', contractId: byosmContractIds.valid },
  rejected: {
    status: 'invalid',
    contractId: byosmContractIds.notFound,
    validation: { status: 'invalid', reason: 'not-found' },
  },
};

interface StakingPageProps {
  title: string;
  backTo: string;
  children: ReactNode;
}

function StakingPage({ title, backTo, children }: StakingPageProps) {
  return (
    <Page>
      <Page.Header title={title} backTo={backTo} />
      <Page.Content>{children}</Page.Content>
    </Page>
  );
}

export function StakingStatesPage() {
  return (
    <StakingPlaygroundShell>
      <Section
        title="Discovery"
        description="Where everyone lands. The page sells the idea to a newcomer and reports the position to someone who already stakes — the two never appear together, so the whole top of the page swaps."
      >
        <Stack gap="space.07">
          <Board
            label="No position — the full page"
            note="The only board that renders /staking end to end. TVL is mocked per signer manager and summed the way the column does it; the USD line under it is absent because market data is not seeded."
            route={routes.index}
          >
            <StakingSurface>
              <Staking />
            </StakingSurface>
          </Board>

          <Board
            label="Position in a listed pool, rewards to claim"
            note="The position replaces the pitch, and claiming now lives on the row rather than in the pool table — the table row switches from Start earning to View position and carries nothing else."
            route={routes.index}
          >
            <StakingSurface
              seed={{
                stakerInfo: listedPosition,
                earnedRewards,
                lockedMicroStx: listedPosition.amountMicroStx,
              }}
            >
              <>
                <StakingTopSection />
                <StakingProviderTable mt="space.05" />
              </>
            </StakingSurface>
          </Board>

          <Board
            label="Position in a listed pool, nothing to claim"
            note="Claim rewards is absent rather than disabled, so the row carries one action until there is genuinely something to collect. This is what a new staker sees for their first cycle."
            route={routes.index}
          >
            <StakingSurface
              seed={{
                stakerInfo: createStakerInfo({
                  signerManagerContractId: listedSignerManagerContractId,
                  firstRewardCycle: mockCurrentCycleId + 1,
                }),
                lockedMicroStx: listedPosition.amountMicroStx,
              }}
            >
              <StakingTopSection />
            </StakingSurface>
          </Board>

          <Board
            label="Position in an unlisted signer manager"
            note="Same row, but no brand mark exists and the pool has no name worth trusting — so the slot takes a contract glyph and the contract id sits under the amount as the thing that actually identifies it."
            route={routes.index}
          >
            <StakingSurface
              seed={{
                stakerInfo: unlistedPosition,
                earnedRewards,
                lockedMicroStx: unlistedPosition.amountMicroStx,
              }}
            >
              <>
                <StakingTopSection />
                <StakingProviderTable mt="space.05" />
              </>
            </StakingSurface>
          </Board>

          <Board
            label="Stake submitted, not yet mined"
            note="Between broadcast and confirmation there is no position to read, so the page says so instead of showing the pitch again."
            route={routes.index}
          >
            <StakingSurface seed={pendingStakeSeed}>
              <StakingTopSection />
            </StakingSurface>
          </Board>
        </Stack>
      </Section>

      <Section
        title="Starting to stake"
        description="The pool page: overview grid, the form, and the review panel that mirrors it. Amount and duration validate live — type an out-of-range duration to see the inline error."
      >
        <Stack gap="space.07">
          <Board
            label="Open cycle"
            note="The common case, with ten days of room left in the cycle. This pool supports BTC payout, so the rewards-payout choice is offered."
            route={routes.pool}
          >
            <StakingSurface>
              <StakingPage title="Stake with a pool" backTo={stakingPaths.index}>
                <StartStaking poolSlug="fast-pool" />
              </StakingPage>
            </StakingSurface>
          </Board>

          <Board
            label="Cycle closing soon"
            note="Inside the last two days the countdown changes colour and switches to hours, because a rounded day count reads as zero exactly when the number starts to matter."
            route={routes.pool}
          >
            <StakingSurface seed={{ cyclePosition: 'closing-soon' }}>
              <StakingPage title="Stake with a pool" backTo={stakingPaths.index}>
                <StartStaking poolSlug="fast-pool" />
              </StakingPage>
            </StakingSurface>
          </Board>

          <Board
            label="Prepare phase"
            note="The contract rejects stakes here. The callout explains it and the stake step is held, so being blocked is something the form says rather than something the wallet reports back."
            route={routes.pool}
          >
            <StakingSurface seed={{ cyclePosition: 'prepare-phase' }}>
              <StakingPage title="Stake with a pool" backTo={stakingPaths.index}>
                <StartStaking poolSlug="fast-pool" />
              </StakingPage>
            </StakingSurface>
          </Board>

          <Board
            label="Pool that pays sBTC only"
            note="Stacking DAO has no BTC payout route, so the payout section states the outcome instead of offering a choice that cannot be honoured. Its fee is fixed at zero rather than read from the contract."
            route={routes.pool}
          >
            <StakingSurface>
              <StakingPage title="Stake with a pool" backTo={stakingPaths.index}>
                <StartStaking poolSlug="stacking-dao" />
              </StakingPage>
            </StakingSurface>
          </Board>

          <Board
            label="A stake is already in the mempool"
            note="The form would let someone stake twice, so it stands down until the first transaction settles."
            route={routes.pool}
          >
            <StakingSurface seed={pendingStakeSeed}>
              <StakingPage title="Stake with a pool" backTo={stakingPaths.index}>
                <StartStaking poolSlug="fast-pool" />
              </StakingPage>
            </StakingSurface>
          </Board>
        </Stack>
      </Section>

      <Section
        title="Bring your own signer manager"
        description="Reached from the table footer. One input stands between a pasted contract and the staking form, and it is the only place in the feature where the person, not the registry, chooses who holds the stake — so every rejection has to say what is wrong with the contract."
      >
        <Stack gap="space.07">
          <Board
            label="Empty"
            note="First contact. The description carries the warning that Leather checks the interface but cannot vouch for the operator."
            route={routes.byosm}
          >
            <StakingSurface>
              <StakingPage title="Stake with a pool" backTo={stakingPaths.index}>
                <ByosmContractEntry state={byosmStates.empty} />
              </StakingPage>
            </StakingSurface>
          </Board>

          <Board
            label="Checking"
            note="Two round trips — the contract interface, then PoX-5 registration — so the wait is long enough to need saying."
            route={routes.byosm}
          >
            <StakingSurface>
              <ByosmContractEntry state={byosmStates.checking} />
            </StakingSurface>
          </Board>

          <Board
            label="Rejected"
            note="Every rejection is this screen with a different sentence under the input: a malformed principal, a testnet address on mainnet, no contract at the address, a contract missing the signer-manager interface, one PoX-5 has not registered, or a check that failed outright and offers a retry instead. Only the sentence changes, so one stands in for all of them."
            route={routes.byosm}
          >
            <StakingSurface>
              <ByosmContractEntry state={byosmStates.rejected} />
            </StakingSurface>
          </Board>

          <Board
            label="Valid contract"
            note="The same start-staking form as a listed pool, with the pasted contract in the details section and a fee read from a contract nobody vetted. Pasting a signer manager that is already a listed pool is not shown: the flow hands over to that pool's own page."
            route={routes.byosm}
          >
            <StakingSurface>
              <StakingPage title="Stake with a pool" backTo={stakingPaths.index}>
                <StartStaking poolSlug="byosm" signerManagerContractId={byosmContractIds.valid} />
              </StakingPage>
            </StakingSurface>
          </Board>
        </Stack>
      </Section>

      <Section
        title="An active position"
        description="Where a staker returns: what is locked, until when, what is claimable, and the two things they can still do about it."
      >
        <Stack gap="space.07">
          <Board
            label="Rewards to claim, paid in sBTC"
            note={`Three completed cycles since the position opened (${claimableCycles.join(', ')}), each claimed as its own transaction, oldest first.`}
            route={routes.active}
          >
            <StakingSurface
              seed={{
                stakerInfo: listedPosition,
                earnedRewards,
                lockedMicroStx: listedPosition.amountMicroStx,
              }}
            >
              <StakingPage title="Your staking" backTo={stakingPaths.index}>
                <StakingActiveInfo poolSlug="fast-pool" />
              </StakingPage>
            </StakingSurface>
          </Board>

          <Board
            label="Rewards routed to a Bitcoin address"
            note="The stored payout preference shows in the grid instead of the sBTC default, so it is visible without opening the update form."
            route={routes.active}
          >
            <StakingSurface
              seed={{
                stakerInfo: listedPosition,
                earnedRewards,
                payoutPreference: mockBtcPayoutPreference,
                lockedMicroStx: listedPosition.amountMicroStx,
              }}
            >
              <StakingPage title="Your staking" backTo={stakingPaths.index}>
                <StakingActiveInfo poolSlug="fast-pool" />
              </StakingPage>
            </StakingSurface>
          </Board>

          <Board
            label="Nothing claimable yet"
            note="A position that starts next cycle has earned nothing that can be claimed — the state most new stakers see first."
            route={routes.active}
          >
            <StakingSurface
              seed={{
                stakerInfo: createStakerInfo({
                  signerManagerContractId: listedSignerManagerContractId,
                  firstRewardCycle: mockCurrentCycleId + 1,
                }),
                lockedMicroStx: listedPosition.amountMicroStx,
              }}
            >
              <StakingPage title="Your staking" backTo={stakingPaths.index}>
                <StakingActiveInfo poolSlug="fast-pool" />
              </StakingPage>
            </StakingSurface>
          </Board>

          <Board
            label="Prepare phase"
            note="Unstake and update would both be rejected by the contract, so they are held and the callout says for how long. Claiming is unaffected."
            route={routes.active}
          >
            <StakingSurface
              seed={{
                cyclePosition: 'prepare-phase',
                stakerInfo: listedPosition,
                earnedRewards,
                lockedMicroStx: listedPosition.amountMicroStx,
              }}
            >
              <StakingPage title="Your staking" backTo={stakingPaths.index}>
                <StakingActiveInfo poolSlug="fast-pool" />
              </StakingPage>
            </StakingSurface>
          </Board>

          <Board
            label="Position in an unlisted signer manager"
            note="Same page, but the pool has no name, description or icon to fall back on — the contract id is the identity."
            route={routes.active}
          >
            <StakingSurface
              seed={{
                stakerInfo: unlistedPosition,
                lockedMicroStx: unlistedPosition.amountMicroStx,
              }}
            >
              <StakingPage title="Your staking" backTo={stakingPaths.index}>
                <StakingActiveInfo poolSlug="byosm" />
              </StakingPage>
            </StakingSurface>
          </Board>
        </Stack>
      </Section>

      <Section
        title="Changing a position"
        description="Extend the lock, add STX, or change where rewards go. Every update restates the payout preference on-chain, which is why the form always loads the stored one before it will mount."
      >
        <Stack gap="space.07">
          <Board
            label="Default — nothing changed yet"
            note="Submitting without changing anything is the most likely first action, so it is a validation message rather than a wasted transaction."
            route={routes.update}
          >
            <StakingSurface
              seed={{
                stakerInfo: listedPosition,
                lockedMicroStx: listedPosition.amountMicroStx,
              }}
            >
              <StakingPage title="Update staking" backTo={stakingPaths.active('fast-pool')}>
                <UpdateStaking poolSlug="fast-pool" />
              </StakingPage>
            </StakingSurface>
          </Board>

          <Board
            label="An existing BTC payout is carried in"
            note="The form opens with the stored preference filled in, because absent calldata deletes it — an unrelated top-up must not silently move rewards back to sBTC."
            route={routes.update}
          >
            <StakingSurface
              seed={{
                stakerInfo: listedPosition,
                payoutPreference: mockBtcPayoutPreference,
                lockedMicroStx: listedPosition.amountMicroStx,
              }}
            >
              <StakingPage title="Update staking" backTo={stakingPaths.active('fast-pool')}>
                <UpdateStaking poolSlug="fast-pool" />
              </StakingPage>
            </StakingSurface>
          </Board>

          <Board
            label="Already locked for the maximum"
            note="Extending would push the total past 96 cycles and abort, so the limit is stated up front and only a top-up is left."
            route={routes.update}
          >
            <StakingSurface
              seed={{
                stakerInfo: createStakerInfo({
                  signerManagerContractId: listedSignerManagerContractId,
                  numCycles: 96,
                  firstRewardCycle: mockCurrentCycleId + 1,
                }),
                lockedMicroStx: listedPosition.amountMicroStx,
              }}
            >
              <StakingPage title="Update staking" backTo={stakingPaths.active('fast-pool')}>
                <UpdateStaking poolSlug="fast-pool" />
              </StakingPage>
            </StakingSurface>
          </Board>

          <Board
            label="Pool that pays sBTC only"
            note="No payout preference exists to restate, so the section states the outcome and the form is down to two fields."
            route={routes.update}
          >
            <StakingSurface
              seed={{
                stakerInfo: stackingDaoPosition,
                lockedMicroStx: stackingDaoPosition.amountMicroStx,
              }}
            >
              <StakingPage title="Update staking" backTo={stakingPaths.active('stacking-dao')}>
                <UpdateStaking poolSlug="stacking-dao" />
              </StakingPage>
            </StakingSurface>
          </Board>
        </Stack>
      </Section>

      <Section
        title="After submitting"
        description="Every stake, update, unstake and claim hands over to the same screen, which owns the page until the transaction resolves. On success it refreshes the position and moves on, so only the two states someone can be held in are shown here."
      >
        <Stack gap="space.07">
          <Board
            label="Waiting for confirmation"
            note="Replaces the surface underneath rather than overlaying it, so there is nothing to interact with while the position is in flux."
          >
            <StakingSurface>
              <Pox5TxStatusScreen trackedTx={mockTrackedTx} />
            </StakingSurface>
          </Board>

          <Board
            label="Rejected by the contract"
            note="The one message that has to land is that nothing moved. Dropped, not-found and unknown reuse this layout with their own sentence."
          >
            <StakingSurface seed={{ txOutcome: { status: 'failed', reason: 'aborted' } }}>
              <Pox5TxStatusScreen trackedTx={mockTrackedTx} />
            </StakingSurface>
          </Board>
        </Stack>
      </Section>
    </StakingPlaygroundShell>
  );
}
