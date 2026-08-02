/* ═══════════════════════════════════════
   CULT — app.js
   ═══════════════════════════════════════ */

// ── STATE ──────────────────────────────
const state = {
  currentPage: 'dashboard',
  user: null,
  transactions: [
    { id:1, date:'Oct 24, 2023', desc:'Office Rent',     cat:'Fixed Cost',     amount:1200.00, checked:false },
    { id:2, date:'Oct 23, 2023', desc:'Cloud Services',  cat:'Software',       amount:1500.00, checked:false },
    { id:3, date:'Oct 22, 2023', desc:'Marketing Ads',   cat:'Marketing',      amount:850.00,  checked:false },
    { id:4, date:'Oct 21, 2023', desc:'Team Lunch',      cat:'Food',           amount:120.00,  checked:false },
    { id:5, date:'Oct 20, 2023', desc:'Software Licenses',cat:'SaaS',          amount:900.00,  checked:false },
    { id:6, date:'Oct 19, 2023', desc:'Office Supplies', cat:'Operations',     amount:320.00,  checked:false },
  ],
  reports: [
    { id:1, date:'Oct 24, 2023', template:'AWS Cloud Services',  cat:'Infrastructure', amount:'$1,500', oldAmount:'$1,200', checked:false },
    { id:2, date:'Oct 23, 2023', template:'Office Catering',     cat:'Operations',     amount:'$450',  checked:false },
    { id:3, date:'Oct 22, 2023', template:'Team Offsite Dinner', cat:'Culture',        amount:'$2,800',checked:false },
    { id:4, date:'Oct 21, 2023', template:'Software Licenses',   cat:'SaaS',           amount:'$900',  checked:false },
    { id:5, date:'Oct 20, 2023', template:'Hardware Upgrade',    cat:'Equipment',      amount:'$1,100',checked:false },
  ],
  categories: [
    { name:'Inventory',  icon:'📦', color:'#EEF1FE', count:24 },
    { name:'Salaries',   icon:'💰', color:'#ECFDF5', count:12 },
    { name:'Operations', icon:'⚙️', color:'#FFF5EE', count:18 },
    { name:'Marketing',  icon:'📣', color:'#F5F3FF', count:15 },
    { name:'Shipping',   icon:'🚚', color:'#FFF5EE', count:8  },
  ],
  undoStack: [],
  charts: {},
  nextTxId: 7,
};

// ── AUTH ────────────────────────────────
function handleSignup() {
  const name  = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const pass  = document.getElementById('signup-password').value;
  const conf  = document.getElementById('signup-confirm').value;
  if (!name)  return showToast('Please enter your full name');
  if (!email || !email.includes('@')) return showToast('Please enter a valid email');
  if (pass.length < 6) return showToast('Password must be at least 6 characters');
  if (pass !== conf)   return showToast('Passwords do not match');
  state.user = { name, email };
  enterApp();
}

function handleSignin() {
  const email = document.getElementById('signin-email').value.trim();
  const pass  = document.getElementById('signin-password').value;
  if (!email || !pass) return showToast('Please fill in all fields');
  state.user = { name: 'Amaresh Nookala', email };
  enterApp();
}

function enterApp() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app-screen').style.display  = 'block';
  const initials = state.user.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  document.getElementById('user-ava').textContent = initials;
  document.getElementById('profile-ava').textContent = initials;
  document.getElementById('user-display-name').textContent = state.user.name;
  initCharts();
  renderTransactions();
  renderReports();
  renderCategories();
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undoLastAction(); }
  });
}

function toggleAuth(e, mode) {
  e.preventDefault();
  document.getElementById('signup-form').style.display = mode === 'signup' ? 'block' : 'none';
  document.getElementById('signin-form').style.display = mode === 'signin' ? 'block' : 'none';
}

function logout() {
  document.getElementById('app-screen').style.display = 'none';
  document.getElementById('auth-screen').style.display = 'flex';
  state.user = null;
}

