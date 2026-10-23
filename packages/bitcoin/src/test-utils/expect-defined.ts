export function expectDefined<T>(value: T): NonNullable<T> {
  if (value === undefined || value === null) throw new Error('Expected value to be defined');
  return value;
}
