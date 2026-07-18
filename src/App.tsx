import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Capacitor, registerPlugin } from '@capacitor/core';

declare const __APP_VERSION__: string;

interface ApkUpdaterPluginType {
  installApk(options: { url: string }): Promise<{ success: boolean }>;
}

const ApkUpdater = registerPlugin<ApkUpdaterPluginType>('ApkUpdater');

let hasCheckedThisSession = false;
import { 
  Calculator, 
  Package, 
  Users, 
  Settings as SettingsIcon,
  Bell,
  X,
  TrendingUp,
  Coins,
  UserPlus,
  Info,
  Menu,
  Store,
  Moon,
  MessageSquare,
  AlertTriangle,
  Share2,
  Check,
  ArrowLeft,
  ChevronRight,
  Lock,
  FileText,
  Smartphone,
  Trash2,
  BarChart2,
  CloudDownload,
  RefreshCw,
  Github,
  Instagram,
  Linkedin
} from 'lucide-react';

// ViewModel Hook
import { useBineViewModel } from './viewmodels/useBineViewModel';

// Views / Sub-tabs
import SalesTab from './components/SalesTab';
import InventoryTab from './components/InventoryTab';
import DebtTab from './components/DebtTab';
import CalculatorTab from './components/CalculatorTab';
import StatsTab from './components/StatsTab';
import BineLogo from './components/BineLogo';
import { SalesLedgerPanel, ExpensesLedgerPanel } from './components/LedgerPanels';
import { Receipt } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('sales');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [showBusinessProfile, setShowBusinessProfile] = useState<boolean>(false);
  const [showSalesLedger, setShowSalesLedger] = useState<boolean>(false);
  const [showExpensesLedger, setShowExpensesLedger] = useState<boolean>(false);
  const [showAbout, setShowAbout] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [showClearConfirmation, setShowClearConfirmation] = useState<boolean>(false);
  const [confirmStep, setConfirmStep] = useState<number>(1);
  const [confirmInput, setConfirmInput] = useState<string>('');
  
  // Connect state and controllers via the ViewModel
  const vm = useBineViewModel();

  // Use Vite injected version as the single source of truth
  const [appVersion] = useState<string>(() => {
    const rawVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.23';
    return rawVersion.startsWith('v') ? rawVersion : `v${rawVersion}`;
  });
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [apkDownloadUrl, setApkDownloadUrl] = useState<string | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [installError, setInstallError] = useState<string | null>(null);

  const isNewerVersion = (current: string, latest: string): boolean => {
    const cleanCurrent = current.startsWith('v') ? current.slice(1) : current;
    const cleanLatest = latest.startsWith('v') ? latest.slice(1) : latest;
    
    const currentParts = cleanCurrent.split('.').map(x => parseInt(x, 10) || 0);
    const latestParts = cleanLatest.split('.').map(x => parseInt(x, 10) || 0);
    
    const maxLength = Math.max(currentParts.length, latestParts.length);
    for (let i = 0; i < maxLength; i++) {
      const curr = currentParts[i] || 0;
      const late = latestParts[i] || 0;
      if (late > curr) return true;
      if (late < curr) return false;
    }
    return false;
  };

  const checkGitHubUpdates = async (force: boolean = false) => {
    // If not forced and already checked this session, load from cache
    if (!force && hasCheckedThisSession) {
      const cached = localStorage.getItem('bine_update_check_result');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.error) {
            setUpdateError(parsed.error);
          } else {
            setLatestVersion(parsed.version);
            setApkDownloadUrl(parsed.url);
          }
          return;
        } catch (e) {
          // ignore cache parse error
        }
      }
    }

    setIsCheckingUpdate(true);
    setUpdateError(null);
    setLatestVersion(null);
    setApkDownloadUrl(null);

    try {
      const res = await fetch('https://api.github.com/repos/marcosmwaba/Bine-/releases');
      
      if (res.status === 404) {
        throw new Error('No releases found (404)');
      }
      
      if (res.status === 403) {
        const rateLimitReset = res.headers.get('X-RateLimit-Reset');
        let retryMsg = 'Rate limit reached. Please try again later.';
        if (rateLimitReset) {
          const resetDate = new Date(parseInt(rateLimitReset, 10) * 1000);
          retryMsg = `Rate limit reached. Try again after ${resetDate.toLocaleTimeString()}.`;
        }
        throw new Error(retryMsg);
      }

      if (!res.ok) {
        throw new Error(`GitHub API Error: ${res.statusText} (${res.status})`);
      }

      const releases = await res.json();
      if (!Array.isArray(releases) || releases.length === 0) {
        throw new Error('No releases found on GitHub');
      }

      // Filter out draft releases. Non-drafts are sorted chronologically by GitHub (newest first)
      const latestRelease = releases.find((r: any) => !r.draft);
      if (!latestRelease || !latestRelease.tag_name) {
        throw new Error('No valid release found on GitHub');
      }

      const tag = latestRelease.tag_name;
      
      // Find APK asset
      let apkUrl: string | null = null;
      if (latestRelease.assets && Array.isArray(latestRelease.assets)) {
        const apkAsset = latestRelease.assets.find((asset: any) => asset.name && asset.name.endsWith('.apk'));
        if (apkAsset) {
          apkUrl = apkAsset.browser_download_url;
        }
      }

      if (!apkUrl) {
        throw new Error(`No APK file asset found in release ${tag}`);
      }

      setLatestVersion(tag);
      setApkDownloadUrl(apkUrl);

      // Save to cache
      localStorage.setItem('bine_update_check_result', JSON.stringify({ version: tag, url: apkUrl }));
      localStorage.setItem('bine_update_check_time', Date.now().toString());
      hasCheckedThisSession = true;

    } catch (err: any) {
      console.error('GitHub update check failed:', err);
      setUpdateError(err.message || 'Couldn\'t check for updates');
      localStorage.setItem('bine_update_check_result', JSON.stringify({ error: err.message || 'Couldn\'t check for updates' }));
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  // Run update check when sidebar is opened
  useEffect(() => {
    if (showSidebar && !latestVersion && !isCheckingUpdate) {
      checkGitHubUpdates(false);
    }
  }, [showSidebar]);

  const handleApplyUpdate = () => {
    if (!latestVersion) return;
    setShowSidebar(false);
    setShowUpdateDialog(true);
  };

  const handleDownloadAndInstall = async () => {
    if (!apkDownloadUrl) {
      setInstallError('No APK download URL found.');
      return;
    }
    
    setIsInstalling(true);
    setInstallError(null);
    try {
      if (!Capacitor.isNativePlatform()) {
        throw new Error('Not running inside a native Android application. Direct APK downloading and intent installation is only available on actual Android devices.');
      }
      
      console.log('Starting native APK download & install for URL:', apkDownloadUrl);
      const res = await ApkUpdater.installApk({ url: apkDownloadUrl });
      if (res && res.success) {
        console.log('Apk installer intent fired successfully!');
      } else {
        throw new Error('ApkUpdater did not return a success response.');
      }
    } catch (err: any) {
      console.error('Failed to install APK:', err);
      setInstallError(err.message || 'Direct install failed. You can still download the APK manually.');
    } finally {
      setIsInstalling(false);
    }
  };

  const unreadCount = vm.notifications.filter(n => !n.read).length;

  const markAllNotificationsAsRead = () => {
    vm.markAllNotificationsAsRead();
  };

  // Global Navigation Bar config
  const navItems = [
    { id: 'sales', label: 'Sales', icon: Store },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'debt', label: 'Debt', icon: Users },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'stats', label: 'Stats', icon: BarChart2 }
  ];

  return (
    <div className={`min-h-screen bg-gray-100 flex items-center justify-center font-sans ${vm.settings.darkMode ? 'dark' : ''}`}>
      {/* Mobile Frame Container: behaves like a phone on large screens and full-screen on mobile */}
      <div className="w-full h-screen md:h-[860px] md:max-w-[412px] md:rounded-[48px] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] md:border-[12px] md:border-gray-950 bg-surface flex flex-col overflow-hidden relative">
        
        {/* Dynamic Screen View Content with animated transitions */}
        <div className="flex-1 overflow-hidden min-h-0 relative bg-surface">
          <AnimatePresence mode="wait">
            {activeTab === 'sales' && (
              <motion.div
                key="sales"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 flex flex-col"
              >
                <SalesTab 
                  products={vm.products}
                  debtors={vm.debtors}
                  cashierAmount={vm.cashierAmount}
                  pressNumpadKey={vm.pressNumpadKey}
                  deleteNumpadDigit={vm.deleteNumpadDigit}
                  clearNumpadAmount={vm.clearNumpadAmount}
                  cartItems={vm.cartItems}
                  addProductToCart={vm.addProductToCart}
                  decrementProductInCart={vm.decrementProductInCart}
                  removeProductFromCart={vm.removeProductFromCart}
                  clearCart={vm.clearCart}
                  getCartTotal={vm.getCartTotal}
                  processCheckout={vm.processCheckout}
                  addExpense={vm.addExpense}
                  selectedCatalogCategory={vm.selectedCatalogCategory}
                  setSelectedCatalogCategory={vm.setSelectedCatalogCategory}
                  onNavigateToTab={setActiveTab}
                  addNewDebtor={vm.addNewDebtor}
                  onOpenNotifications={() => setShowNotifications(true)}
                  unreadNotificationsCount={unreadCount}
                  onOpenSidebar={() => setShowSidebar(true)}
                />
              </motion.div>
            )}

            {activeTab === 'inventory' && (
              <motion.div
                key="inventory"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 flex flex-col"
              >
                <InventoryTab 
                  products={vm.products}
                  addProduct={vm.addProduct}
                  addStock={vm.addStock}
                  onNavigateToTab={setActiveTab}
                  sales={vm.sales}
                  onOpenNotifications={() => setShowNotifications(true)}
                  unreadNotificationsCount={unreadCount}
                  onOpenSidebar={() => setShowSidebar(true)}
                />
              </motion.div>
            )}

            {activeTab === 'debt' && (
              <motion.div
                key="debt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 flex flex-col"
              >
                <DebtTab 
                  debtors={vm.debtors}
                  recordRepayment={vm.recordRepayment}
                  addNewDebtor={vm.addNewDebtor}
                  deleteDebtor={vm.deleteDebtor}
                  clearPaidDebtors={vm.clearPaidDebtors}
                  onNavigateToTab={setActiveTab}
                  onOpenNotifications={() => setShowNotifications(true)}
                  unreadNotificationsCount={unreadCount}
                  onOpenSidebar={() => setShowSidebar(true)}
                  settings={vm.settings}
                />
              </motion.div>
            )}

            {activeTab === 'calculator' && (
              <motion.div
                key="calculator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 flex flex-col"
              >
                <CalculatorTab 
                  onOpenNotifications={() => setShowNotifications(true)}
                  unreadNotificationsCount={unreadCount}
                  onOpenSidebar={() => setShowSidebar(true)}
                  settings={vm.settings}
                />
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 flex flex-col"
              >
                <StatsTab 
                  sales={vm.sales}
                  expenses={vm.expenses}
                  deleteExpense={vm.deleteExpense}
                  getTotalNetProfit={vm.getTotalNetProfit}
                  getGrossSales={vm.getGrossSales}
                  getTotalTransactionsCount={vm.getTotalTransactionsCount}
                  onOpenNotifications={() => setShowNotifications(true)}
                  unreadNotificationsCount={unreadCount}
                  onOpenSidebar={() => setShowSidebar(true)}
                  settings={vm.settings}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Notifications Panel (Saves screen space & slides perfectly) */}
        <AnimatePresence>
          {showNotifications && (
            <>
              {/* Back backdrop scrim */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.45 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black z-100 backdrop-blur-2xs"
                onClick={() => setShowNotifications(false)}
              />
              
              {/* Drawer panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                className="absolute right-0 top-0 bottom-0 w-[85%] max-w-[340px] bg-white z-110 flex flex-col shadow-2xl border-l border-gray-150"
              >
                {/* Top padding to account for phone frame top bar */}
                <div className="h-6 bg-white shrink-0" />
                
                {/* Drawer Header */}
                <header className="px-4 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#003820]" />
                    <h2 className="font-sans font-extrabold text-sm text-gray-850">Notifications</h2>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full leading-none">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-all cursor-pointer"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </header>

                {/* Operations Row */}
                {vm.notifications.length > 0 && (
                  <div className="px-4 py-2.5 border-b border-gray-100 flex justify-between items-center text-xs bg-white shrink-0 select-none">
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[#0f5132] font-extrabold hover:underline cursor-pointer uppercase tracking-wider text-[10px]"
                    >
                      Mark all read
                    </button>
                    <button
                      onClick={() => vm.clearAllNotifications()}
                      className="text-red-600 font-extrabold hover:underline cursor-pointer flex items-center gap-1 uppercase tracking-wider text-[10px]"
                    >
                      Clear all
                    </button>
                  </div>
                )}

                {/* Notifications Scroll Container */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-gray-50/40">
                  {vm.notifications.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4 text-gray-400">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <Bell className="w-6 h-6 stroke-1 text-gray-400" />
                      </div>
                      <p className="font-sans font-bold text-xs text-gray-700">All caught up!</p>
                      <p className="text-[10px] mt-1 text-gray-450 leading-relaxed max-w-[180px] mx-auto">
                        Sales, debtor payments, and restock actions will trigger live notifications here.
                      </p>
                    </div>
                  ) : (
                    vm.notifications.map((notif) => {
                      let Icon = Info;
                      let iconBg = 'bg-gray-100 text-gray-600';
                      let borderTheme = 'border-l-gray-400';
                      
                      if (notif.type === 'sale') {
                        Icon = TrendingUp;
                        iconBg = 'bg-green-50 text-green-700';
                        borderTheme = 'border-l-green-500';
                      } else if (notif.type === 'repayment') {
                        Icon = Coins;
                        iconBg = 'bg-emerald-50 text-emerald-700';
                        borderTheme = 'border-l-emerald-500';
                      } else if (notif.type === 'debtor') {
                        Icon = UserPlus;
                        iconBg = 'bg-orange-50 text-orange-700';
                        borderTheme = 'border-l-orange-500';
                      } else if (notif.type === 'restock') {
                        Icon = Package;
                        iconBg = 'bg-cyan-50 text-cyan-700';
                        borderTheme = 'border-l-cyan-500';
                      }

                      return (
                        <div
                          key={notif.id}
                          onClick={() => vm.markNotificationAsRead(notif.id)}
                          className={`p-3 bg-white border border-gray-150 border-l-4 rounded-xl ${borderTheme} flex gap-2.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-99 transition-all relative ${
                            !notif.read ? 'bg-green-50/5' : 'opacity-65'
                          }`}
                        >
                          {!notif.read && (
                            <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          )}
                          
                          <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs ${iconBg}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-sans text-xs leading-snug ${!notif.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                              {notif.title}
                            </h4>
                            <p className="font-sans text-[11px] text-gray-500 mt-0.5 leading-relaxed break-words">
                              {notif.message}
                            </p>
                            <p className="text-[9px] text-gray-400 mt-1 flex items-center gap-1">
                              {notif.time}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Left Hamburger Drawer / Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <>
              {/* Backdrop scrim */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.45 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black z-100 backdrop-blur-2xs"
                onClick={() => setShowSidebar(false)}
              />
              
              {/* Drawer Panel (slides from left) */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                className="absolute left-0 top-0 bottom-0 w-[85%] max-w-[340px] bg-white z-110 flex flex-col shadow-2xl border-r border-gray-150"
              >
                {/* Top padding to account for phone frame top bar */}
                <div className="h-6 bg-white shrink-0" />
                
                {/* Drawer Header */}
                <div className="p-5 border-b border-gray-100 bg-[#0f5132]/5 flex flex-col gap-2 shrink-0">
                  <div className="flex justify-between items-start">
                    <BineLogo className="h-9 w-auto" />
                    <button
                      onClick={() => setShowSidebar(false)}
                      className="p-1 hover:bg-gray-200/60 rounded-full text-gray-500 transition-all cursor-pointer"
                    >
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>
                  
                  <div className="mt-2 text-left">
                    <span className="font-sans font-extrabold text-sm text-[#003820] block truncate">
                      {vm.settings.businessName || "My Store Ledger"}
                    </span>
                    <span className="text-[10px] text-gray-500 font-sans mt-0.5 font-bold block truncate">
                      Owner: {vm.settings.ownerName || "Zambian Merchant"}
                    </span>
                  </div>
                  
                  <div className="mt-1 text-left">
                    <span className="inline-flex items-center gap-1 bg-[#0f5132]/10 text-[#003820] text-[9px] font-extrabold px-2.5 py-0.5 rounded-full leading-none border border-[#0f5132]/20 uppercase tracking-wider">
                      Built for Zambia 🇿🇲
                    </span>
                  </div>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
                  
                  {/* General Sections */}
                  <div className="space-y-1">
                    <h3 className="px-3 font-sans text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">
                      Ledger Management
                    </h3>
                    
                    {/* Business Profile Button */}
                    <button
                      onClick={() => {
                        setShowSidebar(false);
                        setShowBusinessProfile(true);
                      }}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-50 active:scale-98 transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 text-gray-700 group-hover:text-[#003820]">
                        <Store className="w-5 h-5 stroke-[2] text-[#0f5132]" />
                        <span className="font-sans text-xs font-bold text-gray-800 group-hover:text-[#003820]">
                          Business Profile
                        </span>
                      </div>
                      <ChevronRight className="w-4.5 h-4.5 text-gray-400 group-hover:text-[#0f5132] transition-colors" />
                    </button>

                    {/* Sales Transaction Ledger Button */}
                    <button
                      onClick={() => {
                        setShowSidebar(false);
                        setShowSalesLedger(true);
                      }}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-50 active:scale-98 transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 text-gray-700 group-hover:text-[#003820]">
                        <FileText className="w-5 h-5 stroke-[2] text-[#0f5132]" />
                        <span className="font-sans text-xs font-bold text-gray-800 group-hover:text-[#003820]">
                          Sales Transaction Ledger
                        </span>
                      </div>
                      <ChevronRight className="w-4.5 h-4.5 text-gray-400 group-hover:text-[#0f5132] transition-colors" />
                    </button>

                    {/* Business Expenses Ledger Button */}
                    <button
                      onClick={() => {
                        setShowSidebar(false);
                        setShowExpensesLedger(true);
                      }}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-50 active:scale-98 transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 text-gray-700 group-hover:text-[#003820]">
                        <Receipt className="w-5 h-5 stroke-[2] text-[#0f5132]" />
                        <span className="font-sans text-xs font-bold text-gray-800 group-hover:text-[#003820]">
                          Business Expenses Ledger
                        </span>
                      </div>
                      <ChevronRight className="w-4.5 h-4.5 text-gray-400 group-hover:text-[#0f5132] transition-colors" />
                    </button>

                    {/* About App Button */}
                    <button
                      onClick={() => {
                        setShowSidebar(false);
                        setShowAbout(true);
                      }}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-50 active:scale-98 transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 text-gray-700 group-hover:text-[#003820]">
                        <Info className="w-5 h-5 stroke-[2] text-[#0f5132]" />
                        <span className="font-sans text-xs font-bold text-gray-800 group-hover:text-[#003820]">
                          About Application
                        </span>
                      </div>
                      <ChevronRight className="w-4.5 h-4.5 text-gray-400 group-hover:text-[#0f5132] transition-colors" />
                    </button>

                    {/* Auto Update Panel */}
                    <div className="mt-1 border-t border-gray-100/50 pt-2 px-1">
                      {isCheckingUpdate ? (
                        <div className="flex items-center gap-2 px-3 py-2 text-[10px] text-gray-400 font-mono">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-500" />
                          <span>Checking GitHub for updates...</span>
                        </div>
                      ) : updateError ? (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex flex-col gap-2 text-left shadow-xs">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <p className="font-sans font-extrabold text-[11px] text-red-800 leading-none">
                                Check Failed
                              </p>
                              <p className="text-[9px] text-red-600 mt-1 leading-normal font-medium break-words">
                                {updateError}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => checkGitHubUpdates(true)}
                            className="w-full h-8 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-xl font-sans font-extrabold text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer border border-red-700"
                          >
                            <RefreshCw className="w-3 h-3 text-white" />
                            Retry Check
                          </button>
                        </div>
                      ) : latestVersion && isNewerVersion(appVersion, latestVersion) ? (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-2xl flex flex-col gap-2 text-left shadow-xs">
                          <div className="flex items-start gap-2.5">
                            <div className="p-1.5 bg-orange-100 rounded-lg text-orange-600 animate-pulse shrink-0">
                              <CloudDownload className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-sans font-extrabold text-[11px] text-orange-800 leading-none">
                                Update Available ({latestVersion})
                              </p>
                              <p className="text-[9px] text-orange-600 mt-1 leading-normal font-medium">
                                A newer release is available from GitHub. Click to update.
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={handleApplyUpdate}
                            className="w-full h-8 bg-orange-500 hover:bg-orange-600 active:scale-98 text-white rounded-xl font-sans font-extrabold text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs border border-orange-600"
                          >
                            <RefreshCw className="w-3 h-3 text-white" />
                            Update Now
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between px-3 py-2 text-[10px] text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="font-sans font-bold">App is up to date</span>
                          </div>
                          <button 
                            onClick={() => checkGitHubUpdates(true)}
                            className="text-orange-500 hover:text-orange-600 font-sans font-extrabold uppercase tracking-wider cursor-pointer"
                          >
                            Check
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* App Preferences */}
                  <div className="space-y-2">
                    <h3 className="px-3 font-sans text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">
                      Preferences
                    </h3>
                    
                    {/* Dark Mode toggle inside Sidebar */}
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center gap-3">
                        <Moon className="w-5 h-5 text-gray-600 shrink-0" />
                        <div className="text-left">
                          <p className="font-sans font-bold text-xs text-gray-800 leading-none">Dark Mode</p>
                          <p className="text-[9px] text-gray-400 mt-1">Toggle system theme</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={vm.settings.darkMode} 
                          onChange={(e) => {
                            vm.updateSettings({ ...vm.settings, darkMode: e.target.checked });
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#0f5132]" />
                      </label>
                    </div>

                    {/* Local SMS Scraper inside Sidebar */}
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-gray-600 shrink-0" />
                        <div className="text-left">
                          <p className="font-sans font-bold text-xs text-gray-800 leading-none">SMS Scraper</p>
                          <p className="text-[9px] text-gray-400 mt-1 font-medium">MTN/Airtel SMS sync</p>
                          <p className="text-[9px] text-gray-400 mt-1 font-small">not yet supported</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={vm.settings.localSmsScraper} 
                          onChange={(e) => {
                            vm.updateSettings({ ...vm.settings, localSmsScraper: e.target.checked });
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#0f5132]" />
                      </label>
                    </div>
                  </div>

                  {/* Zambian Smart Backup Action */}
                  <div className="px-3 pt-2">
                    <button
                      onClick={() => {
                        const backupPayload = {
                          timestamp: new Date().toISOString(),
                          businessName: vm.settings.businessName,
                          ownerName: vm.settings.ownerName,
                          products: vm.products,
                          debtors: vm.debtors,
                          sales: vm.sales
                        };
                        const serialized = JSON.stringify(backupPayload, null, 2);
                        navigator.clipboard.writeText(serialized);
                        setSuccessToast('Shop database compiled! Copied to clipboard.');
                        setTimeout(() => setSuccessToast(null), 3000);
                        
                        const whatsappMsg = `=== BINE LEDGER BACKUP: ${vm.settings.businessName} ===\nDate: ${new Date().toLocaleDateString()}\nCopy this backup code to restore: \n\n${serialized.slice(0, 400)}...\n\n(Full backup code copied to clipboard)`;
                        const encoded = encodeURIComponent(whatsappMsg);
                        window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
                      }}
                      className="w-full py-2.5 bg-[#FD7E14] hover:bg-[#e16807] text-white rounded-xl font-sans font-bold text-[11px] flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all shadow-xs border border-orange-600 cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      Back Up Ledger via WhatsApp
                    </button>
                  </div>

                </div>

                {/* Footer details inside Hamburger Sidebar */}
                <div className="p-4 border-t border-gray-100 text-center bg-gray-50 shrink-0">
                  <span className="font-mono text-[9px] font-bold text-gray-500 block">{appVersion} (Stable Release)</span>
                  <span className="font-sans text-[10px] text-gray-400 mt-0.5 block">Resilient Digital Ledger for Zambia</span>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Business Profile Panel (Slides from right, completely on its own) */}
        <AnimatePresence>
          {showBusinessProfile && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="absolute inset-0 bg-surface z-[120] flex flex-col"
            >
              {/* Fake top bar padding */}
              <div className="h-6 bg-white shrink-0" />
              
              {/* Header */}
              <header className="bg-white sticky top-0 z-20 w-full h-14 border-b border-gray-100 flex items-center px-4 shrink-0 shadow-xs">
                <button 
                  aria-label="Go back" 
                  className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-90 transition-all text-gray-700 cursor-pointer"
                  onClick={() => setShowBusinessProfile(false)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="flex-1 text-center font-sans font-bold text-base text-gray-900 pr-10">
                  Business Profile
                </h1>
              </header>

              {/* Business Profile Content */}
              <div className="flex-1 overflow-y-auto px-5 pt-6 pb-24 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#0f5132]/15 text-[#0f5132] flex items-center justify-center shrink-0">
                    <Store className="w-7 h-7" />
                  </div>
                  <div className="text-left">
                    <h2 className="font-sans font-extrabold text-base text-gray-900 leading-tight">
                      Edit Store Details
                    </h2>
                    <p className="text-gray-400 font-sans text-xs mt-1 leading-snug">
                      Your brand identity and billing ledger config
                    </p>
                  </div>
                </div>

                <div className="space-y-5 pt-2 text-left">
                  {/* Business Name Input */}
                  <div className="relative">
                    <label className="absolute -top-2 left-3 px-1.5 bg-white text-gray-400 font-sans text-[10px] font-bold uppercase tracking-wider">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={vm.settings.businessName}
                      onChange={(e) => {
                        vm.updateSettings({ ...vm.settings, businessName: e.target.value });
                      }}
                      className="w-full h-12 border border-gray-200 rounded-xl px-4 font-sans text-sm font-bold text-gray-800 focus:outline-hidden focus:border-[#0f5132] focus:ring-1 focus:ring-[#0f5132] bg-white"
                    />
                  </div>

                  {/* Mobile Money Number */}
                  <div className="relative">
                    <label className="absolute -top-2 left-3 px-1.5 bg-white text-gray-400 font-sans text-[10px] font-bold uppercase tracking-wider">
                      Mobile Money Number
                    </label>
                    <div className="flex items-center border border-gray-200 rounded-xl px-4 h-12 bg-white">
                      <Coins className="w-5 h-5 text-gray-400 mr-2.5 shrink-0" />
                      <input
                        type="text"
                        value={vm.settings.mobileMoneyNumber}
                        onChange={(e) => {
                          vm.updateSettings({ ...vm.settings, mobileMoneyNumber: e.target.value });
                        }}
                        className="flex-1 border-none bg-transparent p-0 font-sans text-sm font-bold text-gray-800 focus:ring-0 outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Owner Name */}
                  <div className="relative">
                    <label className="absolute -top-2 left-3 px-1.5 bg-white text-gray-400 font-sans text-[10px] font-bold uppercase tracking-wider">
                      Owner Name
                    </label>
                    <input
                      type="text"
                      value={vm.settings.ownerName}
                      onChange={(e) => {
                        vm.updateSettings({ ...vm.settings, ownerName: e.target.value });
                      }}
                      className="w-full h-12 border border-gray-200 rounded-xl px-4 font-sans text-sm font-bold text-gray-800 focus:outline-hidden focus:border-[#0f5132] focus:ring-1 focus:ring-[#0f5132] bg-white"
                    />
                  </div>
                </div>

                {/* Info Card explaining usage in Zambia */}
                <div className="p-4 bg-green-50/65 rounded-xl border border-green-100 flex gap-3 text-xs text-[#0f5132] font-sans leading-relaxed text-left">
                  <Smartphone className="w-5 h-5 shrink-0 text-[#0f5132] mt-0.5" />
                  <div>
                    <span className="font-bold block">Mobile Money Ready</span>
                    Keep your Mobile Money number updated to let clients clear outstanding debt safely via MTN MoMo or Airtel Money.
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border-t border-red-100 pt-5 text-left">
                  <h3 className="font-sans text-[10px] font-extrabold text-red-500 uppercase tracking-widest mb-3">
                    Danger Zone
                  </h3>
                  <div className="p-4 bg-red-50/60 rounded-xl border border-red-100 flex flex-col gap-3">
                    <p className="text-gray-500 font-sans text-[11px] leading-relaxed">
                      Need a clean start? This will clear all products, sales history, debtors, and reset the shop ledger to a pristine state so you can add your own stock.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmStep(1);
                        setConfirmInput('');
                        setShowClearConfirmation(true);
                      }}
                      className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all border border-red-700 shadow-xs cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear & Reset Shop Database
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSuccessToast('Business Profile details saved successfully!');
                      setTimeout(() => setSuccessToast(null), 3000);
                      setShowBusinessProfile(false);
                    }}
                    className="w-full py-3 bg-[#0f5132] hover:bg-[#0c4027] text-white rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
                  >
                    Save & Back
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* About App Panel (Slides from right, completely on its own) */}
        <AnimatePresence>
          {showAbout && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="absolute inset-0 bg-surface z-[120] flex flex-col"
            >
              {/* Fake top bar padding */}
              <div className="h-6 bg-white shrink-0" />
              
              {/* Header */}
              <header className="bg-white sticky top-0 z-20 w-full h-14 border-b border-gray-100 flex items-center px-4 shrink-0 shadow-xs">
                <button 
                  aria-label="Go back" 
                  className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-90 transition-all text-gray-700 cursor-pointer"
                  onClick={() => setShowAbout(false)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="flex-1 text-center font-sans font-bold text-base text-gray-900 pr-10">
                  About Application
                </h1>
              </header>

              {/* About Content */}
              <div className="flex-1 overflow-y-auto px-5 py-8 flex flex-col items-center justify-between text-center">
                <div className="w-full flex flex-col items-center">
                  <div className="mb-4">
                    <BineLogo className="h-14 w-auto animate-pulse" />
                  </div>
                  
                  <div className="bg-gray-105 rounded-full px-3.5 py-1 mb-6 border border-gray-200 shrink-0">
                    <span className="font-mono text-[10px] font-bold text-gray-600">{appVersion} (Stable Release)</span>
                  </div>
                  
                  <div className="space-y-4 max-w-[290px] text-center">
                    <p className="text-gray-750 font-sans text-xs font-bold leading-relaxed">
                      Bine is a resilient, offline-first digital merchant ledger designed specifically for small business owners across Zambia.
                    </p>
                    
                    <p className="text-gray-500 font-sans text-xs leading-relaxed">
                      Whether you're operating a market stall, a grocery boutique, or a wholesale depot in Lusaka, Ndola, or Chipata, BIne keeps your sales, inventory, and debt accounts fully active without requiring any constant internet connection.
                    </p>

                    <p className="text-gray-500 font-sans text-xs leading-relaxed">
                      With smart features like MTN & Airtel MoMo alignment, local SMS scraper alerts, and hassle-free WhatsApp backups, BIne is your local retail partner.
                    </p>
                  </div>

                  {/* Developer Info Section */}
                  <div className="mt-8 pt-6 border-t border-gray-150 w-full max-w-[290px] mx-auto text-center">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Developed By</p>
                    <p className="font-sans font-extrabold text-sm text-gray-800">Marcos Mwaba</p>
                    <p className="text-[10px] text-gray-500 mt-0.5 font-medium">Technologist</p>
                    
                    {/* Social links */}
                    <div className="flex justify-center items-center gap-4 mt-3">
                      <a 
                        href="https://github.com/marcosmwaba" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-black rounded-full transition-all active:scale-95 flex items-center justify-center"
                        title="GitHub Profile"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                      <a 
                        href="https://www.instagram.com/marcos_mwaba/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-pink-50 hover:bg-pink-100 text-pink-600 hover:text-pink-700 rounded-full transition-all active:scale-95 flex items-center justify-center"
                        title="Instagram Profile"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                      <a 
                        href="https://www.linkedin.com/in/peter-marcos-mwaba-825219280/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-sky-50 hover:bg-sky-100 text-sky-600 hover:text-sky-700 rounded-full transition-all active:scale-95 flex items-center justify-center"
                        title="LinkedIn Profile"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-5 pt-8">
                  <div className="border-t border-gray-100 pt-5 flex flex-col gap-2 font-sans text-xs font-bold text-gray-400">
                    <div className="flex justify-around">
                      <button className="hover:text-[#003820] transition-colors flex items-center gap-1 cursor-pointer"><Lock className="w-3.5 h-3.5" /> Privacy Policy</button>
                      <button className="hover:text-[#003820] transition-colors flex items-center gap-1 cursor-pointer"><FileText className="w-3.5 h-3.5" /> Terms of Service</button>
                    </div>
                    <span className="text-[9px] text-gray-400 font-normal mt-3">
                      © {new Date().getFullYear()} BIne Ledger. All rights reserved.
                    </span>
                  </div>
                  
                  <button
                    onClick={() => setShowAbout(false)}
                    className="w-full py-3 bg-[#0f5132] hover:bg-[#0c4027] text-white rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
                  >
                    Got It
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Copy Toast Overlay */}
        <AnimatePresence>
          {showUpdateDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-950/70 backdrop-blur-xs z-[200] flex items-center justify-center p-4 text-left"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-[320px] border border-orange-100 flex flex-col gap-4 text-left"
              >
                {/* Header with icon */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-2xl shrink-0">
                    <CloudDownload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-sm text-gray-950 leading-tight">
                      Update Security Protocol
                    </h3>
                    <p className="text-[10px] text-orange-600 font-extrabold font-mono tracking-wide uppercase mt-0.5">
                      New Release Available
                    </p>
                  </div>
                </div>

                {/* Info details */}
                <div className="space-y-3 text-xs leading-relaxed text-gray-600">
                  <div className="bg-orange-50/40 border border-orange-100/50 rounded-2xl p-3 text-[10px] text-orange-800 leading-relaxed font-medium">
                    <span className="font-extrabold block mb-1">🔒 No Over-The-Air (OTA) Updates</span>
                    To safeguard your offline sales ledger and protect local customer transaction data from dynamic remote execution or corruption, Bine does not support silent background over-the-air auto-updates.
                  </div>

                  <p className="text-gray-500 font-sans text-[11px] leading-relaxed">
                    Updates must be installed securely via the official Android Package (APK). Installing the update over your current version will safely preserve all of your existing products, sales, and debt records.
                  </p>

                  <div className="border-t border-gray-100 pt-2.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                      <span>YOUR CURRENT VERSION</span>
                      <span className="font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-extrabold">{appVersion}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-orange-600 mt-1.5">
                      <span>LATEST RELEASE AVAILABLE</span>
                      <span className="font-mono bg-orange-50 px-2 py-0.5 rounded font-extrabold">{latestVersion}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-1">
                  {installError && (
                    <div className="p-2.5 bg-red-50 border border-red-100 rounded-xl text-[10px] text-red-700 leading-normal font-medium text-left">
                      <span className="font-extrabold block mb-0.5">⚠️ Installation Error</span>
                      {installError}
                    </div>
                  )}

                  {isInstalling ? (
                    <div className="w-full py-3 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-orange-800">
                      <RefreshCw className="w-4 h-4 animate-spin text-orange-600" />
                      <span>Downloading & Installing Update...</span>
                    </div>
                  ) : (
                    <>
                      {Capacitor.isNativePlatform() ? (
                        <button
                          type="button"
                          onClick={handleDownloadAndInstall}
                          className="w-full py-2.5 bg-[#0f5132] hover:bg-[#0c4027] active:scale-98 text-white rounded-xl font-sans font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-center"
                        >
                          <CloudDownload className="w-4 h-4" />
                          Download & Install Now
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleDownloadAndInstall}
                          className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 active:scale-98 text-gray-700 rounded-xl font-sans font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                          title="Fails on web browser, showing real error as required"
                        >
                          <Smartphone className="w-4 h-4 text-gray-600" />
                          Simulate Native Install (Fails)
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (apkDownloadUrl) {
                            window.open(apkDownloadUrl, '_blank');
                          }
                        }}
                        className="w-full py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-xl font-sans font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer text-center"
                      >
                        <CloudDownload className="w-3.5 h-3.5" />
                        Download APK Manually
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const releaseUrl = `https://github.com/marcosmwaba/Bine-/releases/tag/${latestVersion}`;
                      window.open(releaseUrl, '_blank');
                    }}
                    className="w-full py-1.5 hover:bg-gray-50 text-gray-500 hover:text-gray-700 rounded-xl font-sans font-bold text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer text-center"
                  >
                    View Release Notes
                  </button>

                  <button
                    type="button"
                    disabled={isInstalling}
                    onClick={() => {
                      setShowUpdateDialog(false);
                      setInstallError(null);
                    }}
                    className="w-full py-1.5 text-center text-gray-400 hover:text-gray-600 font-sans font-bold text-[10px] cursor-pointer disabled:opacity-55"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {successToast && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-20 inset-x-4 z-[150] bg-gray-900 text-white rounded-xl py-3 px-4 shadow-xl flex items-center gap-2 text-xs font-semibold font-sans border border-gray-800"
            >
              <Check className="w-4 h-4 text-green-400 stroke-[3]" />
              <span>{successToast}</span>
            </motion.div>
          )}

          {showClearConfirmation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-950/70 backdrop-blur-xs z-[250] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-[290px] text-center border border-red-150 flex flex-col gap-4 text-left"
              >
                {/* Warning header badge */}
                <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full text-red-600 mx-auto">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>

                {confirmStep === 1 ? (
                  <div className="space-y-3">
                    <h3 className="font-sans font-black text-base text-gray-900 text-center leading-snug">
                      Clear Shop Database?
                    </h3>
                    <p className="text-gray-500 font-sans text-[11px] leading-relaxed text-center font-medium">
                      This is a highly sensitive action. Are you absolutely sure you want to reset your local database and clear all business products, sales history, and outstanding debt records?
                    </p>

                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setConfirmStep(2)}
                        className="w-full py-2.5 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-xl font-sans font-bold text-xs transition-all shadow-sm border border-red-700 cursor-pointer text-center"
                      >
                        Yes, Proceed to Verify
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowClearConfirmation(false)}
                        className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 active:scale-98 text-gray-700 rounded-xl font-sans font-bold text-xs transition-all cursor-pointer text-center"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="font-sans font-black text-base text-gray-900 text-center leading-snug">
                      Final Protection Check
                    </h3>
                    <p className="text-gray-500 font-sans text-[11px] leading-relaxed text-center font-medium">
                      To verify you want to proceed and bypass safety nets, please type the word <span className="font-mono bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-extrabold border border-red-200 text-[10px]">DELETE</span> below:
                    </p>

                    <div className="pt-1">
                      <input
                        type="text"
                        value={confirmInput}
                        onChange={(e) => setConfirmInput(e.target.value)}
                        placeholder="Type DELETE to confirm"
                        className="w-full h-10 px-3 bg-red-50/30 hover:bg-red-50/50 focus:bg-white text-center font-mono text-xs font-bold text-red-700 border border-red-200 focus:border-red-500 rounded-xl focus:ring-2 focus:ring-red-200 outline-hidden transition-all placeholder:text-gray-400 placeholder:font-sans uppercase"
                      />
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        type="button"
                        disabled={confirmInput.trim().toUpperCase() !== 'DELETE'}
                        onClick={() => {
                          vm.clearLedgerData();
                          setShowClearConfirmation(false);
                          setShowBusinessProfile(false);
                          setShowSidebar(false);
                          setSuccessToast('All mock data cleared! Pristine ledger active.');
                          setTimeout(() => setSuccessToast(null), 3500);
                        }}
                        className={`w-full py-2.5 text-white rounded-xl font-sans font-bold text-xs transition-all text-center ${
                          confirmInput.trim().toUpperCase() === 'DELETE'
                            ? 'bg-red-600 hover:bg-red-700 border border-red-700 shadow-sm active:scale-98 cursor-pointer'
                            : 'bg-gray-200 border border-gray-300 text-gray-400 cursor-not-allowed opacity-60'
                        }`}
                      >
                        Permanently Clear Database
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmStep(1)}
                        className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 active:scale-98 text-gray-700 rounded-xl font-sans font-bold text-xs transition-all cursor-pointer text-center"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Bar (matches high fidelity Material 3 layouts) */}
        <nav className="h-16 bg-white border-t border-gray-150 grid grid-cols-5 items-center shrink-0 z-40 select-none pb-safe">
          {navItems.map((item) => {
            const NavIcon = item.icon;
            const isSelected = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center justify-center h-full cursor-pointer group transition-all"
              >
                <div 
                  className={`py-1 px-3.5 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isSelected 
                      ? 'bg-[#0f5132]/10 text-[#0f5132]' 
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <NavIcon className={`w-5 h-5 transition-all ${isSelected ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                </div>
                <span className={`font-sans text-[10px] font-bold mt-1 tracking-wide leading-none transition-colors ${
                  isSelected ? 'text-[#0f5132]' : 'text-gray-500 group-hover:text-gray-800'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Ledger Panels */}
        <SalesLedgerPanel
          isOpen={showSalesLedger}
          onClose={() => setShowSalesLedger(false)}
          sales={vm.sales}
          settings={vm.settings}
        />

        <ExpensesLedgerPanel
          isOpen={showExpensesLedger}
          onClose={() => setShowExpensesLedger(false)}
          expenses={vm.expenses}
          deleteExpense={vm.deleteExpense}
        />

        {/* Android simulated bottom navigation bar pill handle (visible only on desktop mockup) */}
        <div className="hidden md:block absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-gray-900 rounded-full z-50 opacity-40" />
      </div>
    </div>
  );
}
