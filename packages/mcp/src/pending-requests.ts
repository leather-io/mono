import { randomUUID } from 'node:crypto';

import { McpToolError } from './errors';

type ProposeRequestKind = 'send' | 'contract-call' | 'swap';
type RequestKind = 'connect' | ProposeRequestKind;

type RequestState =
  | 'pending'
  | 'opened'
  | 'approved'
  | 'rejected'
  | 'failed'
  | 'expired'
  | 'cancelled';

interface RequestOutcomeError {
  code: string | number;
  message: string;
}

export interface PendingRequest {
  id: string;
  kind: RequestKind;
  state: RequestState;
  createdAt: number;
  expiresAt: number;
  summary: string;
  rpcMethod: string;
  rpcParams?: unknown;
  pairingCode?: string;
  result?: unknown;
  error?: RequestOutcomeError;
}

interface CreateRequestInput {
  kind: RequestKind;
  summary: string;
  rpcMethod: string;
  rpcParams?: unknown;
  pairingCode?: string;
}

const terminalStates: RequestState[] = ['approved', 'rejected', 'failed', 'expired', 'cancelled'];

export function isTerminalState(state: RequestState): boolean {
  return terminalStates.includes(state);
}

export class PendingRequestStore {
  private readonly ttlMs: number;
  private readonly requests = new Map<string, PendingRequest>();

  constructor(ttlMs: number) {
    this.ttlMs = ttlMs;
  }

  create(input: CreateRequestInput): PendingRequest {
    const inFlight = this.findNonTerminalByClass(input.kind);
    if (inFlight)
      throw new McpToolError(
        'REQUEST_IN_FLIGHT',
        `Request ${inFlight.id} (${inFlight.kind}) is still ${inFlight.state}. Check it with check_request or cancel it with cancel_request before creating another.`
      );

    const now = Date.now();
    const request: PendingRequest = {
      id: randomUUID(),
      kind: input.kind,
      state: 'pending',
      createdAt: now,
      expiresAt: now + this.ttlMs,
      summary: input.summary,
      rpcMethod: input.rpcMethod,
      rpcParams: input.rpcParams,
      pairingCode: input.pairingCode,
    };
    this.requests.set(request.id, request);
    return request;
  }

  get(id: string): PendingRequest | undefined {
    const request = this.requests.get(id);
    if (!request) return undefined;
    if (!isTerminalState(request.state) && request.expiresAt <= Date.now()) {
      request.state = 'expired';
    }
    return request;
  }

  getOrThrow(id: string): PendingRequest {
    const request = this.get(id);
    if (!request)
      throw new McpToolError(
        'UNKNOWN_REQUEST',
        `No request with id ${id}. Requests do not survive a server restart; create a new one.`
      );
    return request;
  }

  markOpened(id: string) {
    const request = this.get(id);
    if (!request || isTerminalState(request.state)) return;
    request.state = 'opened';
  }

  complete(
    id: string,
    outcome: 'approved' | 'rejected' | 'failed',
    payload: { result?: unknown; error?: RequestOutcomeError }
  ) {
    const request = this.get(id);
    if (!request || isTerminalState(request.state)) return;
    request.state = outcome;
    request.result = payload.result;
    request.error = payload.error;
  }

  cancel(id: string): PendingRequest {
    const request = this.getOrThrow(id);
    if (isTerminalState(request.state))
      throw new McpToolError(
        'REQUEST_EXPIRED',
        `Request ${id} is already ${request.state} and cannot be cancelled.`
      );
    request.state = 'cancelled';
    return request;
  }

  private findNonTerminalByClass(kind: RequestKind): PendingRequest | undefined {
    for (const request of this.requests.values()) {
      const sameClass =
        kind === 'connect' ? request.kind === 'connect' : request.kind !== 'connect';
      if (sameClass && !isTerminalState(request.state) && this.get(request.id)?.state !== 'expired')
        return request;
    }
    return undefined;
  }
}
