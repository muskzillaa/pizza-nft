// Inline SVG logos for popular EVM wallets.
// These are simplified, original geometric renditions inspired by each
// wallet's brand color palette — not the official trademarked artwork.

export const WALLET_LOGOS = {
  metamask: `
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-label="MetaMask">
      <rect width="32" height="32" rx="6" fill="#fff8f0"/>
      <path d="M27 6L18.4 12.5l1.6-3.8L27 6z" fill="#e2761b"/>
      <path d="M5 6l8.5 6.6-1.5-3.9L5 6z" fill="#e4761b"/>
      <path d="M23.5 21.3l-2.3 3.5 5 1.4 1.4-4.8-4.1-.1z" fill="#e4761b"/>
      <path d="M4.4 21.4L5.8 26.2l5-1.4-2.3-3.5-4.1.1z" fill="#e4761b"/>
      <path d="M10.6 14.4l-1.4 2.1 5 .2-.2-5.4-3.4 3.1z" fill="#e4761b"/>
      <path d="M21.4 14.4L17.9 11.2l-.1 5.5 5-.2-1.4-2.1z" fill="#e4761b"/>
      <path d="M10.7 24.8l3-1.5-2.6-2 -.4 3.5z" fill="#d7c1b3"/>
      <path d="M18.4 23.3l3 1.5-.4-3.5-2.6 2z" fill="#d7c1b3"/>
      <path d="M21.4 24.8l-3-1.5.2 1.9-.02 1.0 2.82-1.4z" fill="#233447"/>
      <path d="M10.7 24.8l2.8 1.4 0-1 .2-1.9-3 1.5z" fill="#233447"/>
      <path d="M13.6 19.8l-2.5-.7 1.7-.8.8 1.5z" fill="#cd6116"/>
      <path d="M18.4 19.8l.8-1.5 1.7.8-2.5.7z" fill="#cd6116"/>
      <path d="M10.7 24.8l.4-3.5-2.7.1 2.3 3.4z" fill="#e4751f"/>
      <path d="M20.9 21.3l.4 3.5 2.3-3.4-2.7-.1z" fill="#e4751f"/>
      <path d="M22.8 16.5l-5 .2.5 2.6.8-1.5 1.7.8 2-2.1z" fill="#f6851b"/>
      <path d="M11.1 19.1l1.7-.8.8 1.5.5-2.6-5-.2 2 2.1z" fill="#f6851b"/>
      <path d="M9.2 16.5L11.3 20.7l-.1-2.1-2-2.1z" fill="#763d16"/>
      <path d="M20.8 18.6l-.1 2.1 2.1-4.2-2 2.1z" fill="#763d16"/>
      <path d="M14.2 16.7l-.5 2.6.6 3.4.2-4.4-.3-1.6z" fill="#763d16"/>
      <path d="M17.8 16.7l-.3 1.6.1 4.4.7-3.4-.5-2.6z" fill="#763d16"/>
      <path d="M18.5 19.3l-.7 3.4 .6.4 2.6-2-.1-2.1-2.4.3z" fill="#f6851b"/>
      <path d="M11.1 19.1l-.1 2.1 2.6 2 .6-.4-.7-3.4-2.4-.3z" fill="#f6851b"/>
    </svg>`,

  rabby: `
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-label="Rabby">
      <rect width="32" height="32" rx="6" fill="#7084ff"/>
      <path d="M9 19c0-3.5 3-7 7-7s7 3.5 7 7c0 1.5-.6 2.6-2 3-1.4.4-3 .2-4-1l-1-1.2-1 1.2c-1 1.2-2.6 1.4-4 1-1.4-.4-2-1.5-2-3z" fill="#fff"/>
      <circle cx="13" cy="16" r="1" fill="#1a1714"/>
      <circle cx="19" cy="16" r="1" fill="#1a1714"/>
      <path d="M11 12c0-1.5 1.5-3 3-3" stroke="#fff" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <path d="M21 12c0-1.5-1.5-3-3-3" stroke="#fff" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    </svg>`,

  okx: `
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-label="OKX">
      <rect width="32" height="32" rx="6" fill="#000"/>
      <rect x="6" y="6" width="6" height="6" fill="#fff"/>
      <rect x="13" y="13" width="6" height="6" fill="#fff"/>
      <rect x="20" y="6" width="6" height="6" fill="#fff"/>
      <rect x="6" y="20" width="6" height="6" fill="#fff"/>
      <rect x="20" y="20" width="6" height="6" fill="#fff"/>
    </svg>`,

  coinbase: `
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-label="Coinbase Wallet">
      <rect width="32" height="32" rx="6" fill="#0052ff"/>
      <circle cx="16" cy="16" r="9" fill="#0052ff" stroke="#fff" stroke-width="0"/>
      <rect x="12" y="12" width="8" height="8" rx="1.5" fill="#fff"/>
    </svg>`,

  trust: `
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-label="Trust Wallet">
      <rect width="32" height="32" rx="6" fill="#0500ff"/>
      <path d="M16 6l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V9l8-3z" fill="#fff"/>
      <path d="M16 9.5l5 1.9v3.6c0 3.2-2.2 5.7-5 7-2.8-1.3-5-3.8-5-7v-3.6L16 9.5z" fill="#0500ff"/>
    </svg>`,

  walletconnect: `
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-label="WalletConnect">
      <rect width="32" height="32" rx="6" fill="#3b99fc"/>
      <path d="M9.5 13c3.6-3.5 9.4-3.5 13 0l.4.4c.2.2.2.5 0 .7l-1.5 1.4c-.1.1-.3.1-.4 0l-.6-.6c-2.5-2.5-6.6-2.5-9.2 0l-.7.7c-.1.1-.3.1-.4 0l-1.5-1.4c-.2-.2-.2-.5 0-.7l.9-.5zm16.1 3l1.3 1.3c.2.2.2.5 0 .7L21.2 23.7c-.2.2-.5.2-.7 0l-4.2-4c-.05-.05-.13-.05-.18 0l-4.2 4c-.2.2-.5.2-.7 0L5.3 18c-.2-.2-.2-.5 0-.7L6.6 16c.2-.2.5-.2.7 0l4.2 4c.05.05.13.05.18 0l4.2-4c.2-.2.5-.2.7 0l4.2 4c.05.05.13.05.18 0l4.2-4c.2-.2.5-.2.7 0z" fill="#fff"/>
    </svg>`,

  injected: `
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-label="Browser Wallet">
      <rect width="32" height="32" rx="6" fill="#1a1714"/>
      <rect x="7" y="11" width="18" height="12" rx="2" fill="#faf7f3"/>
      <rect x="7" y="11" width="18" height="3" fill="#e85d3a"/>
      <circle cx="20" cy="18" r="1.5" fill="#1a1714"/>
    </svg>`,

  wallet: `
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-label="Other Wallet">
      <rect width="32" height="32" rx="6" fill="#f4ede4"/>
      <rect x="6" y="10" width="20" height="13" rx="2.5" fill="#1a1714"/>
      <rect x="18" y="14" width="10" height="5" rx="1.5" fill="#e85d3a"/>
      <circle cx="22.5" cy="16.5" r="1" fill="#fff"/>
    </svg>`,
};

export function getWalletLogo(id) {
  return WALLET_LOGOS[id] || WALLET_LOGOS.wallet;
}
