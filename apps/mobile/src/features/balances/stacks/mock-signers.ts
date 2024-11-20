// dev wallet, add 3 accounts + import wallet
const multiWalletSigners = [
  {
    accountIndex: 0,
    address: 'SP2417H88DQFN7FNDMSKM9N0B3Q6GNGEM40W7ZAZW',
    derivationPath: "m/44'/5757'/0'/0/0",
    descriptor:
      "[efd01538/44'/5757'/0'/0/0]03f83a833e6fc370ec2616b5f8415ef4f0bad22249015c79b53a44f70ab210df50",
    fingerprint: 'efd01538',
    keyOrigin: "efd01538/44'/5757'/0'/0/0",
    network: 'mainnet',
    publicKey: [
      3, 248, 58, 131, 62, 111, 195, 112, 236, 38, 22, 181, 248, 65, 94, 244, 240, 186, 210, 34, 73,
      1, 92, 121, 181, 58, 68, 247, 10, 178, 16, 223, 80,
    ],
    sign: null,
  },
  {
    accountIndex: 0,
    address: 'SPY0682ZM7VGPMVGQP99Z05J3QWMVV83RA6N42SA',
    derivationPath: "m/44'/5757'/0'/0/1",
    descriptor:
      "[efd01538/44'/5757'/0'/0/1]02d21d6305bcb51584ea0d3405aff061dcaef4fe2a362abd4caf1ce7ba36a7c183",
    fingerprint: 'efd01538',
    keyOrigin: "efd01538/44'/5757'/0'/0/1",
    network: 'mainnet',
    publicKey: [
      2, 210, 29, 99, 5, 188, 181, 21, 132, 234, 13, 52, 5, 175, 240, 97, 220, 174, 244, 254, 42,
      54, 42, 189, 76, 175, 28, 231, 186, 54, 167, 193, 131,
    ],
    sign: null,
  },
  {
    accountIndex: 0,
    address: 'SP243F5TQQF7QS7KJC0G53EYJBQB1TTPA4SFZVF70',
    derivationPath: "m/44'/5757'/0'/0/2",
    descriptor:
      "[efd01538/44'/5757'/0'/0/2]02da25a1d0ec58489af14edb0cea358ba2a647ba44a5e96326af9e79ca2e37bf77",
    fingerprint: 'efd01538',
    keyOrigin: "efd01538/44'/5757'/0'/0/2",
    network: 'mainnet',
    publicKey: [
      2, 218, 37, 161, 208, 236, 88, 72, 154, 241, 78, 219, 12, 234, 53, 139, 162, 166, 71, 186, 68,
      165, 233, 99, 38, 175, 158, 121, 202, 46, 55, 191, 119,
    ],
    sign: null,
  },
  {
    accountIndex: 0,
    address: 'SP3F8G4BDEXJ0FW1PGCW9CSPZE29VBW7CY3M6X0SP',
    derivationPath: "m/44'/5757'/0'/0/0",
    descriptor:
      "[558efa7e/44'/5757'/0'/0/0]030f26c9d1dfc3218a50060f54a4ea53260df2f75de242b7ad785d6f9f3f458b6e",
    fingerprint: '558efa7e',
    keyOrigin: "558efa7e/44'/5757'/0'/0/0",
    network: 'mainnet',
    publicKey: [
      3, 15, 38, 201, 209, 223, 195, 33, 138, 80, 6, 15, 84, 164, 234, 83, 38, 13, 242, 247, 93,
      226, 66, 183, 173, 120, 93, 111, 159, 63, 69, 139, 110,
    ],
    sign: null,
  },
];

