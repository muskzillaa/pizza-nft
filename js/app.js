import CONFIG from './config.js';
import wallet from './wallet.js';
import { getWalletLogo } from './wallet-logos.js';
import stats from './realtime.js';
import { getPizzaForReveal, rarityFromHash } from './pizza-svg.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const POPULAR_WALLETS = [
  { id: 'metamask', name: 'MetaMask', detect: () => isInstalled('metamask') },
  { id: 'okx', name: 'OKX Wallet', detect: () => isInstalled('okx') },
  { id: 'rabby', name: 'Rabby', detect: () => isInstalled('rabby') },
  { id: 'coinbase', name: 'Coinbase Wallet', detect: () => isInstalled('coinbase') },
  { id: 'trust', name: 'Trust Wallet', detect: () => isInstalled('trust') },
];

function isInstalled(id) {
  const eth = window.ethereum;
  const providers = Array.isArray(eth?.providers) && eth.providers.length ? eth.providers : (eth ? [eth] : []);
  if (id === 'okx') return !!window.okxwallet;
  if (id === 'metamask') return providers.some(p => p?.isMetaMask);
  if (id === 'rabby') return providers.some(p => p?.isRabby);
  if (id === 'coinbase') return providers.some(p => p?.isCoinbaseWallet);
  if (id === 'trust') return providers.some(p => p?.isTrust);
  return false;
}

function initCountdown() {
  const el = $('#countdown');
  if (!el) return;
  const deadline = new Date().getTime() + (6*24*60*60*1000) + (20*60*60*1000) + (20*60*1000) + (11*1000);
  function tick() {
    const diff = deadline - Date.now();
    if (diff <= 0) { el.innerHTML = '<span>ENDED</span>'; return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.innerHTML = `<span>${String(d).padStart(2,'0')}</span><small>d</small> <span>${String(h).padStart(2,'0')}</span><small>h</small> <span>${String(m).padStart(2,'0')}</span><small>m</small> <span>${String(s).padStart(2,'0')}</span><small>s</small>`;
  }
  tick();
  setInterval(tick, 1000);
}

function initNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  $$('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
  const menuBtn = $('#menuToggle');
  const navLinks = $('.nav-links');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      menuBtn.classList.toggle('open');
    });
  }
}

function buildWalletList(walletList) {
  walletList.innerHTML = '';
  let installedCount = 0;

  POPULAR_WALLETS.forEach(w => {
    const installed = w.detect();
    if (installed) installedCount++;
    const btn = document.createElement('button');
    btn.className = 'wallet-option';
    btn.innerHTML = `
      <span class="wallet-icon" data-wallet="${w.id}">${getWalletLogo(w.id)}</span>
      <span class="wallet-name">${w.name}</span>
      <span class="wallet-tag ${installed ? 'installed' : ''}">${installed ? 'INSTALLED' : 'DETECT'}</span>
    `;
    btn.addEventListener('click', () => connectToWallet(w.id));
    walletList.appendChild(btn);
  });

  // Always show "Other Wallet" / injected fallback at bottom
  const otherBtn = document.createElement('button');
  otherBtn.className = 'wallet-option';
  otherBtn.innerHTML = `
    <span class="wallet-icon" data-wallet="wallet">${getWalletLogo('wallet')}</span>
    <span class="wallet-name">Other Wallet</span>
    <span class="wallet-tag">EVM</span>
  `;
  otherBtn.addEventListener('click', () => connectToWallet('injected'));
  walletList.appendChild(otherBtn);

  if (installedCount === 0 && typeof window.ethereum === 'undefined' && !window.okxwallet) {
    const note = document.createElement('p');
    note.className = 'no-wallet';
    note.innerHTML = 'No wallet detected.<br>Install MetaMask, OKX, Rabby, or any EVM wallet to continue.';
    walletList.prepend(note);
  }
}

async function connectToWallet(walletId) {
  try {
    await wallet.connect(walletId);
    closeWalletModal();
  } catch (err) {
    alert(err.message || 'Connection failed');
  }
}

