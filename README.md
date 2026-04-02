# Spendly — Finance Dashboard

A clean, interactive finance dashboard built with vanilla JavaScript, Chart.js, and a refined editorial dark-mode aesthetic.

---

## 🚀 Quick Start

No build tools or dependencies to install.

1. Download or clone the project folder.
2. Open `index.html` in any modern browser (Chrome, Firefox, Safari, Edge).
3. That's it — it runs fully client-side.

> **Note:** Chart.js is loaded from CDN. You need an internet connection on first load; after that the browser caches it.

---

## 📁 Project Structure

```
finance-dashboard/
├── index.html   — Markup & layout
├── style.css    — All styles (CSS variables, responsive, dark/light)
├── app.js       — Application logic, state, charts, CRUD
└── README.md    — This file
```

---

## ✨ Features

### Dashboard Overview
- **4 Summary Cards** — Total Balance, Income, Expenses, Savings Rate with month-over-month trend indicators
- **Balance Trend Chart** — Line chart showing Income vs Expenses across the selected time period
- **Spending Breakdown** — Donut chart with top expense categories
- **Recent Transactions** — Quick-view list of the 8 most recent entries

### Transactions Section
- Full sortable/filterable transaction table
- **Search** by description or category
- **Filter** by type (Income/Expense) and category
- **Sort** by date (newest/oldest) or amount (highest/lowest)
- Admin-only **Add**, **Edit**, and **Delete** actions with confirmation

### Insights Section
- **Top Spending Category** — Highest expense category over selected period
- **Best Income Month** — Month with highest total income
- **Average Monthly Spend** — Rolling average across selected period
- **Savings Goal Tracker** — Progress toward the standard 20% savings rate target
- **Monthly Comparison Bar Chart** — Side-by-side Income vs Expenses per month
- **Category Breakdown** — Horizontal bar visualization of all expense categories

### Role-Based UI (RBAC)
Simulated via a toggle in the sidebar:

| Feature | Admin | Viewer |
|---|---|---|
| View all data | ✅ | ✅ |
| Add transactions | ✅ | ❌ |
| Edit transactions | ✅ | ❌ |
| Delete transactions | ✅ | ❌ |
| Export CSV | ✅ | ❌ |

### Additional Features
- **Dark / Light Mode** — Toggle in sidebar footer; persisted to localStorage
- **Time Period Selector** — Filter dashboard to last 3, 6, or 12 months
- **CSV Export** — Downloads all filtered transactions as a `.csv` file
- **Data Persistence** — All transactions and preferences saved to `localStorage`
- **Seed Data** — 12 months of realistic mock transactions generated on first load
- **Responsive Design** — Works on mobile, tablet, and desktop
- **Empty State Handling** — Friendly empty states when no data matches filters

---

## 🎨 Design Decisions

- **Aesthetic:** Refined editorial dark theme with warm amber (`#f5a623`) as the primary accent, complemented by green (income) and red (expense) semantic colors.
- **Typography:** `DM Serif Display` for headings (personality), `Syne` for UI labels (clarity), `DM Mono` for numbers (legibility).
- **State Management:** Centralized `STATE` object (no framework needed at this scale). All mutations go through dedicated functions that call `saveState()` and `refreshAll()`.
- **Charts:** Chart.js 4 with custom theming via CSS variables for consistent light/dark appearance.

---

## 🧩 State Management Approach

All application state lives in a single `STATE` object:

```js
const STATE = {
  role: 'admin',          // Current user role
  theme: 'dark',          // UI theme
  filter: { ... },        // Active filter/sort state for transactions
  transactions: [],        // Source of truth for all transaction data
  editingId: null,        // ID of transaction being edited (modal)
  period: 6,              // Selected time period in months
};
```

- **Reads** use pure functions (`getFilteredTx()`, `getPeriodTx()`)
- **Writes** always call `saveState()` → `refreshAll()`
- **Persistence** via `localStorage` (transactions, theme, role)

---

## ⚙️ Assumptions Made

1. Currency is USD throughout.
2. "Balance" = total income minus total expenses over the selected period (not a running bank balance).
3. The 20% savings rate is used as the standard benchmark for the savings goal tracker.
4. Seed data is generated for 12 months regardless of the period selector, which filters the view.
