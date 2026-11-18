import type { ApprovalDirection } from '../pattern/approval-direction';
import { HandshakeHeader, HandshakeIntent } from './handshake-header';
import {
  HandshakeAccountPicker,
  HandshakeAssetRow,
  HandshakeCheckRow,
  HandshakeChoice,
  HandshakeDisclosureRow,
  HandshakeFeeRow,
  HandshakeGuarantee,
  HandshakePermission,
  HandshakeRecipientRow,
  HandshakeRow,
  HandshakeSwitchRow,
} from './handshake-rows';
import { HandshakeSection } from './handshake-section';

export const handshakeDirection: ApprovalDirection = {
  id: 'handshake',
  name: 'Handshake',
  description:
    'The site and signing account form one pair above the action title. The header uses two identity lines; connection and transport details open from an info control beside the origin. Titles omit the default subtitle, with useful facts kept in the review body. Amounts and read-only facts sit in outlined cards. A section with one self-labelled item omits a matching outer heading. Labels and qualifiers share a full-width top row, with icons and values underneath. Editing uses a text action and chevron; copying and external links keep their own icons.',
  inspiration: 'Plaid, Ramp',
  optionOverrides: { containers: 'interactive' },
  Header(props) {
    return <HandshakeHeader {...props} />;
  },
  Intent(props) {
    return <HandshakeIntent {...props} />;
  },
  Section(props) {
    return <HandshakeSection {...props} />;
  },
  AssetRow(props) {
    return <HandshakeAssetRow {...props} />;
  },
  RecipientRow(props) {
    return <HandshakeRecipientRow {...props} />;
  },
  FeeRow(props) {
    return <HandshakeFeeRow {...props} />;
  },
  Guarantee(props) {
    return <HandshakeGuarantee {...props} />;
  },
  Row(props) {
    return <HandshakeRow {...props} />;
  },
  CheckRow(props) {
    return <HandshakeCheckRow {...props} />;
  },
  Permission(props) {
    return <HandshakePermission {...props} />;
  },
  AccountPicker(props) {
    return <HandshakeAccountPicker {...props} />;
  },
  DisclosureRow(props) {
    return <HandshakeDisclosureRow {...props} />;
  },
  SwitchRow(props) {
    return <HandshakeSwitchRow {...props} />;
  },
  Choice(props) {
    return <HandshakeChoice {...props} />;
  },
  AccountBlock() {
    return null;
  },
};
