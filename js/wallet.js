import CONFIG from './config.js';

const STORAGE_KEY = 'pizza-nft.wallet.id';

function saveWalletId(id) {
  try { localStorage.setItem(STORAGE_KEY, id); } catch (_) { /* private mode */ }
}
function clearWalletId() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (_) { /* private mode */ }
}
function loadWalletId() {
  try { return localStorage.getItem(STORAGE_KEY); } catch (_) { return null; }
}

class WalletManager {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.chainId = null;
    this.walletId = null;
    this.listeners = [];
    this._eventsBound = false;
    this._boundProvider = null;
    this._accountsHandler = null;
    this._chainHandler = null;
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  _emit() {
    const state = {
      connected: !!this.address,
      address: this.address,
      chainId: this.chainId,
      correctNetwork: this.chainId === CONFIG.network.chainIdDecimal
    };
    this.listeners.forEach(cb => cb(state));
  }

  getAvailableWallets() {
    const wallets = [];
    const eth = window.ethereum;
    if (typeof eth !== 'undefined') {
      const providers = Array.isArray(eth.providers) && eth.providers.length ? eth.providers : [eth];
      const seen = new Set();
      for (const p of providers) {
        if (p?.isMetaMask && !seen.has('metamask')) { wallets.push({ id: 'metamask', name: 'MetaMask', icon: 'metamask' }); seen.add('metamask'); }
        if (p?.isRabby && !seen.has('rabby')) { wallets.push({ id: 'rabby', name: 'Rabby', icon: 'rabby' }); seen.add('rabby'); }
        if (p?.isCoinbaseWallet && !seen.has('coinbase')) { wallets.push({ id: 'coinbase', name: 'Coinbase Wallet', icon: 'coinbase' }); seen.add('coinbase'); }
        if (p?.isTrust && !seen.has('trust')) { wallets.push({ id: 'trust', name: 'Trust Wallet', icon: 'trust' }); seen.add('trust'); }
      }
    }
    if (window.okxwallet && !wallets.find(w => w.id === 'okx')) {
      wallets.push({ id: 'okx', name: 'OKX Wallet', icon: 'okx' });
    }
    return wallets;
  }

  _getProvider(walletId) {
    if (walletId === 'okx' && window.okxwallet) return window.okxwallet;
    const eth = window.ethereum;
    if (!eth) return null;
    const providers = Array.isArray(eth.providers) && eth.providers.length ? eth.providers : [eth];
    const match = providers.find(p => {
      if (walletId === 'metamask') return p?.isMetaMask;
      if (walletId === 'rabby') return p?.isRabby;
      if (walletId === 'coinbase') return p?.isCoinbaseWallet;
      if (walletId === 'trust') return p?.isTrust;
      return false;
    });
    return match || eth;
  }

