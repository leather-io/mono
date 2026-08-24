import { Stack } from 'leather-styles/jsx';
import { StakingProviderTable } from '~/pages/bitcoin-staking/components/staking-provider-table';

import {
  createStakerInfo,
  stackingDaoSignerManagerContractId,
} from '../staking-states/staking-mock-data';
import {
  Board,
  Section,
  StakingPlaygroundShell,
  StakingSurface,
} from '../staking-states/staking-surface';
import { SwitchSignerManagerPreview } from './switch-signer-manager-preview';

const stackingDaoPosition = createStakerInfo({
  signerManagerContractId: stackingDaoSignerManagerContractId,
  amountMicroStx: 3_200_000_000n,
});

const routes = {
  index: '/staking',
  update: '/staking/pool/:slug/update',
};

export function UpdateStakeSwitchPage() {
  return (
    <StakingPlaygroundShell
      title="Update stake: switch signer manager"
      description="Design record for update-stake also letting users change signer managers (issue #2643). A Switch action on the pool table deep-links into the update form, the form gains a signer-manager picker, and the summary card narrates every change before it is signed. The picker and card are the real components and now ship in the live update flow; these boards keep the interactive states with static position data."
    >
      <Section
        title="Entry point"
        description="Where a switch starts: the pool table, where the pool facts that justify switching already live."
      >
        <Board
          label="Pool table grows a Switch action"
          note="Rows for pools you are not in carry a quiet Switch action that deep-links into the update form with that pool preselected. Your own row keeps View position. The buttons navigate to the real update route, which preselects the target from the link."
          route={routes.index}
        >
          <StakingSurface
            seed={{
              stakerInfo: stackingDaoPosition,
              lockedMicroStx: stackingDaoPosition.amountMicroStx,
            }}
          >
            <StakingProviderTable />
          </StakingSurface>
        </Board>
      </Section>

      <Section
        title="The update form"
        description="One unified form covers every position change, mirroring the single stake-update transaction underneath. The summary card only lists what actually changes; unchanged fields are omitted."
      >
        <Stack gap="space.07">
          <Board
            label="Switch armed, moving to Fast Pool"
            note="The state a Switch action on the pool table would deep-link into: target preselected, the summary shows old to new, and the new pool's terms gate the confirm. Every board here is interactive, so pick other pools to see the summary react."
            route={routes.update}
          >
            <SwitchSignerManagerPreview initialProviderId="fastPool" />
          </Board>

          <Board
            label="Fee increase gets called out"
            note="Rows appear in the summary only when the value actually changes, and a fee increase is rendered in red so it cannot be missed. SenseiNode takes 10% where Stacking DAO takes none."
            route={routes.update}
          >
            <SwitchSignerManagerPreview initialProviderId="senseiNode" />
          </Board>

          <Board
            label="Quiet state, pool unchanged"
            note="The same form covers plain updates: with the current pool still selected the summary only narrates the extend and top-up, and there is no terms step because no new pool relationship is created."
            route={routes.update}
          >
            <SwitchSignerManagerPreview initialProviderId="stackingDao" />
          </Board>
        </Stack>
      </Section>

      <Section
        title="Custom signer managers"
        description="Both directions of the custom (byosm) case. Validation reuses the existing byosm state machine: checking, valid, invalid, not found, and a contract that turns out to be a listed pool snaps the selection to that pool's row instead. A custom contract has no hosted terms, so the confirm is gated by an acknowledgment rather than a T&C step."
      >
        <Stack gap="space.07">
          <Board
            label="Currently on a custom signer manager"
            note="The Current row is the contract itself: code avatar, truncated id, no fee or token meta because a custom contract does not declare them. Listed pools become the switch targets and the summary diffs from the contract id."
            route={routes.update}
          >
            <SwitchSignerManagerPreview currentIsCustom initialProviderId="currentCustom" />
          </Board>

          <Board
            label="Switching to a custom contract"
            note="Selecting the custom row expands the contract entry. Try it: any address with a dot validates, an address containing fast-pool snaps to the listed Fast Pool row, one ending in .not-found errors, and no dot is rejected as a format error. After validation the summary fills in and the acknowledgment gates Confirm switch."
            route={routes.update}
          >
            <SwitchSignerManagerPreview initialProviderId="custom" />
          </Board>
        </Stack>
      </Section>
    </StakingPlaygroundShell>
  );
}
