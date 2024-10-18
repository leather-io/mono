export interface DefaultProperties {
  platform: 'web' | 'extension' | 'mobile';
}

export interface ExternalAnalyticsClientInterface {
  track: (event: string, properties?: Json) => Promise<void>;
  screen: (name: string, properties?: Json) => Promise<void>;
  group: (groupId: string, traits?: Json) => Promise<void>;
  identify: (userId: string, traits?: Json) => Promise<void>;
}

export interface AnalyticsClientConfig {
  writeKey: string;
  client: ExternalAnalyticsClientInterface;
  defaultProperties?: DefaultProperties;
  defaultTraits?: Record<string, Json>;
}

export type Json =
  | Json[]
  | {
      [index: number]: Json;
    }
  | {
      [key: string]: Json;
    };

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
