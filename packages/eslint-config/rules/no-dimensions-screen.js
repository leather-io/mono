// eslint-rules/no-dimensions-screen.js
export const noDimensionsScreenRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prefer Dimensions.get("window") over Dimensions.get("screen"). ' +
        'The "window" value represents the actual usable area of your app, excluding system UI. ' +
        'This mostly affects Android, where "screen" includes the status bar and navigation bar, ' +
        'causing layouts to render behind them and resulting in obscured content. ' +
        'On iOS the values are typically identical.',
    },
    messages: {
      noScreen: "Use Dimensions.get('window') instead of Dimensions.get('screen')",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'Dimensions' &&
          node.callee.property.name === 'get' &&
          node.arguments[0]?.value === 'screen'
        ) {
          context.report({ node, messageId: 'noScreen' });
        }
      },
    };
  },
};
