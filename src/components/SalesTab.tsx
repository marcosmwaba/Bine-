import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  Coins, 
  ChevronRight, 
  Delete, 
  X, 
  ShoppingCart, 
  Sparkles, 
  User, 
  Plus, 
  Minus, 
  Scan, 
  CheckCircle2, 
  ArrowLeft,
  Smartphone,
  Radio,
  ShoppingBag,
  Flame,
  Check,
  Bell,
  Package,
  Coffee,
  Layers,
  Wrench,
  Shirt,
  Heart,
  Grid,
  Receipt
} from 'lucide-react';
import { Product, Debtor } from '../types';
import { formatCurrency } from '../domain/entities';
import BineLogo from './BineLogo';
import BarcodeScannerModal from './BarcodeScannerModal';

interface SalesTabProps {
  products: Product[];
  debtors: Debtor[];
  cashierAmount: string;
  pressNumpadKey: (key: string) => void;
  deleteNumpadDigit: () => void;
  clearNumpadAmount: () => void;
  cartItems: { product: Product; quantity: number }[];
  addProductToCart: (product: Product) => void;
  decrementProductInCart: (productId: string) => void;
  removeProductFromCart: (productId: string) => void;
  clearCart: () => void;
  getCartTotal: () => void;
  processCheckout: (paymentMethod: 'Cash' | 'Airtel Money' | 'MTN MoMo' | 'Nkongole (Debt)', debtorId?: string) => boolean;
  addExpense: (amount: number, description: string) => void;
  selectedCatalogCategory: string;
  setSelectedCatalogCategory: (category: string) => void;
  onNavigateToTab: (tab: string) => void;
  addNewDebtor: (name: string, phone: string, initialOutstanding: number) => Debtor;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  onOpenSidebar?: () => void;
}

