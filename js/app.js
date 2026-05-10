import CONFIG from './config.js';
import wallet from './wallet.js';
import { getWalletLogo } from './wallet-logos.js';
import stats from './realtime.js';

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

function initMint() {
  const mintBtn = $('#mintBtn');
  if (!mintBtn) return;
  mintBtn.addEventListener('click', async () => {
    if (!wallet.address) {
      $('#connectWallet')?.click();
      return;
    }
    if (wallet.chainId !== CONFIG.network.chainIdDecimal) {
      await wallet.switchToCitrea();
      return;
    }
    mintBtn.textContent = 'minting...';
    mintBtn.disabled = true;
    setTimeout(() => {
      mintBtn.textContent = 'Mint';
      mintBtn.disabled = false;
      alert('This is a demo. Connect a real contract to enable minting.');
    }, 2000);
  });
}

function renderRealtime(state) {
  const price = CONFIG.collection.pricePerSlice;
  const goal = CONFIG.collection.goalAmount;

  const priceValue = $('#priceValue');
  if (priceValue) priceValue.textContent = `${price} cBTC`;

  const conversionNote = $('#conversionNote');
  if (conversionNote) conversionNote.textContent = `1 slice = ${price} cBTC`;

  const ethInput = $('#ethInput');
  if (ethInput && (ethInput.value === '' || ethInput.dataset.fromConfig === '1')) {
    ethInput.value = price;
    ethInput.dataset.fromConfig = '1';
  }

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
    } else if (!state.hasContract) {
      status.textContent = `live · block #${state.latestBlock} · awaiting contract`;
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
    } else if (!state.hasContract) {
      tbody.innerHTML = '<tr><td colspan="3" style="padding:1.5rem 0.5rem;text-align:center;color:var(--text-soft)">No on-chain activity yet — contract not deployed</td></tr>';
    } else if (state.activity.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" style="padding:1.5rem 0.5rem;text-align:center;color:var(--text-soft)">No contributions yet — be the first patron</td></tr>';
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

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initCountdown();
  initWalletUI();
  initMint();
  initNetworkSwitch();
  initRealtime();
});
