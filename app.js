/* ─── Ledger Finance Dashboard ── app.js ─────────────────────── */

/* ══════════════════════════════════════════════════════════════
   1. STATE
══════════════════════════════════════════════════════════════ */
const STATE = {
  role: 'admin',       // 'admin' | 'viewer'
  theme: 'dark',
  filter: { search: '', type: 'all', category: 'all', sort: 'date-desc' },
  transactions: [],
  editingId: null,
  period: 6,
};

/* ══════════════════════════════════════════════════════════════
   2. SEED DATA
══════════════════════════════════════════════════════════════ */
const CATEGORY_ICONS = {
  'Food & Dining': '🍔', 'Transport': '🚗', 'Entertainment': '🎬',
  'Shopping': '🛍️', 'Healthcare': '💊', 'Utilities': '💡',
  'Housing': '🏠', 'Salary': '💼', 'Freelance': '💻',
  'Investment': '📈', 'Other': '📦',
};

const CATEGORY_COLORS = [
  '#f5a623','#4ade80','#60a5fa','#f87171','#a78bfa',
  '#34d399','#fb923c','#38bdf8','#e879f9','#facc15',
];

function generateSeedData() {
  const categories = Object.keys(CATEGORY_ICONS);
  const descriptions = {
    'Food & Dining': ['Starbucks','Chipotle','McDonald\'s','Whole Foods','Domino\'s','Sushi Bar'],
    'Transport': ['Uber','Lyft','Gas Station','Parking Fee','Bus Pass','Flight Ticket'],
    'Entertainment': ['Netflix','Spotify','Movie Tickets','Concert','Steam Games','Disney+'],
    'Shopping': ['Amazon','ZARA','Apple Store','Best Buy','Target','Nike'],
    'Healthcare': ['Pharmacy','Doctor Visit','Gym Membership','Vitamins','Dentist','Eye Care'],
    'Utilities': ['Electric Bill','Water Bill','Internet','Phone Bill','Gas Bill','Cloud Storage'],
    'Housing': ['Rent','Home Insurance','Maintenance','Furniture','Security Deposit'],
    'Salary': ['Monthly Salary','Bonus Payment','Performance Pay'],
    'Freelance': ['Design Project','Consulting Fee','Writing Project','Dev Contract'],
    'Investment': ['Stock Dividend','ETF Returns','Crypto Sale'],
    'Other': ['Gift','Miscellaneous','ATM Withdrawal'],
  };

  const txns = [];
  const now = new Date();

  for (let m = 11; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    // Income
    txns.push({
      id: `tx-${Date.now()}-${Math.random()}`,
      description: 'Monthly Salary',
      amount: 5800 + Math.round(Math.random() * 400),
      category: 'Salary',
      type: 'income',
      date: fmtDate(new Date(d.getFullYear(), d.getMonth(), 1 + Math.floor(Math.random() * 3))),
    });
    if (Math.random() > 0.5) {
      const fl = descriptions['Freelance'][Math.floor(Math.random() * descriptions['Freelance'].length)];
      txns.push({
        id: `tx-${Date.now()}-${Math.random()}`,
        description: fl,
        amount: 400 + Math.round(Math.random() * 1200),
        category: 'Freelance',
        type: 'income',
        date: fmtDate(new Date(d.getFullYear(), d.getMonth(), 5 + Math.floor(Math.random() * 10))),
      });
    }
    // Expenses
    const numExpenses = 8 + Math.floor(Math.random() * 6);
    for (let i = 0; i < numExpenses; i++) {
      const expCats = categories.filter(c => !['Salary','Freelance','Investment'].includes(c));
      const cat = expCats[Math.floor(Math.random() * expCats.length)];
      const descs = descriptions[cat];
      txns.push({
        id: `tx-${Date.now()}-${Math.random()}-${i}`,
        description: descs[Math.floor(Math.random() * descs.length)],
        amount: Math.round((20 + Math.random() * 380) * 100) / 100,
        category: cat,
        type: 'expense',
        date: fmtDate(new Date(d.getFullYear(), d.getMonth(), 1 + Math.floor(Math.random() * 27))),
      });
    }
  }

  return txns.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function fmtDate(d) {
  return d.toISOString().split('T')[0];
}

/* ══════════════════════════════════════════════════════════════
   3. PERSISTENCE
══════════════════════════════════════════════════════════════ */
function saveState() {
  try {
    localStorage.setItem('spendly_txns', JSON.stringify(STATE.transactions));
    localStorage.setItem('spendly_theme', STATE.theme);
    localStorage.setItem('spendly_role', STATE.role);
  } catch (e) {}
}

function loadState() {
  try {
    const version = localStorage.getItem('spendly_version');
    if (version !== '2') {
      localStorage.removeItem('spendly_txns');
      localStorage.setItem('spendly_version', '2');
    }
    const txns = localStorage.getItem('spendly_txns');
    const theme = localStorage.getItem('spendly_theme');
    const role = localStorage.getItem('spendly_role');
    if (txns) STATE.transactions = JSON.parse(txns);
    else STATE.transactions = generateSeedData();
    if (theme) STATE.theme = theme;
    if (role) STATE.role = role;
  } catch (e) {
    STATE.transactions = generateSeedData();
  }
}

/* ══════════════════════════════════════════════════════════════
   4. HELPERS
══════════════════════════════════════════════════════════════ */
const fmt = n => '$' + Math.abs(+n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtCompact = n => {
  const abs = Math.abs(n);
  if (abs >= 1000) return '$' + (abs / 1000).toFixed(1) + 'k';
  return '$' + abs.toFixed(0);
};

function formatDisplayDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getMonthLabel(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function trendArrow(val) {
  if (val > 0) return `<span style="color:var(--income)">▲ ${fmt(val)} vs last month</span>`;
  if (val < 0) return `<span style="color:var(--expense)">▼ ${fmt(Math.abs(val))} vs last month</span>`;
  return `<span>Same as last month</span>`;
}

function getFilteredTx() {
  const { search, type, category, sort } = STATE.filter;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - STATE.period);

  return STATE.transactions
    .filter(tx => {
      const txDate = new Date(tx.date + 'T12:00:00');
      if (txDate < cutoff) return false;
      if (type !== 'all' && tx.type !== type) return false;
      if (category !== 'all' && tx.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        return tx.description.toLowerCase().includes(q) || tx.category.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sort === 'date-asc')  return new Date(a.date) - new Date(b.date);
      if (sort === 'amount-desc') return b.amount - a.amount;
      if (sort === 'amount-asc')  return a.amount - b.amount;
      return 0;
    });
}

function getPeriodTx() {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - STATE.period);
  return STATE.transactions.filter(tx => new Date(tx.date + 'T12:00:00') >= cutoff);
}

/* ══════════════════════════════════════════════════════════════
   5. CHARTS
══════════════════════════════════════════════════════════════ */
let trendChartInst = null;
let donutChartInst = null;
let compChartInst = null;

function buildMonthlyData() {
  const months = [];
  const now = new Date();
  for (let i = STATE.period - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push({ key, label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), income: 0, expenses: 0 });
  }

  const allTx = getPeriodTx();
  allTx.forEach(tx => {
    const key = tx.date.substring(0, 7);
    const m = months.find(m => m.key === key);
    if (!m) return;
    if (tx.type === 'income') m.income += tx.amount;
    else m.expenses += tx.amount;
  });

  return months;
}

