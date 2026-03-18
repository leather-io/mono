export const tooltipTextMap = {
  totalBalance:
    'The total value of all your assets across Bitcoin and Stacks networks, including locked, pending, and spendable funds.',
  btcProtocol:
    'The total value of all your Bitcoin-based assets, including BTC, Runes, and inscriptions.',
  btcAvailable:
    'The BTC you can send or use right now. This excludes any pending, inscription-bound, or otherwise unavailable amounts.',
  btcUnavailable:
    "BTC that can't be sent right now. This includes funds tied to inscriptions, Runes, pending transactions, protected UTXOs, and dust amounts too small to send. To make Taproot funds transferable, unprotect your inscriptions.",
  btcPending:
    "BTC from transactions that have been broadcast but haven't been confirmed on the Bitcoin network yet.",
  runes:
    'The total value of Runes tokens held in your wallet. Runes is a fungible token standard on Bitcoin.',
  stacksProtocol:
    'The total value of all your Stacks-based assets, including STX, SIP-10 tokens, and sBTC.',
  stxAvailable:
    'The STX you can send or use right now. This excludes any locked or pending amounts.',
  stxLocked:
    'STX that is currently committed to Stacking and cannot be transferred until the Stacking cycle ends.',
  stxPending:
    "STX from transactions that have been broadcast but haven't been confirmed on the Stacks network yet.",
  sip10:
    'The total value of SIP-10 tokens in your wallet. SIP-10 is the fungible token standard on Stacks.',
  sbtcAvailable:
    'The sBTC you can send or use right now. This excludes any locked or pending amounts.',
  sbtcLocked:
    "sBTC that is currently committed to a DeFi protocol (such as lending or staking) and cannot be transferred until it's unlocked.",
  sbtcPending:
    "sBTC from transactions that have been broadcast but haven't been confirmed on the Stacks network yet.",
};
