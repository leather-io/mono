export function pxStringToNumber(pxString: string): number {
  if (!/^\d+px$/.test(pxString)) {
    throw new Error('Invalid pixel string format');
  }
  return +pxString.replace('px', '');
}
