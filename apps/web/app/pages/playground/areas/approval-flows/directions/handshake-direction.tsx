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
    'Connecting joins the site and your account into one pair, and that pair heads every approval in the standard Approver header, under the title. Only what you can act on is filled; amounts and read-only facts sit in outlined cards, with no divider lines. A section with one self-labelled item omits a matching outer heading. Connection prompts omit the redundant not-connected status; existing connections stay marked on the account. Labels and qualifiers share a full-width top row, with icons and values underneath. Editing uses a text action and chevron; copying and external links keep their own icons. Ignores the Account and Containers options.',
  inspiration: 'Plaid, Ramp',
  optionOverrides: { accountPlacement: 'header', containers: 'interactive' },
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
