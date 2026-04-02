# Spendly — Finance Dashboard (React)

A clean, interactive finance dashboard built with **React 18** (via CDN), Chart.js, and a refined dark-mode aesthetic.

---

## 🚀 Quick Start

No build tools or npm required.

1. Download `index.html`
2. Open it in any modern browser
3. That's it — fully self-contained

> Chart.js and React are loaded from CDN. Internet connection needed on first load.

---

## 🛠 Tech Stack

| Tool | Purpose |
|---|---|
| **React 18** | UI rendering, component architecture |
| **useReducer** | Centralized state management |
| **useMemo / useEffect** | Performance optimization & side effects |
| **Chart.js 4** | Line, Donut, and Bar charts |
| **CSS Custom Properties** | Theming (dark/light mode) |
| **localStorage** | Data persistence |

---

## 📁 Structure

Single file `index.html` containing:
- All React components
- CSS styles
- App logic

**Component Tree:**
```
App
├── Sidebar
├── DashboardView
│   ├── SummaryCards
│   ├── TrendChart
│   ├── DonutChart
│   └── TxRow (recent)
├── TransactionsView
│   └── TxModal (add/edit)
├── InsightsView
│   └── ComparisonChart
└── Toast
```

---

## ✨ Features

### Core
- **Dashboard Overview** — 4 summary cards, balance trend line chart, spending donut chart, recent transactions
- **Transactions** — full table with search, filter by type/category, sort by date/amount
- **Role-Based UI** — Admin (add/edit/delete/export) vs Viewer (read-only, masked amounts)
- **Insights** — top category, best income month, avg spend, savings goal, monthly comparison chart, category breakdown bars

### Optional (all implemented)
- ✅ Dark / Light mode
- ✅ localStorage persistence
- ✅ CSV export
- ✅ Smooth animations
- ✅ 12 months of realistic mock seed data
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Empty state handling

---

## 🧩 State Management

Uses React's `useReducer` hook with a centralized state — similar to Redux but zero dependencies:

```js
const [state, dispatch] = useReducer(reducer, initialState);
```

**State shape:**
```js
{
  transactions: [],      // All transaction data
  filter: { search, type, category, sort },  // Active filters
  role: 'admin',         // 'admin' | 'viewer'
  theme: 'dark',         // 'dark' | 'light'
  period: 6,             // Time period in months
  view: 'dashboard',     // Active page
  modal: { open, editing },
  toast: { msg, type, show },
  sidebarOpen: false,
}
```

All state mutations go through `dispatch(action)` — no direct state mutation anywhere.

---

## 🎭 Role-Based UI

| Feature | Admin | Viewer |
|---|---|---|
| View all data & charts | ✅ | ✅ |
| Add transactions | ✅ | ❌ |
| Edit transactions | ✅ | ❌ |
| Delete transactions | ✅ | ❌ |
| Export CSV | ✅ | ❌ |
| See exact amounts | ✅ | ❌ (masked) |
| Trend indicators | ✅ | ❌ |
| Info banner | ❌ | ✅ |

Switch roles using the toggle in the sidebar footer.

---

## 🎨 Design

- **Theme:** Dark with warm amber (`#f5a623`) accent
- **Typography:** DM Serif Display (headings) + Syne (UI) + DM Mono (numbers)
- **Charts:** Dual Y-axis line chart so income and expense lines both use full height

---

## 📝 Assumptions

1. Currency is USD
2. Balance = total income minus total expenses over selected period
3. 20% is used as the savings rate benchmark
4. Seed data is generated for 12 months on first load
