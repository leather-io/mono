import type { ApprovalDirection } from '../pattern/approval-direction';
import {
  BreakdownAssetRow,
  BreakdownFeeRow,
  BreakdownGuarantee,
  BreakdownRecipientRow,
} from './breakdown-rows';
import { BreakdownSection } from './breakdown-section';

export const breakdownDirection: ApprovalDirection = {
  id: 'breakdown',
  name: 'Breakdown',
  description:
    'The money as a worked sum on a rail: from your account, what you send, the fee and how it’s paid, then the recipient or what arrives, with timing and the guarantee under it.',
  inspiration: 'Wise transfer review',
  Section(props) {
    return <BreakdownSection {...props} />;
  },
  AssetRow(props) {
    return <BreakdownAssetRow {...props} />;
  },
  RecipientRow(props) {
    return <BreakdownRecipientRow {...props} />;
  },
  FeeRow(props) {
    return <BreakdownFeeRow {...props} />;
  },
  Guarantee(props) {
    return <BreakdownGuarantee {...props} />;
  },
  AccountBlock() {
    return null;
  },
};
