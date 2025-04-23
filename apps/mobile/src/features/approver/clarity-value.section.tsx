import { useTheme } from '@shopify/restyle';
import { ClarityType, ClarityValue, cvToString } from '@stacks/transactions';

import { Box, Text, Theme } from '@leather.io/ui/native';
import { assertUnreachable } from '@leather.io/utils';

function wrapText(val: string) {
  return <Text>{val}</Text>;
}

export function ClarityValueListDisplayer({
  val,
  level = 0,
}: {
  val: ClarityValue;
  level?: number;
}) {
  const theme = useTheme<Theme>();
  const encoding = 'tryAscii';

  switch (val.type) {
    case ClarityType.BoolTrue:
      return wrapText('true');
    case ClarityType.BoolFalse:
      return wrapText('false');
    case ClarityType.Int:
      return wrapText(val.value.toString());
    case ClarityType.UInt:
      return wrapText(`u${val.value.toString()}`);
    case ClarityType.Buffer:
      if (/[ -~]/.test(val.value)) return wrapText(JSON.stringify(val.value));
      return wrapText(`0x${val.value}`);
    case ClarityType.OptionalNone:
      return wrapText('none');
    case ClarityType.OptionalSome:
      return wrapText(`some ${cvToString(val.value, encoding)}`);
    case ClarityType.ResponseErr:
      return wrapText(`err ${cvToString(val.value, encoding)}`);
    case ClarityType.ResponseOk:
      return wrapText(`ok ${cvToString(val.value, encoding)}`);
    case ClarityType.PrincipalStandard:
    case ClarityType.PrincipalContract:
      return wrapText(val.value);
    case ClarityType.List:
      return wrapText(`[${val.value.map(v => cvToString(v, encoding)).join(', ')}]`);
    case ClarityType.Tuple:
      return (
        <Box>
          {Object.entries(val.value).map(([key, value]) => (
            <Box
              style={{ paddingLeft: level * theme.spacing['3'] }}
              key={key}
              gap="2"
              flexDirection={value.type === ClarityType.Tuple ? 'column' : 'row'}
            >
              <Text>{key}:</Text>
              <Box flexDirection="row">
                <ClarityValueListDisplayer val={value} level={level + 1} />
              </Box>
            </Box>
          ))}
        </Box>
      );
    case ClarityType.StringASCII:
      return wrapText(`"${val.value}"`);
    case ClarityType.StringUTF8:
      return wrapText(`u"${val.value}"`);
    default:
      assertUnreachable(val);
  }
}
