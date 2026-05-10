const CONFIG = {
  network: {
    chainId: '0x1012',
    chainIdDecimal: 4114,
    chainName: 'Citrea',
    rpcUrls: ['https://rpc.mainnet.citrea.xyz'],
    blockExplorerUrls: ['https://explorer.mainnet.citrea.xyz'],
    nativeCurrency: {
      name: 'Citrea Bitcoin',
      symbol: 'cBTC',
      decimals: 18
    }
  },
  collection: {
    name: 'PIZZA',
    description: 'A community-funded pizza NFT collection on Citrea.',
    totalSupply: 1000,
    pricePerSlice: '0.00006186',
    goalAmount: 30
  },
  // Funds from each Mint are forwarded directly (EOA -> EOA) to this founder
  // wallet. NFTs are airdropped from this wallet after the campaign closes.
  treasury: {
    address: '0x00001e1f764feefda7f8059618f7c6023f8c180e',
    label: 'Founder treasury'
  },
  // Optional smart-contract upgrade path. While zero, the app uses the
  // direct-transfer mint flow above.
  contract: {
    address: '0x0000000000000000000000000000000000000000'
  },
  realtime: {
    refreshIntervalMs: 8000,
    activityBlocksToScan: 200,
    activityMaxRows: 8
  },
  rarities: [
    { tier: 1, name: 'Common',     weight: 5000, palette: { crust: '#d4903c', cheese: '#f5d04e', accent: '#c0392b', extra: '#27ae60' } },
    { tier: 2, name: 'Uncommon',   weight: 2500, palette: { crust: '#a3683b', cheese: '#f5d04e', accent: '#8e44ad', extra: '#27ae60' } },
    { tier: 3, name: 'Rare',       weight: 1500, palette: { crust: '#c47a2a', cheese: '#f7dc6f', accent: '#e67e22', extra: '#1abc9c' } },
    { tier: 4, name: 'Epic',       weight:  800, palette: { crust: '#7e3d8c', cheese: '#f4a3c4', accent: '#e84393', extra: '#0984e3' } },
    { tier: 5, name: 'Legendary',  weight:  200, palette: { crust: '#e67e22', cheese: '#fdcb6e', accent: '#fff200', extra: '#74b9ff' } }
  ]
};

export default CONFIG;
