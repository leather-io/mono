/**
 * Removes trailing periods from a string
 * @param str The input string
 * @returns The string with any trailing periods removed
 */
export function removeTrailingPeriod(str: string | undefined | null): string {
  if (!str) return '';
  
  // Remove any trailing periods
  return str.replace(/\.+$/, '');
} 