// dev wallet, add 1 account + create new wallet
[
  {
    accountIndex: 0,
    address: 'SP2417H88DQFN7FNDMSKM9N0B3Q6GNGEM40W7ZAZW',
    derivationPath: "m/44'/5757'/0'/0/0",
    descriptor:
      "[efd01538/44'/5757'/0'/0/0]03f83a833e6fc370ec2616b5f8415ef4f0bad22249015c79b53a44f70ab210df50",
    fingerprint: 'efd01538',
    keyOrigin: "efd01538/44'/5757'/0'/0/0",
    network: 'mainnet',
    publicKey: [
      3, 248, 58, 131, 62, 111, 195, 112, 236, 38, 22, 181, 248, 65, 94, 244, 240, 186, 210, 34, 73,
      1, 92, 121, 181, 58, 68, 247, 10, 178, 16, 223, 80,
    ],
    sign: null,
  },
  {
    accountIndex: 0,
    address: 'SPY0682ZM7VGPMVGQP99Z05J3QWMVV83RA6N42SA',
    derivationPath: "m/44'/5757'/0'/0/1",
    descriptor:
      "[efd01538/44'/5757'/0'/0/1]02d21d6305bcb51584ea0d3405aff061dcaef4fe2a362abd4caf1ce7ba36a7c183",
    fingerprint: 'efd01538',
    keyOrigin: "efd01538/44'/5757'/0'/0/1",
    network: 'mainnet',
    publicKey: [
      2, 210, 29, 99, 5, 188, 181, 21, 132, 234, 13, 52, 5, 175, 240, 97, 220, 174, 244, 254, 42,
      54, 42, 189, 76, 175, 28, 231, 186, 54, 167, 193, 131,
    ],
    sign: null,
  },
  {
    accountIndex: 0,
    address: 'SPGGMJXPWPA0B7KPF9W78BNY9BSHYA12GV2QQG4R',
    derivationPath: "m/44'/5757'/0'/0/0",
    descriptor:
      "[80c1c6ca/44'/5757'/0'/0/0]03be588345ce0001dabd9a69e95647b2c14f4e90b8c11a4abf8234005109ca9d61",
    fingerprint: '80c1c6ca',
    keyOrigin: "80c1c6ca/44'/5757'/0'/0/0",
    network: 'mainnet',
    publicKey: [
      3, 190, 88, 131, 69, 206, 0, 1, 218, 189, 154, 105, 233, 86, 71, 178, 193, 79, 78, 144, 184,
      193, 26, 74, 191, 130, 52, 0, 81, 9, 202, 157, 97,
    ],
    sign: null,
  },
];

const signT = [
  {
    accountIndex: 0,
    address: 'SP2417H88DQFN7FNDMSKM9N0B3Q6GNGEM40W7ZAZW',
    derivationPath: "m/44'/5757'/0'/0/0",
    descriptor:
      "[efd01538/44'/5757'/0'/0/0]03f83a833e6fc370ec2616b5f8415ef4f0bad22249015c79b53a44f70ab210df50",
    fingerprint: 'efd01538',
    keyOrigin: "efd01538/44'/5757'/0'/0/0",
    network: 'mainnet',
    publicKey: [
      3, 248, 58, 131, 62, 111, 195, 112, 236, 38, 22, 181, 248, 65, 94, 244, 240, 186, 210, 34, 73,
      1, 92, 121, 181, 58, 68, 247, 10, 178, 16, 223, 80,
    ],
    sign: null,
  },
  {
    accountIndex: 0,
    address: 'SPY0682ZM7VGPMVGQP99Z05J3QWMVV83RA6N42SA',
    derivationPath: "m/44'/5757'/0'/0/1",
    descriptor:
      "[efd01538/44'/5757'/0'/0/1]02d21d6305bcb51584ea0d3405aff061dcaef4fe2a362abd4caf1ce7ba36a7c183",
    fingerprint: 'efd01538',
    keyOrigin: "efd01538/44'/5757'/0'/0/1",
    network: 'mainnet',
    publicKey: [
      2, 210, 29, 99, 5, 188, 181, 21, 132, 234, 13, 52, 5, 175, 240, 97, 220, 174, 244, 254, 42,
      54, 42, 189, 76, 175, 28, 231, 186, 54, 167, 193, 131,
    ],
    sign: null,
  },
  {
    accountIndex: 0,
    address: 'SPGGMJXPWPA0B7KPF9W78BNY9BSHYA12GV2QQG4R',
    derivationPath: "m/44'/5757'/0'/0/0",
    descriptor:
      "[80c1c6ca/44'/5757'/0'/0/0]03be588345ce0001dabd9a69e95647b2c14f4e90b8c11a4abf8234005109ca9d61",
    fingerprint: '80c1c6ca',
    keyOrigin: "80c1c6ca/44'/5757'/0'/0/0",
    network: 'mainnet',
    publicKey: [
      3, 190, 88, 131, 69, 206, 0, 1, 218, 189, 154, 105, 233, 86, 71, 178, 193, 79, 78, 144, 184,
      193, 26, 74, 191, 130, 52, 0, 81, 9, 202, 157, 97,
    ],
    sign: null,
  },
];
