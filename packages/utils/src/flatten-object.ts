type ObjectValue = string | number | boolean | null | NestedObject | ObjectValue[];
interface NestedObject {
  [key: string]: ObjectValue;
}

interface FlattenedObject {
  [key: string]: string | number | boolean | null;
}

/**
 * Flattens a nested object or array into a flat object with dot-notation key paths.
 *
 * @param input - The object or array to flatten
 * @param prefix - Internal parameter for recursion, represents the current key path
 * @returns A flat object where keys represent the path to the original nested value
 *
 * @example
 * ```typescript
 * // Object example
 * flattenObject({ layer1: { layer2: 'value' } })
 * // Returns: { 'layer1.layer2': 'value' }
 *
 * // Array example
 * flattenObject([{ key: 'value' }])
 * // Returns: { '[0].key': 'value' }
 *
 * // Mixed example
 * flattenObject({ users: [{ name: 'John', age: 30 }] })
 * // Returns: { 'users[0].name': 'John', 'users[0].age': 30 }
 * ```
 */
export function flattenObject(input: ObjectValue, prefix = ''): FlattenedObject {
  const result: FlattenedObject = {};

  if (input === null || typeof input !== 'object') {
    if (prefix === '') return { value: input };
    return { [prefix]: input };
  }

  if (Array.isArray(input)) {
    input.forEach((item, index) => {
      const key = prefix === '' ? `[${index}]` : `${prefix}[${index}]`;
      const flattened = flattenObject(item, key);
      Object.assign(result, flattened);
    });
  } else {
    Object.entries(input).forEach(([key, value]) => {
      const newKey = prefix === '' ? key : `${prefix}.${key}`;
      const flattened = flattenObject(value, newKey);
      Object.assign(result, flattened);
    });
  }

  return result;
}
