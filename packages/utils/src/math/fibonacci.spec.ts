import { fibonacciGenerator } from './fibonacci';

function take(gen: IterableIterator<number>, count: number) {
  const out: number[] = [];
  for (let i = 0; i < count; i++) out.push(gen.next().value as number);
  return out;
}

describe('fibonacciGenerator', () => {
  it('yields the fibonacci sequence from the default start index', () => {
    expect(take(fibonacciGenerator(), 10)).toEqual([0, 1, 1, 2, 3, 5, 8, 13, 21, 34]);
  });

  it('yields the fibonacci sequence from a given start index', () => {
    expect(take(fibonacciGenerator(2), 8)).toEqual([1, 2, 3, 5, 8, 13, 21, 34]);
  });

  it('computes large indices without exponential blowup', () => {
    const value = fibonacciGenerator(50).next().value;
    expect(value).toBe(12586269025);
  });
});