// ── PASSWORD STRENGTH ───────────────────
function checkStrength(val) {
  let score = 0;
  if (val.length >= 6)  score++;
  if (val.length >= 10) score++;
  if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const colors = ['#EF4444','#F59E0B','#22C55E','#22C55E'];
  const labels = ['Weak','Fair','Strong – Add a symbol to make it excellent!','Excellent!'];
  for (let i = 1; i <= 4; i++) {
    const bar = document.getElementById(`sb${i}`);
    bar.style.background = i <= score ? colors[score - 1] : '#E5E7EB';
  }
  document.getElementById('strength-text').textContent = val.length ? labels[score - 1] || '' : '';
}

function checkNewPassStrength(val) {
  let score = 0;
  if (val.length >= 6) score++;
  if (val.length >= 10) score++;
  if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const colors = ['#EF4444','#F59E0B','#22C55E','#22C55E'];
  for (let i = 1; i <= 4; i++) {
    const bar = document.getElementById(`np${i}`);
    if (bar) bar.style.background = i <= score ? colors[score - 1] : '#E5E7EB';
  }
}

function validateEmail(input) {
  const icon = document.getElementById('email-valid-icon');
  icon.textContent = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value) ? '✅' : '';
}

// ── NAVIGATION ──────────────────────────
function navigate(page, el) {
  // Deactivate pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`page-${page}`);
  if (target) target.classList.add('active');
  // Deactivate nav items
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (el) {
    el.classList.add('active');
  } else {
    const navEl = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navEl) navEl.classList.add('active');
  }
  state.currentPage = page;
  // Re-draw charts when going to dashboard
  if (page === 'dashboard' && state.charts.trend) {
    state.charts.trend.update();
    state.charts.weekly.update();
    state.charts.donut.update();
  }
}

// ── CHARTS ──────────────────────────────
function initCharts() {
  const orange = '#E8500C';
  const orangeLight = 'rgba(232,80,12,0.08)';

  // Trend Chart
  const trendCtx = document.getElementById('trendChart').getContext('2d');
  state.charts.trend = new Chart(trendCtx, {
    type: 'line',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'],
      datasets: [{
        data: [28000,35000,42000,55000,48000,44000,52000,68000],
        borderColor: orange,
        backgroundColor: orangeLight,
        fill: true,
        tension: 0.45,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: orange,
        borderWidth: 2.5,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false }, tooltip: {
        callbacks: { label: ctx => ` $${ctx.parsed.y.toLocaleString()}` }
      }},
      scales: {
        x: { grid: { display: false }, ticks: { font: { family:'Outfit', size:12 }, color:'#9CA3AF' } },
        y: { grid: { color:'#F3F4F6' }, border: { display:false },
             ticks: { font: { family:'Outfit', size:12 }, color:'#9CA3AF',
                      callback: v => '$'+v.toLocaleString() }}
      }
    }
  });

  // Weekly Chart
  const weekCtx = document.getElementById('weeklyChart').getContext('2d');
  state.charts.weekly = new Chart(weekCtx, {
    type: 'bar',
    data: {
      labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      datasets: [{
        data: [12000,9000,18000,14000,22000,8000,5000],
        backgroundColor: ctx => ctx.parsed.y === 22000
          ? orange
          : 'rgba(232,80,12,0.15)',
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false }, tooltip: {
        callbacks: { label: ctx => ` $${ctx.parsed.y.toLocaleString()}` }
      }},
      scales: {
        x: { grid: { display: false }, ticks: { font: { family:'Outfit', size:12 }, color:'#9CA3AF' } },
        y: { grid: { color:'#F3F4F6' }, border: { display:false },
             ticks: { font: { family:'Outfit', size:12 }, color:'#9CA3AF',
                      callback: v => '$'+v.toLocaleString() }}
      }
    }
  });

  // Donut Chart
  const donutCtx = document.getElementById('donutChart').getContext('2d');
  state.charts.donut = new Chart(donutCtx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [75, 25],
        backgroundColor: [orange, '#F3F4F6'],
        borderWidth: 0,
        hoverOffset: 0,
      }]
    },
    options: {
      responsive: false,
      cutout: '78%',
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      animation: { animateRotate: true, duration: 800 },
    }
  });
}

