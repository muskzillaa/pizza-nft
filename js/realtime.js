import CONFIG from './config.js';

const ZERO = '0x0000000000000000000000000000000000000000';

class CitreaRPC {
  constructor() {
    this.rpcUrl = CONFIG.network.rpcUrls[0];
    this._id = 0;
  }

  async call(method, params = []) {
    const res = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: ++this._id, method, params })
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error.message || 'RPC error');
    return json.result;
  }

  async chainId() {
    return parseInt(await this.call('eth_chainId'), 16);
  }

  async blockNumber() {
    return parseInt(await this.call('eth_blockNumber'), 16);
  }

  async getBlock(numberHex, includeTxs = true) {
    return this.call('eth_getBlockByNumber', [numberHex, includeTxs]);
  }

  async getBalance(address) {
    const hex = await this.call('eth_getBalance', [address, 'latest']);
    return Number(BigInt(hex)) / 1e18;
  }
}

export const rpc = new CitreaRPC();

function formatTimeAgo(seconds) {
  const diff = Math.max(0, Math.floor(Date.now() / 1000) - seconds);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function shortAddr(addr) {
  if (!addr) return '—';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

class RealtimeStats {
  constructor() {
    this.state = {
      ready: false,
      hasContract: false,
      raised: 0,
      patrons: 0,
      goal: CONFIG.collection.goalAmount,
      progressPct: 0,
      activity: [],
      latestBlock: null,
      networkOk: false,
      error: null
    };
    this.listeners = [];
    this._timer = null;
  }

  onChange(cb) {
    this.listeners.push(cb);
    cb(this.state);
  }

  _emit() {
    this.listeners.forEach(cb => cb(this.state));
  }

  start() {
    this.refresh();
    if (this._timer) clearInterval(this._timer);
    this._timer = setInterval(() => this.refresh(), CONFIG.realtime.refreshIntervalMs);
  }

  stop() {
    if (this._timer) clearInterval(this._timer);
    this._timer = null;
  }

  async refresh() {
    const contract = (CONFIG.contract.address || '').toLowerCase();
    const hasContract = contract && contract !== ZERO.toLowerCase();
    try {
      const latest = await rpc.blockNumber();
      this.state.latestBlock = latest;
      this.state.networkOk = true;
      this.state.hasContract = hasContract;

      if (!hasContract) {
        this.state.raised = 0;
        this.state.patrons = 0;
        this.state.progressPct = 0;
        this.state.activity = [];
        this.state.ready = true;
        this.state.error = null;
        this._emit();
        return;
      }

      const raised = await rpc.getBalance(CONFIG.contract.address);
      this.state.raised = raised;
      this.state.progressPct = Math.min(100, (raised / CONFIG.collection.goalAmount) * 100);

      const blocks = Math.min(CONFIG.realtime.activityBlocksToScan, latest);
      const txs = [];
      const patrons = new Set();
      const wantedTo = CONFIG.contract.address.toLowerCase();

      const blockNums = [];
      for (let i = 0; i < blocks; i++) blockNums.push(latest - i);

      // Fetch blocks in batches of 10 to avoid hammering RPC.
      const batchSize = 10;
      for (let i = 0; i < blockNums.length; i += batchSize) {
        const batch = blockNums.slice(i, i + batchSize);
        const blocks = await Promise.all(
          batch.map(n => rpc.getBlock('0x' + n.toString(16), true).catch(() => null))
        );
        for (const block of blocks) {
          if (!block || !block.transactions) continue;
          const ts = parseInt(block.timestamp, 16);
          for (const tx of block.transactions) {
            if (tx.to && tx.to.toLowerCase() === wantedTo && tx.value && tx.value !== '0x0') {
              const value = Number(BigInt(tx.value)) / 1e18;
              patrons.add(tx.from.toLowerCase());
              txs.push({
                hash: tx.hash,
                from: tx.from,
                value,
                timestamp: ts
              });
            }
          }
        }
        if (txs.length >= CONFIG.realtime.activityMaxRows * 4) break;
      }

      txs.sort((a, b) => b.timestamp - a.timestamp);
      this.state.activity = txs.slice(0, CONFIG.realtime.activityMaxRows).map(t => ({
        from: t.from,
        fromShort: shortAddr(t.from),
        amount: t.value,
        amountStr: `+${t.value.toFixed(4)} cBTC`,
        timeAgo: formatTimeAgo(t.timestamp),
        hash: t.hash
      }));
      this.state.patrons = patrons.size;
      this.state.ready = true;
      this.state.error = null;
    } catch (err) {
      console.warn('Realtime refresh failed:', err);
      this.state.networkOk = false;
      this.state.error = err.message || String(err);
    }
    this._emit();
  }
}

const stats = new RealtimeStats();
export default stats;
export { formatTimeAgo, shortAddr };
