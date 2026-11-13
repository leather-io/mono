import type { ApprovalDirection } from '../pattern/approval-direction';
import { TactileHeader, TactileIntent } from './tactile-header';
import {
  TactileAssetRow,
  TactileFeeRow,
  TactileGuarantee,
  TactileRecipientRow,
} from './tactile-rows';
import { TactileSection } from './tactile-section';

export const tactileDirection: ApprovalDirection = {
  id: 'tactile',
  name: 'Tactile',
  description:
    'The thing that moves leads: each amount and the recipient are big rounded cards joined by an arrow, the site shrinks to a pill, and fee and account sit in one tray below. Cards rise in with a spring and controls press down.',
  inspiration: 'Family wallet',
  Header(props) {
    return <TactileHeader {...props} />;
  },
  Intent(props) {
    return <TactileIntent {...props} />;
  },
  Section(props) {
    return <TactileSection {...props} />;
  },
  AssetRow(props) {
    return <TactileAssetRow {...props} />;
  },
  RecipientRow(props) {
    return <TactileRecipientRow {...props} />;
  },
  FeeRow(props) {
    return <TactileFeeRow {...props} />;
  },
  Guarantee(props) {
    return <TactileGuarantee {...props} />;
  },
  AccountBlock() {
    return null;
  },
};