  async connect(walletId = 'injected') {
    const provider = this._getProvider(walletId);
    if (!provider) {
      throw new Error('No wallet detected. Please install a wallet extension.');
    }
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      this.address = accounts[0];
      this.provider = provider;
      this.walletId = walletId;
      const chainIdHex = await provider.request({ method: 'eth_chainId' });
      this.chainId = parseInt(chainIdHex, 16);
      if (this.chainId !== CONFIG.network.chainIdDecimal) {
        await this.switchToCitrea();
      }
      this._bindProviderEvents(provider);
      saveWalletId(walletId);
      this._emit();
      return this.address;
    } catch (err) {
      console.error('Wallet connection failed:', err);
      throw err;
    }
  }

  // Silent re-connect using a previously saved walletId. No prompt;
  // returns null if there is no saved wallet, no provider, or the
  // wallet has been disconnected at the extension level.
  async autoReconnect() {
    const walletId = loadWalletId();
    if (!walletId) return null;
    const provider = this._getProvider(walletId);
    if (!provider) return null;
    try {
      // eth_accounts is silent — does NOT prompt the user.
      const accounts = await provider.request({ method: 'eth_accounts' });
      if (!accounts || !accounts.length) {
        clearWalletId();
        return null;
      }
      this.address = accounts[0];
      this.provider = provider;
      this.walletId = walletId;
      try {
        const chainIdHex = await provider.request({ method: 'eth_chainId' });
        this.chainId = parseInt(chainIdHex, 16);
      } catch (_) { this.chainId = null; }
      this._bindProviderEvents(provider);
      this._emit();
      return this.address;
    } catch (err) {
      console.warn('autoReconnect failed:', err);
      return null;
    }
  }

  _unbindProviderEvents() {
    if (this._boundProvider && this._accountsHandler) {
      this._boundProvider.removeListener?.('accountsChanged', this._accountsHandler);
      this._boundProvider.removeListener?.('chainChanged', this._chainHandler);
    }
    this._boundProvider = null;
    this._accountsHandler = null;
    this._chainHandler = null;
    this._eventsBound = false;
  }

  _bindProviderEvents(provider) {
    // If already bound to a different provider, unbind old one first
    if (this._eventsBound && this._boundProvider !== provider) {
      this._unbindProviderEvents();
    }
    if (this._eventsBound) return;
    this._accountsHandler = (accounts) => {
      this.address = accounts && accounts[0] ? accounts[0] : null;
      if (!this.address) clearWalletId();
      this._emit();
    };
    this._chainHandler = (chainIdHex) => {
      this.chainId = parseInt(chainIdHex, 16);
      this._emit();
    };
    provider.on?.('accountsChanged', this._accountsHandler);
    provider.on?.('chainChanged', this._chainHandler);
    this._boundProvider = provider;
    this._eventsBound = true;
  }

  async switchToCitrea() {
    if (!this.provider) return;
    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CONFIG.network.chainId }]
      });
      this.chainId = CONFIG.network.chainIdDecimal;
    } catch (switchError) {
      if (switchError.code === 4902) {
        await this.provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: CONFIG.network.chainId,
            chainName: CONFIG.network.chainName,
            rpcUrls: CONFIG.network.rpcUrls,
            blockExplorerUrls: CONFIG.network.blockExplorerUrls,
            nativeCurrency: CONFIG.network.nativeCurrency
          }]
        });
        this.chainId = CONFIG.network.chainIdDecimal;
      } else {
        throw switchError;
      }
    }
    this._emit();
  }

  disconnect() {
    this._unbindProviderEvents();
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.chainId = null;
    this.walletId = null;
    clearWalletId();
    this._emit();
  }

  shortAddress() {
    if (!this.address) return '';
    return this.address.slice(0, 6) + '...' + this.address.slice(-4);
  }

  async getBalance() {
    if (!this.provider || !this.address) return '0';
    const balHex = await this.provider.request({
      method: 'eth_getBalance',
      params: [this.address, 'latest']
    });
    const balWei = BigInt(balHex);
    const balEth = Number(balWei) / 1e18;
    return balEth.toFixed(6);
  }

  async sendTransaction({ to, value }) {
    if (!this.provider || !this.address) {
      throw new Error('Wallet not connected');
    }
    if (this.chainId !== CONFIG.network.chainIdDecimal) {
      await this.switchToCitrea();
    }
    const txHash = await this.provider.request({
      method: 'eth_sendTransaction',
      params: [{
        from: this.address,
        to,
        value: typeof value === 'bigint' ? '0x' + value.toString(16) : value
      }]
    });
    return txHash;
  }

  async waitForTx(txHash, { intervalMs = 3000, timeoutMs = 180000 } = {}) {
    if (!this.provider) throw new Error('Wallet not connected');
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const receipt = await this.provider.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash]
        });
        if (receipt) return receipt;
      } catch (_) { /* RPC blip, retry */ }
      await new Promise(r => setTimeout(r, intervalMs));
    }
    throw new Error('Timed out waiting for transaction confirmation');
  }
}

const wallet = new WalletManager();
export default wallet;