function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function renderTrendChart() {
  const ctx = document.getElementById('trendChart').getContext('2d');
  const months = buildMonthlyData();

  if (trendChartInst) trendChartInst.destroy();

  const incomeData = months.map(m => m.income);
  const expenseData = months.map(m => m.expenses);

  trendChartInst = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months.map(m => m.label),
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          borderColor: '#4ade80',
          backgroundColor: 'rgba(74,222,128,0.10)',
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#4ade80',
          pointBorderColor: '#141417',
          pointBorderWidth: 2,
          borderWidth: 2.5,
          yAxisID: 'yIncome',
        },
        {
          label: 'Expenses',
          data: expenseData,
          borderColor: '#f87171',
          backgroundColor: 'rgba(248,113,113,0.10)',
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#f87171',
          pointBorderColor: '#141417',
          pointBorderWidth: 2,
          borderWidth: 2.5,
          yAxisID: 'yExpense',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1c1c22',
          borderColor: 'rgba(255,255,255,0.15)',
          borderWidth: 1,
          titleColor: '#f0ede8',
          bodyColor: '#7a7a8c',
          padding: 12,
          cornerRadius: 8,
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
          ticks: { color: '#7a7a8c', font: { family: "'DM Mono', monospace", size: 11 }, maxRotation: 0 },
          border: { display: false },
        },
        yIncome: {
          position: 'left',
          grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
          ticks: { color: '#4ade80', font: { family: "'DM Mono', monospace", size: 11 }, callback: v => fmtCompact(v) },
          border: { display: false },
        },
        yExpense: {
          position: 'right',
          grid: { display: false },
          ticks: { color: '#f87171', font: { family: "'DM Mono', monospace", size: 11 }, callback: v => fmtCompact(v) },
          border: { display: false },
        },
      },
    },
  });
}

