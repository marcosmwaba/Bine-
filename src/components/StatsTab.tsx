import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  Bell, 
  TrendingUp, 
  DollarSign, 
  Receipt, 
  Search, 
  Filter, 
  Calendar, 
  ShoppingBag, 
  ArrowUpRight, 
  ChevronRight, 
  Check, 
  X,
  PieChart as PieChartIcon,
  BarChart2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import BineLogo from './BineLogo';
import { Sale } from '../types';

interface StatsTabProps {
  sales: Sale[];
  getTotalNetProfit: () => number;
  getGrossSales: () => number;
  getTotalTransactionsCount: () => number;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  onOpenSidebar?: () => void;
  settings?: any;
}

export default function StatsTab({
  sales,
  getTotalNetProfit,
  getGrossSales,
  getTotalTransactionsCount,
  onOpenNotifications,
  unreadNotificationsCount,
  onOpenSidebar,
  settings
}: StatsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('All');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Stats calculation
  const grossSalesVal = getGrossSales();
  const netProfitVal = getTotalNetProfit();
  const transactionCountVal = getTotalTransactionsCount();

  // Helper to format currency
  const formatZMW = (val: number) => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW'
    }).format(val);
  };

  // Filter sales
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const matchSearch = s.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.items.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.paymentMethod && s.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchMethod = selectedMethod === 'All' || s.paymentMethod === selectedMethod;

      return matchSearch && matchMethod;
    });
  }, [sales, searchQuery, selectedMethod]);

  // Chart Data: Group sales by payment method
  const paymentMethodData = useMemo(() => {
    const methods: Record<string, { name: string; value: number }> = {
      'Cash': { name: 'Cash', value: 0 },
      'Airtel Money': { name: 'Airtel', value: 0 },
      'MTN MoMo': { name: 'MTN MoMo', value: 0 },
      'Nkongole (Debt)': { name: 'Nkongole', value: 0 }
    };

    sales.forEach(s => {
      if (methods[s.paymentMethod]) {
        methods[s.paymentMethod].value += s.totalAmount;
      }
    });

    return Object.values(methods).filter(item => item.value > 0);
  }, [sales]);

  // Chart Data: Group sales by Date (Chronological)
  const chronologicalSalesData = useMemo(() => {
    const dailyMap: Record<string, { date: string; amount: number; profit: number }> = {};
    
    // Sort chronological order (oldest first for progression chart)
    const sortedSales = [...sales].reverse();
    
    sortedSales.forEach(s => {
      const dateStr = s.date;
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = { date: dateStr, amount: 0, profit: 0 };
      }
      dailyMap[dateStr].amount += s.totalAmount;
      dailyMap[dateStr].profit += s.totalProfit;
    });

    return Object.values(dailyMap).slice(-7); // Keep last 7 active days
  }, [sales]);

  const COLORS = ['#0f5132', '#0dcaf0', '#ffc107', '#dc3545'];

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full bg-surface relative">
      {/* AppBar */}
      <header className="bg-white sticky top-0 z-20 w-full h-14 border-b border-gray-100 flex justify-between items-center px-4 shrink-0 shadow-xs">
        <div className="flex items-center gap-4">
          <Menu className="w-6 h-6 text-[#003820] cursor-pointer hover:opacity-85 transition-opacity" onClick={onOpenSidebar} />
          <BineLogo className="h-7 w-auto" />
        </div>
        <button 
          onClick={onOpenNotifications}
          className="p-2 hover:bg-gray-50 rounded-full text-gray-500 transition-all relative"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse" />
          )}
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto pb-24 min-h-0 bg-gray-50/20">
        <div className="max-w-4xl mx-auto p-4 space-y-5">
          
          {/* Header intro */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-[#0f5132] font-sans text-lg font-extrabold tracking-tight">Business Statistics</h2>
              <p className="text-gray-500 text-xs">Real-time financial performance and sales logs</p>
            </div>
            <div className="bg-emerald-50 px-3 py-1.5 rounded-full text-[#0f5132] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-emerald-100">
              <TrendingUp className="w-3 h-3" /> Live
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-3">
            {/* Gross Sales */}
            <div className="bg-white rounded-2xl p-3.5 border border-gray-150 shadow-xs flex flex-col justify-between">
              <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Gross Sales</div>
              <div className="mt-2">
                <span className="text-gray-400 font-mono text-[10px] mr-0.5">ZMW</span>
                <span className="text-gray-800 text-base font-extrabold font-mono tracking-tight">
                  {grossSalesVal.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </span>
              </div>
              <div className="text-[9px] text-[#0f5132] font-bold flex items-center gap-0.5 mt-1">
                <ArrowUpRight className="w-3 h-3" /> Total Cash flow
              </div>
            </div>

            {/* Net Profit */}
            <div className="bg-emerald-800 text-white rounded-2xl p-3.5 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-white/5 rounded-full pointer-events-none" />
              <div className="text-emerald-200 text-[10px] uppercase font-bold tracking-wider">Net Profit</div>
              <div className="mt-2">
                <span className="text-emerald-300 font-mono text-[10px] mr-0.5">ZMW</span>
                <span className="text-white text-base font-extrabold font-mono tracking-tight">
                  {netProfitVal.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </span>
              </div>
              <div className="text-[9px] text-emerald-300 font-bold flex items-center gap-0.5 mt-1">
                <TrendingUp className="w-3 h-3" /> Profit Margin
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-2xl p-3.5 border border-gray-150 shadow-xs flex flex-col justify-between">
              <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Sales Made</div>
              <div className="mt-2">
                <span className="text-gray-800 text-lg font-extrabold font-mono tracking-tight">
                  {transactionCountVal}
                </span>
              </div>
              <div className="text-[9px] text-gray-500 font-bold mt-1">
                Completed deals
              </div>
            </div>
          </div>

          {/* Graphics Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sales Trends Chart */}
            <div className="bg-white rounded-2xl p-4 border border-gray-150 shadow-xs space-y-2">
              <h3 className="text-gray-700 font-sans text-xs font-bold flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-[#0f5132]" />
                Sales & Profit History
              </h3>
              <div className="h-44 w-full">
                {chronologicalSalesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chronologicalSalesData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0f5132" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#0f5132" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="#9ca3af" />
                      <YAxis tick={{ fontSize: 9 }} stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ fontSize: '11px', borderRadius: '8px' }} 
                        formatter={(val) => [`K${val}`, '']}
                      />
                      <Area type="monotone" dataKey="amount" name="Sales" stroke="#0f5132" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" />
                      <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={1.5} fill="none" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400 italic">
                    No sales data available to chart.
                  </div>
                )}
              </div>
            </div>

            {/* Payment Methods breakdown */}
            <div className="bg-white rounded-2xl p-4 border border-gray-150 shadow-xs space-y-2">
              <h3 className="text-gray-700 font-sans text-xs font-bold flex items-center gap-1.5">
                <PieChartIcon className="w-4 h-4 text-[#0f5132]" />
                Volume by Payment Channel
              </h3>
              <div className="h-44 w-full flex flex-col justify-between">
                {paymentMethodData.length > 0 ? (
                  <>
                    <div className="h-32 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={paymentMethodData} layout="vertical" margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                          <XAxis type="number" tick={{ fontSize: 9 }} stroke="#9ca3af" hide />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fontWeight: 'bold' }} stroke="#4b5563" width={55} />
                          <Tooltip formatter={(val) => [`K${val}`, 'Volume']} />
                          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                            {paymentMethodData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Compact list */}
                    <div className="flex gap-2.5 justify-center text-[9px] font-bold text-gray-500 overflow-x-auto scrollbar-none pb-1">
                      {paymentMethodData.map((item, idx) => (
                        <div key={item.name} className="flex items-center gap-1 shrink-0">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span>{item.name}: {formatZMW(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400 italic">
                    No transaction breakdown available.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transaction History log */}
          <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
              <h3 className="text-gray-800 font-sans text-xs font-bold uppercase tracking-wider">
                Sales Transaction Ledger
              </h3>
              
              {/* Payment Method Selector */}
              <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
                {['All', 'Cash', 'Airtel Money', 'MTN MoMo', 'Nkongole (Debt)'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setSelectedMethod(method)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase transition-all whitespace-nowrap cursor-pointer ${
                      selectedMethod === method
                        ? 'bg-[#0f5132] text-white'
                        : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {method === 'Nkongole (Debt)' ? 'Nkongole' : method}
                  </button>
                ))}
              </div>
            </div>

            {/* Search filter bar */}
            <div className="p-3 border-b border-gray-100 flex items-center gap-2">
              <div className="flex-1 relative flex items-center">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by invoice, product name, or payment channel..."
                  className="w-full h-9 pl-9 pr-3 text-xs bg-gray-100/75 border border-transparent rounded-xl focus:bg-white focus:border-gray-200 focus:ring-1 focus:ring-gray-200 outline-none"
                />
              </div>
            </div>

            {/* List of sales */}
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <button
                    key={sale.id}
                    onClick={() => setSelectedSale(sale)}
                    className="w-full text-left p-3.5 hover:bg-gray-50/80 transition-colors flex items-center justify-between group"
                  >
                    <div className="space-y-1 min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-gray-400 group-hover:text-[#0f5132] transition-colors">
                          #{sale.invoiceNumber}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          sale.paymentMethod === 'Cash' ? 'bg-emerald-50 text-emerald-700' :
                          sale.paymentMethod === 'Nkongole (Debt)' ? 'bg-red-50 text-red-700' :
                          'bg-sky-50 text-sky-700'
                        }`}>
                          {sale.paymentMethod}
                        </span>
                      </div>
                      <div className="text-gray-700 text-xs font-semibold truncate">
                        {sale.items.map(item => `${item.productName} (x${item.quantity})`).join(', ')}
                      </div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {sale.date} at {sale.time}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-gray-900 text-xs font-extrabold font-mono">
                        {formatZMW(sale.totalAmount)}
                      </div>
                      <div className="text-[10px] text-[#0f5132] font-semibold font-mono">
                        + {formatZMW(sale.totalProfit)} profit
                      </div>
                    </div>
                    
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 ml-2 transition-colors" />
                  </button>
                ))
              ) : (
                <div className="text-center py-10 text-xs text-gray-400 italic">
                  No matching transaction logs found.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Invoice / Receipt Modal Detail View */}
      <AnimatePresence>
        {selectedSale && (
          <div className="fixed inset-0 bg-black/40 flex items-end justify-center sm:items-center z-50 p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-none"
            >
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <span className="text-gray-700 font-sans text-xs font-bold uppercase tracking-wider">
                  Transaction Receipt
                </span>
                <button 
                  onClick={() => setSelectedSale(null)}
                  className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Receipt Body */}
              <div className="p-5 overflow-y-auto space-y-4">
                <div className="text-center space-y-1">
                  <span className="font-extrabold text-gray-800 text-base">{settings?.businessName || 'Bine Shop'}</span>
                  <p className="text-gray-400 text-[10px] uppercase font-mono tracking-wider">Invoice #{selectedSale.invoiceNumber}</p>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>Date:</span>
                    <span className="font-semibold text-gray-700">{selectedSale.date}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Time:</span>
                    <span className="font-semibold text-gray-700">{selectedSale.time}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Payment Channel:</span>
                    <span className="font-bold text-gray-800">{selectedSale.paymentMethod}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t border-dashed border-gray-200 pt-3 space-y-2">
                  <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider block">Items Purchased</span>
                  <div className="space-y-1.5">
                    {selectedSale.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-xs text-gray-700">
                        <span>{item.productName} <span className="text-gray-400 text-[11px]">x{item.quantity}</span></span>
                        <span className="font-semibold font-mono">{formatZMW(item.sellingPrice * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-dashed border-gray-200 pt-3 space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold text-gray-800">
                    <span>Total Amount Paid:</span>
                    <span className="font-mono text-[#0f5132] text-base">{formatZMW(selectedSale.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-[#0f5132] font-semibold">
                    <span>Expected Net Profit:</span>
                    <span className="font-mono bg-emerald-50 px-2 py-0.5 rounded-md">+{formatZMW(selectedSale.totalProfit)}</span>
                  </div>
                </div>

                <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/50 text-[10px] text-[#0f5132] text-center leading-relaxed">
                  💡 This record is fully persistent. Standard transactions and Nkongole repayment stats are automatically integrated into the ledger.
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => setSelectedSale(null)}
                  className="flex-1 h-10 bg-[#0f5132] hover:bg-[#0c4027] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Close Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
