import React, { useState } from 'react';

import { demoTokenContract } from '@common/contracts';
import { useSTXAddress } from '@common/use-stx-address';
import {
  stacksTestnetNetwork as network,
  stacksLocalhostNetwork,
  stacksMainnetNetwork,
  stacksTestnetNetwork,
} from '@common/utils';
import { useConnect } from '@stacks/connect-react-jwt';
import { STACKS_TESTNET } from '@stacks/network';
import { type StacksTestnet } from '@stacks/network-v6';
import {
  type ClarityValue,
  type FungiblePostCondition,
  type NonFungiblePostCondition,
  PostConditionMode,
  StacksTransactionWire,
  type StxPostCondition,
  broadcastTransaction,
  bufferCV,
  bufferCVFromString,
  intCV,
  noneCV,
  postConditionToWire,
  serializeCV,
  serializePostConditionWire,
  someCV,
  sponsorTransaction,
  standardPrincipalCV,
  stringAsciiCV,
  stringUtf8CV,
  trueCV,
  tupleCV,
  uintCV,
} from '@stacks/transactions';
import { TestAppSelectors } from '@tests/selectors/test-app.selectors';
import BN from 'bn.js';
import { Box, Flex, styled } from 'leather-styles/jsx';

import { ExplorerLink } from './explorer-link';