function renderDonutChart() {
  const canvas = document.getElementById('donutChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const expenses = getPeriodTx().filter(t => t.type === 'expense');
  const byCat = {};
  expenses.forEach(t => { byCat[t.category] = (byCat[t.category] || 0) + t.amount; });
  const sorted = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const total = sorted.reduce((s, [, v]) => s + v, 0);

  if (donutChartInst) { donutChartInst.destroy(); donutChartInst = null; }
  if (sorted.length === 0) {
    document.getElementById('donutLegend').innerHTML = '<p style="font-size:12px;color:var(--text-muted);text-align:center;margin-top:8px">No data</p>';
    return;
  }

  donutChartInst = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: sorted.map(([k]) => k),
      datasets: [{
        data: sorted.map(([, v]) => v),
        backgroundColor: CATEGORY_COLORS,
        borderWidth: 0,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1c1c22',
          borderColor: 'rgba(255,255,255,0.15)',
          borderWidth: 1,
          titleColor: '#f0ede8',
          bodyColor: '#7a7a8c',
          padding: 10,
          callbacks: { label: ctx => ` ${fmt(ctx.parsed)} (${((ctx.parsed / total) * 100).toFixed(1)}%)` },
        },
      },
    },
  });

  const legend = document.getElementById('donutLegend');
  legend.innerHTML = sorted.slice(0, 5).map(([k, v], i) => `
    <div class="donut-legend-item">
      <span class="donut-legend-label">
        <span class="donut-legend-dot" style="background:${CATEGORY_COLORS[i]}"></span>
        ${k}
      </span>
      <span class="donut-legend-pct">${((v / total) * 100).toFixed(0)}%</span>
    </div>
  `).join('');
}

function renderComparisonChart() {
  const ctx = document.getElementById('comparisonChart').getContext('2d');
  const months = buildMonthlyData();

  if (compChartInst) compChartInst.destroy();

  compChartInst = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months.map(m => m.label),
      datasets: [
        {
          label: 'Income',
          data: months.map(m => m.income),
          backgroundColor: 'rgba(74,222,128,0.7)',
          borderRadius: 6,
          barPercentage: 0.7,
          categoryPercentage: 0.6,
        },
        {
          label: 'Expenses',
          data: months.map(m => m.expenses),
          backgroundColor: 'rgba(248,113,113,0.7)',
          borderRadius: 6,
          barPercentage: 0.7,
          categoryPercentage: 0.6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: true, labels: { color: getCSSVar('--text-muted') || '#7a7a8c', font: { family: "'Syne', sans-serif", size: 12 }, usePointStyle: true, pointStyleWidth: 10 } },
        tooltip: {
          backgroundColor: getCSSVar('--bg3') || '#1c1c22',
          borderColor: getCSSVar('--border-strong') || 'rgba(255,255,255,0.13)',
          borderWidth: 1,
          titleColor: getCSSVar('--text') || '#f0ede8',
          bodyColor: getCSSVar('--text-muted') || '#7a7a8c',
          padding: 12,
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: getCSSVar('--text-muted') || '#7a7a8c', font: { family: "'DM Mono', monospace", size: 11 } } },
        y: { grid: { color: getCSSVar('--border') || 'rgba(255,255,255,0.07)' }, ticks: { color: getCSSVar('--text-muted') || '#7a7a8c', font: { family: "'DM Mono', monospace", size: 11 }, callback: v => fmtCompact(v) } },
      },
    },
  });
}

