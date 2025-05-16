import { Box, Flex, styled } from 'leather-styles/jsx';
import { Address, ExternalAddress } from '~/features/stacking/components/address';
import { makeExplorerTxLink } from '~/utils/external-links';
import { toHumanReadableMicroStx } from '~/utils/unit-convert';

import { Hr } from '@leather.io/ui';

import { ReturnGetHasPendingDirectStacking } from '../get-has-pending-direct-stacking';

interface Props {
  data: ReturnGetHasPendingDirectStacking;
  transactionId: string | undefined;
  networkName: string;
}
export function PendingStackingInfo({ data, transactionId, networkName }: Props) {
  return (
    <>
      <Flex height="100%" justify="center" align="center">
        <Box>
          <Box mx={['space.04', 'space.06']}>
            <Flex flexDirection="column" pt="space.04" pb="space.04">
              <styled.h2 textStyle="heading.02">You&apos;re stacking</styled.h2>
              <styled.p textStyle="heading.02" fontSize="24px" fontWeight={500}>
                {toHumanReadableMicroStx(data.amountMicroStx)}
              </styled.p>

              <Box pb="space.04">
                <styled.p textStyle="label.02">Waiting for transaction confirmation</styled.p>
                <styled.p>
                  A stacking request was successfully submitted to the blockchain. Once confirmed,
                  the account will be ready to start stacking.
                </styled.p>
              </Box>

              <Hr />

              <Box mt="space.04">
                <Box>
                  <Box>
                    <styled.p textStyle="label.02">Duration</styled.p>
                    <styled.p>{data.lockPeriod.toString()} cycles</styled.p>
                  </Box>
                  <Box>
                    <styled.p textStyle="label.02">Bitcoin address</styled.p>
                    <Address address={data.poxAddress} />
                  </Box>
                </Box>
                <Box>
                  <Box>
                    {transactionId && (
                      <ExternalAddress
                        address={transactionId}
                        href={makeExplorerTxLink(transactionId, networkName)}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            </Flex>
          </Box>
        </Box>
      </Flex>
    </>
  );
}
