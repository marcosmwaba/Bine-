# Bine - Smart Retail & POS Manager

Bine is a high-performance, mobile-optimized point-of-sale (POS), inventory management, and customer ledger application. Designed for speed and visual clarity, Bine empowers retailers to manage sales, track inventory levels, monitor outstanding debts, and review detailed financial logs seamlessly.

---

## 🚀 Key Features

- **Live Inventory Integration**: The retail sales catalog and POS shopping cart are fully integrated. Cart additions are checked against actual stock levels in real time.
- **Dynamic Cart Controls**: Easily increment, decrement, and remove items directly from the horizontal POS quick-access strip or catalog grid, with automated blockages when reaching maximum stock.
- **Ledger & Debt Management**: Monitor client balances, track payment schedules, and keep historical records of outstanding retail balances.
- **Comprehensive History & Analytics**: Log every transaction with precise breakdown details for both cash and debt-based purchases.
- **Adaptive Dark Mode Theme**: An eye-safe, high-contrast dark palette tailored for night shifts and low-light environments, mapped flawlessly across all screens.
- **Capacitor Android Architecture**: Fully containerized and optimized to run as a native Android app, ready for production compile.

---

## 📱 Android Compilation Guide

Bine uses **Capacitor** to wrap the modern React/Vite front-end into a native Android workspace.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/), the [Android SDK](https://developer.android.com/studio), and [Gradle](https://gradle.org/) installed.

### Build and Sync
To compile the web assets and synchronize them into the native Android folder:

```bash
# 1. Build the production React web bundle
npm run build

# 2. Synchronize assets into the Android native template
npm run android:sync
```

### Run and Debug
To open the project inside **Android Studio** for emulation, code signing, and local debugging:

```bash
npm run android:open
```

---

## 🛠️ GitHub Actions Release Workflow

We have integrated an automated CI/CD pipeline inside `.github/workflows/android-release.yml`.

### How It Works:
1. **Trigger**: The workflow triggers automatically whenever a new version tag starting with `v` (e.g., `v1.0.0`) is pushed to your repository.
2. **Execution**:
   - Checks out the code and sets up the Node.js build cache.
   - Restores dependencies and builds the production web distribution bundle.
   - Installs JDK 17, loads the Android SDK, and syncs the native Capacitor files.
   - Runs Gradle to assemble both **Debug** (`app-debug.apk`) and **Release** (`app-release-unsigned.apk`) packages.
3. **Draft Release**: Generates a GitHub Release tagged with your version number and attaches the compile-ready Android APKs directly to the release page.

### To Release a New Version:
```bash
git tag v1.0.0
git push origin v1.0.0
```

---

## 📂 Project Structure

```text
├── .github/workflows/       # GitHub Actions automated release pipelines
├── android/                 # Auto-generated native Android build studio project
├── src/
│   ├── components/          # Modularized dashboard tabs (Sales, Debt, History, Inventory, Settings)
│   ├── viewmodels/          # Centralized React state management and business logic hook
│   ├── types.ts             # Shared typescript definitions and models
│   ├── index.css            # Tailwind custom theme variables and dark mode mappings
│   └── main.tsx             # Application bootstrap entry
├── capacitor.config.ts      # Native wrapper configuration properties
└── package.json             # Core scripts and app package declarations
```
