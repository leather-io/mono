import { stacksMemoSchema } from './memo.schema';

describe('stacksMemoSchema', () => {
  it('should pass for valid memo strings (<= 34 bytes)', () => {
    expect(() => stacksMemoSchema.parse('short memo')).not.toThrow();
    expect(() => stacksMemoSchema.parse('a'.repeat(34))).not.toThrow();
  });

  it('should fail for memo strings > 34 bytes', () => {
    expect(() => stacksMemoSchema.parse('a'.repeat(35))).toThrow('Invalid memo string');
    expect(() =>
      stacksMemoSchema.parse('This memo is definitely longer than thirty-four bytes!')
    ).toThrow('Invalid memo string');
  });
});