// ── BUDGET SLIDERS ──────────────────────
function updateBudget(key, val, maxTarget) {
  const pct = parseInt(val);
  document.getElementById(`${key}-pct`).textContent = pct + '%';
  const target = Math.round(maxTarget * pct / 100);
  document.getElementById(`${key}-target`).textContent = '$' + target.toLocaleString() + ' TARGET';
  // Update gradient on slider
  const slider = document.getElementById(`${key}-range`);
  slider.style.background = `linear-gradient(to right, var(--orange) ${pct}%, #E5E7EB ${pct}%)`;
  checkAllocation();
}

function checkAllocation() {
  const inv = parseInt(document.getElementById('inv-range').value);
  const sal = parseInt(document.getElementById('sal-range').value);
  const ops = parseInt(document.getElementById('ops-range').value);
  const total = inv + sal + ops;
  const msg = document.getElementById('alloc-msg');
  const notice = document.getElementById('alloc-notice');
  if (total === 100) {
    msg.innerHTML = 'Total allocation must equal <strong>100%</strong>. Your current distribution is optimal.';
    notice.style.background = '#FFF5EE';
    notice.style.borderColor = '#FDDCC4';
  } else {
    msg.innerHTML = `Current total: <strong>${total}%</strong>. Must equal <strong>100%</strong> (${total < 100 ? (100-total)+'% remaining' : (total-100)+'% over'}).`;
    notice.style.background = total > 100 ? '#FEF2F2' : '#FFF5EE';
    notice.style.borderColor = total > 100 ? '#FECACA' : '#FDDCC4';
  }
}

// ── ADD EXPENSE ──────────────────────────
function applyTemplate(el, name, amount, cat) {
  document.querySelectorAll('.tmpl-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('exp-amount').value = amount;
  document.getElementById('exp-cat').value = cat;
}

function addNewTemplate() {
  const name = prompt('Template name:');
  if (!name) return;
  const amount = prompt('Amount:');
  const icon = prompt('Icon emoji:') || '💡';
  const chips = document.getElementById('tmpl-chips');
  const addBtn = chips.querySelector('.add-chip');
  const chip = document.createElement('button');
  chip.className = 'tmpl-chip';
  chip.textContent = `${icon} ${name}`;
  chip.onclick = () => applyTemplate(chip, name, parseFloat(amount) || 0, 'Operations');
  chips.insertBefore(chip, addBtn);
  showToast(`Template "${name}" added!`);
}

function handleReceiptUpload(input) {
  if (input.files.length > 0) {
    document.getElementById('rcpt-filename').textContent = input.files[0].name;
    showToast('Receipt uploaded! Auto-detecting...');
    setTimeout(() => showToast('✓ Category auto-detected!'), 1500);
  }
}

function addExpense() {
  const cat    = document.getElementById('exp-cat').value;
  const amount = parseFloat(document.getElementById('exp-amount').value);
  const date   = document.getElementById('exp-date').value;
  if (!amount || amount <= 0) return showToast('Please enter a valid amount');
  const tx = {
    id: state.nextTxId++,
    date: new Date(date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }),
    desc: cat + ' Expense',
    cat,
    amount,
    checked: false,
  };
  state.transactions.unshift(tx);
  renderTransactions();
  showToast(`✓ Expense $${amount.toLocaleString()} added to ${cat}!`);
  document.getElementById('exp-amount').value = '';
}

// ── TRANSACTIONS ────────────────────────
function renderTransactions(list = null) {
  const tbody = document.getElementById('tx-tbody');
  const data  = list || state.transactions;
  tbody.innerHTML = data.map(tx => `
    <tr class="${tx.checked ? 'selected' : ''}" data-id="${tx.id}">
      <td><input type="checkbox" ${tx.checked ? 'checked' : ''} onchange="toggleTx(${tx.id},this)"/></td>
      <td style="color:var(--text-gray);font-size:13px;white-space:nowrap">${tx.date}</td>
      <td style="font-weight:600">${tx.desc}</td>
      <td><span class="cat-tag ${getCatClass(tx.cat)}">${tx.cat}</span></td>
      <td style="font-family:var(--mono);font-weight:600">$${tx.amount.toLocaleString('en-US',{minimumFractionDigits:2})}</td>
    </tr>
  `).join('');
}

