import type { ApprovalDirection } from '../pattern/approval-direction';
import {
  ActivityAccountBlock,
  ActivityAssetRow,
  ActivityFeeRow,
  ActivityGuarantee,
  ActivityHistoryStatus,
  ActivityRecipientRow,
  ActivitySection,
} from './activity-rows';

export const activityDirection: ApprovalDirection = {
  id: 'activity',
  name: 'Activity',
  description: 'The approval reads like the activity details screen it becomes after signing.',
  inspiration: 'Leather activity details, Phantom, Rainbow',
  Section(props) {
    return <ActivitySection {...props} />;
  },
  AssetRow(props) {
    return <ActivityAssetRow {...props} />;
  },
  RecipientRow(props) {
    return <ActivityRecipientRow {...props} />;
  },
  FeeRow(props) {
    return <ActivityFeeRow {...props} />;
  },
  Guarantee(props) {
    return <ActivityGuarantee {...props} />;
  },
  AccountBlock(props) {
    return <ActivityAccountBlock {...props} />;
  },
  HistoryStatus(props) {
    return <ActivityHistoryStatus {...props} />;
  },
};
