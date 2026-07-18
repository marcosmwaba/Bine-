import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  Bell, 
  TrendingUp, 
  TrendingDown,
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
  BarChart2,
  Trash2
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
import { Sale, Expense } from '../types';

interface StatsTabProps {
  sales: Sale[];
  expenses: Expense[];
  deleteExpense: (id: string) => void;
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
  expenses = [],
  deleteExpense,
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
  const totalExpensesVal = expenses.reduce((acc, e) => acc + e.amount, 0);
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Gross Sales */}
            <div className="bg-white rounded-2xl p-3.5 border border-gray-150 shadow-xs flex flex-col justify-between">
              <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Gross Sales</div>
              <div className="mt-2">
                <span className="text-gray-400 font-mono text-[9px] mr-0.5">ZMW</span>
                <span className="text-gray-800 text-sm md:text-base font-extrabold font-mono tracking-tight">
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
                <span className="text-emerald-300 font-mono text-[9px] mr-0.5">ZMW</span>
                <span className="text-white text-sm md:text-base font-extrabold font-mono tracking-tight">
                  {netProfitVal.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </span>
              </div>
              <div className="text-[9px] text-emerald-300 font-bold flex items-center gap-0.5 mt-1">
                <TrendingUp className="w-3 h-3" /> Profit Margin
              </div>
            </div>

            {/* Total Expenses */}
            <div className="bg-white rounded-2xl p-3.5 border border-gray-150 shadow-xs flex flex-col justify-between">
              <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Total Expenses</div>
              <div className="mt-2">
                <span className="text-gray-400 font-mono text-[9px] mr-0.5">ZMW</span>
                <span className="text-red-600 text-sm md:text-base font-extrabold font-mono tracking-tight">
                  {totalExpensesVal.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </span>
              </div>
              <div className="text-[9px] text-red-600 font-bold flex items-center gap-0.5 mt-1">
                <TrendingDown className="w-3 h-3" /> Deducted Cash
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-2xl p-3.5 border border-gray-150 shadow-xs flex flex-col justify-between">
              <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Sales Made</div>
              <div className="mt-2">
                <span className="text-gray-800 text-sm md:text-base font-extrabold font-mono tracking-tight">
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

          {/* Horizontal Statistics Bars */}
          <div className="bg-white rounded-2xl p-4.5 border border-gray-150 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-800 font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-[#0f5132]" />
                Financial Performance Bars
              </h3>
              <span className="text-[10px] text-gray-400 font-medium font-sans">Proportional breakdown</span>
            </div>

            <div className="space-y-4">
              {/* Gross Sales Row */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 font-semibold">Gross Sales</span>
                  <span className="font-extrabold font-mono text-gray-900">{formatZMW(grossSalesVal)}</span>
                </div>
                <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden relative shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    className="bg-gray-800 h-full rounded-full"
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Total inflow benchmark</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Net Profit Row */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Net Profit
                  </span>
                  <span className="font-extrabold font-mono text-emerald-700">{formatZMW(netProfitVal)}</span>
                </div>
                <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden relative shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${grossSalesVal > 0 ? Math.max(0, Math.min(100, (netProfitVal / grossSalesVal) * 100)) : 0}%` 
                    }}
                    className="bg-emerald-600 h-full rounded-full"
                    transition={{ duration: 0.8, delay: 0.1 }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Profit margin percentage</span>
                  <span>{grossSalesVal > 0 ? ((netProfitVal / grossSalesVal) * 100).toFixed(1) : '0.0'}%</span>
                </div>
              </div>

              {/* Total Expenses Row */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-red-700 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Operating Expenses
                  </span>
                  <span className="font-extrabold font-mono text-red-700">{formatZMW(totalExpensesVal)}</span>
                </div>
                <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden relative shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${grossSalesVal > 0 ? Math.max(0, Math.min(100, (totalExpensesVal / grossSalesVal) * 100)) : 0}%` 
                    }}
                    className="bg-red-500 h-full rounded-full"
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Expense deduction of gross</span>
                  <span>{grossSalesVal > 0 ? ((totalExpensesVal / grossSalesVal) * 100).toFixed(1) : '0.0'}%</span>
                </div>
              </div>

              {/* Cost of Goods / Other Cost Row */}
              {(() => {
                const cogsVal = Math.max(0, grossSalesVal - netProfitVal - totalExpensesVal);
                const cogsPct = grossSalesVal > 0 ? (cogsVal / grossSalesVal) * 100 : 0;
                return (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-amber-700 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Cost of Goods Sold (COGS) & Other
                      </span>
                      <span className="font-extrabold font-mono text-amber-700">{formatZMW(cogsVal)}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden relative shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${cogsPct}%` }}
                        className="bg-amber-500 h-full rounded-full"
                        transition={{ duration: 0.8, delay: 0.3 }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Inventory & wholesale baseline costs</span>
                      <span>{cogsPct.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
