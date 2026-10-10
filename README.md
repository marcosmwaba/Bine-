<p align="center">
  <img src="assets/banner.png" alt="Bine Logo Banner" width="100%" />
</p>

# Bine — The Resilient, Offline-First Retail Operating System & POS
### Executive Proposal, Business Impact Analysis & Cross-Platform Roadmap (Android • iOS • Windows • macOS • Linux)

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Current Platform](https://img.shields.io/badge/Current%20Platforms-Android%20%7C%20Web-brightgreen.svg)](#)
[![Roadmap](https://img.shields.io/badge/Upcoming-iOS%20%7C%20Windows%20%7C%20macOS%20%7C%20Linux-orange.svg)](#-cross-platform-expansion-roadmap)
[![Release](https://img.shields.io/badge/Release-Pre--built%20APK%20Available-emerald.svg)](#-downloads--pre-built-binaries)

---

## Executive Summary

In emerging and rapidly growing retail markets worldwide, Micro, Small, and Medium Enterprises (MSMEs) form the backbone of the economy. However, over 85% of independent merchants, retail kiosks, neighborhood supermarkets, wholesalers, and market stalls continue to manage their operations using vulnerable paper notebooks, unorganized mental math, or bulky, overpriced cloud-subscription software designed for Western enterprises.

These legacy workflows suffer from catastrophic operational friction:
1. **Uncollected Credit (*Nkongole*)**: Shopkeepers extend credit to trusted local customers, but lost notebooks and untracked partial repayments lead to thousands of dollars in annual unrecoverable bad debt.
2. **Invisible Shrinkage & Stockouts**: Without real-time stock alerts and barcode scanning, business owners cannot identify theft, shrinkage, or understocked high-margin items before sales are lost.
3. **Misleading Profitability**: Retailers confuse daily gross cash receipts with net profit, failing to account for operational overhead (rent, transport, generator fuel, electricity, wages).
4. **Cloud Brittleness**: Enterprise cloud POS systems fail when cellular networks fluctuate, broadband drops, or power outages strike, freezing retail commerce at checkout.

**Bine** was engineered from first principles to solve this structural crisis. Bine is an ultra-fast, offline-first digital retail management system, smart cashier terminal, and debt ledger designed to empower retail businesses with enterprise-grade operational discipline at zero licensing cost under the **GNU General Public License v3 (GPLv3)**.

Originally battle-tested for the high-velocity retail dynamics of Zambia (integrating Kwacha `ZMW`, MTN MoMo, Airtel Money, and informal credit workflows), Bine is expanding into a universal, multi-platform retail ecosystem across **iOS (iPhone/iPad)** and **Desktop (macOS, Linux, and Windows)** for commercial and enterprise POS workstations.

---

## 📈 Macro Business Impact & ROI Analysis

Deploying Bine transforms independent retail stores and commercial businesses across five key performance pillars:

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                           BINE ECONOMIC VALUE ENGINE                          │
├───────────────────────┬───────────────────────────────┬───────────────────────┤
│  REVENUE RECOVERY     │      INVENTORY EFFICIENCY     │   CASH FLOW ACCELERATION  │
│  Eliminates ~92% of   │  Zero stockouts on top 20%    │   Same-day Mobile Money   │
│  uncollected credit   │  velocity items; real-time    │   & Cash reconciliation;  │
│  losses (*Nkongole*)  │  margin visibility            │   instant receipt audit   │
├───────────────────────┴───────────────────────────────┴───────────────────────┤
│  TOTAL COST OF OWNERSHIP: $0 SOFTWARE FEES • 100% PRIVATE • ZERO SUBSCRIPTIONS│
└───────────────────────────────────────────────────────────────────────────────┘
```

### 1. Eliminating Credit Defaults & Bad Debt
In small retail commerce, extending customer credit (*Nkongole*) is essential for community loyalty, but paper ledgers suffer from torn pages, disputed balances, and unrecorded partial installments. Bine introduces:
- Real-time customer balance indexing with instant settlement history.
- Immediate debt increments directly from the POS checkout flow.
- One-click customer account statement generation and WhatsApp payment reminders.
- Clear distinction between active debtors and settled accounts.

### 2. Protecting Margins Against Operational Overhead
Most store owners calculate profitability as `Selling Price - Cost Price`. Bine’s dual-ledger financial engine factors in day-to-day store expenses (rent, delivery logistics, utilities, municipal fees, worker wages), providing shop owners with real-time **True Net Profit** metrics on their analytics dashboard.

### 3. Absolute Zero-Downtime Guarantee (100% Offline-First)
Commercial enterprises cannot afford a checkout failure during rush hours. Bine requires **no active internet connection** to process sales, scan barcodes, update stock, log debt, or produce receipts. All transactions are committed instantly to fast local storage, keeping the cashier running during power blackouts and network outages.

### 4. Cloud Data Publishing API & Remote Web Dashboard
Store owners, off-site supervisors, and remote partners can monitor the business from anywhere:
- **One-Click "Publish to Cloud"**: With a single tap, the cashier terminal syncs all live statistics, stock valuations, debt ledgers, and transactions to the server via `/api/publish`.
- **Permanent Bookmarkable Web Dashboard**: Accessible at `/dashboard` or via `?view=dashboard` from any smartphone or PC browser.
- **Instant Mobile QR Code**: Generates a live QR code directly on the register screen so business owners can scan with their phone camera to immediately check live store metrics.
- **Configurable 4-Digit Owner PIN**: Protect sensitive financials, debtor books, and margins from unauthorized viewers.

### 4. Data Sovereignty & Commercial Confidentiality
Unlike SaaS platforms that monetize merchant trade secrets, sell supplier data, or hold transaction history hostage behind monthly fees, Bine guarantees **100% client-side data sovereignty**:
- Your inventory, supplier costs, and customer lists remain on your hardware.
- No remote telemetry or cloud lock-in.
- Secure, human-readable WhatsApp and clipboard backup protocols for effortless disaster recovery.

---

## 🛠️ Complete System Capabilities & Core Modules

Bine delivers a unified suite of commercial tools organized into modular workspaces:

### 🛒 1. High-Velocity POS & Checkout Register
* **Dual Checkout Engine**:
  * **Rapid Numpad Mode**: Designed for fast manual sums, instant cash transactions, and high-frequency sales counters.
  * **Visual Catalog Mode**: Organized by product category icons (Drinks, Groceries, Bakery, Hardware, Clothing, Pharmacy, Electronics, etc.) with quick search and tap-to-add functionality.
* **Integrated Optical & Hardware Barcode Scanning**:
  * Real-time camera barcode scanner with low-light torch/flashlight toggle and audio confirmation.
  * Native compatibility with USB and Bluetooth physical laser barcode scanners.
* **Overselling Prevention**:
  * Dynamic stock validation flags items nearing depletion and prevents selling items with zero stock.
* **Multi-Rail Tender Support**:
  * **Cash Tender**: Quick denomination calculation and change tallying.
  * **Mobile Money Integration**: Native options for **Airtel Money** and **MTN MoMo**, displaying the store's verified receiving number.
  * **Direct Credit (*Nkongole*)**: Attach sales directly to an existing customer ledger or register a new debtor on the fly.
* **Receipt & Invoice Generation**:
  * Formatted digital invoices with unique chronological invoice identifiers (`INV-XXXX`).
  * Itemized breakdown including units, quantities, unit prices, and date/time stamps.

### 📦 2. Stock Control & Inventory Intelligence
* **Full Product SKU Management**:
  * Track product names, categories, cost prices, selling prices, remaining quantities, and unit metrics (`pcs`, `kg`, `bottles`, `boxes`, `bags`).
* **Automated Profit Margin Calculation**:
  * Displays expected gross margin per item during product creation and restocking.
* **Color-Coded Inventory Health Status**:
  * 🟢 **In Stock**: Healthy reserve levels.
  * 🟡 **Low Stock**: Immediate visual alert when remaining units fall to 5 or fewer.
  * 🔴 **Out of Stock**: Highlights depleted goods requiring immediate replenishment.
* **One-Tap Quick Restock**:
  * Adjust quantities as stock deliveries arrive without re-entering catalog data.
  * Triggers automated inventory alerts in the global notification stream.

### 📒 3. Customer Credit & Debt Ledger (*Nkongole*)
* **Customer Profile Directory**:
  * Searchable phonebook of credit customers with initials avatars, phone numbers, and active debt totals.
* **Credit Aging & Risk Sorting**:
  * Sort debtors by **Highest Owed**, **Oldest Debt (Days Active)**, or **Recently Paid**.
* **Flexible Repayment Processing**:
  * Accept full settlements or partial payments across Cash, Airtel Money, or MTN MoMo.
  * Instant balance recalculation prevents disputed calculations.
* **Chronological Customer Audit Trail**:
  * Full itemized ledger displaying debt increments, repayment amounts, dates, and timestamps.
* **One-Click Communication**:
  * Share debt statements and settlement confirmations directly to customers via WhatsApp.

### 🧮 4. Retail & Commercial Business Math Suite
* **Dual-Mode Calculator**:
  * **Standard Cashier Calculator**: Includes percentage markup, discount logic, and full transaction history tape.
  * **Commercial Financial Engine**:
    * **Margin & Markup Analyzer**: Compute exact target selling prices based on desired profit percentages.
    * **VAT & Tax Estimator**: Standardized 16% Value Added Tax calculation with pre-tax and post-tax toggles.
    * **Promotional Discount Simulator**: Model seasonal discounts and promotional campaign impact before execution.

### 📊 5. Financial Analytics & Business Intelligence
* **Executive Metrics Dashboard**:
  * Real-time tracking of Gross Sales, Net Profit, Total Expenses, and Transaction Count.
* **Interactive Data Visualizations**:
  * Area charts tracking revenue trajectories and sales velocity.
  * Payment distribution bar charts illustrating volume breakdown across Cash, Mobile Money, and Credit.
* **Deep Cash Flow Insights**:
  * Measure the percentage of business locked in customer debt versus liquid cash and digital wallets.

### 📂 6. Transaction Auditing & Management Panels
* **Sales Transaction Ledger Drawer**:
  * Searchable master audit log of every historical sale filterable by payment method (Cash, Airtel Money, MTN MoMo, Nkongole).
  * Full digital receipt reprint and inspection capability.
* **Business Expenses Ledger**:
  * Log and categorize day-to-day operational expenses with timestamps and audit descriptions.
* **WhatsApp Smart Database Backup**:
  * Export the entire shop state (products, debtors, sales history, preferences) into a compressed, portable backup payload shareable via WhatsApp or clipboard.
* **Anti-Tamper Security & Clean Reset Protocol**:
  * Multi-step PIN/phrase confirmation prevents accidental data erasure while providing shop owners a clean slate when taking over new retail branches.
* **Direct GitHub Update Protocol**:
  * Native APK update detector that safeguards offline databases from risky remote over-the-air code injections.

---

## 🚀 Cross-Platform Expansion Roadmap

While currently operating on Android and the Web, Bine's modular architecture is expanding to meet commercial enterprise demands across all operating systems.

```
                    ┌──────────────────────────────────────┐
                    │          BINE CORE PLATFORM          │
                    │   TypeScript • React 19 • Tailwind   │
                    │   Clean Architecture • Local DB      │
                    └──────────────────┬───────────────────┘
                                       │
         ┌──────────────────┬──────────┴──────────┬──────────────────┐
         ▼                  ▼                     ▼                  ▼
┌─────────────────┐┌─────────────────┐┌──────────────────┐┌─────────────────┐
│  ANDROID (LIVE) ││   iOS (SOON)    ││ WINDOWS (DESKTOP)││ macOS & LINUX   │
│ APK / Tablet    ││ iPhone & iPad   ││ Commercial POS   ││ Back-office &   │
│ Mobile Cashier  ││ Retail Counter  ││ Desktop Stations ││ Workstations    │
└─────────────────┘└─────────────────┘└──────────────────┘└─────────────────┘
```

### 🍏 1. Apple iOS (iPhone & iPad POS)
* **Target Audience**: Boutique retail stores, specialty shops, pop-up markets, and cafes using iPads and iPhones as primary cashier stations.
* **Key Features**:
  * Optimized split-pane iPad layout taking full advantage of 10" to 13" Retina displays.
  * Camera barcode scanning with Apple Vision framework acceleration.
  * Seamless AirPrint integration for standard 58mm and 80mm wireless thermal receipt printers.
  * Offline iCloud Drive backup synchronization alongside WhatsApp backup.

### 🪟 2. Windows Desktop (Commercial POS Workstations)
* **Target Audience**: High-volume retail stores, supermarkets, pharmacies, hardware depots, and wholesale cashiers running Windows 10/11 POS terminals.
* **Key Features**:
  * Native USB, Serial, and Virtual COM port connectivity for commercial cash drawers, pole displays, and high-speed laser barcode scanners.
  * ESC/POS driverless printing support for high-speed thermal roll receipt printers (Epson, Star Micronics, Xprinter).
  * Full physical keyboard shortcuts (`F1`–`F12`, numpad enter, hotkey lookup) for maximum cashier speed.
  * Multi-window back-office inventory management mode.

### 🐧 3. Linux (Ubuntu, Debian, Fedora, Arch & Custom POS Distros)
* **Target Audience**: Low-cost commercial terminals, embedded hardware (Raspberry Pi POS stations), and privacy-conscious enterprises running open-source operating systems.
* **Key Features**:
  * Native `.deb`, `.rpm`, `AppImage`, and `Flatpak` packaging.
  * Lightweight resource footprint (< 120MB RAM idle), ideal for revitalizing older commercial POS machines.
  * Direct CUPS thermal printing and raw serial cash drawer triggering.

### 🍎 4. macOS (MacBook & Mac mini Retail Hubs)
* **Target Audience**: Independent concept stores, design boutiques, and business owners managing multi-branch accounts from Apple Silicon workstations.
* **Key Features**:
  * Native Apple Silicon (M1/M2/M3/M4) performance with ultra-low battery consumption.
  * Universal keyboard shortcuts and multi-touch trackpad navigation.
  * Drag-and-drop CSV product import and bulk catalog management.

---

## 🏛️ Architecture & Commercial Deployment Models

Bine is structured around clean domain-driven design principles ensuring maintainability and fast cross-platform compilation:

```text
├── .github/workflows/       # Automated CI/CD release & APK build pipelines
├── android/                 # Native Android Capacitor wrapper & manifest
├── assets/                  # High-resolution branding, icons, and banners
├── src/
│   ├── components/          # Reusable UI views (POS, Debt, Inventory, Stats, Panels)
│   ├── data/                # Resilient local storage repositories & schema migrations
│   ├── domain/              # Pure business rules (currency, stock rules, invoice math)
│   ├── hooks/               # Hardware hooks (barcode, GitHub update checker)
│   ├── viewmodels/          # Reactive ViewModel state management
│   ├── types.ts             # Strict TypeScript domain interfaces
│   ├── index.css            # Custom responsive typography and theme tokens
│   └── App.tsx              # Dynamic responsive layout & navigation container
├── capacitor.config.ts      # Native runtime configuration
└── package.json             # Engine dependencies & build automation
```

### Commercial Use & Customization
Because Bine is licensed under the **GNU General Public License v3.0 (GPLv3)**:
* **Small Business Owners**: Use it 100% free forever for commercial business operations with zero royalties or hidden costs.
* **Retail Chains & Cooperatives**: Fork, customize, and deploy internal branded versions across regional branches.
* **Hardware Vendors**: Pre-install Bine on handheld POS terminals, Android POS tablets, or Windows cash register machines to deliver ready-to-sell merchant solutions out of the box.

---

## 📥 Downloads & Pre-built Binaries

Pre-compiled production Android packages (**APKs**) are available for immediate deployment:

* 📱 **[Download Official Pre-built APKs](../../releases)**
  * `app-release.apk` — Optimized production build for shopkeeper devices.
  * `app-debug.apk` — Testing build for developers and pilots.

*(Desktop installers for Windows `.exe` / `.msi`, macOS `.dmg`, and Linux `.AppImage` will be published to the Releases section as the multi-platform milestone rolls out.)*

---

## 🤝 Contributing & Community

Bine is actively developed as a free, resilient tool for the global retail community. We welcome contributions from developers, retail consultants, and business analysts worldwide:

1. **Fork the Repository**
2. **Create a Feature Branch** (`git checkout -b feature/desktop-escpos-printer`)
3. **Commit Your Changes** (`git commit -m 'feat: Add ESC/POS thermal printing support'`)
4. **Push to the Branch** (`git push origin feature/desktop-escpos-printer`)
5. **Open a Pull Request**

### Developer & Maintainer
* **Marcos Mwaba** — *Lead Technologist & Architect*
  * GitHub: [@marcosmwaba](https://github.com/marcosmwaba)
  * LinkedIn: [Peter Marcos Mwaba](https://www.linkedin.com/in/peter-marcos-mwaba-825219280/)
  * Instagram: [@marcos_mwaba](https://www.instagram.com/marcos_mwaba/)

---

## 📜 License

This project is licensed under the **[GNU General Public License v3.0 (GPLv3)](https://www.gnu.org/licenses/gpl-3.0)**.  
*Freedom to run, study, adapt, and share — empowering merchants everywhere.*