function getCatClass(cat) {
  const map = {
    'Fixed Cost':'cat-fixed','Software':'cat-software','Marketing':'cat-marketing',
    'Food':'cat-food','Operations':'cat-operations','Inventory':'cat-inventory',
    'Infrastructure':'cat-infrastructure','Culture':'cat-culture','SaaS':'cat-saas',
    'Equipment':'cat-equipment','Salaries':'cat-food','Shipping':'cat-operations',
  };
  return map[cat] || 'cat-fixed';
}

function toggleTx(id, checkbox) {
  const tx = state.transactions.find(t => t.id === id);
  if (tx) tx.checked = checkbox.checked;
  updateBulkBar();
}

function selectAllTx(masterCb) {
  state.transactions.forEach(tx => tx.checked = masterCb.checked);
  renderTransactions();
  updateBulkBar();
}

function updateBulkBar() {
  const selected = state.transactions.filter(t => t.checked);
  const bar = document.getElementById('bulk-toolbar');
  const cnt = document.getElementById('selected-count');
  bar.style.display = selected.length ? 'flex' : 'none';
  cnt.textContent = `${selected.length} item${selected.length>1?'s':''} selected`;
}

function filterTransactions() {
  const q = document.getElementById('tx-search').value.toLowerCase();
  const filtered = state.transactions.filter(t =>
    t.desc.toLowerCase().includes(q) ||
    t.cat.toLowerCase().includes(q) ||
    t.date.toLowerCase().includes(q)
  );
  renderTransactions(filtered);
}

function safeDeleteSelected() {
  const selected = state.transactions.filter(t => t.checked);
  if (!selected.length) return showToast('No items selected');
  state.undoStack.push([...state.transactions]);
  state.transactions = state.transactions.filter(t => !t.checked);
  renderTransactions();
  updateBulkBar();
  showUndoBar(`${selected.length} Expense${selected.length>1?'s':''} Deleted`);
  addActivity(`Deleted ${selected.length} transaction(s)`);
}

function bulkChangeCategory() {
  const newCat = prompt('New category name:');
  if (!newCat) return;
  state.transactions.forEach(t => { if (t.checked) t.cat = newCat; });
  renderTransactions();
  showToast(`Category changed to "${newCat}"`);
  addActivity(`Category changed to "${newCat}"`);
}

// ── REPORTS ─────────────────────────────
function renderReports(list = null) {
  const tbody = document.getElementById('rpt-tbody');
  const data  = list || state.reports;
  tbody.innerHTML = data.map(r => `
    <tr class="${r.checked ? 'selected' : ''}" data-id="${r.id}">
      <td><input type="checkbox" ${r.checked ? 'checked' : ''} onchange="toggleReport(${r.id},this)"/></td>
      <td style="color:var(--text-gray);font-size:13px;white-space:nowrap">${r.date}</td>
      <td style="font-weight:600">${r.template}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="cat-tag ${getCatClass(r.cat)}">${r.cat.toUpperCase()}</span>
          ${r.oldAmount ? `<span style="text-decoration:line-through;color:var(--text-light);font-size:13px">${r.oldAmount}</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>` : ''}
        </div>
      </td>
      <td style="font-family:var(--mono);font-weight:700;color:${r.oldAmount?'var(--orange)':'var(--text)'}">${r.amount}</td>
    </tr>
  `).join('');
}

function toggleReport(id, cb) {
  const r = state.reports.find(x => x.id === id);
  if (r) r.checked = cb.checked;
}

function selectAllReports(cb) {
  state.reports.forEach(r => r.checked = cb.checked);
  renderReports();
}

