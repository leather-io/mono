type McpToolErrorCode =
  | 'WALLET_NOT_PAIRED'
  | 'WALLET_NOT_INSTALLED'
  | 'REQUEST_IN_FLIGHT'
  | 'UNKNOWN_REQUEST'
  | 'REQUEST_EXPIRED'
  | 'QUOTE_EXPIRED'
  | 'UNSUPPORTED_ASSET'
  | 'UNSUPPORTED_ROUTE'
  | 'NAME_NOT_FOUND'
  | 'INVALID_PARAMS'
  | 'INTERNAL_ERROR';

export class McpToolError extends Error {
  readonly code: McpToolErrorCode;

  constructor(code: McpToolErrorCode, message: string) {
    super(message);
    this.name = 'McpToolError';
    this.code = code;
  }
}
