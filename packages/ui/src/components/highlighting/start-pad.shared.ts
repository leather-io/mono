export function startPad(n: number, z = 2, s = '0') {
  return (n + '').length <= z
    ? ['', '-'][+(n < 0)] + (s.repeat(z) + Math.abs(n)).slice(-1 * z)
    : n + '';
}
