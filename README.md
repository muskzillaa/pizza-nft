# PIZZA NFT

A community-powered NFT crowdfund web app on the **Citrea Mainnet** (the first
EVM-compatible Bitcoin rollup). 1,000 unique on-chain pixel-art pizza slices,
priced in cBTC, with a refund-if-goal-not-met mechanism.

## Pages

- `index.html` — mint page with countdown, price, progress, and Mint button.
- `dashboard.html` — fundraise overview, your wallet, recent activity.
- `collection.html` — browse 1,000 generative pizza slices.
- `about.html` — project, how-it-works, collection details, contract.

## Network

- Chain: **Citrea** (mainnet)
- Chain ID: `4114` (`0x1012`)
- RPC: `https://rpc.mainnet.citrea.xyz`
- Explorer: `https://explorer.mainnet.citrea.xyz`
- Native token: **cBTC** (18 decimals)

## Wallet support

The Connect Wallet modal renders a logo for each wallet:

- MetaMask
- OKX Wallet
- Rabby
- Coinbase Wallet
- Trust Wallet
- Other Wallet (any EIP-1193 injected provider)

The site auto-detects which wallets are installed in the browser and tags them
as `INSTALLED`. On connect, it requests an account, then calls
`wallet_switchEthereumChain` (and `wallet_addEthereumChain` if the chain is
unknown) to put the user on Citrea.

## Run locally

It's a static site — no build step.

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Any static host works (Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3,
`devinapps.com`, etc.). Just upload the repo root as-is.

## Files

```
index.html
dashboard.html
collection.html
about.html
css/style.css
js/config.js        // network + collection config
js/wallet.js        // EIP-1193 wallet manager (multi-provider aware)
js/wallet-logos.js  // inline-SVG wallet logos
js/app.js           // UI wiring (modal, mint, countdown, network switch)
js/pizza-svg.js     // generative pizza SVG
```

## Notes

The mint flow is currently a UI demo — the "Mint" button shows a confirmation
toast. Wire it to a real ERC-721 crowdfund contract by replacing
`CONFIG.contract.address` in `js/config.js` and adding a contract call in
`initMint` (`js/app.js`).