function closeWalletModal() {
  $('#walletModal')?.classList.remove('show');
  $('#modalOverlay')?.classList.remove('show');
}

function initWalletUI() {
  const connectBtn = $('#connectWallet');
  const walletInfo = $('#walletInfo');
  const walletAddr = $('#walletAddr');
  const walletModal = $('#walletModal');
  const modalOverlay = $('#modalOverlay');
  const disconnectBtn = $('#disconnectBtn');
  if (!connectBtn) return;

  connectBtn.addEventListener('click', () => {
    const walletList = $('#walletList');
    if (walletList) buildWalletList(walletList);
    walletModal.classList.add('show');
    modalOverlay.classList.add('show');
  });

  modalOverlay?.addEventListener('click', closeWalletModal);
  $('#modalClose')?.addEventListener('click', closeWalletModal);

  disconnectBtn?.addEventListener('click', () => {
    wallet.disconnect();
  });

  wallet.onChange((state) => {
    if (state.connected) {
      connectBtn.style.display = 'none';
      walletInfo.style.display = 'flex';
      walletAddr.textContent = wallet.shortAddress();
      const networkWarn = $('#networkWarning');
      if (networkWarn) {
        networkWarn.style.display = state.correctNetwork ? 'none' : 'flex';
      }
      updateDashboard();
    } else {
      connectBtn.style.display = '';
      walletInfo.style.display = 'none';
      walletAddr.textContent = '';
    }
  });
}

async function updateDashboard() {
  const balEl = $('#userBalance');
  if (balEl && wallet.address) {
    try {
      const bal = await wallet.getBalance();
      balEl.textContent = `${bal} cBTC`;
    } catch { balEl.textContent = '—'; }
  }
}

// Convert a decimal cBTC string (e.g. "0.00006186") to wei BigInt without
// floating-point error.
function parseCbtcToWei(amountStr) {
  const [intPart, fracPart = ''] = String(amountStr).split('.');
  const fracPadded = (fracPart + '000000000000000000').slice(0, 18);
  return BigInt(intPart || '0') * 10n ** 18n + BigInt(fracPadded || '0');
}

function initMint() {
  const mintBtn = $('#mintBtn');
  if (!mintBtn) return;
  const treasury = CONFIG.treasury?.address;
  mintBtn.addEventListener('click', async () => {
    if (!wallet.address) {
      $('#connectWallet')?.click();
      return;
    }
    if (wallet.chainId !== CONFIG.network.chainIdDecimal) {
      await wallet.switchToCitrea();
      return;
    }
    if (!treasury || /^0x0+$/i.test(treasury)) {
      alert('Treasury address is not configured.');
      return;
    }
    const slicesEl = $('#sliceCount');
    const slices = Math.max(1, Math.min(20, parseInt(slicesEl?.value || '1', 10) || 1));
    const pricePerSlice = CONFIG.collection.pricePerSlice;
    const totalWei = parseCbtcToWei(pricePerSlice) * BigInt(slices);
    const original = mintBtn.textContent;
    mintBtn.textContent = 'Confirm in wallet…';
    mintBtn.disabled = true;
    try {
      const txHash = await wallet.sendTransaction({
        to: treasury,
        value: '0x' + totalWei.toString(16)
      });
      mintBtn.textContent = 'Confirming on-chain…';
      showMintReveal({ txHash, slices, totalWei, status: 'pending' });
      try {
        const receipt = await wallet.waitForTx(txHash);
        const success = receipt.status === '0x1' || receipt.status === 1;
        showMintReveal({ txHash, slices, totalWei, status: success ? 'success' : 'failed', receipt });
      } catch (waitErr) {
        console.warn('waitForTx failed:', waitErr);
        showMintReveal({ txHash, slices, totalWei, status: 'pending' });
      }
    } catch (err) {
      console.error('Mint failed:', err);
      const code = err?.code;
      if (code === 4001 || /reject/i.test(err?.message || '')) {
        // user rejected — silent
      } else {
        alert('Mint failed: ' + (err?.message || err));
      }
    } finally {
      mintBtn.textContent = original || 'Mint';
      mintBtn.disabled = false;
    }
  });
}