function reportSafeDelete() {
  const selected = state.reports.filter(r => r.checked);
  if (!selected.length) return showToast('Select items to delete');
  state.undoStack.push({ type:'reports', data: [...state.reports] });
  state.reports = state.reports.filter(r => !r.checked);
  renderReports();
  showUndoBar(`${selected.length} Expense${selected.length>1?'s':''} Deleted`);
}

// ── CATEGORIES ──────────────────────────
function renderCategories() {
  const grid = document.getElementById('cat-grid');
  const colors = ['#EEF1FE','#ECFDF5','#FFF5EE','#F5F3FF','#FFF0E8'];
  grid.innerHTML = state.categories.map((cat, i) => `
    <div class="cat-card" onclick="showToast('${cat.name}: ${cat.count} transactions')">
      <div class="cat-card-icon" style="background:${colors[i % colors.length]}">
        <span style="font-size:22px">${cat.icon}</span>
      </div>
      <div class="cat-card-name">${cat.name}</div>
      <div class="cat-card-count">${cat.count} transactions</div>
    </div>
  `).join('') + `
    <div class="cat-add-card" onclick="openCatModal()">
      <span style="font-size:24px">+</span>
      <span>Add New</span>
    </div>
  `;
  document.getElementById('cat-count-label').textContent = `${state.categories.length} Active`;
}

function openCatModal() {
  document.getElementById('cat-modal').style.display = 'flex';
}

function closeCatModal(e) {
  if (!e || e.target === document.getElementById('cat-modal'))
    document.getElementById('cat-modal').style.display = 'none';
}

function saveNewCategory() {
  const name = document.getElementById('new-cat-name').value.trim();
  const icon = document.getElementById('new-cat-icon').value.trim() || '📁';
  if (!name) return showToast('Please enter a category name');
  state.categories.push({ name, icon, color:'#F9FAFB', count:0 });
  renderCategories();
  // Also add to selects
  ['exp-cat'].forEach(id => {
    const sel = document.getElementById(id);
    if (sel) { const opt = new Option(name, name); sel.add(opt); }
  });
  closeCatModal();
  showToast(`✓ Category "${name}" created!`);
  document.getElementById('new-cat-name').value = '';
  document.getElementById('new-cat-icon').value = '';
}

