import { Divider } from '@/components/divider';
import { ClarityValueListDisplayer } from '@/features/approver/clarity-value.section';
import { t } from '@lingui/macro';
import { ChainId } from '@stacks/network';
import {
  ClarityType,
  ClarityValue,
  StringAsciiCV,
  TupleCV,
  UIntCV,
  cvToString,
  deserializeCV,
} from '@stacks/transactions';

import { stacksChainIdToCoreNetworkMode } from '@leather.io/stacks';
import { Approver, Box, Text } from '@leather.io/ui/native';
import { capitalize } from '@leather.io/utils';

function cvToDisplay(cv: ClarityValue): string {
  return cvToString(cv).replaceAll('"', '');
}
function chainIdToDisplay(chainIdCv: ClarityValue): string {
  if (chainIdCv.type !== ClarityType.UInt) return '';
  const chainIdString = cvToString(chainIdCv);
  const chainId = parseInt(chainIdString.replace('u', ''), 10);
  if (!Object.values(ChainId).includes(chainId)) return '';
  return capitalize(stacksChainIdToCoreNetworkMode(chainId));
}

type StructuredMessageDataDomain = TupleCV<{
  name: StringAsciiCV;
  version: StringAsciiCV;
  'chain-id': UIntCV;
}>;

interface StructuredMessageSectionProps {
  messageToSign: { messageType: 'structured'; message: string; domain: string };
}

export function StructuredMessageSection({ messageToSign }: StructuredMessageSectionProps) {
  const dom: StructuredMessageDataDomain = deserializeCV(messageToSign.domain);

  const domainName = cvToDisplay(dom.value.name);
  const domainVersion = cvToDisplay(dom.value.version);
  const domainChainName = chainIdToDisplay(dom.value['chain-id']);
  return (
    <Approver.Section>
      <Text variant="label01">
        {t({
          id: 'approver.signMessage.message-subtitle',
          message: 'Message',
        })}
      </Text>
      <Box gap="4">
        <Box flexDirection="row" justifyContent="space-between">
          <Text>{domainName}</Text>
          <Text>
            {domainVersion} {domainChainName}
          </Text>
        </Box>
        <Divider />
        <ClarityValueListDisplayer val={deserializeCV(messageToSign.message)} />
      </Box>
    </Approver.Section>
  );
}
