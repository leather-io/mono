import type { ApprovalDirection } from '../pattern/approval-direction';
import { PhantomHeader, PhantomIntent } from './phantom-header';
import { PhantomAssetRow, PhantomFeeRow, PhantomRecipientRow } from './phantom-rows';
import { PhantomGuarantee, PhantomSection } from './phantom-section';

export const phantomDirection: ApprovalDirection = {
  id: 'phantom',
  name: 'Centred',
  description:
    'Site and title centred over light grouped tiles: a changes group with big signed amounts, a details group for fee and account, risk as a tinted note.',
  inspiration: 'Calm consumer wallets',
  Header(props) {
    return <PhantomHeader {...props} />;
  },
  Intent(props) {
    return <PhantomIntent {...props} />;
  },
  Section(props) {
    return <PhantomSection {...props} />;
  },
  AssetRow(props) {
    return <PhantomAssetRow {...props} />;
  },
  RecipientRow(props) {
    return <PhantomRecipientRow {...props} />;
  },
  FeeRow(props) {
    return <PhantomFeeRow {...props} />;
  },
  Guarantee(props) {
    return <PhantomGuarantee {...props} />;
  },
  AccountBlock() {
    return null;
  },
};