// ── SETTINGS ────────────────────────────
function switchSettingsTab(btn, tab) {
  document.querySelectorAll('.stg-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.stg-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const panel = document.getElementById(`stg-panel-${tab}`);
  if (panel) panel.classList.add('active');
}

function saveProfile() {
  const name  = document.getElementById('prf-name').value.trim();
  const email = document.getElementById('prf-email').value.trim();
  if (!name) return showToast('Name cannot be empty');
  state.user.name = name;
  state.user.email = email;
  const initials = name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  document.getElementById('user-ava').textContent = initials;
  document.getElementById('profile-ava').textContent = initials;
  document.getElementById('user-display-name').textContent = name;
  showToast('✓ Profile saved successfully!');
}

function setTheme(mode, el) {
  document.querySelectorAll('.theme-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  if (mode === 'dark') {
    document.documentElement.style.setProperty('--bg', '#0E1117');
    document.documentElement.style.setProperty('--surface', '#1A1D27');
    document.documentElement.style.setProperty('--border', '#2A2D3A');
    document.documentElement.style.setProperty('--text', '#F1F5F9');
    document.documentElement.style.setProperty('--text-gray', '#8A93A8');
    showToast('Dark theme applied');
  } else {
    document.documentElement.style.setProperty('--bg', '#F0F2F5');
    document.documentElement.style.setProperty('--surface', '#FFFFFF');
    document.documentElement.style.setProperty('--border', '#E8ECF2');
    document.documentElement.style.setProperty('--text', '#111318');
    document.documentElement.style.setProperty('--text-gray', '#6B7280');
    showToast('Light theme applied');
  }
}

function setAccent(color, el) {
  document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active-swatch'));
  el.classList.add('active-swatch');
  document.documentElement.style.setProperty('--orange', color);
  document.documentElement.style.setProperty('--orange-light', hexToLight(color));
  showToast('Accent color updated!');
}

function hexToLight(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},0.1)`;
}

function adjustSidebar(val) {
  document.getElementById('sw-val').textContent = val + 'px';
  document.getElementById('sidebar').style.width = val + 'px';
}

// ── EXPORT / RESET ──────────────────────
function exportData() {
  const headers = ['Date','Description','Category','Amount'];
  const rows = state.transactions.map(t =>
    [t.date, t.desc, t.cat, '$' + t.amount.toFixed(2)].join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type:'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'cult_transactions.csv'; a.click();
  URL.revokeObjectURL(url);
  showToast('✓ Exported as CSV!');
}

function resetBudgets() {
  if (!confirm('Reset all budget allocations to defaults?')) return;
  document.getElementById('inv-range').value = 50;
  document.getElementById('sal-range').value = 30;
  document.getElementById('ops-range').value = 20;
  updateBudget('inv', 50, 4000000);
  updateBudget('sal', 30, 2400000);
  updateBudget('ops', 20, 1600000);
  showToast('✓ Budgets reset to defaults');
}

function confirmDeleteAccount() {
  if (confirm('Are you SURE you want to permanently delete your account? This cannot be undone.')) {
    if (confirm('Last warning: all data will be lost. Proceed?')) {
      logout();
      showToast('Account deleted. Goodbye!');
    }
  }
}

// ── UNDO SYSTEM ─────────────────────────
function showUndoBar(msg) {
  const bar = document.getElementById('undo-bar');
  document.getElementById('undo-msg').textContent = msg;
  bar.style.display = 'flex';
  clearTimeout(window._undoTimer);
  window._undoTimer = setTimeout(() => bar.style.display = 'none', 6000);
}

function undoLastAction() {
  const bar = document.getElementById('undo-bar');
  bar.style.display = 'none';
  if (state.undoStack.length === 0) { showToast('Nothing to undo'); return; }
  const prev = state.undoStack.pop();
  if (Array.isArray(prev)) {
    state.transactions = prev;
    renderTransactions();
    updateBulkBar();
  } else if (prev.type === 'reports') {
    state.reports = prev.data;
    renderReports();
  }
  showToast('↩ Action undone!');
}

// ── ACTIVITY LOG ────────────────────────
function addActivity(text) {
  const list = document.getElementById('activity-list');
  if (!list) return;
  const item = document.createElement('div');
  item.className = 'act-item';
  item.innerHTML = `
    <div class="act-dot edit-dot">✏️</div>
    <div><div class="act-title">${text}</div><div class="act-time">Just now</div></div>
  `;
  list.insertBefore(item, list.firstChild);
  if (list.children.length > 6) list.removeChild(list.lastChild);
}

// ── FAB ─────────────────────────────────
function fabAction() {
  const page = state.currentPage;
  if (page === 'dashboard' || page === 'budgets') {
    navigate('budgets', null);
    showToast('Add a new expense below →');
  } else if (page === 'transactions') {
    const desc = prompt('Transaction description:');
    if (!desc) return;
    const amount = parseFloat(prompt('Amount:') || '0');
    if (!amount) return;
    state.transactions.unshift({
      id: state.nextTxId++,
      date: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),
      desc, cat:'Operations', amount, checked:false,
    });
    renderTransactions();
    showToast('✓ Transaction added!');
  } else if (page === 'categories') {
    openCatModal();
  } else {
    showToast('Use the form to add entries');
  }
}

// ── TOAST ────────────────────────────────
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── INIT SLIDER GRADIENTS ON LOAD ────────
window.addEventListener('DOMContentLoaded', () => {
  ['inv-range','sal-range','ops-range'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const v = el.value;
    el.style.background = `linear-gradient(to right, var(--orange) ${v}%, #E5E7EB ${v}%)`;
    el.addEventListener('input', function() {
      this.style.background = `linear-gradient(to right, var(--orange) ${this.value}%, #E5E7EB ${this.value}%)`;
    });
  });
});