function formatCbtcFromWei(weiBig) {
  const w = BigInt(weiBig);
  const whole = w / 10n ** 18n;
  const frac = w % 10n ** 18n;
  const fracStr = frac.toString().padStart(18, '0').replace(/0+$/, '') || '0';
  return `${whole}.${fracStr}`;
}

function showMintReveal({ txHash, slices, totalWei, status, receipt }) {
  const overlay = $('#mintRevealOverlay');
  const modal = $('#mintRevealModal');
  if (!overlay || !modal) {
    if (status === 'success') alert(`Mint confirmed!\nTx: ${txHash}`);
    return;
  }
  const rarity = rarityFromHash(txHash);
  const explorer = CONFIG.network.blockExplorerUrls[0];
  const totalCbtc = formatCbtcFromWei(totalWei);
  const statusBadge = {
    pending: `<span class="status-pill pending">Confirming on-chain…</span>`,
    success: `<span class="status-pill success">Confirmed</span>`,
    failed: `<span class="status-pill failed">Reverted</span>`
  }[status] || '';
  modal.innerHTML = `
    <button class="modal-close" id="revealClose">×</button>
    <div class="reveal-inner">
      <div class="reveal-art rarity-${rarity.tier}">${getPizzaForReveal(txHash, 240)}</div>
      <div class="reveal-body">
        <div class="reveal-rarity">
          <span class="rarity-tag tier-${rarity.tier}">${rarity.name}</span>
          ${statusBadge}
        </div>
        <h3>Your slice is reserved</h3>
        <p class="reveal-sub">${slices} slice${slices > 1 ? 's' : ''} for ${totalCbtc} cBTC, sent to the founder treasury.</p>
        <p class="reveal-note">The on-chain NFT itself will be airdropped to your wallet after the campaign closes &mdash; this transaction is your permanent receipt and reveals the rarity that will be minted to you.</p>
        <div class="reveal-row">
          <span class="reveal-label">Tx</span>
          <a class="reveal-link" href="${explorer}/tx/${txHash}" target="_blank" rel="noopener">${txHash.slice(0, 10)}…${txHash.slice(-8)}</a>
        </div>
        <div class="reveal-row">
          <span class="reveal-label">Treasury</span>
          <a class="reveal-link" href="${explorer}/address/${CONFIG.treasury.address}" target="_blank" rel="noopener">${CONFIG.treasury.address.slice(0, 10)}…${CONFIG.treasury.address.slice(-6)}</a>
        </div>
        <button class="btn primary" id="revealOk">Got it</button>
      </div>
    </div>
  `;
  overlay.classList.add('show');
  modal.classList.add('show');
  modal.querySelector('#revealClose')?.addEventListener('click', closeMintReveal);
  modal.querySelector('#revealOk')?.addEventListener('click', closeMintReveal);
  overlay.addEventListener('click', closeMintReveal, { once: true });
  // Refresh stats after a short delay so the row appears in activity
  setTimeout(() => stats.refresh(), 4000);
}

function closeMintReveal() {
  $('#mintRevealOverlay')?.classList.remove('show');
  $('#mintRevealModal')?.classList.remove('show');
}

