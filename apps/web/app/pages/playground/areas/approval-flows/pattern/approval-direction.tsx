import { type ReactNode, createContext, useContext } from 'react';

import type { ApprovalIdentityContext } from './approval-identity-context';
import type { ApprovalAccountPlacement, ApprovalContainers } from './approval-options';
import type { ApprovalAccount, ApprovalNetwork, ApprovalRequester } from './approval-types';

export type ApprovalLines = ReactNode | ReactNode[];

export type ApprovalGuaranteeKind =
  | 'strict'
  | 'account-only'
  | 'unrestricted'
  | 'final'
  | 'open'
  | 'staking';

export type ApprovalAssetDirection = 'out' | 'in' | 'neutral';

export type ApprovalFeeSpeed = 'slow' | 'standard' | 'fast' | 'custom';

export type ApprovalHistoryState = 'confirmed' | 'pending' | 'failed';

export const whatMovesLabel = 'What moves';

export const whatMovedLabel = 'What moved';

export function isWhatMovesLabel(label?: string) {
  return label === whatMovesLabel || label === whatMovedLabel;
}

export interface DirectionSectionProps {
  label?: string;
  trailing?: ReactNode;
  divided?: boolean;
  collapsible?: boolean;
  summary?: ReactNode;
  isOpen: boolean;
  onToggle(): void;
  children: ReactNode;
}

export interface DirectionAssetRowProps {
  icon: ReactNode;
  label: string;
  qualifier?: string;
  amount: ReactNode;
  fiat?: string;
  direction: ApprovalAssetDirection;
  estimateSource?: string;
}

type ApprovalRecipientNameKind = 'bns' | 'yours';

export interface ApprovalRecipientName {
  value: string;
  kind: ApprovalRecipientNameKind;
  source?: string;
  caution?: string;
}

export interface DirectionRecipientRowProps {
  context?: ApprovalIdentityContext;
  address: ReactNode;
  label: string;
  name?: ApprovalRecipientName;
  caption?: ApprovalLines;
  avatar?: ReactNode;
}

export interface DirectionFeeRowProps {
  label: string;
  icon?: ReactNode;
  speed?: ApprovalFeeSpeed;
  amount: ReactNode;
  fiat?: string;
  caption?: ApprovalLines;
  action?: ReactNode;
}

export interface DirectionGuaranteeProps {
  kind: ApprovalGuaranteeKind;
  label: string;
  isWeak: boolean;
  children: ReactNode;
}

export interface DirectionRowProps {
  label: ReactNode;
  value: ReactNode;
  caption?: ApprovalLines;
  action?: ReactNode;
  stacked?: boolean;
}

export interface DirectionCheckRowProps {
  icon: ReactNode;
  title: string;
  caption?: ReactNode;
}

export type ApprovalPermissionKind = 'can' | 'cannot';

export interface DirectionPermissionProps {
  kind: ApprovalPermissionKind;
  children: string;
}

export interface DirectionAccountPickerProps {
  account: ApprovalAccount;
  caption: string;
  isConnected?: boolean;
}

export interface DirectionDisclosureRowProps {
  label: string;
  caption?: string;
  isExternal?: boolean;
}

export interface DirectionSwitchRowProps {
  switchId: string;
  title: ReactNode;
  caption?: ReactNode;
  icon?: ReactNode;
  isChecked: boolean;
  onCheckedChange(isChecked: boolean): void;
}

export interface DirectionChoiceProps {
  label: string;
  icon?: ReactNode;
  caption?: ApprovalLines;
  badge?: ReactNode;
  value?: ReactNode;
  valueCaption?: ReactNode;
  isSelected: boolean;
  isDisabled?: boolean;
  children?: ReactNode;
  onSelect(): void;
}

export interface DirectionAccountBlockProps {
  account: ApprovalAccount;
}

export interface DirectionHeaderProps {
  requester: ApprovalRequester;
  network: ApprovalNetwork;
  account?: ApprovalAccount;
  connecting?: ApprovalAccount;
  trailing?: ReactNode;
}

export interface DirectionIntentProps {
  title: string;
  kind?: ReactNode;
  icon?: ReactNode;
}

export interface DirectionHistoryStatusProps {
  state: ApprovalHistoryState;
  label: string;
  preposition: string;
  date: string;
  note?: ReactNode;
  actions?: ReactNode;
}

interface ApprovalDirectionOptionOverrides {
  accountPlacement?: ApprovalAccountPlacement;
  containers?: ApprovalContainers;
}

export interface ApprovalDirection {
  id: string;
  name: string;
  description: string;
  inspiration: string;
  optionOverrides?: ApprovalDirectionOptionOverrides;
  Header?(props: DirectionHeaderProps): ReactNode;
  Intent?(props: DirectionIntentProps): ReactNode;
  Section?(props: DirectionSectionProps): ReactNode;
  AssetRow?(props: DirectionAssetRowProps): ReactNode;
  RecipientRow?(props: DirectionRecipientRowProps): ReactNode;
  FeeRow?(props: DirectionFeeRowProps): ReactNode;
  Guarantee?(props: DirectionGuaranteeProps): ReactNode;
  Row?(props: DirectionRowProps): ReactNode;
  CheckRow?(props: DirectionCheckRowProps): ReactNode;
  Permission?(props: DirectionPermissionProps): ReactNode;
  AccountPicker?(props: DirectionAccountPickerProps): ReactNode;
  DisclosureRow?(props: DirectionDisclosureRowProps): ReactNode;
  SwitchRow?(props: DirectionSwitchRowProps): ReactNode;
  Choice?(props: DirectionChoiceProps): ReactNode;
  AccountBlock?(props: DirectionAccountBlockProps): ReactNode;
  HistoryStatus?(props: DirectionHistoryStatusProps): ReactNode;
}

const ApprovalDirectionContext = createContext<ApprovalDirection | undefined>(undefined);

interface ApprovalDirectionProviderProps {
  direction?: ApprovalDirection;
  children: ReactNode;
}

export function ApprovalDirectionProvider({ direction, children }: ApprovalDirectionProviderProps) {
  return (
    <ApprovalDirectionContext.Provider value={direction}>
      {children}
    </ApprovalDirectionContext.Provider>
  );
}

export function useApprovalDirection() {
  return useContext(ApprovalDirectionContext);
}
