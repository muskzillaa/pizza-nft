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
  contract: {
    // Set this to the deployed crowdfund contract on Citrea mainnet.
    // While zero, the UI shows live network status with empty fundraise stats
    // (no fake numbers).
    address: '0x0000000000000000000000000000000000000000'
  },
  realtime: {
    refreshIntervalMs: 8000,
    activityBlocksToScan: 200,
    activityMaxRows: 8
  }
};

export default CONFIG;
