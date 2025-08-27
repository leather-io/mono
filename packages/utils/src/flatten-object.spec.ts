import { flattenObject } from './flatten-object';

describe(flattenObject.name, () => {
  describe('Object flattening', () => {
    test('flattens simple nested objects', () => {
      const input = { layer1: { layer2: 'value' } };
      const expected = { 'layer1.layer2': 'value' };
      expect(flattenObject(input)).toEqual(expected);
    });

    test('flattens deeply nested objects', () => {
      const input = {
        level1: {
          level2: {
            level3: {
              level4: 'deep value',
            },
          },
        },
      };
      const expected = { 'level1.level2.level3.level4': 'deep value' };
      expect(flattenObject(input)).toEqual(expected);
    });

    test('flattens objects with multiple properties', () => {
      const input = {
        user: {
          name: 'John',
          age: 30,
          address: {
            street: '123 Main St',
            city: 'Anytown',
          },
        },
        status: 'active',
      };
      const expected = {
        'user.name': 'John',
        'user.age': 30,
        'user.address.street': '123 Main St',
        'user.address.city': 'Anytown',
        status: 'active',
      };
      expect(flattenObject(input)).toEqual(expected);
    });

    test('handles empty objects', () => {
      expect(flattenObject({})).toEqual({});
    });
  });

  describe('Array flattening', () => {
    test('flattens simple arrays with objects', () => {
      const input = [{ key: 'value' }];
      const expected = { '[0].key': 'value' };
      expect(flattenObject(input)).toEqual(expected);
    });

    test('flattens arrays with multiple objects', () => {
      const input = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ];
      const expected = {
        '[0].name': 'John',
        '[0].age': 30,
        '[1].name': 'Jane',
        '[1].age': 25,
      };
      expect(flattenObject(input)).toEqual(expected);
    });

    test('flattens arrays with primitive values', () => {
      const input = ['first', 'second', 'third'];
      const expected = {
        '[0]': 'first',
        '[1]': 'second',
        '[2]': 'third',
      };
      expect(flattenObject(input)).toEqual(expected);
    });

    test('flattens nested arrays', () => {
      const input = [
        [1, 2],
        [3, 4],
      ];
      const expected = {
        '[0][0]': 1,
        '[0][1]': 2,
        '[1][0]': 3,
        '[1][1]': 4,
      };
      expect(flattenObject(input)).toEqual(expected);
    });

    test('handles empty arrays', () => {
      expect(flattenObject([])).toEqual({});
    });
  });

  describe('Mixed object and array flattening', () => {
    test('flattens objects containing arrays', () => {
      const input = {
        users: [
          { name: 'John', age: 30 },
          { name: 'Jane', age: 25 },
        ],
        meta: {
          count: 2,
        },
      };
      const expected = {
        'users[0].name': 'John',
        'users[0].age': 30,
        'users[1].name': 'Jane',
        'users[1].age': 25,
        'meta.count': 2,
      };
      expect(flattenObject(input)).toEqual(expected);
    });

    test('flattens arrays containing objects with nested arrays', () => {
      const input = [
        {
          id: 1,
          tags: ['tag1', 'tag2'],
        },
        {
          id: 2,
          tags: ['tag3'],
        },
      ];
      const expected = {
        '[0].id': 1,
        '[0].tags[0]': 'tag1',
        '[0].tags[1]': 'tag2',
        '[1].id': 2,
        '[1].tags[0]': 'tag3',
      };
      expect(flattenObject(input)).toEqual(expected);
    });

    test('handles complex nested structures', () => {
      const input = {
        data: {
          items: [
            {
              name: 'item1',
              properties: {
                color: 'red',
                sizes: ['small', 'medium'],
              },
            },
          ],
        },
      };
      const expected = {
        'data.items[0].name': 'item1',
        'data.items[0].properties.color': 'red',
        'data.items[0].properties.sizes[0]': 'small',
        'data.items[0].properties.sizes[1]': 'medium',
      };
      expect(flattenObject(input)).toEqual(expected);
    });
  });

  describe('Primitive value handling', () => {
    test('handles null values', () => {
      const input = { key: null };
      const expected = { key: null };
      expect(flattenObject(input)).toEqual(expected);
    });

    test('handles boolean values', () => {
      const input = { active: true, disabled: false };
      const expected = { active: true, disabled: false };
      expect(flattenObject(input)).toEqual(expected);
    });

    test('handles number values', () => {
      const input = {
        integer: 42,
        float: 3.14,
        zero: 0,
        negative: -10,
      };
      const expected = {
        integer: 42,
        float: 3.14,
        zero: 0,
        negative: -10,
      };
      expect(flattenObject(input)).toEqual(expected);
    });

    test('handles string values', () => {
      const input = {
        text: 'hello world',
        empty: '',
        unicode: '🚀',
      };
      const expected = {
        text: 'hello world',
        empty: '',
        unicode: '🚀',
      };
      expect(flattenObject(input)).toEqual(expected);
    });

    test('handles root primitive values', () => {
      expect(flattenObject('hello')).toEqual({ value: 'hello' });
      expect(flattenObject(42)).toEqual({ value: 42 });
      expect(flattenObject(true)).toEqual({ value: true });
      expect(flattenObject(null)).toEqual({ value: null });
    });
  });

  describe('Edge cases', () => {
    test('handles objects with array-like property names', () => {
      const input = {
        '0': 'first',
        '1': 'second',
        length: 2,
      };
      const expected = {
        '0': 'first',
        '1': 'second',
        length: 2,
      };
      expect(flattenObject(input)).toEqual(expected);
    });

    test('handles keys with special characters', () => {
      const input = {
        'key-with-dash': 'value1',
        key_with_underscore: 'value2',
        'key with space': 'value3',
        'key.with.dot': 'value4',
      };
      const expected = {
        'key-with-dash': 'value1',
        key_with_underscore: 'value2',
        'key with space': 'value3',
        'key.with.dot': 'value4',
      };
      expect(flattenObject(input)).toEqual(expected);
    });

    test('handles sparse arrays', () => {
      const input: any[] = [];
      input[0] = 'first';
      input[2] = 'third';

      const result = flattenObject(input);
      expect(result).toEqual({
        '[0]': 'first',
        '[1]': undefined,
        '[2]': 'third',
      });
    });
  });
});
