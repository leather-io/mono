import { ScrollView } from 'react-native-gesture-handler';

import { t } from '@lingui/macro';

import { Highlighter, Prism, Text } from '@leather.io/ui/native';

export function CodeCard({ codeBody }: { codeBody: string }) {
  return (
    <>
      <Text variant="label01">
        {t({
          id: 'approver.code.title',
          message: 'Code',
        })}
      </Text>
      <ScrollView horizontal>
        <Highlighter code={codeBody} prism={Prism} language="clarity" />
      </ScrollView>
    </>
  );
}
