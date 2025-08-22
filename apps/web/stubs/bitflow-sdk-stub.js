// Stub for @bitflowlabs/core-sdk to avoid browser compatibility issues
export class BitflowSDK {
  constructor() {
    throw new Error('BitflowSDK not available in browser environment');
  }
}

// Export stub types to satisfy imports
export const QuoteResult = {};
export const RouteQuote = {};
export const SwapDataParamsAndPostConditions = {};
export const SwapExecutionData = {};
export const Token = {};
export const SelectedSwapRoute = {};
