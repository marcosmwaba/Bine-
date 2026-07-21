<p align="center">
  <img src="assets/banner.png" alt="Bine Logo Banner" width="100%" />
</p>

# Bine - Smart Retail & POS Manager

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Web-brightgreen.svg)](#)
[![Release](https://img.shields.io/badge/Release-Pre--built%20APK%20Available-orange.svg)](#-downloads--pre-built-apks)

**Bine** is a modern, open-source Point of Sale (POS), inventory control, and debt ledger management application built specifically for small-to-medium retail businesses, local shops, and independent merchants. 

Designed to replace paper sales books and complex enterprise software, Bine provides an intuitive, high-speed interface optimized for touchscreens and mobile devices.

---

## 🎯 Intended Purpose & Problem Solved

Small retail businesses frequently face operational challenges such as unrecorded credit sales, stockouts, tedious manual math, and untracked shop expenses. **Bine** solves these challenges by offering:

- **Speed at Checkout**: Process cash, mobile money, and credit transactions in seconds.
- **Accurate Credit Tracking**: Eliminate lost revenue from informal customer loans (*Nkongole*) with structured debt profiles.
- **Real-Time Stock Intelligence**: Automatically deduct inventory upon sale and notify shopkeepers of low stock.
- **True Business Health Insights**: Measure actual net profit by factoring in operational expenses alongside gross sales.
- **Offline Reliability**: Operate seamlessly without internet dependencies, storing data securely on the device.

---

## 🛠️ Core Application Modules

### 🛒 1. Point of Sale & Checkout Register
- **Instant Product Search & Barcode Scanning**: Find items by name, category, or camera/hardware barcode scanner.
- **Dynamic Cart Management**: Real-time total calculation with automatic stock limit warnings to prevent overselling.
- **Flexible Payment Methods**: Support for Cash, Airtel Money, MTN Mobile Money, Bank Transfer, and Credit (Debt).
- **Digital Invoicing & Receipts**: Generate formatted receipts with printable options and digital sharing.

### 📦 2. Inventory & Stock Control
- **Catalog Management**: Add, update, or remove products with images, cost prices, selling prices, and SKUs/barcodes.
- **Margin Calculations**: Automatically view profit margins per item during inventory setup.
- **Stock Alert Indicators**: Color-coded badges for **In Stock**, **Low Stock**, and **Out of Stock** items.
- **Restocking Operations**: Quickly adjust quantities as new stock arrives.

### 📒 3. Customer Debt Ledger (*Nkongole*)
- **Debtor Profiles**: Maintain customer profiles with phone numbers and current outstanding debt balances.
- **Credit Sales Direct-to-Ledger**: Easily charge sales to a debtor's account directly from the checkout screen.
- **Repayment Tracking**: Record full or partial repayments with instant balance updates and clear transaction histories.
- **Settlement & History**: Keep historical logs of settled debts and customer repayment patterns.

### 📊 4. Financial Analytics & Reporting
- **Performance Overview**: Track Gross Sales, Net Profit, Total Transactions, and Active Debt Totals at a glance.
- **Expense Tracking**: Log store expenses (rent, electricity, supplier freight, worker wages) to determine true net margins.
- **Time-based Filtering**: Analyze business performance by Day, Week, Month, or Custom Date ranges.
- **Product Insights**: Identify top-performing products and sales volume breakdown.

---

## 📱 Downloads & Pre-built APKs

Pre-compiled Android application packages (**APKs**) are available directly on the GitHub Releases page. You do not need to set up local build tools or compile the native source code manually.

- **[Latest Releases & Pre-built APKs](../../releases)**
  - `app-release.apk` (Production Release)
  - `app-debug.apk` (Development & Testing)

---

## 📸 Screenshots

> *Screenshots coming soon.*

---

## 📂 Project Structure

```text
├── .github/workflows/       # Automated CI/CD release workflows
├── android/                 # Native Android Capacitor workspace
├── assets/                  # Banners, icons, and graphic assets
├── src/
│   ├── components/          # Dashboard views (POS, Debt, Ledger, Inventory, Stats, Settings)
│   ├── viewmodels/          # Centralized React hooks and core business logic
│   ├── types.ts             # Shared TypeScript models and interfaces
│   ├── index.css            # Tailwind styling and theme configurations
│   └── main.tsx             # Main application entry point
├── capacitor.config.ts      # Capacitor native wrapper config
└── package.json             # App dependencies and scripts
```

---

## 📜 License

This project is open-source software distributed under the terms of the **[GNU General Public License v3.0 (GPLv3)](https://www.gnu.org/licenses/gpl-3.0)**.

You are free to run, modify, and redistribute this software under the terms of the GPLv3 license.


