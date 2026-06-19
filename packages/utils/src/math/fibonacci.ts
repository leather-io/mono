function fibonacci(n = 0): number {
  if (n < 0) throw new Error('Cannot calculate from negative number');
  if (n < 2) return n;
  let prev = 0;
  let curr = 1;
  for (let i = 2; i <= n; i++) {
    const next = prev + curr;
    prev = curr;
    curr = next;
  }
  return curr;
}

export function* fibonacciGenerator(startIndex = 0): IterableIterator<number> {
  let index = startIndex;
  while (index < Infinity) yield fibonacci(index++);
  return Infinity;
}
