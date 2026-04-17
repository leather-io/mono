// All new events should use the object-action framework.
import { CryptoAssetProtocol, DefaultNetworkConfigurations, StxBalance } from '@leather.io/models';

// https://segment.com/academy/collecting-data/naming-conventions-for-clean-data/
export interface Events extends HistoricalEvents {
  balance_updated: {
    walletAccountId: string;
    platform: 'mobile' | 'extension';
    stxAvailableBalance: number;
    stxLockedBalance: number;
    usdBalance: number;
    btcBalance: number;
  };
  user_setting_updated: UserSettingValue;
  wallet_created: WalletCreatedValue;
  wallet_restored: WalletCreatedValue;
  app_unlocked: undefined;
  app_locked: undefined;
  submit_feature_waitlist: SubmitWaitlist;
  legacy_request_initiated: { method: string; origin?: string };
  application_first_opened: { timestamp: string };
  pooled_stacking_started: {
    amount: number;
    provider: string;
    poolAddress: string;
    delegationDurationType?: string;
    numberOfCycles: number;
  };
  liquid_stacking_started: {
    amount: number;
    provider?: string;
  };
  liquid_stacking_increased: {
    amount: number;
  };
  stx_balance_updated: StxBalance;
  in_app_browser_opened: { url: string };
  add_wallet_sheet_opened: undefined;
  browser_sheet_opened: undefined;
  send_sheet_opened: { asset?: string };
  send_sheet_dismissed: undefined;
  swap_sheet_opened: { asset?: string };
  swap_sheet_dismissed: undefined;
  swap_base_asset_selected: { symbol: string; protocol: string };
  swap_target_asset_selected: { symbol: string; protocol: string };
  swap_amount_preset_selected: { preset: '25%' | '50%' | '75%' | 'max' };
  swap_assets_flipped: undefined;
  swap_currency_mode_toggled: { mode: 'crypto' | 'quote' };
  swap_slippage_changed: { slippage: number };
  swap_fee_tier_selected: { tier: string };
  swap_custom_fee_entered: { fee: number };
  swap_review_initiated: {
    baseSymbol: string;
    targetSymbol: string;
    baseAmount: number;
    provider: string;
  };
  swap_submitted: {
    baseSymbol: string;
    targetSymbol: string;
    baseAmount: number;
    targetAmount: number;
    provider: string;
  };
  swap_submission_success: {
    baseSymbol: string;
    targetSymbol: string;
    baseAmount: number;
    targetAmount: number;
    provider: string;
  };
  swap_submission_failure: {
    baseSymbol: string;
    targetSymbol: string;
    errorMessage: string;
    provider: string;
  };
  receive_sheet_opened: { type: string };
  receive_sheet_dismissed: undefined;
  send_asset_selected: { asset?: string };
  send_account_selected: undefined;
  send_back_button_pressed: { screen: string };
  send_inline_asset_picker_opened: undefined;
  send_max_selected: undefined;
  send_amount_entered: { amount: string };
  send_recipient_sheet_opened: undefined;
  send_recipient_selected: { type: 'internal' | 'external' };
  send_qr_scanner_opened: { source: 'toggle' | 'input' };
  send_transaction_review_initiated: { asset: string; amount: number };
  token_details_opened: { assetId: string; source: 'all_account_balances' | 'account_balances' };
  receive_address_copied: { asset: string; location: string };
  receive_share_button_pressed: { asset: string };
  token_portfolio_summary: TokenPortfolioSummary;
  collectibles_summary: CollectiblesSummary;
  token_details_viewed: TokenCollectibleDetailsViewed;
  collectible_details_viewed: TokenCollectibleDetailsViewed;
  app_icon_picker_sheet_opened: undefined;
  app_icon_picker_sheet_dismissed: undefined;
  app_icon_selected: { icon: string; previousIcon: string };
  app_icon_change_failed: { icon: string; previousIcon: string; error?: string };
  network_added: undefined;
  network_edited: undefined;
  taproot_utxo_warning_dialog_displayed: undefined;
}

