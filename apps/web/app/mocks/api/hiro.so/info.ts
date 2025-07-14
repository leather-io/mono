const resp = {
  peer_version: 402653196,
  pox_consensus: '0afd525b63d771966617f44bdc102863f1991102',
  burn_block_height: 905815,
  stable_pox_consensus: 'e8e431702c13534c5920ae364b23ff1f823fdaa3',
  stable_burn_block_height: 905808,
  server_version:
    'stacks-node 3.1.0.0.13 (release/3.1.0.0.13:8a79aaa+, release build, linux [x86_64])',
  network_id: 1,
  parent_network_id: 3652501241,
  stacks_tip_height: 2198127,
  stacks_tip: '48803cef2cd34d2a0b67f109972332e27c8018a23d30e99889287dd120dedb55',
  stacks_tip_consensus_hash: '0afd525b63d771966617f44bdc102863f1991102',
  genesis_chainstate_hash: '74237aa39aa50a83de11a4f53e9d3bb7d43461d1de9873f402e5453ae60bc59b',
  unanchored_tip: null,
  unanchored_seq: null,
  tenure_height: 204538,
  exit_at_block_height: null,
  is_fully_synced: true,
  node_public_key: '02ef24b1c7d8930a2753aac0316fe054c6600f9b2640511c71b8b87a70ddc49d16',
  node_public_key_hash: '053bda48db0a15844cfa14c8b58c1e3a46669eda',
  affirmations: {
    heaviest: '',
    stacks_tip: '',
    sortition_tip: '',
    tentative_best: '',
  },
  last_pox_anchor: {
    anchor_block_hash: 'a381ac1da80fca861a5808647f304b1a3d9975ebe53195d7795ba9225a72f1c7',
    anchor_block_txid: '37e621c55c5b5fccb2eaf030368d8e8ec0db814ca03ab0be1faf0e678bb7ed89',
  },
  stackerdbs: [],
};

export const hiroInfoHandler = {
  path: 'https://api.mainnet.hiro.so/v2/info',
  resp,
  method: 'get',
} as const;