/* ══════════════════════════════════════════════════════════════
   6. SUMMARY CARDS
══════════════════════════════════════════════════════════════ */
function renderCards() {
  const tx = getPeriodTx();
  const income = tx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = tx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expenses;
  const rate = income > 0 ? ((income - expenses) / income * 100) : 0;

  // Last month vs current month comparison
  const now = new Date();
  const thisMonKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMon = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonKey = `${lastMon.getFullYear()}-${String(lastMon.getMonth() + 1).padStart(2, '0')}`;

  const thisMon = STATE.transactions.filter(t => t.date.startsWith(thisMonKey));
  const prevMon = STATE.transactions.filter(t => t.date.startsWith(lastMonKey));

  const thisInc = thisMon.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const prevInc = prevMon.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const thisExp = thisMon.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const prevExp = prevMon.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const isViewer = STATE.role === 'viewer';
  const mask = (val) => isViewer ? '••••••' : val;

  document.getElementById('totalBalance').textContent = mask(fmt(balance));
  document.getElementById('totalIncome').textContent = mask(fmt(income));
  document.getElementById('totalExpenses').textContent = mask(fmt(expenses));
  document.getElementById('savingsRate').textContent = mask(rate.toFixed(1) + '%');

  document.getElementById('balanceTrend').innerHTML = isViewer ? '' : trendArrow(thisInc - thisExp - (prevInc - prevExp));
  document.getElementById('incomeTrend').innerHTML = isViewer ? '' : trendArrow(thisInc - prevInc);
  document.getElementById('expensesTrend').innerHTML = isViewer ? '' : trendArrow(prevExp - thisExp);
  document.getElementById('savingsTrend').innerHTML = isViewer ? '' : (rate >= 20
    ? `<span style="color:var(--income)">✓ On target</span>`
    : `<span style="color:var(--accent)">${(20 - rate).toFixed(1)}% below 20% target</span>`);
}

/* ══════════════════════════════════════════════════════════════
   7. RECENT TRANSACTIONS (Dashboard)
══════════════════════════════════════════════════════════════ */
function renderRecentTx() {
  const list = document.getElementById('recentTxList');
  const recent = STATE.transactions.slice(0, 8);

  if (recent.length === 0) {
    list.innerHTML = '<div class="empty-state"><p>No transactions yet</p></div>';
    return;
  }

  const isViewer = STATE.role === 'viewer';
  list.innerHTML = recent.map(tx => `
    <div class="tx-row">
      <div class="tx-icon" style="background:${tx.type === 'income' ? 'var(--income-dim)' : 'var(--expense-dim)'}">
        ${CATEGORY_ICONS[tx.category] || '💰'}
      </div>
      <div class="tx-info">
        <div class="tx-desc">${tx.description}</div>
        <div class="tx-date">${formatDisplayDate(tx.date)}</div>
      </div>
      <div class="tx-category">${tx.category}</div>
      <div class="tx-amount ${tx.type}">${isViewer ? '<span class="masked-amt">••••</span>' : (tx.type === 'income' ? '+' : '-') + fmt(tx.amount)}</div>
    </div>
  `).join('');
}

