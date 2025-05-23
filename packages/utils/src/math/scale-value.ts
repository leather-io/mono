export function scaleValue(num: number): number {
  if (num === 0) return 0;
  const absNum = Math.abs(num);
  const exponent = Math.floor(Math.log10(absNum));
  const scale = Math.pow(10, exponent);
  const msd = Math.floor(absNum / scale);
  const result = msd * scale;
  // Fix floating point precision issues by rounding to 12 decimal places
  const rounded = Math.round(result * 1e12) / 1e12;
  return num < 0 ? -rounded : rounded;
}
