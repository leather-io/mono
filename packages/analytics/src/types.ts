export interface DefaultProperties {
  platform: 'web' | 'extension' | 'mobile';
}

export interface ExternalAnalyticsClientInterface {
  track: (event: string, properties?: JsonMap) => Promise<void>;
  screen: (name: string, properties?: JsonMap) => Promise<void>;
  group: (groupId: string, traits?: JsonMap) => Promise<void>;
  identify: (userId: string, traits?: JsonMap) => Promise<void>;
}

export interface AnalyticsClientConfig {
  client: ExternalAnalyticsClientInterface;
  defaultProperties?: DefaultProperties;
  defaultTraits?: JsonMap;
}
export type JsonList = JsonValue[];
export type JsonValue = boolean | number | string | null | JsonList | JsonMap | undefined;
export interface JsonMap {
  [key: string]: JsonValue;
  [index: number]: JsonValue;
}

export type OptionalIfUndefined<T> = T extends undefined ? undefined : T;

interface HistoricalEventProperties {
  add_network: undefined;
  broadcast_retrieve_taproot_to_native_segwit: undefined;
  broadcast_ordinal_transaction: undefined;
  broadcast_ordinal_error: { error: any };
  broadcast_transaction: {
    symbol: string;
    amount: number;
    fee: number;
    inputs: number;
    outputs: number;
  };
  broadcast_btc_error: { error: any };
  copy_btc_address_to_clipboard: { type: string };
  copy_secret_key_to_clipboard: undefined;
  copy_address_to_add_new_inscription: undefined;
  copy_stx_address_to_clipboard: undefined;
  copy_recipient_bns_address_to_clipboard: undefined;
  change_network: { id: string };
  click_open_in_new_tab_menu_item: undefined;
  click_change_network_menu_item: undefined;
  click_change_theme_menu_item: undefined;
  click_toggle_privacy: undefined;
  request_psbt_cancel: undefined;
  request_sign_psbt_submit: undefined;
  request_update_profile_submit: undefined;
  request_update_profile_cancel: undefined;
  request_signature_cancel: undefined;
  requesting_origin_tab_closed_with_pending_action: { status: 'action_pending' };
  select_add_new_collectible: undefined;
  select_buy_option: { provider: string };
  select_theme: { theme: string };
  select_inscription_to_add_new_collectible: undefined;
  select_maximum_amount_for_send: undefined;
  submit_valid_password: undefined;
  submit_invalid_password: undefined;
  submit_fee_for_transaction: { calculation: string; fee: number | string; type: string };
  user_approved_send_transfer: { origin: string };
  user_approved_sign_and_broadcast_psbt: { origin: string };
  view_bitcoin_transaction: undefined;
  view_transaction: undefined;
  view_collectibles: { ordinals_count?: number; stamps_count?: number; stacks_nfts_count?: number };
  view_rpc_send_transfer_confirmation: { symbol: string };
  view_rpc_sign_and_broadcast_psbt_confirmation: { symbol: string };
  view_transaction_confirmation: { symbol: string };
  view_transaction_signing: undefined;
  view_transaction_signing_error: { reason: string };
  start_unlock: undefined;
  complete_unlock: { durationMs: number };
  background_analytics_schema_fail: undefined;
  new_brand_reveal_name: undefined;
  new_brand_accept_terms: undefined;
  new_brand_reject_terms: undefined;
  lock_session: undefined;
  remove_network: undefined;
  generate_new_secret_key: undefined;
  bitcoin_contract_error: { msg: string };
  ordinals_dot_com_unavailable: { error: any };
  schema_fail: {
    query: any;
    hash: string;
    error: string;
  };
  switch_account: { index: number; hasStxBalance: boolean };
  non_compliant_entity_detected: { address: string };
  ledger_transaction_publish_error: { error: { message: string; error: any } };
  native_segwit_tx_hex_to_ledger_tx: { success: boolean };
  psbt_sign_request: { status: 'missing_taproot_internal_key' };
  ledger_nativesegwit_add_nonwitnessutxo: {
    action: 'add_nonwitness_utxo' | 'skip_add_nonwitness_utxo';
  };
  redux_persist_migration_to_no_serialization: undefined;
}

export interface EventProperties extends HistoricalEventProperties {
  test_event_submitted: undefined;
}

export type EventName = keyof EventProperties;
