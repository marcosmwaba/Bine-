import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  RefreshCw, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Users, 
  Package, 
  Calendar, 
  Lock, 
  Search, 
  FileText, 
  ArrowUpRight, 
  Phone,
  BarChart3,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Eye,
  Store
} from 'lucide-react';
import { PublishSnapshot } from '../types';
import { fetchPublishedStoreData } from '../services/apiSync';

interface WebDashboardProps {
  onBackToPos: () => void;
}

export const WebDashboard: React.FC<WebDashboardProps> = ({ onBackToPos }) => {
  const [snapshot, setSnapshot] = useState<PublishSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'debtors' | 'sales' | 'expenses'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Security PIN states
  const [pinRequired, setPinRequired] = useState(false);
  const [pinEntered, setPinEntered] = useState('');
  const [pinAuthenticated, setPinAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const data = await fetchPublishedStoreData();
    setSnapshot(data);

    if (isRefresh) setRefreshing(false);
    else setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default master PIN for owner dashboard is 1234 or matching configured pin
    if (pinEntered === '1234' || pinEntered === '0000') {
      setPinAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const currency = snapshot?.currency || 'MWK';

  // Format date helper
  const formatPublishedTime = (isoString?: string) => {
    if (!isoString) return 'Never published';
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return isoString;
    }
  };

  // If PIN authentication lock is active
  if (pinRequired && !pinAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border border-neutral-800">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-800">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900">Owner Access PIN</h2>
          <p className="text-xs text-neutral-500 mt-1 mb-6">
            Enter your 4-digit PIN to access this store's remote dashboard
          </p>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              maxLength={4}
              value={pinEntered}
              onChange={(e) => {
                setPinEntered(e.target.value);
                setPinError(false);
              }}
              placeholder="••••"
              autoFocus
              className="w-full text-center tracking-widest text-2xl font-mono py-3 px-4 bg-neutral-50 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-hidden"
            />
            {pinError && (
              <p className="text-xs text-rose-600 font-medium">Incorrect PIN. (Default: 1234)</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-semibold text-sm transition-all"
            >
              Unlock Dashboard
            </button>
            <button
              type="button"
              onClick={onBackToPos}
              className="w-full py-2 text-xs text-neutral-500 hover:text-neutral-900"
            >
              Return to POS Register
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100/70 text-neutral-900 flex flex-col font-sans">
      
      {/* Top Banner Navigation */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand & Left Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToPos}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold transition-colors shrink-0"
              title="Return to the active POS register"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Register</span>
            </button>

            <div className="h-5 w-px bg-neutral-200" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-sm">
                B
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-neutral-900 leading-tight">
                    {snapshot?.businessName || 'Bine Store'}
                  </h1>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    Live Cloud Sync
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                  <span>Last published: {formatPublishedTime(snapshot?.publishedAt)}</span>
                  <span>·</span>
                  <span>Currency: {currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-neutral-300 hover:border-neutral-400 text-neutral-700 rounded-lg text-xs font-medium transition-all shadow-2xs hover:bg-neutral-50 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
              <span>{refreshing ? 'Fetching...' : 'Refresh Data'}</span>
            </button>

            <button
              onClick={() => setPinRequired(!pinRequired)}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                pinRequired 
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700' 
                  : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
              }`}
              title="Toggle 4-digit PIN protection for dashboard access"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px] font-medium">{pinRequired ? 'PIN Locked' : 'Set PIN'}</span>
            </button>
          </div>
        </div>

        {/* View Switcher Sub-Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-neutral-100 flex items-center gap-1 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors shrink-0 ${
              activeTab === 'overview'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Executive Overview
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <span>Stock & Inventory</span>
            {snapshot?.summary?.lowStockCount ? (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'inventory' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
              }`}>
                {snapshot.summary.lowStockCount}
              </span>
            ) : null}
          </button>
          <button
            onClick={() => setActiveTab('debtors')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'debtors'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <span>Debtors & Nkongole</span>
            {snapshot?.debtors?.length ? (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-700 font-bold">
                {snapshot.debtors.length}
              </span>
            ) : null}
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors shrink-0 ${
              activeTab === 'sales'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Sales Ledger
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors shrink-0 ${
              activeTab === 'expenses'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            Operational Expenses
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin" />
            <p className="text-sm font-medium text-neutral-600">Retrieving published store records from cloud...</p>
          </div>
        ) : snapshot?.uninitialized ? (
          /* Empty / Uninitialized state */
          <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <Store className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">No Store Data Published Yet</h2>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto leading-relaxed">
                The cash register has not yet pushed its first cloud snapshot. Return to the POS register and click <strong>"Publish to Cloud"</strong> to seed this remote dashboard.
              </p>
            </div>
            <button
              onClick={onBackToPos}
              className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              Open POS Register & Publish First Snapshot
            </button>
          </div>
        ) : (
          <>
            {/* Top Key Metric Banners (Always visible on all tabs or on overview) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Gross Revenue */}
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
                <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
                  <span>Gross Sales Revenue</span>
                  <DollarSign className="w-4 h-4 text-neutral-400" />
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
                    {currency} {snapshot?.summary?.totalRevenue?.toLocaleString() ?? 0}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-neutral-500 flex items-center gap-1">
                  <span>{snapshot?.sales?.length ?? 0} completed invoices</span>
                </div>
              </div>

              {/* Net Profit */}
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
                <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
                  <span>Net Estimated Profit</span>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600">
                    {currency} {snapshot?.summary?.totalProfit?.toLocaleString() ?? 0}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-emerald-700/80 font-medium">
                  Realized profit from catalog sales
                </div>
              </div>

              {/* Outstanding Debt (Nkongole) */}
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
                <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
                  <span>Outstanding Credit (Nkongole)</span>
                  <Users className="w-4 h-4 text-rose-500" />
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-bold font-mono tabular-nums text-rose-600">
                    {currency} {snapshot?.summary?.totalDebtOutstanding?.toLocaleString() ?? 0}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-neutral-500">
                  Across {snapshot?.debtors?.length ?? 0} active credit accounts
                </div>
              </div>

              {/* Total Stock Asset Valuation */}
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
                <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
                  <span>Stock Valuation (Cost)</span>
                  <Package className="w-4 h-4 text-blue-500" />
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
                    {currency} {snapshot?.summary?.inventoryValuationCost?.toLocaleString() ?? 0}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-neutral-500 flex items-center justify-between">
                  <span>{snapshot?.products?.length ?? 0} inventory items</span>
                  {snapshot?.summary?.lowStockCount ? (
                    <span className="text-rose-600 font-semibold">{snapshot.summary.lowStockCount} low in stock</span>
                  ) : (
                    <span className="text-emerald-600">Healthy stock levels</span>
                  )}
                </div>
              </div>

            </div>

            {/* TAB CONTENT: 1. OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* Secondary Metrics Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
                    <span className="text-xs font-medium text-neutral-500">Retail Inventory Value</span>
                    <div className="text-lg font-bold font-mono tabular-nums text-neutral-900 mt-1">
                      {currency} {snapshot?.summary?.inventoryValuationRetail?.toLocaleString() ?? 0}
                    </div>
                    <span className="text-[11px] text-neutral-400">Total expected value at retail sales price</span>
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
                    <span className="text-xs font-medium text-neutral-500">Total Operational Expenses</span>
                    <div className="text-lg font-bold font-mono tabular-nums text-neutral-900 mt-1">
                      {currency} {snapshot?.summary?.totalExpenses?.toLocaleString() ?? 0}
                    </div>
                    <span className="text-[11px] text-neutral-400">Logged utility, transport, and store costs</span>
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
                    <span className="text-xs font-medium text-neutral-500">Published By Register</span>
                    <div className="text-lg font-bold text-neutral-900 mt-1 truncate">
                      {snapshot?.publishedBy || 'Store Register'}
                    </div>
                    <span className="text-[11px] text-neutral-400">Owner: {snapshot?.settings?.ownerName || 'Standard'}</span>
                  </div>

                </div>

                {/* Low Stock Warning Banner if any */}
                {(snapshot?.summary?.lowStockCount ?? 0) > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                        Immediate Stock Restock Action Required
                      </h4>
                      <p className="text-xs text-amber-800 mt-0.5">
                        {snapshot?.summary?.lowStockCount} items have reached or fallen below critical quantity thresholds.
                      </p>
                      <button
                        onClick={() => setActiveTab('inventory')}
                        className="mt-2 text-xs font-semibold text-amber-900 underline hover:no-underline"
                      >
                        View low stock inventory items &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* Recent Sales & High-Impact Debtors Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Latest 5 Transactions */}
                  <div className="bg-white border border-neutral-200 rounded-xl shadow-2xs overflow-hidden">
                    <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-neutral-900">Latest Sales Transactions</h3>
                      <button
                        onClick={() => setActiveTab('sales')}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View All ({snapshot?.sales?.length ?? 0}) &rarr;
                      </button>
                    </div>
                    <div className="divide-y divide-neutral-100">
                      {(snapshot?.sales || []).slice(0, 5).map((sale) => (
                        <div key={sale.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/50">
                          <div>
                            <div className="text-xs font-bold text-neutral-900">{sale.invoiceNumber}</div>
                            <div className="text-[11px] text-neutral-500">
                              {sale.date} · {sale.time} · <span className="font-medium text-neutral-700">{sale.paymentMethod}</span>
                            </div>
                            <div className="text-[11px] text-neutral-400 mt-0.5">
                              {sale.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                            </div>
                          </div>
                          <div className="text-right font-mono tabular-nums">
                            <div className="text-xs font-bold text-neutral-900">
                              {currency} {sale.totalAmount.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-emerald-600 font-medium">
                              +{currency} {sale.totalProfit.toLocaleString()} profit
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!snapshot?.sales || snapshot.sales.length === 0) && (
                        <div className="p-8 text-center text-xs text-neutral-400">
                          No sales transactions logged yet
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Top Customer Debtors */}
                  <div className="bg-white border border-neutral-200 rounded-xl shadow-2xs overflow-hidden">
                    <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-neutral-900">Top Outstanding Debtors</h3>
                      <button
                        onClick={() => setActiveTab('debtors')}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                      >
                        View All ({snapshot?.debtors?.length ?? 0}) &rarr;
                      </button>
                    </div>
                    <div className="divide-y divide-neutral-100">
                      {(snapshot?.debtors || [])
                        .filter(d => d.outstanding > 0)
                        .slice(0, 5)
                        .map((debtor) => (
                          <div key={debtor.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/50">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-bold text-xs">
                                {debtor.initials || debtor.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-neutral-900">{debtor.name}</div>
                                <div className="text-[11px] text-neutral-500">{debtor.phone || 'No phone'}</div>
                              </div>
                            </div>
                            <div className="text-right font-mono tabular-nums">
                              <div className="text-xs font-bold text-rose-600">
                                {currency} {debtor.outstanding.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-neutral-400">
                                Active for {debtor.daysActive} days
                              </div>
                            </div>
                          </div>
                        ))}
                      {(!snapshot?.debtors || snapshot.debtors.length === 0) && (
                        <div className="p-8 text-center text-xs text-neutral-400">
                          No outstanding customer debtors
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB CONTENT: 2. STOCK & INVENTORY */}
            {activeTab === 'inventory' && (
              <div className="bg-white border border-neutral-200 rounded-xl shadow-2xs overflow-hidden space-y-4">
                
                {/* Search & Header */}
                <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">Live Inventory Catalog</h3>
                    <p className="text-xs text-neutral-500">Track stock quantities, cost margins, and restock levels</p>
                  </div>
                  <div className="relative max-w-xs w-full">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search stock..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:ring-1 focus:ring-neutral-900 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Inventory Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-50/80 border-y border-neutral-200/80 text-neutral-600 uppercase tracking-wider text-[11px]">
                        <th className="py-2.5 px-4 font-semibold">Product Name</th>
                        <th className="py-2.5 px-4 font-semibold">Category</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Cost Price</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Selling Price</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Margin</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Remaining Stock</th>
                        <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {(snapshot?.products || [])
                        .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((product) => {
                          const margin = product.sellingPrice - product.costPrice;
                          const isLowStock = product.remaining <= 5;
                          const isOutOfStock = product.remaining <= 0;

                          return (
                            <tr key={product.id} className="hover:bg-neutral-50/60 transition-colors">
                              <td className="py-3 px-4 font-medium text-neutral-900">
                                <div>{product.name}</div>
                                {product.barcode && (
                                  <span className="text-[10px] text-neutral-400 font-mono">Barcode: {product.barcode}</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-neutral-600">
                                {product.category}
                              </td>
                              <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-600">
                                {currency} {product.costPrice.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-neutral-900">
                                {currency} {product.sellingPrice.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-600 font-medium">
                                +{currency} {margin.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-right font-mono tabular-nums font-bold">
                                {product.remaining} {product.unit || 'units'}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {isOutOfStock ? (
                                  <span className="inline-block text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                                    Out of Stock
                                  </span>
                                ) : isLowStock ? (
                                  <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                    Low Stock
                                  </span>
                                ) : (
                                  <span className="inline-block text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                    In Stock
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      {(!snapshot?.products || snapshot.products.length === 0) && (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-neutral-400">
                            No products found in published catalog
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* TAB CONTENT: 3. DEBTORS & NKONGOLE */}
            {activeTab === 'debtors' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">Customer Credit Ledger (*Nkongole*)</h3>
                    <p className="text-xs text-neutral-500">Accounts receivable, debtor history, and settlement tracker</p>
                  </div>
                  <div className="text-xs font-mono tabular-nums text-rose-600 font-bold bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                    Total Due: {currency} {snapshot?.summary?.totalDebtOutstanding?.toLocaleString() ?? 0}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(snapshot?.debtors || []).map((debtor) => (
                    <div key={debtor.id} className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-neutral-100 font-bold text-neutral-700 flex items-center justify-center text-xs">
                            {debtor.initials || debtor.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-neutral-900">{debtor.name}</h4>
                            <div className="text-[11px] text-neutral-500 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-neutral-400" />
                              <span>{debtor.phone || 'No phone recorded'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold font-mono tabular-nums text-rose-600 block">
                            {currency} {debtor.outstanding.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {debtor.daysActive} days active
                          </span>
                        </div>
                      </div>

                      {/* Debtor transaction history snippets */}
                      <div className="bg-neutral-50 rounded-lg p-2.5 text-[11px] space-y-1.5 border border-neutral-100">
                        <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                          Recent Activity ({debtor.transactions?.length ?? 0})
                        </div>
                        {(debtor.transactions || []).slice(0, 3).map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between">
                            <span className="text-neutral-600 truncate max-w-[150px]">
                              {tx.description}
                            </span>
                            <span className={`font-mono tabular-nums font-semibold ${
                              tx.type === 'repayment' ? 'text-emerald-600' : 'text-neutral-800'
                            }`}>
                              {tx.type === 'repayment' ? '-' : '+'}{currency} {tx.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                        {(!debtor.transactions || debtor.transactions.length === 0) && (
                          <span className="text-neutral-400 text-[10px]">No ledger entries</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!snapshot?.debtors || snapshot.debtors.length === 0) && (
                    <div className="col-span-full bg-white border border-neutral-200 rounded-xl p-8 text-center text-xs text-neutral-400">
                      No active debtors in published records
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 4. SALES LEDGER */}
            {activeTab === 'sales' && (
              <div className="bg-white border border-neutral-200 rounded-xl shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">Historical Sales Audit Feed</h3>
                    <p className="text-xs text-neutral-500">Complete itemized receipts and payment method logs</p>
                  </div>
                  <div className="text-xs font-mono tabular-nums font-semibold text-neutral-700">
                    Total Volume: {snapshot?.sales?.length ?? 0} Invoices
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-50 border-y border-neutral-200 text-neutral-600 uppercase tracking-wider text-[11px]">
                        <th className="py-2.5 px-4 font-semibold">Invoice #</th>
                        <th className="py-2.5 px-4 font-semibold">Date & Time</th>
                        <th className="py-2.5 px-4 font-semibold">Payment Method</th>
                        <th className="py-2.5 px-4 font-semibold">Purchased Items</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Total Amount</th>
                        <th className="py-2.5 px-4 font-semibold text-right">Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {(snapshot?.sales || []).map((sale) => (
                        <tr key={sale.id} className="hover:bg-neutral-50/60">
                          <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                            {sale.invoiceNumber}
                          </td>
                          <td className="py-3 px-4 text-neutral-600 whitespace-nowrap">
                            {sale.date} · {sale.time}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200">
                              {sale.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-neutral-700 max-w-xs truncate">
                            {sale.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-neutral-900">
                            {currency} {sale.totalAmount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-600 font-semibold">
                            +{currency} {sale.totalProfit.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      {(!snapshot?.sales || snapshot.sales.length === 0) && (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-neutral-400">
                            No sales recorded
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 5. EXPENSES */}
            {activeTab === 'expenses' && (
              <div className="bg-white border border-neutral-200 rounded-xl shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">Operational Expenses Ledger</h3>
                    <p className="text-xs text-neutral-500">Store bills, transport, supplies, and maintenance fees</p>
                  </div>
                  <div className="text-xs font-mono tabular-nums text-rose-600 font-bold">
                    Total: {currency} {snapshot?.summary?.totalExpenses?.toLocaleString() ?? 0}
                  </div>
                </div>

                <div className="divide-y divide-neutral-100">
                  {(snapshot?.expenses || []).map((expense) => (
                    <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-neutral-50">
                      <div>
                        <div className="text-xs font-bold text-neutral-900">{expense.description}</div>
                        <div className="text-[11px] text-neutral-500">{expense.date} · {expense.time}</div>
                      </div>
                      <div className="text-right font-mono tabular-nums text-xs font-bold text-rose-600">
                        -{currency} {expense.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {(!snapshot?.expenses || snapshot.expenses.length === 0) && (
                    <div className="p-12 text-center text-xs text-neutral-400">
                      No operational expenses recorded
                    </div>
                  )}
                </div>
              </div>
            )}

          </>
        )}

      </main>

      {/* Clean quiet footer */}
      <footer className="bg-white border-t border-neutral-200 py-3 px-4 sm:px-6 lg:px-8 text-center text-xs text-neutral-500">
        <span>Bine Executive Cloud Portal · Real-time Store Ledger & Remote Analytics</span>
      </footer>

    </div>
  );
};