/* ══════════════════════════════════════════════════════════════
   8. TRANSACTIONS TABLE
══════════════════════════════════════════════════════════════ */
function populateCategoryFilter() {
  const cats = [...new Set(STATE.transactions.map(t => t.category))].sort();
  const sel = document.getElementById('filterCategory');
  sel.innerHTML = '<option value="all">All Categories</option>' +
    cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

function renderTransactionsTable() {
  const filtered = getFilteredTx();
  const tbody = document.getElementById('txTableBody');
  const empty = document.getElementById('txEmptyState');
  const isAdmin = STATE.role === 'admin';

  document.getElementById('txCount').textContent = `${filtered.length} transaction${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'flex';
    return;
  }
  empty.style.display = 'none';

  const isViewer = STATE.role === 'viewer';
  tbody.innerHTML = filtered.map(tx => `
    <tr data-id="${tx.id}">
      <td class="date-cell">${formatDisplayDate(tx.date)}</td>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:18px">${CATEGORY_ICONS[tx.category] || '💰'}</span>
          <span style="font-weight:600">${tx.description}</span>
        </div>
      </td>
      <td><span class="tx-category">${tx.category}</span></td>
      <td><span class="type-badge ${tx.type}">${tx.type === 'income' ? '↑' : '↓'} ${tx.type}</span></td>
      <td class="amount-cell" style="color:var(--${tx.type === 'income' ? 'income' : 'expense'})">
        ${isViewer ? '<span class="masked-amt">••••••</span>' : (tx.type === 'income' ? '+' : '-') + fmt(tx.amount)}
      </td>
      <td class="admin-only">
        <div class="action-btns">
          <button class="btn-icon edit" onclick="openEditModal('${tx.id}')" title="Edit">
            <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon delete" onclick="deleteTx('${tx.id}')" title="Delete">
            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

/* ══════════════════════════════════════════════════════════════
   9. INSIGHTS
══════════════════════════════════════════════════════════════ */
function renderInsights() {
  const tx = getPeriodTx();
  const expenses = tx.filter(t => t.type === 'expense');
  const incomes = tx.filter(t => t.type === 'income');

  // Top category
  const byCat = {};
  expenses.forEach(t => { byCat[t.category] = (byCat[t.category] || 0) + t.amount; });
  const topCat = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
  document.getElementById('topCategory').textContent = topCat ? topCat[0] : '—';
  document.getElementById('topCategoryAmt').textContent = topCat ? fmt(topCat[1]) + ' total' : '';

  // Best income month
  const byMonth = {};
  incomes.forEach(t => {
    const k = t.date.substring(0, 7);
    byMonth[k] = (byMonth[k] || 0) + t.amount;
  });
  const bestMon = Object.entries(byMonth).sort((a, b) => b[1] - a[1])[0];
  if (bestMon) {
    const [yr, mo] = bestMon[0].split('-');
    const label = new Date(yr, mo - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    document.getElementById('bestIncomeMonth').textContent = label;
    document.getElementById('bestIncomeAmt').textContent = fmt(bestMon[1]) + ' income';
  }

  // Avg monthly spend
  const totalExp = expenses.reduce((s, t) => s + t.amount, 0);
  const avgSpend = STATE.period > 0 ? totalExp / STATE.period : 0;
  document.getElementById('avgMonthlySpend').textContent = fmt(avgSpend);

  // Savings goal
  const totalInc = incomes.reduce((s, t) => s + t.amount, 0);
  const rate = totalInc > 0 ? ((totalInc - totalExp) / totalInc * 100) : 0;
  const pct = Math.min(100, (rate / 20) * 100);
  document.getElementById('savingsGoal').textContent = rate.toFixed(1) + '%';

  // Category breakdown bars
  const allExpCats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const maxAmt = allExpCats[0]?.[1] || 1;
  const breakList = document.getElementById('categoryBreakdownList');
  breakList.innerHTML = allExpCats.map(([cat, amt], i) => `
    <div class="category-bar-row">
      <div class="cat-bar-header">
        <span class="cat-bar-name">${CATEGORY_ICONS[cat] || ''} ${cat}</span>
        <span class="cat-bar-amt">${fmt(amt)}</span>
      </div>
      <div class="cat-bar-track">
        <div class="cat-bar-fill" style="width:${(amt / maxAmt * 100).toFixed(1)}%;background:${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}"></div>
      </div>
    </div>
  `).join('');

  renderComparisonChart();
}

/* ══════════════════════════════════════════════════════════════
   10. MODAL
══════════════════════════════════════════════════════════════ */
function openAddModal() {
  STATE.editingId = null;
  document.getElementById('modalTitle').textContent = 'Add Transaction';
  document.getElementById('fDescription').value = '';
  document.getElementById('fAmount').value = '';
  document.getElementById('fDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('fType').value = 'expense';
  document.getElementById('fCategory').value = 'Food & Dining';
  document.getElementById('modalOverlay').classList.add('open');
}

function openEditModal(id) {
  const tx = STATE.transactions.find(t => t.id === id);
  if (!tx) return;
  STATE.editingId = id;
  document.getElementById('modalTitle').textContent = 'Edit Transaction';
  document.getElementById('fDescription').value = tx.description;
  document.getElementById('fAmount').value = tx.amount;
  document.getElementById('fDate').value = tx.date;
  document.getElementById('fType').value = tx.type;
  document.getElementById('fCategory').value = tx.category;
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  STATE.editingId = null;
}

function saveTransaction() {
  const desc = document.getElementById('fDescription').value.trim();
  const amt = parseFloat(document.getElementById('fAmount').value);
  const date = document.getElementById('fDate').value;
  const type = document.getElementById('fType').value;
  const category = document.getElementById('fCategory').value;

  if (!desc || isNaN(amt) || amt <= 0 || !date) {
    showToast('Please fill in all fields correctly', 'error');
    return;
  }

  if (STATE.editingId) {
    const idx = STATE.transactions.findIndex(t => t.id === STATE.editingId);
    if (idx !== -1) {
      STATE.transactions[idx] = { ...STATE.transactions[idx], description: desc, amount: amt, date, type, category };
    }
    showToast('Transaction updated', 'success');
  } else {
    const newTx = {
      id: `tx-${Date.now()}-${Math.random()}`,
      description: desc, amount: amt, date, type, category,
    };
    STATE.transactions.unshift(newTx);
    showToast('Transaction added', 'success');
  }

  STATE.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  saveState();
  closeModal();
  refreshAll();
}

function deleteTx(id) {
  if (!confirm('Delete this transaction?')) return;
  STATE.transactions = STATE.transactions.filter(t => t.id !== id);
  saveState();
  showToast('Transaction deleted', 'success');
  refreshAll();
}

/* ══════════════════════════════════════════════════════════════
   11. TOAST
══════════════════════════════════════════════════════════════ */
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  setTimeout(() => { t.className = 'toast'; }, 2800);
}

/* ══════════════════════════════════════════════════════════════
   12. NAVIGATION
══════════════════════════════════════════════════════════════ */
function switchView(viewName) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const view = document.getElementById(`view-${viewName}`);
  if (view) view.classList.add('active');

  const navItem = document.querySelector(`.nav-item[data-view="${viewName}"]`);
  if (navItem) navItem.classList.add('active');

  if (viewName === 'insights') renderInsights();
  if (viewName === 'transactions') { populateCategoryFilter(); renderTransactionsTable(); }
}

/* ══════════════════════════════════════════════════════════════
   13. RBAC
══════════════════════════════════════════════════════════════ */
const ROLE_PERMISSIONS = {
  admin: {
    canAdd: true,
    canEdit: true,
    canDelete: true,
    canExport: true,
    canSeeRawAmounts: true,
    canClearData: true,
  },
  viewer: {
    canAdd: false,
    canEdit: false,
    canDelete: false,
    canExport: false,
    canSeeRawAmounts: false,
    canClearData: false,
  },
};

function applyRole(role) {
  STATE.role = role;
  document.querySelectorAll('.role-btn').forEach(b => b.classList.toggle('active', b.dataset.role === role));
  document.getElementById('mobileRole').textContent = role.charAt(0).toUpperCase() + role.slice(1);

  if (role === 'viewer') {
    document.body.classList.add('viewer-mode');
  } else {
    document.body.classList.remove('viewer-mode');
  }

  updateRoleBanner(role);
  updateAmountVisibility(role);
  saveState();
  refreshAll();
}

function updateRoleBanner(role) {
  let banner = document.getElementById('roleBanner');
  if (role === 'viewer') {
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'roleBanner';
      banner.className = 'role-banner';
      document.querySelector('.main-content').prepend(banner);
    }
    banner.innerHTML = `
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>You are in <strong>Viewer mode</strong> — data is read-only. Transaction amounts are masked. Switch to Admin for full access.</span>
    `;
  } else {
    if (banner) banner.remove();
  }
}

function updateAmountVisibility(role) {
  // Viewer sees masked amounts (privacy mode)
  const isViewer = role === 'viewer';
  document.documentElement.setAttribute('data-masked', isViewer ? 'true' : 'false');
}

/* ══════════════════════════════════════════════════════════════
   14. THEME
══════════════════════════════════════════════════════════════ */
function applyTheme(theme) {
  STATE.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  saveState();
  setTimeout(() => {
    renderTrendChart();
    renderDonutChart();
    if (document.getElementById('view-insights').classList.contains('active')) renderComparisonChart();
  }, 50);
}

/* ══════════════════════════════════════════════════════════════
   15. EXPORT
══════════════════════════════════════════════════════════════ */
function exportCSV() {
  const tx = getFilteredTx();
  const headers = ['Date','Description','Category','Type','Amount'];
  const rows = tx.map(t => [t.date, `"${t.description}"`, t.category, t.type, t.amount.toFixed(2)]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'spendly-transactions.csv'; a.click();
  URL.revokeObjectURL(url);
  showToast('CSV exported!', 'success');
}

/* ══════════════════════════════════════════════════════════════
   16. REFRESH ALL
══════════════════════════════════════════════════════════════ */
function refreshAll() {
  renderCards();
  renderTrendChart();
  renderDonutChart();
  renderRecentTx();
  const activeName = document.querySelector('.view.active')?.id?.replace('view-', '');
  if (activeName === 'transactions') renderTransactionsTable();
  if (activeName === 'insights') renderInsights();
}

/* ══════════════════════════════════════════════════════════════
   17. INIT
══════════════════════════════════════════════════════════════ */
function init() {
  loadState();

  // Date
  document.getElementById('currentDate').textContent =
    new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Theme
  document.documentElement.setAttribute('data-theme', STATE.theme);

  // Role
  applyRole(STATE.role);

  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      switchView(item.dataset.view);
      if (window.innerWidth < 768) document.getElementById('sidebar').classList.remove('open');
    });
  });

  document.querySelectorAll('.see-all').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); switchView(a.dataset.view); });
  });

  // Theme toggle
  document.getElementById('themeToggle').addEventListener('click', () => {
    applyTheme(STATE.theme === 'dark' ? 'light' : 'dark');
  });

  // Role toggle
  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', () => applyRole(btn.dataset.role));
  });

  // Period select
  document.getElementById('periodSelect').addEventListener('change', e => {
    STATE.period = parseInt(e.target.value);
    refreshAll();
  });

  // Export
  document.getElementById('exportBtn').addEventListener('click', exportCSV);

  // Add TX button
  document.getElementById('addTxBtn').addEventListener('click', openAddModal);

  // Modal
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalCancel').addEventListener('click', closeModal);
  document.getElementById('modalSave').addEventListener('click', saveTransaction);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });

  // Filters
  document.getElementById('searchInput').addEventListener('input', e => {
    STATE.filter.search = e.target.value;
    renderTransactionsTable();
  });
  document.getElementById('filterType').addEventListener('change', e => {
    STATE.filter.type = e.target.value;
    renderTransactionsTable();
  });
  document.getElementById('filterCategory').addEventListener('change', e => {
    STATE.filter.category = e.target.value;
    renderTransactionsTable();
  });
  document.getElementById('sortBy').addEventListener('change', e => {
    STATE.filter.sort = e.target.value;
    renderTransactionsTable();
  });
  document.getElementById('clearFilters').addEventListener('click', () => {
    STATE.filter = { search: '', type: 'all', category: 'all', sort: 'date-desc' };
    document.getElementById('searchInput').value = '';
    document.getElementById('filterType').value = 'all';
    document.getElementById('filterCategory').value = 'all';
    document.getElementById('sortBy').value = 'date-desc';
    renderTransactionsTable();
  });

  // Mobile sidebar
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Initial render
  refreshAll();
}

// Make global for inline onclick
window.openEditModal = openEditModal;
window.deleteTx = deleteTx;

document.addEventListener('DOMContentLoaded', init);