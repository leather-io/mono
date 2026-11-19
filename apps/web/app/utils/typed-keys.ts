export function typedKeys<T extends object>(record: T) {
  const keys: Extract<keyof T, string>[] = [];
  for (const key in record) {
    if (Object.prototype.hasOwnProperty.call(record, key)) keys.push(key);
  }
  return keys;
}
