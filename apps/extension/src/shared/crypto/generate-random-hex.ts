export function generateRandomHexString(byteLength = 16) {
  const randomValues = [...crypto.getRandomValues(new Uint8Array(byteLength))];
  return randomValues.map(val => ('00' + val.toString(16)).slice(-2)).join('');
}
