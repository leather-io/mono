import {
  PostConditionMode,
  type PostConditionModeName,
  type PostConditionWire,
} from '@stacks/transactions';

import { ensurePostConditionWireFormat } from '@leather.io/stacks';
import { Approver } from '@leather.io/ui';

import { NoPostConditions } from './no-post-conditions';
import { PostConditionList } from './post-condition-list';
import { PostConditionModeWarning } from './post-condition-mode-warning';

interface PostConditionsDetailsLayoutProps {
  postConditions: PostConditionWire[];
  postConditionMode?: PostConditionMode | PostConditionModeName;
}
export function PostConditionsDetailsLayout({
  postConditions,
  postConditionMode = PostConditionMode.Deny,
}: PostConditionsDetailsLayoutProps) {
  const hasPostConditions = postConditions.length > 0;
  const isAllowMode =
    postConditionMode === PostConditionMode.Allow || postConditionMode === 'allow';
  const showPostConditionsSection = hasPostConditions || !isAllowMode;

  return (
    <>
      <PostConditionModeWarning mode={postConditionMode} hasPostConditions={hasPostConditions} />
      {showPostConditionsSection && (
        <Approver.Section>
          <Approver.Subheader>Post conditions</Approver.Subheader>
          {hasPostConditions ? (
            <PostConditionList
              postConditions={postConditions.map(pc => ensurePostConditionWireFormat(pc))}
            />
          ) : (
            <NoPostConditions />
          )}
        </Approver.Section>
      )}
    </>
  );
}
