export function createMock<T extends object>(implementation: Partial<T>): T;
export function createMock(implementation: object): object {
  return implementation;
}
