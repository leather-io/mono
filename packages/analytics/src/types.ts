export interface DefaultProperties {
  platform: 'web' | 'extension' | 'mobile';
}

export interface AnalyticsClientInterface {
  track: (event: string, properties?: JsonMap) => Promise<void>;
  screen: (name: string, properties?: JsonMap) => Promise<void>;
  group: (groupId: string, traits?: JsonMap) => Promise<void>;
  identify: (userId: string, traits?: JsonMap) => Promise<void>;
}
export interface AnalyticsClientConfig {
  writeKey: string;
  client: AnalyticsClientInterface;
  defaultProperties: DefaultProperties;
  defaultTraits?: Record<string, JsonValue>;
}

export type JsonValue = boolean | number | string | null | JsonList | JsonMap | undefined | unknown;

export interface JsonMap {
  [key: string]: JsonValue;
  [index: number]: JsonValue;
}

export type JsonList = JsonValue[];

export type OptionalIfUndefined<T> = T extends undefined ? undefined : T;

export interface EventProperties {
  background_analytics_schema_fail: undefined;
  schema_fail: {
    query: unknown;
    hash: string;
    error: string;
  };
  switch_account: { index: number; hasStxBalance: boolean };
  view_transaction_confirmation: { symbol: string };
  ordinals_dot_com_unavailable: {
    error: {
      errorMessage: string;
      errorName: string;
    };
  };
  select_maximum_amount_for_send: { maximum: boolean };
  copy_recipient_bns_address_to_clipboard: { value: 'thing' | 'other-thing' };
  broadcast_transaction: { symbol: string };
  broadcast_btc_error: {
    symbol: string;
    error: {
      errorMessage: string;
      errorName: string;
    };
  };
  request_signature_cancel: undefined;
  view_transaction_signing: undefined;
  submit_fee_for_transaction: { calculation: string; fee: number | string; type: string };
  request_update_profile_submit: { requestType: 'update' | 'cancel' };
  request_update_profile_cancel: { requestType: 'update' | 'cancel' };
  non_compliant_entity_detected: { address: string };
  requesting_origin_tab_closed_with_pending_action: { status: 'action_pending' };
  native_segwit_tx_hex_to_ledger_tx: { success: boolean };
  psbt_sign_request: { status: 'missing_taproot_internal_key' };
  ledger_nativesegwit_add_nonwitnessutxo: {
    action: 'add_nonwitness_utxo' | 'skip_add_nonwitness_utxo';
  };
  redux_persist_migration_to_no_serialization: undefined;
}

export type EventName = keyof EventProperties;
