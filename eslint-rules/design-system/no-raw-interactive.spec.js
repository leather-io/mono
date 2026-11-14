import { noRawInteractiveRule } from './no-raw-interactive.js';
import { ruleTester } from './rule-tester.js';

ruleTester.run('no-raw-interactive', noRawInteractiveRule, {
  valid: [
    { code: '<Button variant="outline" onClick={onCancel}>Cancel</Button>' },
    { code: '<Pressable onClick={onSelect}>Row</Pressable>' },
    { code: "import { View, Text } from 'react-native';" },
    { code: "import type { PressableProps } from 'react-native';" },
  ],
  invalid: [
    {
      code: '<button onClick={onCopy}>Copy</button>',
      errors: [
        {
          message:
            'Use Button, IconButton or Pressable from @leather.io/ui instead of a raw <button> — docs/design/never.md#raw-button',
        },
      ],
    },
    {
      code: '<styled.button onClick={onCopy}>Copy</styled.button>',
      errors: [{ messageId: 'styledButton' }],
    },
    {
      code: "const Trigger = styled('button', { base: { p: 'space.02' } });",
      errors: [{ messageId: 'styledButton' }],
    },
    {
      code: "import { TouchableOpacity, View } from 'react-native';",
      errors: [
        {
          messageId: 'nativeTouchable',
          data: { name: 'TouchableOpacity', link: 'docs/design/never.md#raw-button' },
        },
      ],
    },
  ],
});
