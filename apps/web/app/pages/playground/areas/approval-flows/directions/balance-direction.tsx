import type { ApprovalDirection } from '../pattern/approval-direction';
import {
  BalanceAccountBlock,
  BalanceAssetRow,
  BalanceFeeRow,
  BalanceRecipientRow,
} from './balance-rows';
import { BalanceGuarantee, BalanceSection } from './balance-section';

export const balanceDirection: ApprovalDirection = {
  id: 'balance',
  name: 'Balance',
  description:
    'What changes in your wallet, as plus and minus lines, with what can move shown as a chip.',
  inspiration: 'Rabby, MetaMask, Phantom',
  Section(props) {
    return <BalanceSection {...props} />;
  },
  AssetRow(props) {
    return <BalanceAssetRow {...props} />;
  },
  RecipientRow(props) {
    return <BalanceRecipientRow {...props} />;
  },
  FeeRow(props) {
    return <BalanceFeeRow {...props} />;
  },
  Guarantee(props) {
    return <BalanceGuarantee {...props} />;
  },
  AccountBlock(props) {
    return <BalanceAccountBlock {...props} />;
  },
};
