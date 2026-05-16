# Spendly — Finance Dashboard

A clean, interactive personal finance dashboard built with **React 18** (via CDN), Chart.js, and a refined dark-mode aesthetic.

🔗 **[Live Demo](https://finance-dashboard-six-sigma.vercel.app/)** · [GitHub Repo](https://github.com/srilathapothana/finance-dashboard)

---

## 🚀 Quick Start

No build tools or npm required.

1. Clone the repo or download the files
2. Open `index.html` in any modern browser
3. That's it — works out of the box

> Chart.js and React are loaded from CDN. An internet connection is needed on first load.

---

## 🛠 Tech Stack

| Tool | Purpose |
|---|---|
| **React 18** | UI rendering, component architecture |
| **useReducer** | Centralized state management |
| **useMemo / useEffect** | Performance optimization & side effects |
| **Chart.js 4** | Line, Donut, and Bar charts |
| **CSS Custom Properties** | Theming (dark/light mode) |
| **localStorage** | Data persistence across sessions |

---

## 📁 Project Structure

```
finance-dashboard/
├── index.html      # App entry point + React component tree
├── app.js          # All React components and app logic
├── style.css       # Global styles and CSS custom properties
└── README.md
```

**Component Tree:**
```
App
├── Sidebar
├── DashboardView
│   ├── SummaryCards
│   ├── TrendChart
│   ├── DonutChart
│   └── TxRow (recent transactions)
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

### Additional Features
- ✅ Dark / Light mode toggle
- ✅ localStorage persistence
- ✅ CSV export
- ✅ Smooth animations
- ✅ 12 months of realistic mock seed data
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Empty state handling

---

## 🧩 State Management

Uses React's `useReducer` hook with centralized state — similar to Redux but with zero dependencies:

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
- **Charts:** Dual Y-axis line chart so income and expense lines both use full chart height

---

## 📝 Assumptions

1. Currency is USD
2. Balance = total income minus total expenses over the selected period
3. 20% is used as the savings rate benchmark
4. Seed data is auto-generated for 12 months on first load
