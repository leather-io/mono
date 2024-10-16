export interface HiroMessage {
    id: string;
    title: string;
    text: string;
    img?: string;
    imgWidth?: string;
    purpose: 'error' | 'info' | 'warning';
    publishedAt: string;
    dismissible: boolean;
    chainTarget: 'all' | 'mainnet' | 'testnet';
    learnMoreUrl?: string;
    learnMoreText?: string;
}
export declare enum AvailableRegions {
    InsideUsa = "inside-usa-only",
    OutsideUsa = "outside-usa-only",
    Global = "global"
}
export interface ActiveFiatProvider {
    availableRegions: AvailableRegions;
    enabled: boolean;
    hasFastCheckoutProcess: boolean;
    hasTradingFees: boolean;
    name: string;
}
interface FeeEstimationsConfig {
    maxValues?: number[];
    maxValuesEnabled?: boolean;
    minValues?: number[];
    minValuesEnabled?: boolean;
}
export interface RemoteConfig {
    messages: any;
    activeFiatProviders?: Record<string, ActiveFiatProvider>;
    bitcoinEnabled: boolean;
    bitcoinSendEnabled: boolean;
    feeEstimationsMinMax?: FeeEstimationsConfig;
    nftMetadataEnabled: boolean;
    ordinalsbot?: {
        integrationEnabled: boolean;
        mainnetApiUrl: string;
        signetApiUrl: string;
    };
    tokensEnabledByDefault: string[];
}
export {};
//# sourceMappingURL=remote-config.d.ts.map