import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  Calendar, 
  ChevronRight, 
  X, 
  Receipt, 
  Trash2,
  FileText
} from 'lucide-react';
import { Sale, Expense } from '../types';

interface SalesLedgerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sales: Sale[];
  settings: any;
}

export function SalesLedgerPanel({ isOpen, onClose, sales, settings }: SalesLedgerPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('All');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Currency helper
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="absolute inset-0 bg-surface z-[120] flex flex-col"
        >
          {/* Fake phone bar space */}
          <div className="h-6 bg-white shrink-0" />

          {/* Header */}
          <header className="bg-white sticky top-0 z-20 w-full h-14 border-b border-gray-100 flex items-center px-4 shrink-0 shadow-xs">
            <button 
              aria-label="Go back" 
              className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-90 transition-all text-gray-700 cursor-pointer"
              onClick={onClose}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="flex-1 text-center font-sans font-bold text-base text-gray-900 pr-10">
              Sales Transaction Ledger
            </h1>
          </header>

          {/* Search & Selector Bar */}
          <div className="bg-white p-4 border-b border-gray-100 space-y-3 shrink-0 text-left">
            {/* Payment Method Selector */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {['All', 'Cash', 'Airtel Money', 'MTN MoMo', 'Nkongole (Debt)'].map((method) => (
                <button
                  key={method}
                  onClick={() => setSelectedMethod(method)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase transition-all whitespace-nowrap cursor-pointer ${
                    selectedMethod === method
                      ? 'bg-[#0f5132] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200/70 border border-transparent'
                  }`}
                >
                  {method === 'Nkongole (Debt)' ? 'Nkongole' : method}
                </button>
              ))}
            </div>

            {/* Search filter input */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoice #, product or method..."
                className="w-full h-10 pl-9 pr-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#0f5132] focus:ring-1 focus:ring-[#0f5132] outline-none font-medium"
              />
            </div>
          </div>

          {/* List of sales */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 bg-gray-50/30">
            {filteredSales.length > 0 ? (
              filteredSales.map((sale) => (
                <button
                  key={sale.id}
                  onClick={() => setSelectedSale(sale)}
                  className="w-full text-left p-4 hover:bg-gray-50/80 transition-colors flex items-center justify-between group bg-white"
                >
                  <div className="space-y-1 min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-gray-400 group-hover:text-[#0f5132] transition-colors">
                        #{sale.invoiceNumber}
                      </span>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                        sale.paymentMethod === 'Cash' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        sale.paymentMethod === 'Nkongole (Debt)' ? 'bg-red-50 text-red-700 border border-red-100' :
                        'bg-sky-50 text-sky-700 border border-sky-100'
                      }`}>
                        {sale.paymentMethod}
                      </span>
                    </div>
                    <div className="text-gray-800 text-xs font-bold truncate">
                      {sale.items.map(item => `${item.productName} (x${item.quantity})`).join(', ')}
                    </div>
                    <div className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {sale.date} at {sale.time}
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      <div className="text-gray-900 text-xs font-extrabold font-mono">
                        {formatZMW(sale.totalAmount)}
                      </div>
                      <div className="text-[10px] text-[#0f5132] font-bold font-mono">
                        + {formatZMW(sale.totalProfit)} profit
                      </div>
                    </div>
                    <ChevronRight className="w-4.5 h-4.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-20 px-4">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400 italic">No matching transactions found in the ledger.</p>
              </div>
            )}
          </div>

          {/* Invoice / Receipt Modal Detail View */}
          <AnimatePresence>
            {selectedSale && (
              <div className="fixed inset-0 bg-black/50 flex items-end justify-center sm:items-center z-[130] p-0 sm:p-4">
                {/* Backdrop closer */}
                <div className="absolute inset-0" onClick={() => setSelectedSale(null)} />

                <motion.div
                  initial={{ opacity: 0, y: 120 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 120 }}
                  className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-none relative z-10"
                >
                  <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-gray-700 font-sans text-xs font-extrabold uppercase tracking-wider">
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
                  <div className="p-5 overflow-y-auto space-y-4 text-left">
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

                    <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/50 text-[10px] text-[#0f5132] leading-relaxed">
                      💡 This transaction is securely logged. Nkongole repayments are automatically tracked under debtors.
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ExpensesLedgerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  deleteExpense: (id: string) => void;
}

export function ExpensesLedgerPanel({ isOpen, onClose, expenses, deleteExpense }: ExpensesLedgerPanelProps) {
  // Currency helper
  const formatZMW = (val: number) => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW'
    }).format(val);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="absolute inset-0 bg-surface z-[120] flex flex-col"
        >
          {/* Fake phone bar space */}
          <div className="h-6 bg-white shrink-0" />

          {/* Header */}
          <header className="bg-white sticky top-0 z-20 w-full h-14 border-b border-gray-100 flex items-center px-4 shrink-0 shadow-xs">
            <button 
              aria-label="Go back" 
              className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-90 transition-all text-gray-700 cursor-pointer"
              onClick={onClose}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="flex-1 text-center font-sans font-bold text-base text-gray-900 pr-10">
              Business Expenses Ledger
            </h1>
          </header>

          {/* Records Counter banner */}
          <div className="bg-red-50/50 px-4 py-3 border-b border-red-100/50 flex justify-between items-center text-left shrink-0">
            <div>
              <p className="text-xs font-extrabold text-red-800">Total Deductible Expenses</p>
              <p className="text-[10px] text-red-600 mt-0.5">These are subtracted from your gross profit margin.</p>
            </div>
            <span className="text-[10px] bg-red-100 text-red-700 font-extrabold px-3 py-1 rounded-full uppercase">
              {expenses.length} Records
            </span>
          </div>

          {/* Scrollable list of expenses */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 bg-gray-50/30">
            {expenses.length > 0 ? (
              expenses.slice().reverse().map((expense) => (
                <div 
                  key={expense.id} 
                  className="p-4 flex items-center justify-between hover:bg-gray-50/40 transition-colors bg-white text-left"
                >
                  <div className="space-y-1 min-w-0 flex-1 pr-2">
                    <div className="text-gray-800 text-xs font-bold truncate">
                      {expense.description}
                    </div>
                    <div className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3" /> {expense.date}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right shrink-0">
                      <div className="text-red-600 text-xs font-extrabold font-mono">
                        - {formatZMW(expense.amount)}
                      </div>
                      <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                        Deducted
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 cursor-pointer"
                      title="Delete/Void Expense"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 px-4">
                <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400 italic">No business expenses logged yet.</p>
                <p className="text-[10px] text-gray-400 mt-1">Expenses can be charged directly on the catalog checkout sheet.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