// These are historical events that we'll maintain but that do not follow the object-action framework.
interface HistoricalEvents {
  add_network: undefined;
  bitcoin_rbf_fee_increase_error: { outputDiff: number };
  broadcast_ordinal_transaction: undefined;
  broadcast_ordinal_error: { error: any };
  broadcast_transaction: {
    symbol: string;
    amount?: number;
    fee?: number;
    inputs?: number;
    outputs?: number;
  };
  broadcast_btc_error: { error: any };
  copy_btc_address_to_clipboard: { type: string };
  copy_secret_key_to_clipboard: undefined;
  copy_address_to_add_new_inscription: undefined;
  copy_stx_address_to_clipboard: undefined;
  copy_recipient_bns_address_to_clipboard: undefined;
  create_new_account: undefined;
  change_network: { id: string };
  click_open_in_new_tab_menu_item: undefined;
  click_change_network_menu_item: undefined;
  click_change_theme_menu_item: undefined;
  click_settings_menu_item: undefined;
  click_toggle_privacy: undefined;
  click_unprotect_all_inscriptions: undefined;
  click_manage_inscriptions: undefined;
  request_psbt_cancel: undefined;
  request_sign_psbt_submit: undefined;
  request_update_profile_submit: undefined;
  request_update_profile_cancel: undefined;
  request_signature_cancel: undefined;
  requesting_origin_tab_closed_with_pending_action: undefined;
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
  user_clicked_feedback_button: undefined;
  unable_to_read_fee_in_stx_validator: undefined;
  unable_to_read_available_balance_in_stx_validator: undefined;
  view_bitcoin_transaction: undefined;
  view_transaction: undefined;
  view_collectibles: { ordinals_count?: number; stacks_nfts_count?: number };
  view_rpc_send_transfer_confirmation: { symbol: string };
  view_rpc_sign_and_broadcast_psbt_confirmation: { symbol: string };
  view_transaction_confirmation: { symbol: string };
  view_transaction_signing: undefined;
  view_transaction_signing_error: { reason: string };
  start_unlock: undefined;
  complete_unlock: { durationMs: number };
  background_analytics_schema_fail: undefined;
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
  request_signature_cannot_sign_message_no_account: undefined;
  request_signature_sign: { type: 'software' | 'ledger' };
  switch_account: { index: number; hasStxBalance: boolean };
  non_compliant_entity_detected: { address: string | string[] };
  ledger_transaction_publish_error: { error: { message: string; error: any } };
  native_segwit_tx_hex_to_ledger_tx: { success: boolean };
  psbt_sign_request_p2tr_missing_taproot_internal_key: undefined;
  ledger_nativesegwit_add_nonwitnessutxo: {
    action: 'add_nonwitness_utxo' | 'skip_add_nonwitness_utxo';
  };
  submit_invalid_secret_key: undefined;
  submit_valid_secret_key: undefined;
  increase_fee_transaction: { symbol: string; txid: string };
  finalize_tx_signature_error_thrown: { data: unknown };
  auth_response_with_illegal_redirect_uri: undefined;
  redux_persist_migration_to_no_serialization: undefined;
  sign_out: undefined;
  ledger_app_version_info: { info: object };
  ledger_transaction_signed_approved: undefined;
  ledger_transaction_signed_rejected: undefined;
  ledger_message_signed_approved: undefined;
  ledger_message_signed_rejected: undefined;
  ledger_public_keys_pulled_from_device: undefined;
  user_clicked_requested_by_link: { endpoint: string };
  user_approved_get_addresses: { origin: string };
  user_approved_message_signing: { origin: string };
}

export type EventName = keyof Events;

type UserSettingValue =
  | { account_display: 'stacks' | 'native-segwit' | 'taproot' | 'bns' }
  | { analytics: 'consent-given' | 'rejects-tracking' }
  | { bitcoin_unit: 'bitcoin' | 'satoshi' }
  | { email_address: string }
  | { fiat_currency: string }
  | { quote_currency: string }
  | { network: DefaultNetworkConfigurations }
  | { privacy_mode: 'hidden' | 'visible' }
  | { haptics: 'disabled' | 'enabled' }
  | { theme: 'light' | 'dark' | 'system' }
  | { language: string }
  | { security_level: 'insecure' | 'secure' | 'not-selected' }
  | { notifications: 'disabled' | 'enabled' | 'not-selected' }
  | { app_icon: string };

interface WalletCreatedValue {
  type: 'software' | 'ledger';
}

interface SubmitWaitlist {
  feature: string;
}

interface TokenPortfolioSummary {
  walletAccountId: string;
  platform: 'mobile' | 'extension';
  sip10TokenCount: number;
  totalTokenCount: number;
  sip10TokenValue: number;
  totalTokenValue: number;
  fiatCurrency?: string;
}

interface CollectiblesSummary {
  walletAccountId: string;
  platform: 'mobile' | 'extension';
  totalCollectibles: number;
  byProtocol: Partial<Record<CryptoAssetProtocol, CollectibleProtocolBreakdown>>;
}

interface TokenCollectibleDetailsViewed {
  assetId: string;
  protocol: CryptoAssetProtocol;
  platform: 'mobile' | 'extension';
  walletAccountId: string;
}

interface CollectibleProtocolBreakdown {
  total: number;
  byContentType?: Record<string, number>;
}