function renderRealtime(state) {
  const price = CONFIG.collection.pricePerSlice;
  const goal = CONFIG.collection.goalAmount;

  const priceValue = $('#priceValue');
  if (priceValue) priceValue.textContent = `${price} cBTC`;

  const conversionNote = $('#conversionNote');
  if (conversionNote) conversionNote.textContent = `1 slice = ${price} cBTC`;
  syncSliceTotal();

  const dashGoal = $('#dashGoal');
  if (dashGoal) dashGoal.textContent = String(goal);
  const dashPrice = $('#dashPrice');
  if (dashPrice) dashPrice.textContent = price;

  const raisedFmt = state.raised.toFixed(4);
  const pct = state.progressPct;
  const remaining = Math.max(0, goal - state.raised).toFixed(4);

  const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
  const setWidth = (id, pct) => { const el = document.getElementById(id); if (el) el.style.width = `${pct.toFixed(1)}%`; };

  setText('statRaised', raisedFmt);
  setText('statPatrons', String(state.patrons));
  setWidth('progressFill', pct);
  setText('progressText', `${raisedFmt} / ${goal} cBTC`);

  setText('dashRaised', raisedFmt);
  setText('dashPatrons', String(state.patrons));
  setText('dashProgressPct', `${pct.toFixed(1)}% funded`);
  setText('dashProgressRemaining', `${remaining} cBTC remaining`);
  setWidth('dashProgressFill', pct);

  const status = $('#realtimeStatus');
  if (status) {
    if (!state.networkOk) {
      status.textContent = 'rpc offline';
      status.style.color = 'var(--red)';
    } else if (!state.hasTreasury) {
      status.textContent = `live · block #${state.latestBlock} · treasury not set`;
      status.style.color = 'var(--text-soft)';
    } else {
      status.textContent = `live · block #${state.latestBlock}`;
      status.style.color = 'var(--green)';
    }
  }

  const tbody = $('#activityBody');
  if (tbody) {
    if (!state.ready) {
      tbody.innerHTML = '<tr><td colspan="3" style="padding:1.5rem 0.5rem;text-align:center;color:var(--text-soft)">Loading from Citrea…</td></tr>';
    } else if (!state.hasTreasury) {
      tbody.innerHTML = '<tr><td colspan="3" style="padding:1.5rem 0.5rem;text-align:center;color:var(--text-soft)">Treasury address not configured</td></tr>';
    } else if (state.activity.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" style="padding:1.5rem 0.5rem;text-align:center;color:var(--text-soft)">No mints yet — be the first patron</td></tr>';
    } else {
      tbody.innerHTML = state.activity.map(t =>
        `<tr>
          <td class="addr"><a href="${CONFIG.network.blockExplorerUrls[0]}/tx/${t.hash}" target="_blank" rel="noopener">${t.fromShort}</a></td>
          <td class="amount">${t.amountStr}</td>
          <td>${t.timeAgo}</td>
        </tr>`
      ).join('');
    }
  }
}

function initRealtime() {
  stats.onChange(renderRealtime);
  stats.start();
}

function initNetworkSwitch() {
  const switchBtn = $('#switchNetwork');
  if (!switchBtn) return;
  switchBtn.addEventListener('click', () => wallet.switchToCitrea());
}

function syncSliceTotal() {
  const sliceEl = $('#sliceCount');
  const ethInput = $('#ethInput');
  const sLabel = $('#sliceLabelS');
  if (!sliceEl) return;
  let n = parseInt(sliceEl.value, 10);
  if (!Number.isFinite(n) || n < 1) n = 1;
  if (n > 20) n = 20;
  if (String(n) !== sliceEl.value) sliceEl.value = String(n);
  const totalWei = parseCbtcToWei(CONFIG.collection.pricePerSlice) * BigInt(n);
  if (ethInput) ethInput.value = formatCbtcFromWei(totalWei) + ' cBTC';
  if (sLabel) sLabel.textContent = n === 1 ? '' : 's';
}

function initSlicePicker() {
  const sliceEl = $('#sliceCount');
  if (!sliceEl) return;
  $('#sliceMinus')?.addEventListener('click', () => {
    sliceEl.value = String(Math.max(1, (parseInt(sliceEl.value, 10) || 1) - 1));
    syncSliceTotal();
  });
  $('#slicePlus')?.addEventListener('click', () => {
    sliceEl.value = String(Math.min(20, (parseInt(sliceEl.value, 10) || 1) + 1));
    syncSliceTotal();
  });
  sliceEl.addEventListener('input', syncSliceTotal);
  syncSliceTotal();
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initCountdown();
  initWalletUI();
  initSlicePicker();
  initMint();
  initNetworkSwitch();
  initRealtime();
  // Silent re-connect for users who previously connected on another page.
  // Runs after listeners are wired so UI reflects the restored state.
  wallet.autoReconnect().catch(() => { /* swallowed */ });
});
