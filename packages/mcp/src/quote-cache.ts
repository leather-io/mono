import { randomUUID } from 'node:crypto';

import type { SwapQuote } from '@leather.io/models';

import { McpToolError } from './errors';

interface CachedQuote {
  quote: SwapQuote;
  expiresAt: number;
}

export class QuoteCache {
  private readonly ttlMs: number;
  private readonly quotes = new Map<string, CachedQuote>();

  constructor(ttlMs: number) {
    this.ttlMs = ttlMs;
  }

  put(quote: SwapQuote): string {
    const quoteId = randomUUID();
    this.quotes.set(quoteId, { quote, expiresAt: Date.now() + this.ttlMs });
    return quoteId;
  }

  getOrThrow(quoteId: string): SwapQuote {
    const cached = this.quotes.get(quoteId);
    if (!cached || cached.expiresAt <= Date.now()) {
      this.quotes.delete(quoteId);
      throw new McpToolError(
        'QUOTE_EXPIRED',
        `Quote ${quoteId} is unknown or expired. Call get_swap_quotes again for fresh quotes.`
      );
    }
    return cached.quote;
  }
}
