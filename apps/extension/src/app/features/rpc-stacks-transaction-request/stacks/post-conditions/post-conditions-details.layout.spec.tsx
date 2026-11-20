import {
  Pc,
  PostConditionMode,
  type PostConditionModeName,
  type PostConditionWire,
  postConditionToWire,
} from '@stacks/transactions';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { Approver } from '@leather.io/ui';

import { PostConditionsDetailsLayout } from './post-conditions-details.layout';

vi.mock('./post-condition-list', () => ({
  PostConditionList({ postConditions }: { postConditions: PostConditionWire[] }) {
    return <div>{`${postConditions.length} post conditions listed`}</div>;
  },
}));

const postCondition = Pc.principal('SP000000000000000000002Q6VF78').willSendEq(42).ustx();
const noPostConditionsText =
  'Only fees will be transferred from your account or the transaction will abort.';
const listedPostConditionsText = '1 post conditions listed';

function renderLayout(
  postConditionMode: PostConditionMode | PostConditionModeName | undefined,
  postConditions: PostConditionWire[]
) {
  return render(
    <Approver requester="https://example.com">
      <PostConditionsDetailsLayout
        postConditions={postConditions}
        postConditionMode={postConditionMode}
      />
    </Approver>
  );
}

function postConditionsOf(hasPostConditions: boolean): PostConditionWire[] {
  return hasPostConditions ? [postConditionToWire(postCondition)] : [];
}

describe(PostConditionsDetailsLayout.name, () => {
  test.each([
    {
      mode: PostConditionMode.Deny,
      hasPostConditions: true,
      title: 'Standard checks',
      body: 'Only the transfers shown are allowed. Any other movement of assets will cancel the transaction.',
    },
    {
      mode: 'deny' as const,
      hasPostConditions: false,
      title: 'Standard checks',
      body: 'No asset transfers are permitted. Any movement of assets will cancel the transaction.',
    },
    {
      mode: undefined,
      hasPostConditions: false,
      title: 'Standard checks',
      body: 'No asset transfers are permitted. Any movement of assets will cancel the transaction.',
    },
    {
      mode: 'originator' as const,
      hasPostConditions: true,
      title: 'Originator mode',
      body: "Only the transfers shown below can move assets out of your account. Assets owned by contracts aren't restricted.",
    },
    {
      mode: PostConditionMode.Originator,
      hasPostConditions: false,
      title: 'Originator mode',
      body: "No assets will be transferred from your account by this transaction. Assets owned by contracts aren't restricted.",
    },
  ])(
    'shows the $title callout and the post conditions section for mode $mode with post conditions $hasPostConditions',
    ({ mode, hasPostConditions, title, body }) => {
      renderLayout(mode, postConditionsOf(hasPostConditions));

      expect(screen.getByText(title)).toBeDefined();
      expect(screen.getByText(body)).toBeDefined();
      expect(screen.getByText('Post conditions')).toBeDefined();
      expect(screen.queryByText(listedPostConditionsText) !== null).toBe(hasPostConditions);
      expect(screen.queryByText(noPostConditionsText) !== null).toBe(!hasPostConditions);
    }
  );

  test.each([PostConditionMode.Allow, 'allow' as const])(
    'shows the allow mode callout and the post condition list for mode %s with post conditions',
    mode => {
      renderLayout(mode, postConditionsOf(true));

      expect(screen.getByText('Allow mode')).toBeDefined();
      expect(
        screen.getByText(
          'The transfers shown will be checked, but this transaction can also move any other assets — including from your account — without limit. Only confirm if you fully trust the contract.'
        )
      ).toBeDefined();
      expect(screen.getByText('Post conditions')).toBeDefined();
      expect(screen.getByText(listedPostConditionsText)).toBeDefined();
    }
  );

  test.each([PostConditionMode.Allow, 'allow' as const])(
    'shows only the any-asset warning for mode %s without post conditions',
    mode => {
      renderLayout(mode, []);

      expect(screen.getByText('This transaction can transfer any of your assets')).toBeDefined();
      expect(
        screen.getByText(
          'If you confirm, you allow it to transfer any of your tokens. Only confirm if you trust and have verified the contract.'
        )
      ).toBeDefined();
      expect(screen.queryByText('Post conditions')).toBeNull();
      expect(screen.queryByText(noPostConditionsText)).toBeNull();
    }
  );
});
