import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  Search, 
  Scan, 
  MoreVertical, 
  Plus, 
  X, 
  Package, 
  AlertTriangle, 
  Check, 
  ArrowRight,
  TrendingUp,
  Tag,
  Coins,
  ShoppingCart,
  Layers,
  Percent,
  Receipt,
  Info,
  Bell
} from 'lucide-react';
import { Product, Sale } from '../types';
import { formatCurrency, checkStockLevel } from '../domain/entities';
import BineLogo from './BineLogo';
import BarcodeScannerModal from './BarcodeScannerModal';

interface InventoryTabProps {
  products: Product[];
  addProduct: (
    name: string,
    category: string,
    costPrice: number,
    sellingPrice: number,
    initialStock: number,
    barcode?: string,
    unit?: string
  ) => boolean;
  addStock: (productId: string, quantity: number) => void;
  onNavigateToTab: (tab: string) => void;
  sales: Sale[];
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  onOpenSidebar?: () => void;
}

export default function InventoryTab({ 
  products, 
  addProduct, 
  addStock, 
  onNavigateToTab, 
  sales,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  onOpenSidebar
}: InventoryTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [showAddProductSheet, setShowAddProductSheet] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [scannerAlert, setScannerAlert] = useState<string | null>(null);

  // New product form states
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('General');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [newProdCostPrice, setNewProdCostPrice] = useState('');
  const [newProdSellingPrice, setNewProdSellingPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('');
  const [newProdBarcode, setNewProdBarcode] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('pcs');

  // Add stock state
  const [stockToAdd, setStockToAdd] = useState('');
  const [showScannerModal, setShowScannerModal] = useState(false);

  const handleBarcodeScanInInventory = (code: string) => {
    // 1. If Add Product Sheet is open, prefill its barcode input!
    if (showAddProductSheet) {
      setNewProdBarcode(code);
      setScannerAlert(`Barcode prefilled: ${code}`);
      setTimeout(() => setScannerAlert(null), 3000);
      setShowScannerModal(false);
      return;
    }

    // 2. Search for a product with this barcode
    const foundProduct = products.find(p => p.barcode === code);
    if (foundProduct) {
      setSearchQuery(code);
      setSelectedProduct(foundProduct);
      setScannerAlert(`Found product: ${foundProduct.name}`);
      setTimeout(() => setScannerAlert(null), 3500);
    } else {
      // 3. Open Add Product sheet with prefilled barcode!
      setNewProdBarcode(code);
      setNewProdName('');
      setShowAddProductSheet(true);
      setScannerAlert(`Barcode "${code}" not registered. Fill details to add product!`);
      setTimeout(() => setScannerAlert(null), 4500);
    }
    setShowScannerModal(false);
  };

  // Get unique categories from current product database
  const uniqueCategories = useMemo(() => {
    const categories = products.map(p => p.category).filter(Boolean);
    // Unique list preserving original casing
    const unique: string[] = [];
    const seen = new Set<string>();
    categories.forEach(cat => {
      const lower = cat.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        unique.push(cat);
      }
    });
    return unique;
  }, [products]);

  // Combined dropdown list of standard defaults + existing custom categories
  const categoryOptions = useMemo(() => {
    const defaults = uniqueCategories.length === 0 ? ['General'] : [];
    const uniqueOptions = [...defaults];
    uniqueCategories.forEach(cat => {
      if (!uniqueOptions.some(opt => opt.toLowerCase() === cat.toLowerCase())) {
        uniqueOptions.push(cat);
      }
    });
    return uniqueOptions;
  }, [uniqueCategories]);

  const filterChips = useMemo(() => {
    return ['All', 'Low Stock', 'Out of Stock', ...uniqueCategories];
  }, [uniqueCategories]);

  // Filtering Logic
  const filteredProducts = products.filter((p) => {
    // 1. Filter by search query
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery));

    if (!matchesSearch) return false;

    // 2. Filter by status chips
    const stockStatus = checkStockLevel(p);
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Low Stock') return stockStatus === 'low_stock';
    if (selectedFilter === 'Out of Stock') return stockStatus === 'out_of_stock';
    
    // Otherwise filter by category
    return p.category.toLowerCase() === selectedFilter.toLowerCase();
  });

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdCostPrice || !newProdSellingPrice || !newProdStock) {
      alert('Please fill in all required fields.');
      return;
    }

    const finalCategory = newProdCategory === '__custom__' ? customCategoryName.trim() : newProdCategory;
    if (newProdCategory === '__custom__' && !customCategoryName.trim()) {
      alert('Please enter a valid custom category name.');
      return;
    }

    const isNew = addProduct(
      newProdName,
      finalCategory,
      parseFloat(newProdCostPrice),
      parseFloat(newProdSellingPrice),
      parseInt(newProdStock),
      newProdBarcode || undefined,
      newProdUnit || 'pcs'
    );

    // Reset Form & Close
    setNewProdName('');
    setNewProdCategory('General');
    setCustomCategoryName('');
    setNewProdCostPrice('');
    setNewProdSellingPrice('');
    setNewProdStock('');
    setNewProdBarcode('');
    setNewProdUnit('pcs');
    setShowAddProductSheet(false);

    // Show quick alert depending on if it was newly created or merged
    if (isNew) {
      setScannerAlert('New product saved successfully!');
    } else {
      setScannerAlert('Identical product found! Stock merged successfully.');
    }
    setTimeout(() => setScannerAlert(null), 3000);
  };

  const triggerMockScanner = () => {
    const mockBarcode = Math.floor(6000000000000 + Math.random() * 999999999999).toString();
    setNewProdBarcode(mockBarcode);
    setScannerAlert(`Barcode Scanned: ${mockBarcode}`);
    setTimeout(() => setScannerAlert(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full bg-surface relative">
      {/* Top AppBar */}
      <header className="bg-white sticky top-0 z-20 w-full h-14 border-b border-gray-100 flex justify-between items-center px-4 shrink-0 shadow-xs">
        <div className="flex items-center gap-4">
          <Menu className="w-6 h-6 text-[#003820] cursor-pointer hover:opacity-85 transition-opacity" onClick={onOpenSidebar} />
          <BineLogo className="h-7 w-auto" />
        </div>
        <div className="flex items-center gap-2.5">
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

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-28 space-y-5">
        {/* Search & Filter Section */}
        <section className="space-y-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products by name or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-12 rounded-2xl border border-gray-200 bg-white focus:outline-hidden focus:border-[#0f5132] focus:ring-1 focus:ring-[#0f5132] transition-all font-sans text-sm"
            />
            <button 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#003820] hover:bg-gray-100 p-1.5 rounded-full transition-all"
              onClick={() => setShowScannerModal(true)}
            >
              <Scan className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {filterChips.map((chip) => (
              <button
                key={chip}
                className={`flex-none px-4 py-1.5 rounded-full font-sans text-xs font-bold transition-all border ${
                  selectedFilter === chip
                    ? 'bg-[#003820] border-[#003820] text-white'
                    : chip === 'Low Stock'
                    ? 'bg-orange-50 border-orange-200 text-orange-600'
                    : chip === 'Out of Stock'
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedFilter(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        </section>

        {/* Product List */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-sans font-bold text-lg text-gray-900">Inventory List</h2>
            {filteredProducts.length > 0 && searchQuery.trim() && (
              <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider bg-gray-100 px-2.5 py-1 rounded-full">
                {filteredProducts.length} matched
              </span>
            )}
          </div>

          {searchQuery.trim() && (
            <div className="bg-[#003820]/5 rounded-2xl p-3.5 border border-[#003820]/15 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#003820]/10 flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5 text-[#003820]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-800 font-extrabold leading-tight">
                    Add custom item
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium truncate mt-0.5">
                    Create <span className="font-extrabold text-[#003820]">"{searchQuery}"</span> as a new product in the inventory
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const query = searchQuery.trim();
                  const isNumeric = /^\d+$/.test(query);
                  if (isNumeric) {
                    setNewProdBarcode(query);
                    setNewProdName('');
                  } else {
                    setNewProdName(query);
                    setNewProdBarcode('');
                  }
                  setShowAddProductSheet(true);
                }}
                className="bg-[#003820] hover:bg-[#072d1c] text-white text-xs font-extrabold px-4 h-9 rounded-xl transition-all shrink-0 active:scale-95 shadow-xs flex items-center justify-center cursor-pointer"
              >
                Create
              </button>
            </div>
          )}
          
          <div className="flex flex-col gap-2.5">
            {filteredProducts.length === 0 ? (
              <div className="py-12 bg-white rounded-2xl border border-gray-100 text-center flex flex-col items-center justify-center text-gray-400 px-6">
                <Package className="w-14 h-14 mb-2 stroke-1 text-gray-300" />
                <p className="text-sm font-sans mb-3.5">No products match your filters</p>
                {searchQuery.trim() && (
                  <button
                    onClick={() => {
                      const query = searchQuery.trim();
                      const isNumeric = /^\d+$/.test(query);
                      if (isNumeric) {
                        setNewProdBarcode(query);
                        setNewProdName('');
                      } else {
                        setNewProdName(query);
                        setNewProdBarcode('');
                      }
                      setShowAddProductSheet(true);
                    }}
                    className="px-4.5 py-2.5 bg-[#003820] text-white text-xs font-extrabold rounded-xl shadow-md hover:bg-[#072d1c] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add "{searchQuery}" as New Product
                  </button>
                )}
              </div>
            ) : (
              filteredProducts.map((p) => {
                const stockStatus = checkStockLevel(p);
                
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className={`bg-white p-3 rounded-xl shadow-xs border flex items-center justify-between gap-3 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer ${
                      stockStatus === 'out_of_stock'
                        ? 'border-red-100 bg-red-50/10'
                        : stockStatus === 'low_stock'
                        ? 'border-orange-100 bg-orange-50/10'
                        : 'border-gray-150'
                    }`}
                  >
                    {/* Left: Product identification */}
                    <div className="flex-1 min-w-0 pr-1">
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
                      <p className="text-[9px] text-gray-400 mt-0.5 leading-none font-medium">
                        Cost: {formatCurrency(p.costPrice)}
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
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>

      {/* FAB to add product */}
      <button
        id="fab-add-product"
        className="fixed bottom-20 right-4 w-14 h-14 bg-[#003820] hover:bg-[#072d1c] text-white rounded-2xl shadow-xl flex items-center justify-center z-30 active:scale-90 transition-all cursor-pointer border border-green-800"
        onClick={() => setShowAddProductSheet(true)}
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Add Product Bottom Sheet */}
      <AnimatePresence>
        {showAddProductSheet && (
          <>
            {/* Backdrop Scrim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 z-[100] backdrop-blur-xs"
              onClick={() => setShowAddProductSheet(false)}
            />

            {/* Sheet Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[110] px-4 pt-3 pb-8 max-h-[90%] overflow-y-auto shadow-2xl flex flex-col"
            >
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4 shrink-0" />
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-sans font-extrabold text-xl text-[#003820]">
                  Add Product
                </h2>
                <button
                  className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all"
                  onClick={() => setShowAddProductSheet(false)}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-sans text-xs font-bold text-gray-700 block">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Castle Lager 330ml"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full h-11 border border-gray-200 rounded-xl px-4 focus:outline-hidden focus:border-[#0f5132] focus:ring-1 focus:ring-[#0f5132] font-sans text-sm bg-gray-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-xs font-bold text-gray-700 block">
                    Category
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full h-11 border border-gray-200 rounded-xl px-4 focus:outline-hidden focus:border-[#0f5132] focus:ring-1 focus:ring-[#0f5132] font-sans text-sm bg-gray-50/50"
                  >
                    {categoryOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                    <option value="__custom__">+ Add Custom Category...</option>
                  </select>
                </div>

                {newProdCategory === '__custom__' && (
                  <div className="space-y-1 animate-fadeIn">
                    <label className="font-sans text-xs font-bold text-[#0f5132] block">
                      Custom Category Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cosmetics, Hardware, Pharmacy"
                      value={customCategoryName}
                      onChange={(e) => setCustomCategoryName(e.target.value)}
                      className="w-full h-11 border border-[#0f5132] rounded-xl px-4 focus:outline-hidden focus:ring-1 focus:ring-[#0f5132] font-sans text-sm bg-white"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-sans text-xs font-bold text-gray-700 block">
                      Cost Price (K)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={newProdCostPrice}
                      onChange={(e) => setNewProdCostPrice(e.target.value)}
                      className="w-full h-11 border border-gray-200 rounded-xl px-4 focus:outline-hidden focus:border-[#0f5132] focus:ring-1 focus:ring-[#0f5132] font-sans text-sm bg-gray-50/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-sans text-xs font-bold text-gray-700 block">
                      Selling Price (K)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={newProdSellingPrice}
                      onChange={(e) => setNewProdSellingPrice(e.target.value)}
                      className="w-full h-11 border border-gray-200 rounded-xl px-4 focus:outline-hidden focus:border-[#0f5132] focus:ring-1 focus:ring-[#0f5132] font-sans text-sm bg-gray-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-sans text-xs font-bold text-gray-700 block">
                      Initial Stock
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="Quantity"
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(e.target.value)}
                      className="w-full h-11 border border-gray-200 rounded-xl px-4 focus:outline-hidden focus:border-[#0f5132] focus:ring-1 focus:ring-[#0f5132] font-sans text-sm bg-gray-50/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-sans text-xs font-bold text-gray-700 block">
                      Stock Unit
                    </label>
                    <select
                      value={newProdUnit}
                      onChange={(e) => setNewProdUnit(e.target.value)}
                      className="w-full h-11 border border-gray-200 rounded-xl px-4 focus:outline-hidden focus:border-[#0f5132] focus:ring-1 focus:ring-[#0f5132] font-sans text-sm bg-gray-50/50"
                    >
                      <option value="pcs">Pieces (pcs)</option>
                      <option value="bottles">Bottles</option>
                      <option value="bags">Bags</option>
                      <option value="boxes">Boxes</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="packs">Packs</option>
                      <option value="cans">Cans</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-xs font-bold text-gray-700 block">
                    Barcode (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 600XXXXXXXX"
                    value={newProdBarcode}
                    onChange={(e) => setNewProdBarcode(e.target.value)}
                    className="w-full h-11 border border-gray-200 rounded-xl px-4 focus:outline-hidden focus:border-[#0f5132] focus:ring-1 focus:ring-[#0f5132] font-sans text-sm bg-gray-50/50"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowScannerModal(true)}
                  className="w-full h-11 border-2 border-dashed border-[#003820] rounded-xl flex items-center justify-center gap-2 text-[#003820] font-sans font-bold text-xs hover:bg-[#003820]/5 active:scale-98 transition-all"
                >
                  <Scan className="w-4 h-4" />
                  Scan with Camera
                </button>

                <button
                  type="submit"
                  className="w-full h-12 bg-[#003820] hover:bg-[#042114] text-white rounded-xl font-sans font-bold text-sm shadow-md active:scale-95 transition-all mt-6"
                >
                  Save Product
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Detail Popup Dialog */}
      <AnimatePresence>
        {selectedProduct && (() => {
          const p = products.find(prod => prod.id === selectedProduct.id) || selectedProduct;
          const stockStatus = checkStockLevel(p);
          
          // Calculate stats
          const soldUnits = sales.reduce((acc, sale) => {
            const item = sale.items.find(it => it.productId === p.id);
            return acc + (item ? item.quantity : 0);
          }, 0);
          
          const totalStock = p.remaining + soldUnits;
          const unitProfit = p.sellingPrice - p.costPrice;
          const totalRevenue = soldUnits * p.sellingPrice;
          const totalCost = soldUnits * p.costPrice;
          const totalProfit = soldUnits * unitProfit;
          const marginPercentage = p.sellingPrice > 0 ? ((unitProfit / p.sellingPrice) * 100).toFixed(1) : '0';
          
          // Find related sales history for this product
          const productSales = sales.filter(sale => 
            sale.items.some(item => item.productId === p.id)
          ).map(sale => {
            const item = sale.items.find(it => it.productId === p.id);
            return {
              id: sale.id,
              invoiceNumber: sale.invoiceNumber,
              date: sale.date,
              time: sale.time,
              quantity: item ? item.quantity : 0,
              paymentMethod: sale.paymentMethod,
              amount: item ? item.quantity * item.sellingPrice : 0
            };
          });

          return (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 z-[100] backdrop-blur-xs"
                onClick={() => setSelectedProduct(null)}
              />

              {/* Sheet Container */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[110] px-4 pt-3 pb-8 max-h-[85%] overflow-y-auto shadow-2xl flex flex-col font-sans"
              >
                <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4 shrink-0" />
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="font-sans font-extrabold text-lg text-gray-950 leading-tight">
                      {p.name}
                    </h2>
                    <div className="flex gap-2 items-center mt-1.5">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#0f5132]/15 text-[#0f5132] uppercase tracking-wider">
                        {p.category}
                      </span>
                      {p.barcode && (
                        <span className="font-mono text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          Barcode: {p.barcode}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all shrink-0"
                    onClick={() => setSelectedProduct(null)}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Stock Metrics Row */}
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-150">
                    <h3 className="font-sans text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-gray-400" /> Stock Level & Units
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-2 text-center mb-3.5">
                      <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Remaining</p>
                        <p className={`font-sans font-extrabold text-sm mt-1 truncate ${
                          stockStatus === 'out_of_stock' ? 'text-red-600' : stockStatus === 'low_stock' ? 'text-orange-500' : 'text-[#0f5132]'
                        }`}>
                          {p.remaining} {p.unit || 'pcs'}
                        </p>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Sold Units</p>
                        <p className="font-sans font-extrabold text-sm text-gray-800 mt-1 truncate">
                          {soldUnits} {p.unit || 'pcs'}
                        </p>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Total Stock</p>
                        <p className="font-sans font-extrabold text-sm text-gray-500 mt-1 truncate">
                          {totalStock} {p.unit || 'pcs'}
                        </p>
                      </div>
                    </div>

                    {/* Stock Proportion Bar */}
                    {totalStock > 0 ? (
                      <div className="space-y-1.5">
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden flex">
                          <div 
                            style={{ width: `${(p.remaining / totalStock) * 100}%` }} 
                            className={`h-full ${
                              stockStatus === 'out_of_stock' ? 'bg-red-500' : stockStatus === 'low_stock' ? 'bg-orange-500' : 'bg-[#0f5132]'
                            }`}
                          />
                          <div 
                            style={{ width: `${(soldUnits / totalStock) * 100}%` }} 
                            className="h-full bg-blue-500"
                          />
                        </div>
                        <div className="flex justify-between text-[9px] font-bold text-gray-400 px-0.5">
                          <span className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${stockStatus === 'out_of_stock' ? 'bg-red-500' : stockStatus === 'low_stock' ? 'bg-orange-500' : 'bg-[#0f5132]'}`} />
                            {((p.remaining / totalStock) * 100).toFixed(0)}% Left
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            {((soldUnits / totalStock) * 100).toFixed(0)}% Sold
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-400 text-center py-1 italic">
                        No stock records found
                      </p>
                    )}
                  </div>

                  {/* Pricing and Margins Card */}
                  <div className="bg-white rounded-2xl p-4 border border-gray-150 grid grid-cols-2 gap-4">
                    <div className="space-y-3 border-r border-gray-100 pr-2">
                      <h4 className="font-sans text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                        Unit Margins
                      </h4>
                      <div className="space-y-1.5">
                        <div className="text-xs font-medium text-gray-500 flex justify-between">
                          <span>Cost Price:</span>
                          <span className="font-bold text-gray-700">{formatCurrency(p.costPrice)}</span>
                        </div>
                        <div className="text-xs font-medium text-gray-500 flex justify-between">
                          <span>Selling Price:</span>
                          <span className="font-bold text-[#0f5132]">{formatCurrency(p.sellingPrice)}</span>
                        </div>
                        <div className="text-xs font-bold text-gray-800 flex justify-between border-t border-gray-50 pt-1.5">
                          <span className="flex items-center gap-1 text-gray-500"><Coins className="w-3.5 h-3.5 text-green-600" /> Profit/Unit:</span>
                          <span className="text-green-700">+{formatCurrency(unitProfit)}</span>
                        </div>
                        <div className="text-[10px] font-extrabold text-gray-400 text-right uppercase tracking-wider flex justify-between items-center">
                          <span className="flex items-center gap-1 font-bold text-gray-500"><Percent className="w-3.5 h-3.5 text-blue-500" /> Margin:</span>
                          <span className="text-blue-600">{marginPercentage}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pl-2">
                      <h4 className="font-sans text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                        Total Performance
                      </h4>
                      <div className="space-y-1.5">
                        <div className="text-xs font-medium text-gray-500 flex justify-between">
                          <span>Total Revenue:</span>
                          <span className="font-bold text-gray-800">{formatCurrency(totalRevenue)}</span>
                        </div>
                        <div className="text-xs font-medium text-gray-500 flex justify-between">
                          <span>Total Cost:</span>
                          <span className="font-bold text-gray-600">{formatCurrency(totalCost)}</span>
                        </div>
                        <div className="text-xs font-bold text-gray-900 flex justify-between border-t border-gray-50 pt-1.5">
                          <span className="flex items-center gap-1 text-gray-500"><TrendingUp className="w-3.5 h-3.5 text-[#003820]" /> Net Profit:</span>
                          <span className="text-green-700">+{formatCurrency(totalProfit)}</span>
                        </div>
                        <p className="text-[10px] font-medium text-gray-400 text-right leading-tight italic pt-0.5">
                          Calculated for {soldUnits} sold units
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Restock Panel */}
                  <div className="bg-[#003820]/5 rounded-2xl p-4 border border-[#003820]/15">
                    <h3 className="font-sans text-[10px] font-extrabold text-[#003820] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-[#003820]" /> Restock Inventory
                    </h3>
                    <p className="text-[11px] text-gray-500 font-medium mb-3">
                      Add newly arrived stock batches to this product's current inventory.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder={`Quantity to add (${p.unit || 'pcs'})`}
                        value={stockToAdd}
                        onChange={(e) => setStockToAdd(e.target.value)}
                        className="flex-1 h-11 border border-gray-200 rounded-xl px-3.5 focus:outline-hidden focus:border-[#0f5132] focus:ring-1 focus:ring-[#0f5132] font-sans text-xs bg-white"
                        min="1"
                      />
                      <button
                        onClick={() => {
                          const qty = parseInt(stockToAdd);
                          if (qty > 0) {
                            addStock(p.id, qty);
                            setStockToAdd('');
                            // Show quick toast notification using our existing overlay
                            setScannerAlert(`Successfully added +${qty} ${p.unit || 'pcs'} to ${p.name}`);
                          }
                        }}
                        disabled={!stockToAdd || parseInt(stockToAdd) <= 0}
                        className="h-11 bg-[#003820] hover:bg-[#042114] disabled:bg-gray-200 disabled:text-gray-400 text-white px-5 rounded-xl font-sans font-extrabold text-xs transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Stock
                      </button>
                    </div>
                  </div>

                  {/* Related Sales History */}
                  <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-sans text-[10px] font-extrabold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-gray-400" /> Sales Log ({productSales.length})
                      </h3>
                      <span className="text-[10px] font-extrabold text-[#0f5132] bg-[#0f5132]/5 px-2 py-0.5 rounded-full">
                        Recent Purchases
                      </span>
                    </div>

                    <div className="max-h-40 overflow-y-auto divide-y divide-gray-100">
                      {productSales.length === 0 ? (
                        <div className="py-8 text-center text-gray-400 text-xs italic font-medium">
                          No sales recorded for this product yet
                        </div>
                      ) : (
                        productSales.map((sale) => (
                          <div key={sale.id} className="px-4 py-2.5 flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-gray-800 font-mono">
                                {sale.invoiceNumber}
                              </p>
                              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                                {sale.date} • {sale.time}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-extrabold text-gray-900">
                                {sale.quantity} x {formatCurrency(p.sellingPrice)}
                              </p>
                              <p className="text-[9px] text-[#0f5132] font-extrabold mt-0.5">
                                Total: {formatCurrency(sale.amount)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* Mock Scanning Alert Overlay */}
      <AnimatePresence>
        {scannerAlert && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 inset-x-4 z-[150] bg-gray-900 text-white rounded-xl py-2 px-4 shadow-xl flex items-center justify-between border border-gray-800 text-xs font-mono"
          >
            <span>{scannerAlert}</span>
            <X className="w-4 h-4 text-gray-400 cursor-pointer" onClick={() => setScannerAlert(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      <BarcodeScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onScan={handleBarcodeScanInInventory}
        products={products}
        title="Inventory Barcode Scanner"
      />
    </div>
  );
}
