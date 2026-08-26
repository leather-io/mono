import React, { useEffect, useState } from 'react';

import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import { hashMessage, verifyMessageSignatureRsv } from '@stacks/encryption';
import {
  ClarityValue,
  TupleCV,
  bufferCVFromString,
  contractPrincipalCV,
  encodeStructuredData,
  falseCV,
  intCV,
  listCV,
  noneCV,
  responseErrorCV,
  responseOkCV,
  serializeCV,
  someCV,
  standardPrincipalCV,
  stringAsciiCV,
  stringUtf8CV,
  trueCV,
  tupleCV,
  uintCV,
} from '@stacks/transactions';
import { Box, styled } from 'leather-styles/jsx';

import { LeatherProvider } from '@leather.io/rpc';

declare global {
  interface Window {
    LeatherProvider?: LeatherProvider;
  }
}

interface SignatureData {
  signature: string;
  publicKey: string;
}

export function Signature() {
  const [signatureStructured, setSignatureStructured] = useState<SignatureData | undefined>();
  const [signatureIsVerified, setSignatureIsVerified] = useState<boolean | undefined>();
  const [currentStructuredData, setCurrentStructuredData] = useState<
    { message: ClarityValue; domain: ClarityValue } | undefined
  >();
  const signatureMessage = 'Hello world!';
  const ADDRESS = 'SP2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B';

  const structuredData = tupleCV({
    a: intCV(-1),
    b: uintCV(1),
    c: bufferCVFromString('test'),
    d: trueCV(),
    e: someCV(trueCV()),
    f: noneCV(),
    g: standardPrincipalCV(ADDRESS),
    h: contractPrincipalCV(ADDRESS, 'test'),
    i: responseOkCV(trueCV()),
    j: responseErrorCV(falseCV()),
    k: listCV([trueCV(), falseCV()]),
    l: tupleCV({
      a: trueCV(),
      b: falseCV(),
    }),
    m: stringAsciiCV('hello world'),
    another: tupleCV({
      a: trueCV(),
      b: falseCV(),
      deep: tupleCV({
        a: trueCV(),
        b: falseCV(),
      }),
    }),
    n: stringUtf8CV('hello \u{1234}'),
    o: listCV([]),
  });

  useEffect(() => {
    if (!signatureStructured || !currentStructuredData) return;
    const message = encodeStructuredData(currentStructuredData);
    const messageHash = bytesToHex(sha256(message));
    const verified = verifyMessageSignatureRsv({
      ...signatureStructured,
      message: Buffer.from(messageHash, 'hex'),
    });

    setSignatureIsVerified(verified);
  }, [signatureStructured, currentStructuredData]);

  function clearState() {
    setSignatureIsVerified(undefined);
    setSignatureStructured(undefined);
  }

  async function signMessageRpc(message: string) {
    if (!window.LeatherProvider) throw new Error('LeatherProvider not found');

    clearState();

    const result = await window.LeatherProvider.request('stx_signMessage', {
      message,
      messageType: 'utf8',
    });

    verifyMessageSignatureRsv({
      ...result.result,
      message: hashMessage(message),
    });
  }

  const domain = tupleCV({
    name: stringAsciiCV('hiro.so'),
    version: stringAsciiCV('1.0.0'),
    'chain-id': uintCV(1),
  });

  async function signStructureRpc(message: ClarityValue, domain: TupleCV) {
    if (!window.LeatherProvider) throw new Error('LeatherProvider not found');

    clearState();
    setCurrentStructuredData({ message, domain });

    // ClarityValue -> Uint8Array -> Buffer -> string (hex)
    const stringMessage = serializeCV(message);
    const stringDomain = serializeCV(domain);

    const result = await window.LeatherProvider.request('stx_signStructuredMessage', {
      message: stringMessage,
      messageType: 'structured',
      domain: stringDomain,
    });

    setSignatureStructured(result.result);
  }

  return (
    <Box py={6}>
      {signatureStructured && (
        <styled.span textStyle="body.large" display="block" my="space.04">
          <styled.span color="green">
            Signature {signatureIsVerified ? 'successfully ' : 'not'} verified
          </styled.span>
        </styled.span>
      )}
      <span>RPC</span>
      <br />
      <styled.button mt={3} onClick={() => signMessageRpc(signatureMessage)}>
        Signature RPC (Testnet)
      </styled.button>
      <br />
      <styled.button mt={3} onClick={() => signStructureRpc(structuredData, domain)}>
        Signature Structure RPC (Testnet)
      </styled.button>
    </Box>
  );
}
