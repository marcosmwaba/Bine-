import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  Bell, 
  Users, 
  Search, 
  X, 
  ChevronRight, 
  CheckCircle2, 
  ArrowLeft, 
  Smartphone, 
  Coins, 
  DollarSign, 
  Plus, 
  UserPlus, 
  Trash2,
  Share2
} from 'lucide-react';
import { Debtor, DebtTransaction, Settings } from '../types';
import { formatCurrency } from '../domain/entities';
import BineLogo from './BineLogo';

interface DebtTabProps {
  debtors: Debtor[];
  recordRepayment: (debtorId: string, amount: number, paymentMethod: string) => Debtor | null;
  addNewDebtor: (name: string, phone: string, initialOutstanding: number) => void;
  deleteDebtor: (debtorId: string) => void;
  clearPaidDebtors: () => void;
  onNavigateToTab: (tab: string) => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  onOpenSidebar?: () => void;
  settings?: Settings;
}

export default function DebtTab({ 
  debtors, 
  recordRepayment, 
  addNewDebtor, 
  deleteDebtor, 
  clearPaidDebtors, 
  onNavigateToTab, 
  onOpenNotifications, 
  unreadNotificationsCount,
  onOpenSidebar,
  settings
}: DebtTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'Highest Owed' | 'Oldest Debt' | 'Recently Paid'>('Highest Owed');
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);
  
  // Repayment Modals
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [repaymentSuccess, setRepaymentSuccess] = useState<string | null>(null);

  // 1. Calculations
  const totalOutstanding = debtors.reduce((acc, curr) => acc + curr.outstanding, 0);
  const activeDebtorsCount = debtors.filter(d => d.outstanding > 0).length;
  const paidDebtorsCount = debtors.filter(d => d.outstanding <= 0).length;

  // 2. Sorting & Filtering
  const sortedDebtors = [...debtors].sort((a, b) => {
    if (filterType === 'Highest Owed') {
      return b.outstanding - a.outstanding;
    } else if (filterType === 'Oldest Debt') {
      return b.daysActive - a.daysActive;
    } else {
      // Sort by last payment or generic order
      return a.name.localeCompare(b.name);
    }
  });

  const filteredDebtors = sortedDebtors.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.phone.includes(searchQuery)
  );

  const handleOpenDebtorDetails = (debtor: Debtor) => {
    // Look up current debtor state to make sure details are fully reactive
    const liveDebtor = debtors.find(d => d.id === debtor.id) || debtor;
    setSelectedDebtor(liveDebtor);
    setRepaymentAmount(liveDebtor.outstanding.toString());
  };

  const handleRepay = (method: string) => {
    if (!selectedDebtor) return;
    const amount = parseFloat(repaymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid repayment amount.');
      return;
    }

    const updatedDebtor = recordRepayment(selectedDebtor.id, amount, method);
    if (updatedDebtor) {
      // Refresh selected debtor state immediately
      setSelectedDebtor(updatedDebtor);
      setRepaymentAmount(updatedDebtor.outstanding.toString());
      setShowRepaymentModal(false);
      
      // Success banner
      setRepaymentSuccess(`Recorded payment of ${formatCurrency(amount)} via ${method}!`);
      setTimeout(() => setRepaymentSuccess(null), 3000);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full bg-surface relative">
      {/* Top AppBar */}
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

      {/* Main content scroll container */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-24 space-y-5">
        {/* Ledger Summary Card */}
        <section className="bg-orange-50 rounded-2xl p-5 border border-orange-100 shadow-xs relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 text-orange-200/40 opacity-50 select-none">
            <Users className="w-20 h-20 stroke-1" />
          </div>
          
          <h2 className="text-gray-500 font-sans text-xs font-bold uppercase tracking-wider mb-2">
            Total Outstanding Nkongole
          </h2>
          <div className="flex items-baseline gap-2">
            <span className="text-[#FD7E14] font-sans font-extrabold text-3xl">
              {formatCurrency(totalOutstanding)}
            </span>
          </div>
          
          <div className="mt-3.5 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FD7E14]" />
              <span className="font-sans text-xs font-semibold text-gray-600">
                {activeDebtorsCount} Customers with active debt
              </span>
            </div>
            
            {paidDebtorsCount > 0 && (
              <button
                onClick={() => {
                  if (confirm(`Do you want to clear and delete all ${paidDebtorsCount} customer ledger(s) that have been fully paid off?`)) {
                    clearPaidDebtors();
                    setRepaymentSuccess(`Successfully purged all ${paidDebtorsCount} fully paid customer ledger(s)!`);
                    setTimeout(() => setRepaymentSuccess(null), 3000);
                  }
                }}
                className="py-1 px-2.5 bg-white hover:bg-orange-100 text-[#FD7E14] font-sans font-extrabold text-[10px] rounded-lg border border-orange-200 transition-all flex items-center gap-1 shadow-2xs cursor-pointer uppercase tracking-wider"
              >
                <CheckCircle2 className="w-3 h-3 text-[#FD7E14]" />
                Purge {paidDebtorsCount} Paid
              </button>
            )}
          </div>
        </section>

        {/* Search & filters row */}
        <section className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search debtor by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white focus:outline-hidden focus:border-[#003820] focus:ring-1 focus:ring-[#003820] transition-all font-sans text-sm"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {(['Highest Owed', 'Oldest Debt', 'Recently Paid'] as const).map((chip) => (
              <button
                key={chip}
                className={`flex-none px-4 py-1.5 rounded-full font-sans text-xs font-bold transition-all border ${
                  filterType === chip
                    ? 'bg-[#0f5132] border-[#0f5132] text-white shadow-xs'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
                onClick={() => setFilterType(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        </section>

        {/* Debtors List */}
        <section className="space-y-2.5 pb-4">
          {debtors.length === 0 ? (
            <div className="py-12 bg-white border border-gray-150 rounded-2xl text-center flex flex-col items-center justify-center p-6 text-gray-400">
              <div className="w-12 h-12 bg-[#FD7E14]/10 rounded-full flex items-center justify-center text-[#FD7E14] mb-3">
                <Users className="w-6 h-6" />
              </div>
              <p className="font-sans font-bold text-sm text-gray-800">No Customers Added Yet</p>
              <p className="text-xs text-gray-400 max-w-xs mt-1 leading-relaxed">
                Accounts are automatically created when you check out a sale in the <span className="font-bold text-[#0f5132]">Cashier Tab</span> using the <span className="font-bold text-[#FD7E14]">Nkongole (Debt)</span> payment method.
              </p>
            </div>
          ) : filteredDebtors.length === 0 ? (
            <div className="py-12 bg-white border border-gray-100 rounded-2xl text-center text-gray-400 text-xs">
              No debtors match your current search criteria.
            </div>
          ) : (
            filteredDebtors.map((debtor) => {
              // Custom color coding based on active days to pay homage to screenshots
              let avatarBg = 'bg-[#0f5132]/10 text-[#0f5132]';
              if (debtor.id === 'd2') avatarBg = 'bg-yellow-100 text-yellow-700';
              if (debtor.id === 'd3') avatarBg = 'bg-red-100 text-red-600';
              if (debtor.id === 'd4') avatarBg = 'bg-teal-100 text-teal-700';

              return (
                <div
                  key={debtor.id}
                  className="bg-white p-4 rounded-2xl shadow-xs border border-gray-150 hover:border-gray-200 flex items-center justify-between cursor-pointer active:bg-gray-50 transition-all duration-200"
                  onClick={() => handleOpenDebtorDetails(debtor)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full font-sans font-extrabold flex items-center justify-center text-sm ${avatarBg}`}>
                      {debtor.initials}
                    </div>
                    <div>
                      <p className="font-sans font-bold text-base text-gray-900 leading-tight">
                        {debtor.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{debtor.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#FD7E14] font-sans font-bold text-base leading-tight">
                      {formatCurrency(debtor.outstanding)}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Days Active: {debtor.daysActive}d
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>

      {/* Customer Detail Bottom Sheet Panel */}
      <AnimatePresence>
        {selectedDebtor && (
          <>
            {/* Backdrop Scrim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 z-[100] backdrop-blur-xs"
              onClick={() => setSelectedDebtor(null)}
            />

            {/* Bottom Sheet Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[110] max-h-[85%] flex flex-col overflow-hidden shadow-2xl pb-24"
            >
              {/* Drag Handle Indicator */}
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto my-3 shrink-0" />
              
              <div className="px-5 pb-4 flex-1 overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="font-sans font-extrabold text-2xl text-gray-900 leading-tight">
                      {selectedDebtor.name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">{selectedDebtor.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#FD7E14] font-sans font-extrabold text-2xl leading-none">
                      {formatCurrency(selectedDebtor.outstanding)}
                    </p>
                    <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#FD7E14] mt-1.5 bg-orange-50 px-2 py-0.5 rounded-full inline-block">
                      Outstanding
                    </p>
                  </div>
                </div>

                {/* WhatsApp MoMo Payment Reminder Card */}
                {selectedDebtor.outstanding > 0 && (
                  <div className="mb-6 p-4 bg-orange-50/70 border border-orange-100 rounded-2xl flex flex-col gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#FD7E14]/15 flex items-center justify-center text-[#FD7E14]">
                        <Smartphone className="w-4.5 h-4.5" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-sans font-bold text-xs text-gray-800 leading-none">WhatsApp MoMo Reminder</h4>
                        <p className="text-[10px] text-gray-400 mt-1">Send pre-filled request to clear balance</p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const messageText = `Hi ${selectedDebtor.name},\n\nThis is a friendly reminder from *${settings?.businessName || 'our shop'}* regarding your outstanding Nkongole balance of *${formatCurrency(selectedDebtor.outstanding)}*.\n\nYou can conveniently pay this off via Mobile Money using the details below:\n📱 *MoMo Number:* ${settings?.mobileMoneyNumber || 'Contact Merchant'}\n👤 *Name:* ${settings?.ownerName || 'Merchant'}\n\nThank you for your business!`;
                        const encodedText = encodeURIComponent(messageText);
                        window.open(`https://api.whatsapp.com/send?phone=${selectedDebtor.phone.replace(/\s+/g, '')}&text=${encodedText}`, '_blank');
                      }}
                      className="w-full py-2.5 bg-[#FD7E14] hover:bg-[#e16807] text-white rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all shadow-xs border border-orange-600 cursor-pointer"
                    >
                      <Share2 className="w-4.5 h-4.5" strokeWidth={2.5} />
                      Share MoMo Reminder
                    </button>
                  </div>
                )}

                <h3 className="font-sans text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Transaction History
                </h3>

                {/* History Timeline list */}
                <div className="space-y-3 pr-1">
                  {selectedDebtor.transactions.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-400">
                      No transaction logs recorded for this customer.
                    </div>
                  ) : (
                    selectedDebtor.transactions.map((tr) => (
                      <div
                        key={tr.id}
                        className={`flex justify-between items-center py-3 border-b border-gray-100 ${
                          tr.type === 'repayment'
                            ? 'bg-green-50/50 -mx-5 px-5 border-green-50'
                            : ''
                        }`}
                      >
                        <div>
                          <p className={`font-sans font-bold text-sm ${
                            tr.type === 'repayment' ? 'text-green-700 flex items-center gap-1' : 'text-gray-800'
                          }`}>
                            {tr.type === 'repayment' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                            {tr.description}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{tr.date} • {tr.time}</p>
                        </div>
                        <p className={`font-sans font-bold text-sm ${
                          tr.type === 'repayment' ? 'text-green-700' : 'text-gray-850'
                        }`}>
                          {tr.type === 'repayment' ? '-' : '+'} {formatCurrency(tr.amount)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Record Repayment sticky footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex gap-2">
                <button
                  className="px-4 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-sans font-bold text-sm rounded-xl active:scale-97 transition-all text-center"
                  onClick={() => setSelectedDebtor(null)}
                >
                  Close
                </button>
                
                <button
                  type="button"
                  title="Delete Customer Ledger"
                  className="px-4 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/50 rounded-xl active:scale-97 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                  onClick={() => {
                    if (confirm(`Are you sure you want to completely delete ${selectedDebtor.name}'s account and all their transaction history? This cannot be undone.`)) {
                      const name = selectedDebtor.name;
                      deleteDebtor(selectedDebtor.id);
                      setSelectedDebtor(null);
                      setRepaymentSuccess(`Customer ledger for "${name}" has been permanently deleted.`);
                      setTimeout(() => setRepaymentSuccess(null), 3000);
                    }
                  }}
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                {selectedDebtor.outstanding <= 0 ? (
                  <button
                    className="flex-1 py-3.5 bg-green-50 hover:bg-green-100 text-[#0f5132] border border-green-200 font-sans font-extrabold text-xs rounded-xl active:scale-97 transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer uppercase tracking-wider"
                    onClick={() => {
                      if (confirm(`${selectedDebtor.name} has paid everything back. Settle and delete their account from your logs?`)) {
                        const name = selectedDebtor.name;
                        deleteDebtor(selectedDebtor.id);
                        setSelectedDebtor(null);
                        setRepaymentSuccess(`Successfully settled & archived customer "${name}"!`);
                        setTimeout(() => setRepaymentSuccess(null), 3000);
                      }
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#0f5132]" />
                    Settle &amp; Archive
                  </button>
                ) : (
                  <button
                    className="flex-1 py-3.5 bg-[#0f5132] hover:bg-[#083520] text-white font-sans font-bold text-xs rounded-xl active:scale-97 transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer uppercase tracking-wider"
                    onClick={() => setShowRepaymentModal(true)}
                  >
                    <Coins className="w-4 h-4" />
                    Record Repayment
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Repayment Confirmation Modal Popup */}
      <AnimatePresence>
        {showRepaymentModal && selectedDebtor && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 z-[120] backdrop-blur-xs"
              onClick={() => setShowRepaymentModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: '-40%', x: '-50%' }}
              animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
              exit={{ opacity: 0, scale: 0.95, y: '-45%', x: '-50%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute top-1/2 left-1/2 w-[90%] max-w-sm bg-white rounded-3xl z-[130] shadow-2xl p-6"
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-sans font-bold text-lg text-gray-900">
                  Confirm Repayment
                </h2>
                <button
                  className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all"
                  onClick={() => setShowRepaymentModal(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">
                    Repayment Amount (ZMW)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full py-2.5 text-center font-sans font-extrabold text-2xl border-2 border-gray-200 rounded-2xl focus:outline-hidden focus:border-[#0f5132] focus:ring-0"
                    value={repaymentAmount}
                    onChange={(e) => setRepaymentAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-500 text-center mb-1">
                    Select Payment Method
                  </p>
                  
                  {/* Cash */}
                  <button
                    className="w-full py-2.5 bg-[#0f5132] hover:bg-[#072a1a] text-white rounded-xl flex items-center justify-between px-4 active:scale-[0.98] transition-all text-sm font-bold"
                    onClick={() => handleRepay('Cash')}
                  >
                    <span>Cash</span>
                    <Coins className="w-4 h-4" />
                  </button>

                  {/* MTN */}
                  <button
                    className="w-full py-2.5 bg-[#FFCC00] hover:bg-[#d9ae00] text-gray-950 rounded-xl flex items-center justify-between px-4 active:scale-[0.98] transition-all text-sm font-bold"
                    onClick={() => handleRepay('MTN MoMo')}
                  >
                    <span>MTN MoMo</span>
                    <Smartphone className="w-4 h-4 text-gray-950" />
                  </button>

                  {/* Airtel */}
                  <button
                    className="w-full py-2.5 bg-[#E11900] hover:bg-[#bd1400] text-white rounded-xl flex items-center justify-between px-4 active:scale-[0.98] transition-all text-sm font-bold"
                    onClick={() => handleRepay('Airtel Money')}
                  >
                    <span>Airtel Money</span>
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Notification Alert overlay */}
      <AnimatePresence>
        {repaymentSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="absolute inset-x-4 top-20 z-[150] bg-white border-2 border-[#0f5132] rounded-2xl shadow-2xl p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 stroke-2" />
            </div>
            <div>
              <p className="font-sans font-extrabold text-sm text-[#0f5132] leading-tight">
                Ledger Updated
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{repaymentSuccess}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