export function Debugger() {
  const { doContractCall, doSTXTransfer, doContractDeploy } = useConnect();
  const address = useSTXAddress() ?? '';

  const [txId, setTxId] = useState<string>('');
  const [txType, setTxType] = useState<string>('');

  function clearState() {
    setTxId('');
    setTxType('');
  }

  function setState(type: string, id: string) {
    setTxId(id);
    setTxType(type);
  }

  // If need to add more test tokens: STW7PFH79HW1C9Z0SXBP5PTPHKZZ58KK9WP1MZZA
  async function handleSponsoredTransactionBroadcast(tx: StacksTransactionWire) {
    const sponsorOptions = {
      fee: 388,
      sponsorPrivateKey: 'b8c6aaef4b6de5e62648a59fff13e389856dff5e58163e676c2cfdf9dd5dd11101',
      transaction: tx,
    };

    const sponsoredTx = await sponsorTransaction(sponsorOptions);
    return broadcastTransaction({ transaction: sponsoredTx, network: STACKS_TESTNET });
  }

  async function callBnsTransfer() {
    // this will fail because the address does not own the name
    clearState();
    const args: ClarityValue[] = [
      bufferCVFromString('id'), // namespace
      bufferCVFromString('stella'), // name
      standardPrincipalCV('ST1X6M947Z7E58CNE0H8YJVJTVKS9VW0PHEG3NHN3'), // recipient
      noneCV(), // zonefile
    ];
    const pc: NonFungiblePostCondition = {
      type: 'nft-postcondition',
      address,
      condition: 'sent',
      asset: 'ST000000000000000000002AMW42H.bns::names',
      assetId: tupleCV({
        name: bufferCVFromString('stella'),
        namespace: bufferCVFromString('id'),
      }),
    };
    await doContractCall({
      network,
      contractAddress: 'ST000000000000000000002AMW42H',
      contractName: 'bns',
      functionName: 'name-transfer',
      functionArgs: args.map(arg => serializeCV(arg)),
      attachment: 'This is an attachment',
      postConditions: [serializePostConditionWire(postConditionToWire(pc))],
      onFinish: data => {
        setState('Contract Call', data.txId);
      },
    });
  }

  async function callAnimalTransfer() {
    clearState();
    const args = [
      uintCV(1),
      standardPrincipalCV('ST3K6AFDAW05G6Z9FWZD61RBRN6WV1J2N4MJG43JJ'), // sender
      standardPrincipalCV('ST9VQ21ZEGG54JDFE39B99ZBTSFSWMEC323MENFG'), // recipient
    ];
    await doContractCall({
      network,
      contractAddress: 'ST9VQ21ZEGG54JDFE39B99ZBTSFSWMEC323MENFG',
      contractName: 'animal',
      functionName: 'transfer',
      functionArgs: args.map(arg => serializeCV(arg)),
      postConditionMode: PostConditionMode.Allow,
      postConditions: [],
      onFinish: data => {
        setState('Contract Call', data.txId);
      },
    });
  }

  async function callFaker(
    network: StacksTestnet,
    mode = PostConditionMode.Deny,
    sponsored = false
  ) {
    clearState();
    const contractAddress = network.isMainnet()
      ? 'SPY0682ZM7VGPMVGQP99Z05J3QWMVV83RA6N42SA'
      : 'STS8CKF63P16J28AYF7PXW9E5AACH0NZNRV74CM7';

    const args = [
      uintCV(1234),
      intCV(-234),
      bufferCV(Buffer.from('hello, world')),
      stringAsciiCV('hey-ascii'),
      stringUtf8CV('hey-utf8'),
      standardPrincipalCV(contractAddress),
      trueCV(),
    ];

    const pc1: StxPostCondition = {
      type: 'stx-postcondition',
      address,
      condition: 'lte',
      amount: new BN('100', 10).toString(),
    };

    await doContractCall({
      network,
      contractAddress,
      contractName: 'faker',
      functionName: 'rawr',
      functionArgs: args.map(arg => serializeCV(arg)),
      attachment: 'This is an attachment',
      postConditionMode: mode,
      postConditions: [serializePostConditionWire(postConditionToWire(pc1))],
      onFinish: (data: any) => {
        if (sponsored) void handleSponsoredTransactionBroadcast(data.stacksTransaction);
        setState('Contract Call', data.txId);
      },
      onCancel: () => {
        // Handle cancel
      },
      sponsored,
    });
  }

  async function stxTransfer(amount: string) {
    clearState();
    await doSTXTransfer({
      network,
      amount,
      memo: 'From demo app',
      recipient: 'ST1X6M947Z7E58CNE0H8YJVJTVKS9VW0PHEG3NHN3',
      onFinish: data => {
        setState('Stacks Transfer', data?.txId);
      },
      onCancel: () => {
        // Handle cancel
      },
    });
  }

  async function deployContract() {
    clearState();
    await doContractDeploy({
      network,
      contractName: `demo-deploy-${new Date().getTime().toString()}`,
      codeBody: demoTokenContract,
      onFinish: data => {
        setState('Contract Deploy', data.txId);
      },
      onCancel: () => {
        // Handle cancel
      },
    });
  }

  async function callNullContract() {
    clearState();
    await doContractCall({
      network,
      contractAddress: 'ST1X6M947Z7E58CNE0H8YJVJTVKS9VW0PHEG3NHN3',
      contractName: `connect-token-${new Date().getTime()}`,
      functionName: 'faucet',
      functionArgs: [],
    });
  }

  const pc2: StxPostCondition = {
    type: 'stx-postcondition',
    address,
    condition: 'eq',
    amount: new BN(42, 10).toString(),
  };

  async function getRocketTokens() {
    clearState();
    await doContractCall({
      network,
      contractAddress: 'ST1X6M947Z7E58CNE0H8YJVJTVKS9VW0PHEG3NHN3',
      contractName: 'dull-sapphire-bird',
      functionName: 'buy',
      functionArgs: [serializeCV(uintCV(42))],
      postConditions: [serializePostConditionWire(postConditionToWire(pc2))],
      onFinish: data => {
        setState('Token Faucet', data.txId);
      },
      onCancel: () => {
        // Handle cancel
      },
    });
  }

  async function getStellaFaucetTokens() {
    clearState();
    await doContractCall({
      network,
      contractAddress: 'ST6G7N19FKNW24XH5JQ5P5WR1DN10QWMKQSPSTK7',
      contractName: 'stella-the-cat',
      functionName: 'faucet',
      functionArgs: [],
      onFinish: data => {
        setState('Token Faucet', data.txId);
      },
      onCancel: () => {
        // Handle cancel
      },
    });
  }

  const pc3: FungiblePostCondition = {
    type: 'ft-postcondition',
    address,
    condition: 'eq',
    amount: new BN(1).toString(),
    asset: 'ST6G7N19FKNW24XH5JQ5P5WR1DN10QWMKQSPSTK7.stella-the-cat::stella-token',
  };

  async function sendStellaTokens() {
    clearState();
    await doContractCall({
      network,
      contractAddress: 'ST6G7N19FKNW24XH5JQ5P5WR1DN10QWMKQSPSTK7',
      contractName: 'stella-the-cat',
      functionName: 'transfer',
      functionArgs: [
        uintCV(1), // amount
        standardPrincipalCV(address || ''), // sender
        standardPrincipalCV('ST1X6M947Z7E58CNE0H8YJVJTVKS9VW0PHEG3NHN3'), // recipient
        someCV(bufferCVFromString('meow')), // memo
      ].map(arg => serializeCV(arg)),
      postConditions: [serializePostConditionWire(postConditionToWire(pc3))],
      onFinish: data => {
        setState('Token Faucet', data.txId);
      },
      onCancel: () => {
        // Handle cancel
      },
    });
  }

  const pc4: FungiblePostCondition = {
    type: 'ft-postcondition',
    address,
    condition: 'eq',
    amount: new BN(1).toString(),
    asset: 'ST1X6M947Z7E58CNE0H8YJVJTVKS9VW0PHEG3NHN3.dull-sapphire-bird::rocket-token',
  };

  async function sendRocketTokens() {
    clearState();
    await doContractCall({
      network,
      contractAddress: 'ST1X6M947Z7E58CNE0H8YJVJTVKS9VW0PHEG3NHN3',
      contractName: 'dull-sapphire-bird',
      functionName: 'transfer',
      functionArgs: [
        uintCV(1), // amount
        standardPrincipalCV(address || ''), // sender
        standardPrincipalCV('ST1X6M947Z7E58CNE0H8YJVJTVKS9VW0PHEG3NHN3'), // recipient
      ].map(arg => serializeCV(arg)),
      postConditions: [serializePostConditionWire(postConditionToWire(pc4))],
      onFinish: data => {
        setState('Token Faucet', data.txId);
      },
      onCancel: () => {
        // Handle cancel
      },
    });
  }

  const pc5: FungiblePostCondition = {
    type: 'ft-postcondition',
    address,
    condition: 'eq',
    amount: new BN(1).toString(),
    asset: 'SP466FNC0P7JWTNM2R9T199QRZN1MYEDTAR0KP27.miamicoin-token::miami-token',
  };

  async function sendMiamiTokens() {
    clearState();
    await doContractCall({
      network,
      contractAddress: 'SP466FNC0P7JWTNM2R9T199QRZN1MYEDTAR0KP27',
      contractName: 'miamicoin-token',
      functionName: 'transfer',
      functionArgs: [
        uintCV(1), // amount
        standardPrincipalCV(address || ''), // sender
        standardPrincipalCV('ST1X6M947Z7E58CNE0H8YJVJTVKS9VW0PHEG3NHN3'), // recipient
      ].map(arg => serializeCV(arg)),
      postConditions: [serializePostConditionWire(postConditionToWire(pc5))],
      onFinish: data => {
        setState('Token Faucet', data.txId);
      },
      onCancel: () => {
        // Handle cancel
      },
    });
  }
  return (
    <Box py={6}>
      <styled.h2>Debugger</styled.h2>
      <styled.span>
        Try out a bunch of different transactions on the Stacks blockchain testnet.
      </styled.span>
      {txId && (
        <styled.span>
          <styled.span color="green" textStyle="body.02" data-testid="status-message">
            Successfully broadcasted &quot;{txType}&quot;
          </styled.span>
          <ExplorerLink txId={txId} />
        </styled.span>
      )}

      <Box>
        <Flex gap={4} my="space.04">
          <styled.button
            mt={3}
            onClick={() => callFaker(stacksTestnetNetwork, PostConditionMode.Allow)}
          >
            Contract call (ALLOW mode)
          </styled.button>
          <styled.button mt={3} onClick={() => callFaker(stacksTestnetNetwork)}>
            Contract call (Testnet)
          </styled.button>
          <styled.button
            data-testid={TestAppSelectors.BtnContractCall}
            mt={3}
            onClick={() => callFaker(stacksMainnetNetwork)}
          >
            Contract call (StacksMainnet)
          </styled.button>
          <styled.button mt={3} onClick={() => callFaker(stacksLocalhostNetwork)}>
            Contract call (Localhost)
          </styled.button>
          <styled.button
            data-testid={TestAppSelectors.BtnStxTransfer}
            mt={3}
            onClick={() => stxTransfer('102')}
          >
            STX transfer
          </styled.button>
          <styled.button mt={3} onClick={callBnsTransfer}>
            NFT with postconditions (will fail)
          </styled.button>
          <styled.button mt={3} onClick={callAnimalTransfer}>
            transfer Animal NFT
          </styled.button>
          <styled.button mt={3} onClick={deployContract}>
            Contract deploy
          </styled.button>
          <styled.button mt={3} onClick={getStellaFaucetTokens}>
            Get SteLLa tokens (sip 10 with memo)
          </styled.button>
          <styled.button mt={3} onClick={sendStellaTokens}>
            Send SteLLa tokens
          </styled.button>
          <styled.button mt={3} onClick={getRocketTokens}>
            Get Rocket tokens (old sip 10 no memo)
          </styled.button>
          <styled.button mt={3} onClick={sendRocketTokens}>
            Send Rocket tokens
          </styled.button>
          <styled.button mt={3} onClick={sendMiamiTokens}>
            Send Miami tokens
          </styled.button>
          <styled.button mt={3} onClick={callNullContract}>
            Non-existent contract
          </styled.button>
          <styled.button
            mt={3}
            onClick={() => callFaker(stacksTestnetNetwork, PostConditionMode.Allow, true)}
          >
            Sponsored contract call
          </styled.button>
          <styled.button
            mt={3}
            onClick={() => fetch('https://api.hiro.so/v2/info').then(resp => resp.json())}
          >
            Request API info
          </styled.button>

          <styled.button
            mt={3}
            onClick={() => {
              window.btc
                ?.request('getAddresses')
                .then(() => {
                  // Request successful
                })
                .catch(() => {
                  // Request failed
                });
            }}
          >
            RPC test
          </styled.button>
        </Flex>
      </Box>
    </Box>
  );
}
