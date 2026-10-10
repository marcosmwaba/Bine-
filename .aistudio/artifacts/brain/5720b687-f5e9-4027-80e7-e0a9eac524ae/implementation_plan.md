# Architectural Blueprint: Cloud Data Publishing API & Executive Web Dashboard

## 1. Executive Summary & Overview
This plan establishes a two-way synchronization and remote oversight pipeline for the **Bine POS & Retail Operating System**. 
A local cashier or shopkeeper running the POS terminal can click **"Publish to Cloud"** to push their store snapshot (stock, sales, debtors, expenses, financial progressions, and settings) to a built-in server API (`/api/publish`). 

Remote stakeholders (owners, partners, managers) can access a **permanent bookmarkable Web Dashboard** (`/dashboard` or top-level toggle) from any phone or PC to view real-time figures, stock alerts, debt books, and revenue breakdowns without interrupting the active cashier register.

```
┌──────────────────────────────────────────────────────────────┐
│                  Bine POS Terminal (Cashier)                 │
│  - Active register: Sales, Stock, Debtors, Expenses          │
│  - Header action: [ Publish to Cloud ]                       │
│  - Share modal: Permanent Dashboard URL & Live QR Code       │
└──────────────────────────────┬───────────────────────────────┘
                               │ POST /api/publish (Store Snapshot)
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                    Express Backend Server                    │
│  - server.ts running on port 3000                            │
│  - Endpoints:                                                │
│    • POST /api/publish       -> Validates & writes to disk   │
│    • GET  /api/store-data    -> Serves latest snapshot       │
│    • GET  /api/health        -> Connection status            │
│  - Vite middleware mounted for seamless single-port hosting  │
└──────────────────────────────┬───────────────────────────────┘
                               │ GET /api/store-data
                               ▼
┌──────────────────────────────────────────────────────────────┐
│              Executive Web Dashboard (/dashboard)            │
│  - Remote responsive interface (mobile, tablet, desktop)     │
│  - Executive KPI cards: Revenue, Net Profit, Debt, Margin    │
│  - Live Inventory table with Low-Stock alerts                │
│  - Debtors (*Nkongole*) ledger & repayment status            │
│  - Sales & Expense audit ledger with CSV/Print export        │
│  - Optional 4-digit PIN lock for authorized owner access     │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. API Contract & Data Architecture

### A. Endpoint Definitions
1. **`POST /api/publish`**
   - **Request Body**:
     ```typescript
     interface PublishPayload {
       storeId: string;
       businessName: string;
       currency: string;
       publishedAt: string; // ISO-8601
       publishedBy: string; // Cashier or Owner name
       summary: {
         totalRevenue: number;
         totalProfit: number;
         totalDebtOutstanding: number;
         totalExpenses: number;
         inventoryValuation: number;
         lowStockCount: number;
       };
       products: Product[];
       sales: Sale[];
       debtors: Debtor[];
       expenses: Expense[];
       settings: Settings;
     }
     ```
   - **Response**: `{ success: true, timestamp: string, version: number }`
   - **Persistence**: Saved server-side to `data/store_snapshot.json` (with automatic directory creation) ensuring data survives server restarts.

2. **`GET /api/store-data`**
   - **Response**: Returns the latest `PublishPayload` snapshot along with server sync timestamp. If no publish has occurred yet, returns default initial state with an `uninitialized` flag.

3. **`GET /api/health`**
   - Simple ping endpoint for the POS client to verify cloud connectivity before publishing.

---

## 3. User Interface & Feature Specifications

### A. POS Terminal Controls (Cashier Side)
- **Top Header Action**: A dedicated **"Cloud Sync"** action button in the top navigation bar showing sync status badge:
  - *Cloud Connected* / *Last synced: 10:45 AM*
  - Clicking opens the **Publish & Share Modal**.
- **Publish & Share Modal**:
  - **"Publish Now" Primary Button**: Triggers packaging of local products, sales, debtors, and expenses. Includes loading spinner and instant success feedback.
  - **Permanent Web Link**: Clean, copyable dashboard URL (`https://.../?view=dashboard` or `/dashboard`). One-click **"Copy Link"** button with copy toast.
  - **Live Scannable QR Code**: Built-in SVG QR code generator pointing to the exact dashboard URL so owners can point their mobile phone camera and view immediately.
  - **Switch to Dashboard Button**: Allows testing the executive view directly on the same device.

