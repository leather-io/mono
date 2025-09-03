import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';

import { clarityContractSchema } from './clarity-contract.schema';

function makeContractFillerLine(num: number) {
  return `(define-constant filler${num} "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")\n`;
}

describe('clarityContractSchema', () => {
  it('should validate a valid small contract', () => {
    const validContract = '(define-constant hello "world")';

    expect(() => clarityContractSchema.parse(validContract)).not.toThrow();
  });

  it('should validate a moderately sized contract', () => {
    const validContract = `
      (define-constant hello "world")
      (define-public (say-hi)
        (ok "Hello World"))
      (define-read-only (get-greeting)
        hello)
    `;

    expect(() => clarityContractSchema.parse(validContract)).not.toThrow();
  });

  it('should throw ContractExceedsMaxLength error for oversized contract', () => {
    let oversizedContract = '(define-constant start "beginning")\n';

    for (let i = 0; i < 1500; i++) {
      oversizedContract += makeContractFillerLine(i);
    }

    oversizedContract += '(define-constant end "finished")';

    expect(() => clarityContractSchema.parse(oversizedContract)).toThrow();

    try {
      clarityContractSchema.parse(oversizedContract);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      const zodError = error as ZodError<string>;
      expect(zodError.issues).toHaveLength(1);
      expect(zodError.issues[0].message).toBe('ContractExceedsMaxLength');
    }
  });
});
