export type AssetForAvatar =
  | { protocol: 'nativeStx' }
  | { protocol: 'nativeBtc' }
  | { protocol: 'sip10'; contractId: string; imageCanonicalUri: string; name: string }
  | { protocol: string };