### B. Executive Web Dashboard (Remote Owner Side)
- **Header & Navigation**:
  - Store identity header: Business Name, active currency, and **"Last Published [Time]"** banner with relative time badge (e.g. *Updated 4 mins ago*).
  - **"Refresh Data" button**: Fetches latest snapshot from the API with animated spinner.
  - **"Back to Register" toggle**: Seamlessly switches between the POS register view and Executive Dashboard.
- **Executive Metric Deck**:
  - **Gross Revenue**: Total sales revenue with transaction count.
  - **True Net Profit**: Calculated net margin after cost of goods and operational expenses.
  - **Outstanding Debt (Nkongole)**: Total active customer debt, number of debtors, and top overdue accounts.
  - **Stock Asset Valuation**: Total wholesale and retail inventory value.
- **Visual Analytics Tabs / Sections**:
  - **Overview**: Revenue progression, payment method breakdown (Cash vs Airtel Money vs MTN MoMo vs Debt).
  - **Stock & Low Inventory**: Inventory catalog with instant search, category filters, and red-highlighted critical restock warnings.
  - **Debtors Ledger**: Complete debtor cards with contact info, outstanding amounts, and payment history.
  - **Sales & Expense Audit**: Chronological transaction feed with invoice details and profit margins.

### C. Security & Access Option
- Configurable **4-digit Owner PIN** (default `1234` or customizable in settings). If enabled, the dashboard prompts for the quick PIN before revealing financial figures.

---

## 4. Implementation Steps & File Modifications

1. **Backend Integration (`server.ts`)**:
   - Create `server.ts` utilizing Express with `express.json({ limit: '10mb' })`.
   - Implement `/api/publish`, `/api/store-data`, and `/api/health`.
   - Mount Vite middleware in development mode (`vite.middlewares`) and static file serving in production.
   - Update `package.json` `"dev"` script to `"tsx server.ts"` and restart dev server.

2. **API Client & Sync Service (`src/services/apiSync.ts`)**:
   - Implement `publishStoreData(payload)` and `fetchStoreData()`.
   - Error handling for offline conditions, timeout handling, and local sync caching.

3. **QR Code Generator Component (`src/components/QRCodeDisplay.tsx`)**:
   - Lightweight, dependency-free SVG QR Code renderer generating the exact permanent dashboard URL for instant mobile phone scanning.

4. **Publish Modal Component (`src/components/PublishModal.tsx`)**:
   - Modal interface for triggering publication, displaying upload progress, copying permanent URL, and displaying the QR code.

5. **Executive Web Dashboard View (`src/components/WebDashboard.tsx`)**:
   - High-density, executive-grade dashboard adhering to SaaS Dashboard guidelines.
   - Tabular figures (`font-mono tabular-nums`), WCAG AA contrast, clean search inputs, and responsive layout.

6. **View Routing & Navigation (`src/App.tsx`)**:
   - Add top header sync button and URL query listener (`?view=dashboard`) allowing direct deep linking or toggle switching.

---

## 5. Verification & Testing Plan
- **Verification 1 (API Endpoints)**: Verify `POST /api/publish` correctly persists store data to disk and `GET /api/store-data` returns full fidelity.
- **Verification 2 (Publish Trigger)**: Click "Publish to Cloud" in the POS app, verify feedback toast, and check that sales/stock are packaged properly.
- **Verification 3 (Web Dashboard)**: Open dashboard view via link and QR code, verify metrics, debtor balances, low stock alerts, and test "Refresh Data".
- **Verification 4 (Build & Lint)**: Run `lint_applet` and `compile_applet` to confirm 0 TypeScript or build errors.
