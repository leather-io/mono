import { useEffect, useState } from 'react';

import { Link } from '@leather.io/ui';
import { createNullArrayOfLength } from '@leather.io/utils';

import { Content } from '@app/components/layout';
import { Header } from '@app/components/layout/headers/header';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import {
  DescriptionColumn,
  TwoColumnLayout,
} from '@app/components/layout/layouts/two-column.layout';
import { MnemonicForm } from '@app/pages/onboarding/sign-in/mnemonic-form';

interface EnterMnemonicProps {
  title: string;
  description: string;
}

export function EnterMnemonic({ title, description }: EnterMnemonicProps) {
  const [twentyFourWordMode, setTwentyFourWordMode] = useState(true);
  const [mnemonic, setMnemonic] = useState<(string | null)[]>([]);

  useEffect(() => {
    const emptyMnemonicArray = twentyFourWordMode
      ? createNullArrayOfLength(24)
      : createNullArrayOfLength(12);
    setMnemonic(emptyMnemonicArray);
  }, [twentyFourWordMode]);

  return (
    <>
      <Header px="space.04">
        <HeaderGrid leftCol={<HeaderBackButton />} rightCol={null} />
      </Header>
      <Content>
        <TwoColumnLayout
          leftColumn={
            <>
              <DescriptionColumn title={title} description={description} />
              <Link
                onClick={() => setTwentyFourWordMode(!twentyFourWordMode)}
                textStyle="label.03"
                width="fit-content"
                variant="text"
              >
                {twentyFourWordMode ? 'Have a 12-word Secret Key?' : 'Use 24 word Secret Key'}
              </Link>
            </>
          }
          rightColumn={
            <MnemonicForm
              mnemonic={mnemonic}
              setMnemonic={setMnemonic}
              twentyFourWordMode={twentyFourWordMode}
            />
          }
        />
      </Content>
    </>
  );
}