export default function SalesTab({
  products,
  debtors,
  cashierAmount,
  pressNumpadKey,
  deleteNumpadDigit,
  clearNumpadAmount,
  cartItems,
  addProductToCart,
  decrementProductInCart,
  removeProductFromCart,
  clearCart,
  getCartTotal,
  processCheckout,
  addExpense,
  selectedCatalogCategory,
  setSelectedCatalogCategory,
  onNavigateToTab,
  addNewDebtor,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  onOpenSidebar
}: SalesTabProps) {
  const [activeTab, setActiveTab] = useState<'numpad' | 'catalog'>('numpad');
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [showDebtorSelectSheet, setShowDebtorSelectSheet] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseDescription, setExpenseDescription] = useState('General Expense');
  const [debtorSearchQuery, setDebtorSearchQuery] = useState('');
  const [successAnim, setSuccessAnim] = useState<string | null>(null);

  // New debtor registration states
  const [showAddDebtorForm, setShowAddDebtorForm] = useState(false);
  const [newDebtorName, setNewDebtorName] = useState('');
  const [newDebtorPhone, setNewDebtorPhone] = useState('');
  const [showScannerModal, setShowScannerModal] = useState(false);

  const handleBarcodeScanInSales = (code: string) => {
    const foundProduct = products.find(p => p.barcode === code);
    if (foundProduct) {
      if (foundProduct.remaining <= 0) {
        alert(`"${foundProduct.name}" is out of stock and cannot be added to your cart.`);
      } else {
        addProductToCart(foundProduct);
        triggerSuccess(`"${foundProduct.name}" added to cart!`);
        setShowScannerModal(false);
      }
    } else {
      const createNew = confirm(`Barcode "${code}" was not found in your inventory.\n\nWould you like to register a new product with this barcode?`);
      if (createNew) {
        onNavigateToTab('inventory');
      }
      setShowScannerModal(false);
    }
  };

  const totalDue = getCartTotal() as any as number;

  const handleNumpadKey = (val: string) => {
    // If we have cart items, disable numpad entry or clear cart first
    if (cartItems.length > 0) {
      if (confirm("Numpad manual entry will clear the active Quick Catalog items in your cart. Proceed?")) {
        clearCart();
        pressNumpadKey(val);
      }
    } else {
      pressNumpadKey(val);
    }
  };

  // Dynamic categories helper
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('grocery') || name.includes('food') || name.includes('eat') || name.includes('snack') || name.includes('bread') || name.includes('sugar')) {
      return ShoppingBag;
    }
    if (name.includes('drink') || name.includes('soda') || name.includes('beverage') || name.includes('beer') || name.includes('juice') || name.includes('cola')) {
      return Coffee;
    }
    if (name.includes('charcoal') || name.includes('fuel') || name.includes('fire') || name.includes('gas') || name.includes('coal') || name.includes('heat')) {
      return Flame;
    }
    if (name.includes('airtime') || name.includes('phone') || name.includes('telecom') || name.includes('recharge') || name.includes('talk') || name.includes('mobile')) {
      return Smartphone;
    }
    if (name.includes('clothing') || name.includes('wear') || name.includes('shirt') || name.includes('dress') || name.includes('shoe') || name.includes('fashion') || name.includes('boutique')) {
      return Shirt;
    }
    if (name.includes('tool') || name.includes('hardware') || name.includes('build') || name.includes('repair') || name.includes('iron') || name.includes('cement')) {
      return Wrench;
    }
    if (name.includes('service') || name.includes('work') || name.includes('fee') || name.includes('labor')) {
      return Layers;
    }
    if (name.includes('beauty') || name.includes('salon') || name.includes('cosmetic') || name.includes('hair') || name.includes('makeup')) {
      return Sparkles;
    }
    if (name.includes('health') || name.includes('medicine') || name.includes('pill') || name.includes('clinic') || name.includes('drug')) {
      return Heart;
    }
    if (name.includes('money') || name.includes('cash') || name.includes('finance') || name.includes('debt') || name.includes('repay')) {
      return Coins;
    }
    return Package;
  };

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
    if (unique.length === 0) {
      return [
        { name: 'General', icon: Package }
      ];
    }
    return unique.map(cat => ({
      name: cat,
      icon: getCategoryIcon(cat)
    }));
  }, [products]);

  // Sync selected catalog category if it no longer exists
  useEffect(() => {
    if (categories.length > 0) {
      const exists = categories.some(c => c.name.toLowerCase() === selectedCatalogCategory.toLowerCase());
      if (!exists) {
        setSelectedCatalogCategory(categories[0].name);
      }
    }
  }, [categories, selectedCatalogCategory, setSelectedCatalogCategory]);

  const filteredProducts = products.filter(
    (p) => p.category.toLowerCase() === (selectedCatalogCategory || '').toLowerCase()
  );

  const handleSelectPayment = (method: 'Cash' | 'Airtel Money' | 'MTN MoMo' | 'Nkongole (Debt)') => {
    if (method === 'Nkongole (Debt)') {
      setShowAddDebtorForm(false);
      setNewDebtorName('');
      setNewDebtorPhone('');
      setShowDebtorSelectSheet(true);
    } else {
      const ok = processCheckout(method);
      if (ok) {
        setShowPaymentSheet(false);
        triggerSuccess(`K ${totalDue.toFixed(2)} paid successfully via ${method}!`);
      }
    }
  };

  const handleSelectExpense = () => {
    setShowExpenseForm(true);
    setExpenseDescription('General Expense');
  };

  const handleRecordExpense = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense(totalDue, expenseDescription);
    setShowExpenseForm(false);
    setShowPaymentSheet(false);
    clearCart();
    clearNumpadAmount();
    triggerSuccess(`K ${totalDue.toFixed(2)} logged as expense: ${expenseDescription}`);
  };

  const handleSelectDebtor = (debtor: Debtor) => {
    const ok = processCheckout('Nkongole (Debt)', debtor.id);
    if (ok) {
      setShowDebtorSelectSheet(false);
      setShowPaymentSheet(false);
      triggerSuccess(`K ${totalDue.toFixed(2)} charged to ${debtor.name}'s Nkongole!`);
    }
  };

  const handleCreateAndChargeDebtor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDebtorName.trim() || !newDebtorPhone.trim()) {
      alert('Please enter a valid name and phone number.');
      return;
    }
    const createdDebtor = addNewDebtor(newDebtorName.trim(), newDebtorPhone.trim(), 0);
    const ok = processCheckout('Nkongole (Debt)', createdDebtor.id);
    if (ok) {
      setShowAddDebtorForm(false);
      setShowDebtorSelectSheet(false);
      setShowPaymentSheet(false);
      triggerSuccess(`Customer "${createdDebtor.name}" added successfully & K ${totalDue.toFixed(2)} charged to Nkongole!`);
    }
  };

  const triggerSuccess = (msg: string) => {
    setSuccessAnim(msg);
    setTimeout(() => {
      setSuccessAnim(null);
    }, 2800);
  };

  // Filter debtors for debt select
  const filteredDebtors = debtors.filter((d) =>
    d.name.toLowerCase().includes(debtorSearchQuery.toLowerCase()) ||
    d.phone.includes(debtorSearchQuery)
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full bg-surface">
      {/* Top App Bar */}
      <header className="bg-white flex justify-between items-center px-4 h-14 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <Menu className="w-6 h-6 text-[#003820] cursor-pointer hover:opacity-85 transition-opacity" onClick={onOpenSidebar} />
          <BineLogo className="h-7 w-auto" />
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setShowScannerModal(true)}
            className="p-1.5 hover:bg-gray-50 rounded-full text-[#0f5132] bg-[#0f5132]/5 hover:bg-[#0f5132]/10 transition-all relative cursor-pointer flex items-center gap-1 px-2.5 border border-[#0f5132]/20"
            title="Scan Barcode"
          >
            <Scan className="w-4 h-4" />
            <span className="font-sans text-[10px] font-bold">Scan</span>
          </button>
          <button 
            onClick={onOpenNotifications}
            className="p-1.5 hover:bg-gray-50 rounded-full text-gray-500 transition-all relative cursor-pointer"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse" />
            )}
          </button>
        </div>
      </header>

      {/* Cart Display Zone */}
      <section className="px-4 py-6 bg-white flex flex-col items-center justify-center border-b border-gray-100 shrink-0">
        <span className="font-sans text-xs font-semibold text-gray-400 tracking-wider uppercase mb-1">
          Total Sale Amount
        </span>
        <div className="font-sans font-extrabold text-4xl text-[#0f5132]">
          {formatCurrency(totalDue)}
        </div>
        
        {cartItems.length > 0 && (
          <div className="mt-2 text-xs text-[#0f5132] bg-[#0f5132]/5 px-3 py-1 rounded-full font-medium flex items-center gap-1 shrink-0">
            <ShoppingCart className="w-3.5 h-3.5" />
            {cartItems.reduce((acc, ci) => acc + ci.quantity, 0)} catalog items in cart
          </div>
        )}

        {cartItems.length > 0 && (
          <div className="w-full mt-4 overflow-x-auto hide-scrollbar flex gap-2.5 py-1.5 px-1 max-w-full shrink-0">
            {cartItems.map((item) => {
              const p = products.find((prod) => prod.id === item.product.id) || item.product;
              return (
                <div 
                  key={p.id}
                  className="flex-none bg-gray-50 border border-gray-150 rounded-2xl p-2.5 flex items-center gap-3 shadow-2xs hover:border-gray-250 transition-all"
                >
                  <div className="flex flex-col text-left min-w-[70px] max-w-[120px]">
                    <span className="font-sans font-bold text-xs text-gray-900 truncate leading-tight">
                      {p.name}
                    </span>
                    <span className="font-mono text-[10px] text-[#0f5132] font-semibold mt-0.5">
                      {formatCurrency(p.sellingPrice)}
                    </span>
                    {p.unit && (
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">
                        {p.unit}
                      </span>
                    )}
                  </div>
                  
                  {/* Quantity Control Buttons */}
                  <div className="flex items-center gap-1.5 bg-white border border-gray-150 rounded-xl p-1">
                    <button
                      type="button"
                      className="w-6 h-6 hover:bg-gray-50 rounded-lg flex items-center justify-center text-gray-500 transition-all active:scale-90 cursor-pointer"
                      onClick={() => decrementProductInCart(p.id)}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-sans font-extrabold text-xs text-gray-800 px-1 min-w-[16px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="w-6 h-6 hover:bg-gray-50 rounded-lg flex items-center justify-center text-gray-500 transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      disabled={item.quantity >= p.remaining}
                      onClick={() => addProductToCart(p)}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    className="p-1 hover:bg-red-50 text-red-500 rounded-lg transition-all active:scale-90 cursor-pointer"
                    onClick={() => removeProductFromCart(p.id)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Tabs Container */}
      <nav className="flex border-b border-gray-200 bg-white shrink-0">
        <button
          className={`flex-1 py-3 text-center font-sans font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'numpad'
              ? 'border-[#003820] text-[#003820]'
              : 'border-transparent text-gray-500 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('numpad')}
        >
          Quick Numpad
        </button>
        <button
          className={`flex-1 py-3 text-center font-sans font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'catalog'
              ? 'border-[#003820] text-[#003820]'
              : 'border-transparent text-gray-500 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('catalog')}
        >
          Quick Catalog
        </button>
      </nav>

      {/* Main Interaction Area */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'numpad' ? (
            <motion.div
              key="numpad"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex h-full"
            >
              {/* Left: Numpad Grid */}
              <div className="flex-[3] p-3 overflow-y-auto flex flex-col justify-center max-w-lg mx-auto">
                <div className="grid grid-cols-3 gap-3 w-full aspect-[4/5] max-h-[400px]">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((key) => (
                    <button
                      key={key}
                      id={`numpad-key-${key}`}
                      className="rounded-2xl bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-800 font-sans font-semibold text-xl flex items-center justify-center transition-all shadow-xs active:scale-95 border border-gray-100"
                      onClick={() => handleNumpadKey(key)}
                    >
                      {key}
                    </button>
                  ))}
                  <button
                    id="numpad-key-c"
                    className="rounded-2xl bg-red-100 hover:bg-red-200 text-red-700 font-sans font-semibold text-xl flex items-center justify-center transition-all shadow-xs active:scale-95 border border-red-200"
                    onClick={clearNumpadAmount}
                  >
                    C
                  </button>
                  <button
                    id="numpad-key-0"
                    className="rounded-2xl bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-800 font-sans font-semibold text-xl flex items-center justify-center transition-all shadow-xs active:scale-95 border border-gray-100"
                    onClick={() => handleNumpadKey('0')}
                  >
                    0
                  </button>
                  <button
                    id="numpad-key-backspace"
                    className="rounded-2xl bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-800 flex items-center justify-center transition-all shadow-xs active:scale-95 border border-gray-100"
                    onClick={deleteNumpadDigit}
                  >
                    <Delete className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Right: Category vertical chips */}
              <aside className="w-24 p-2 border-l border-gray-200 bg-gray-50 flex flex-col gap-2.5 shrink-0 overflow-y-auto">
                {categories.map((cat) => {
                  const CatIcon = cat.icon;
                  return (
                    <button
                      key={cat.name}
                      className={`flex flex-col items-center justify-center gap-1 p-2 bg-white rounded-xl border-2 transition-all text-center aspect-square ${
                        selectedCatalogCategory === cat.name
                          ? 'border-[#003820] shadow-sm text-[#003820]'
                          : 'border-transparent text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        setSelectedCatalogCategory(cat.name);
                        setActiveTab('catalog');
                      }}
                    >
                      <CatIcon className="w-5 h-5 text-[#003820]" />
                      <span className="font-sans text-[9px] font-bold leading-tight">{cat.name}</span>
                    </button>
                  );
                })}
              </aside>
            </motion.div>
          ) : (
            <motion.div
              key="catalog"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col overflow-hidden h-full"
            >
              {/* Category selector row */}
              <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 py-3 bg-white border-b border-gray-100 shrink-0">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    className={`flex-none px-4 py-1.5 rounded-full font-sans text-xs font-bold transition-all ${
                      selectedCatalogCategory === cat.name
                        ? 'bg-[#003820] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedCatalogCategory(cat.name)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Catalog Items list matching Inventory Tab styling */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 min-h-0">
                {products.length === 0 ? (
                  <div className="py-16 px-6 text-center flex flex-col items-center justify-center text-gray-400 max-w-[280px] mx-auto">
                    <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-[#0f5132] mb-3.5">
                      <Package className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-sans font-bold text-gray-800">Your Catalog is Empty</p>
                    <p className="text-xs font-sans text-gray-400 mt-1 leading-relaxed">
                      Go to the <span className="font-bold text-[#0f5132]">Inventory Tab</span> below to add your first product, set stock, and customize your own categories!
                    </p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center justify-center text-gray-400">
                    <ShoppingBag className="w-12 h-12 mb-2 stroke-1" />
                    <p className="text-sm font-sans">No products in this category</p>
                  </div>
                ) : (
                  filteredProducts.map((p) => {
                    const cartItem = cartItems.find((ci) => ci.product.id === p.id);
                    const qtyInCart = cartItem ? cartItem.quantity : 0;
                    const isOutOfStock = p.remaining <= 0;
                    const isLowStock = p.remaining > 0 && p.remaining <= 5;
                    const stockStatus = isOutOfStock ? 'out_of_stock' : isLowStock ? 'low_stock' : 'healthy';

                    return (
                      <div
                        key={p.id}
                        className={`bg-white p-3 rounded-xl shadow-xs border flex items-center justify-between gap-3 hover:shadow-md transition-all duration-200 select-none ${
                          isOutOfStock
                            ? 'border-red-100 bg-red-50/10 opacity-75'
                            : qtyInCart > 0
                            ? 'border-[#003820] ring-1 ring-[#003820] bg-green-50/5'
                            : stockStatus === 'low_stock'
                            ? 'border-orange-100 bg-orange-50/10'
                            : 'border-gray-150'
                        }`}
                      >
                        {/* Left: Product identification */}
                        <div className="flex-1 min-w-0 pr-1 text-left">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-sans font-bold text-sm text-gray-900 truncate leading-tight">
                              {p.name}
                            </h3>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 uppercase tracking-wide shrink-0">
                              {p.category}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-gray-400">
                            {p.barcode && (
                              <span className="font-mono bg-gray-50 px-1 py-0.2 rounded text-gray-400 truncate max-w-[100px]">
                                {p.barcode}
                              </span>
                            )}
                            <span>Unit: <span className="text-gray-500 font-extrabold uppercase">{p.unit || 'pcs'}</span></span>
                          </div>
                        </div>

                        {/* Middle: Prices */}
                        <div className="text-right shrink-0 min-w-[70px]">
                          <p className="font-sans text-[9px] text-gray-400 uppercase tracking-wider font-extrabold leading-none">
                            Price
                          </p>
                          <p className="font-sans font-extrabold text-sm text-[#003820] mt-0.5 leading-none">
                            {formatCurrency(p.sellingPrice)}
                          </p>
                        </div>

                        {/* Right: Stocks & status badge */}
                        <div className="text-right shrink-0 min-w-[75px] flex flex-col items-end">
                          <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider border leading-none ${
                            stockStatus === 'out_of_stock'
                              ? 'bg-red-50 text-red-600 border-red-200'
                              : stockStatus === 'low_stock'
                              ? 'bg-orange-50 text-orange-600 border-orange-200 animate-pulse'
                              : 'bg-green-50 text-green-700 border-green-200'
                          }`}>
                            {stockStatus === 'out_of_stock' ? 'Out' : stockStatus === 'low_stock' ? 'Low' : 'Healthy'}
                          </span>
                          <p className={`font-sans font-extrabold text-xs leading-none mt-1.5 ${
                            stockStatus === 'out_of_stock' ? 'text-red-600' : stockStatus === 'low_stock' ? 'text-orange-500' : 'text-gray-800'
                          }`}>
                            {p.remaining} <span className="text-[9px] text-gray-400 font-bold uppercase">{p.unit || 'pcs'}</span>
                          </p>
                        </div>

                        {/* Interactive Cart Controls */}
                        <div className="shrink-0 pl-1">
                          {isOutOfStock ? (
                            <div className="text-center text-[10px] text-red-600 font-bold uppercase tracking-wider px-2 py-1 bg-red-50 rounded">
                              Sold Out
                            </div>
                          ) : qtyInCart > 0 ? (
                            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-1">
                              <button
                                type="button"
                                className="w-6 h-6 hover:bg-gray-200/70 rounded flex items-center justify-center text-gray-600 transition-all active:scale-90 cursor-pointer"
                                onClick={() => decrementProductInCart(p.id)}
                              >
                                <Minus className="w-3 h-3 stroke-[2.5]" />
                              </button>
                              <span className="font-sans font-extrabold text-xs text-gray-900 min-w-[14px] text-center">
                                {qtyInCart}
                              </span>
                              <button
                                type="button"
                                className="w-6 h-6 hover:bg-gray-200/70 rounded flex items-center justify-center text-gray-600 transition-all active:scale-90 disabled:opacity-30 cursor-pointer"
                                disabled={qtyInCart >= p.remaining}
                                onClick={() => addProductToCart(p)}
                              >
                                <Plus className="w-3 h-3 stroke-[2.5]" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addProductToCart(p)}
                              className="px-3.5 py-1.5 rounded-lg bg-[#0f5132] hover:bg-[#0c4028] text-white font-sans font-bold text-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer shadow-2xs"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Add</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action Bar (Charge Button) */}
      <footer className="p-4 bg-white border-t border-gray-100 shrink-0 z-10 shadow-xs">
        <button
          disabled={totalDue <= 0}
          className={`w-full py-3.5 rounded-2xl font-sans font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md ${
            totalDue > 0
              ? 'bg-[#0f5132] hover:bg-[#0c4028] text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          onClick={() => setShowPaymentSheet(true)}
        >
          <span>CHARGE: {formatCurrency(totalDue)}</span>
          <Coins className="w-5 h-5" />
        </button>
      </footer>

      {/* Payment Selection Bottom Sheet */}
      <AnimatePresence>
        {showPaymentSheet && (
          <>
            {/* Backdrop Scrim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/45 z-[100] backdrop-blur-xs"
              onClick={() => {
                if (!showDebtorSelectSheet) setShowPaymentSheet(false);
              }}
            />

            {/* Sheet Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[110] px-4 pt-3 pb-8 max-h-[85%] overflow-y-auto shadow-2xl flex flex-col"
            >
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4 shrink-0" />
              
              {!showDebtorSelectSheet && !showExpenseForm ? (
                <>
                  <h2 className="font-sans font-bold text-xl text-center text-gray-900 mb-1">
                    Select Payment Method
                  </h2>
                  <p className="text-gray-500 text-center text-sm mb-6">
                    Total due: <span className="font-bold text-[#0f5132]">{formatCurrency(totalDue)}</span>
                  </p>

                  <div className="flex flex-col gap-3">
                    {/* Cash */}
                    <button
                      className="w-full py-3.5 bg-[#0f5132] hover:bg-[#0b3c25] text-white rounded-2xl flex items-center px-4 gap-4 active:scale-[0.97] transition-all shadow-sm"
                      onClick={() => handleSelectPayment('Cash')}
                    >
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Coins className="w-5 h-5" />
                      </div>
                      <span className="font-sans font-bold text-base text-left">Cash Payment</span>
                      <ChevronRight className="ml-auto w-5 h-5" />
                    </button>

                    {/* Airtel */}
                    <button
                      className="w-full py-3.5 bg-[#E31B23] hover:bg-[#be161d] text-white rounded-2xl flex items-center px-4 gap-4 active:scale-[0.97] transition-all shadow-sm"
                      onClick={() => handleSelectPayment('Airtel Money')}
                    >
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <span className="font-sans font-bold text-base text-left">Airtel Money</span>
                      <ChevronRight className="ml-auto w-5 h-5" />
                    </button>

                    {/* MTN */}
                    <button
                      className="w-full py-3.5 bg-[#FFCC00] hover:bg-[#e6b800] text-gray-950 rounded-2xl flex items-center px-4 gap-4 active:scale-[0.97] transition-all shadow-sm"
                      onClick={() => handleSelectPayment('MTN MoMo')}
                    >
                      <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <span className="font-sans font-bold text-base text-left">MTN MoMo</span>
                      <ChevronRight className="ml-auto w-5 h-5 text-gray-950" />
                    </button>

                    {/* Nkongole */}
                    <button
                      className="w-full py-3.5 bg-[#FD7E14] hover:bg-[#e47111] text-white rounded-2xl flex items-center px-4 gap-4 active:scale-[0.97] transition-all shadow-sm"
                      onClick={() => handleSelectPayment('Nkongole (Debt)')}
                    >
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                      <span className="font-sans font-bold text-base text-left">Nkongole (Debt / Credit)</span>
                      <ChevronRight className="ml-auto w-5 h-5" />
                    </button>

                    {/* Expense Deduction */}
                    <button
                      className="w-full py-3.5 bg-gray-700 hover:bg-gray-800 text-white rounded-2xl flex items-center px-4 gap-4 active:scale-[0.97] transition-all shadow-sm"
                      onClick={handleSelectExpense}
                    >
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-red-300" />
                      </div>
                      <span className="font-sans font-bold text-base text-left">Deduct as Business Expense</span>
                      <ChevronRight className="ml-auto w-5 h-5 text-red-300" />
                    </button>
                  </div>

                  <button
                    className="w-full mt-6 py-3 font-sans font-bold text-sm text-gray-500 hover:bg-gray-100 rounded-full transition-all"
                    onClick={() => setShowPaymentSheet(false)}
                  >
                    Cancel
                  </button>
                </>
              ) : showExpenseForm ? (
                <form onSubmit={handleRecordExpense} className="flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <button
                      type="button"
                      className="p-1 hover:bg-gray-100 rounded-full text-gray-600 transition-all mr-2"
                      onClick={() => setShowExpenseForm(false)}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="font-sans font-bold text-lg text-gray-900">
                      Log Business Expense
                    </h2>
                  </div>

                  <div className="space-y-4 flex-1">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Confirm the deduction of <span className="font-bold text-red-600">{formatCurrency(totalDue)}</span>. This will deduct from actual gross sales and net profit.
                    </p>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Expense Category / Description</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Fuel, Transport, Rent, Salaries, General"
                        value={expenseDescription}
                        onChange={(e) => setExpenseDescription(e.target.value)}
                        className="w-full h-11 border border-gray-200 rounded-xl px-3 focus:outline-hidden focus:border-[#0f5132] focus:ring-1 focus:ring-[#0f5132] font-sans text-xs bg-gray-50/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Quick Suggestions</label>
                      <div className="flex flex-wrap gap-2">
                        {['Fuel', 'Transport', 'Rent', 'Salaries', 'Restock', 'Refreshments', 'Utility Bill', 'General'].map((item) => (
                          <button
                            type="button"
                            key={item}
                            onClick={() => setExpenseDescription(item)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              expenseDescription.toLowerCase() === item.toLowerCase()
                                ? 'bg-red-50 text-red-600 border-red-200 font-bold'
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-sans font-bold text-xs rounded-xl transition-all text-center"
                      onClick={() => setShowExpenseForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-2 py-3 bg-red-600 hover:bg-red-700 text-white font-sans font-bold text-xs rounded-xl shadow-md transition-all text-center uppercase"
                    >
                      Deduct Expense: {formatCurrency(totalDue)}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col h-full">
                  {showAddDebtorForm ? (
                    <form onSubmit={handleCreateAndChargeDebtor} className="flex flex-col h-full">
                      <div className="flex items-center mb-4">
                        <button
                          type="button"
                          className="p-1 hover:bg-gray-100 rounded-full text-gray-600 transition-all mr-2"
                          onClick={() => setShowAddDebtorForm(false)}
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h2 className="font-sans font-bold text-lg text-gray-900">
                          Add &amp; Charge New Debtor
                        </h2>
                      </div>

                      <div className="space-y-4 flex-1">
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Enter details to create a new customer account and immediately charge <span className="font-bold text-red-600">{formatCurrency(totalDue)}</span> to their Nkongole ledger.
                        </p>
                        
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Mwansa Mwape"
                            value={newDebtorName}
                            onChange={(e) => setNewDebtorName(e.target.value)}
                            className="w-full h-11 border border-gray-200 rounded-xl px-3 focus:outline-hidden focus:border-[#0f5132] focus:ring-1 focus:ring-[#0f5132] font-sans text-xs bg-gray-50/50"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Phone Number</label>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. 097 000 0000"
                            value={newDebtorPhone}
                            onChange={(e) => setNewDebtorPhone(e.target.value)}
                            className="w-full h-11 border border-gray-200 rounded-xl px-3 focus:outline-hidden focus:border-[#0f5132] focus:ring-1 focus:ring-[#0f5132] font-sans text-xs bg-gray-50/50"
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex gap-3">
                        <button
                          type="button"
                          className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-sans font-bold text-xs rounded-xl transition-all text-center"
                          onClick={() => setShowAddDebtorForm(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-2 py-3 bg-[#0f5132] hover:bg-[#072a1a] text-white font-sans font-bold text-xs rounded-xl shadow-md transition-all text-center"
                        >
                          CREATE &amp; CHARGE
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <button
                            className="p-1 hover:bg-gray-100 rounded-full text-gray-600 transition-all mr-2"
                            onClick={() => setShowDebtorSelectSheet(false)}
                          >
                            <ArrowLeft className="w-5 h-5" />
                          </button>
                          <h2 className="font-sans font-bold text-lg text-gray-900">
                            Charge Nkongole Debt
                          </h2>
                        </div>
                        <button
                          className="px-3 py-1 bg-[#0f5132]/10 text-[#0f5132] font-sans font-bold text-xs rounded-lg border border-[#0f5132]/20 hover:bg-[#0f5132]/15 active:scale-95 transition-all"
                          onClick={() => {
                            const query = debtorSearchQuery.trim();
                            const isNumeric = /^\d+$/.test(query.replace(/\s+/g, ''));
                            if (isNumeric) {
                              setNewDebtorPhone(query);
                              setNewDebtorName('');
                            } else {
                              setNewDebtorName(query);
                              setNewDebtorPhone('');
                            }
                            setShowAddDebtorForm(true);
                          }}
                        >
                          + New Debtor
                        </button>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                          Please select the customer ledger who is purchasing this on Nkongole (credit). This will increase their outstanding balance by <span className="font-bold text-red-600">{formatCurrency(totalDue)}</span>.
                        </p>
                        <input
                          type="text"
                          placeholder="Search debtor by name or phone..."
                          value={debtorSearchQuery}
                          onChange={(e) => setDebtorSearchQuery(e.target.value)}
                          className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#0f5132] focus:ring-1 focus:ring-[#0f5132]"
                        />
                      </div>

                      {/* Debtors List */}
                      <div className="flex-1 overflow-y-auto max-h-[250px] flex flex-col gap-2 pr-1 hide-scrollbar">
                        {filteredDebtors.length === 0 ? (
                          <div className="text-center py-8 text-gray-400 text-xs">
                            <p className="mb-3">No debtors found matching "{debtorSearchQuery}".</p>
                            <button 
                              className="px-4 py-2 bg-[#0f5132] hover:bg-[#083520] text-white rounded-xl font-bold transition-all text-xs active:scale-95 shadow-sm"
                              onClick={() => {
                                const query = debtorSearchQuery.trim();
                                const isNumeric = /^\d+$/.test(query.replace(/\s+/g, ''));
                                if (isNumeric) {
                                  setNewDebtorPhone(query);
                                  setNewDebtorName('');
                                } else {
                                  setNewDebtorName(query);
                                  setNewDebtorPhone('');
                                }
                                setShowAddDebtorForm(true);
                              }}
                            >
                              + Create &amp; Charge "{debtorSearchQuery || 'New Debtor'}"
                            </button>
                          </div>
                        ) : (
                          filteredDebtors.map((debtor) => (
                            <div
                              key={debtor.id}
                              className="p-3 bg-gray-50 hover:bg-[#0f5132]/5 rounded-xl border border-gray-150 flex items-center justify-between cursor-pointer transition-all active:scale-98"
                              onClick={() => handleSelectDebtor(debtor)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#0f5132]/10 text-[#0f5132] font-sans font-extrabold flex items-center justify-center text-xs">
                                  {debtor.initials}
                                </div>
                                <div>
                                  <h4 className="font-sans font-bold text-sm text-gray-900 leading-tight">
                                    {debtor.name}
                                  </h4>
                                  <p className="text-[11px] text-gray-400">{debtor.phone}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-sans font-bold text-xs text-orange-600">
                                  Owes: {formatCurrency(debtor.outstanding)}
                                </p>
                                <p className="text-[9px] text-gray-400">Days active: {debtor.daysActive}d</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <button
                        className="w-full mt-4 py-2.5 font-sans font-bold text-xs bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-all"
                        onClick={() => setShowDebtorSelectSheet(false)}
                      >
                        Go Back
                      </button>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Animation Notification Overlay */}
      <AnimatePresence>
        {successAnim && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="absolute inset-x-4 top-20 z-[150] bg-white border-2 border-[#0f5132] rounded-2xl shadow-2xl p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <p className="font-sans font-extrabold text-sm text-[#0f5132] leading-tight">
                Sale Recorded
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{successAnim}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BarcodeScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onScan={handleBarcodeScanInSales}
        products={products}
        title="Sales Cashier Scanner"
      />
    </div>
  );
}
