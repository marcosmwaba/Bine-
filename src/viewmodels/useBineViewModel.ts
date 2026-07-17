import { useState, useEffect } from 'react';
import { Product, Debtor, Sale, Settings, DebtTransaction, AppNotification } from '../types';
import { repository } from '../data/repositories';
import { generateInvoiceNumber, getFormattedDate, getFormattedTime } from '../domain/entities';

export function useBineViewModel() {
  // --- Data States ---
  const [products, setProducts] = useState<Product[]>([]);
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<Settings>({
    businessName: '',
    mobileMoneyNumber: '',
    ownerName: '',
    darkMode: false,
    localSmsScraper: true
  });

  // Load Initial Data on Mount
  useEffect(() => {
    const RESET_KEY = 'bine_pos_pristine_reset_v4';
    if (!localStorage.getItem(RESET_KEY)) {
      localStorage.removeItem('bine_pos_products');
      localStorage.removeItem('bine_pos_debtors');
      localStorage.removeItem('bine_pos_sales');
      localStorage.removeItem('bine_pos_notifications');
      localStorage.setItem(RESET_KEY, 'true');
    }

    let initialProducts = repository.getProducts();
    let initialDebtors = repository.getDebtors();
    let initialSales = repository.getSales();

    // Clean up residual mock data from localStorage
    const mockProductIds = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9'];
    const mockDebtorIds = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10', 'd11', 'd12', 'd13', 'd14'];
    const mockSaleIds = ['s1', 's2', 's3', 's4'];

    const hasMockProducts = initialProducts.some(p => mockProductIds.includes(p.id));
    const hasMockDebtors = initialDebtors.some(d => mockDebtorIds.includes(d.id));
    const hasMockSales = initialSales.some(s => mockSaleIds.includes(s.id));

    if (hasMockProducts || hasMockDebtors || hasMockSales) {
      initialProducts = initialProducts.filter(p => !mockProductIds.includes(p.id));
      initialDebtors = initialDebtors.filter(d => !mockDebtorIds.includes(d.id));
      initialSales = initialSales.filter(s => !mockSaleIds.includes(s.id));

      repository.saveProducts(initialProducts);
      repository.saveDebtors(initialDebtors);
      repository.saveSales(initialSales);
    }

    setProducts(initialProducts);
    setDebtors(initialDebtors);
    setSales(initialSales);
    setNotifications(repository.getNotifications());
    setSettings(repository.getSettings());
  }, []);

  // Save to repositories when states change
  const updateProductsState = (newProducts: Product[]) => {
    setProducts(newProducts);
    repository.saveProducts(newProducts);
  };

  const updateDebtorsState = (newDebtors: Debtor[]) => {
    setDebtors(newDebtors);
    repository.saveDebtors(newDebtors);
  };

  const updateSalesState = (newSales: Sale[]) => {
    setSales(newSales);
    repository.saveSales(newSales);
  };

  const updateNotificationsState = (newNotifications: AppNotification[]) => {
    setNotifications(newNotifications);
    repository.saveNotifications(newNotifications);
  };

  const addNotification = (title: string, message: string, type: 'sale' | 'repayment' | 'debtor' | 'restock' | 'info') => {
    const newNotif: AppNotification = {
      id: `n_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      title,
      message,
      time: getFormattedTime(),
      type,
      read: false
    };
    const currentNotifs = repository.getNotifications();
    updateNotificationsState([newNotif, ...currentNotifs]);
  };

  const markNotificationAsRead = (id: string) => {
    const currentNotifs = repository.getNotifications();
    const updated = currentNotifs.map(n => n.id === id ? { ...n, read: true } : n);
    updateNotificationsState(updated);
  };

  const markAllNotificationsAsRead = () => {
    const currentNotifs = repository.getNotifications();
    const updated = currentNotifs.map(n => ({ ...n, read: true }));
    updateNotificationsState(updated);
  };

  const clearAllNotifications = () => {
    updateNotificationsState([]);
  };

  const updateSettingsState = (newSettings: Settings) => {
    setSettings(newSettings);
    repository.saveSettings(newSettings);
    
    // Apply dark mode class to document element
    if (newSettings.darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  // --- 1. Cashier / Sales Terminal State & Operations ---
  const [cashierAmount, setCashierAmount] = useState<string>('0');
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<string>('General');
  const [cartItems, setCartItems] = useState<{ product: Product; quantity: number }[]>([]);

  const pressNumpadKey = (key: string) => {
    setCashierAmount((prev) => {
      if (prev === '0') return key;
      if (prev.length >= 10) return prev;
      return prev + key;
    });
  };

  const deleteNumpadDigit = () => {
    setCashierAmount((prev) => {
      if (prev.length <= 1) return '0';
      return prev.slice(0, -1);
    });
  };

  const clearNumpadAmount = () => {
    setCashierAmount('0');
  };

  // Keep cart items capped at available product stock level if stock is updated in inventory
  useEffect(() => {
    if (cartItems.length === 0) return;
    let changed = false;
    const updatedCart = cartItems.map((item) => {
      const liveProduct = products.find((p) => p.id === item.product.id);
      if (!liveProduct) return item; // product was deleted or is custom
      
      let newQuantity = item.quantity;
      if (liveProduct.remaining <= 0) {
        changed = true;
        return null; // remove from cart as it is out of stock
      }
      if (item.quantity > liveProduct.remaining) {
        newQuantity = liveProduct.remaining;
        changed = true;
      }
      if (
        item.product.sellingPrice !== liveProduct.sellingPrice ||
        item.product.costPrice !== liveProduct.costPrice ||
        item.product.remaining !== liveProduct.remaining ||
        newQuantity !== item.quantity
      ) {
        changed = true;
        return {
          product: liveProduct,
          quantity: newQuantity
        };
      }
      return item;
    }).filter(Boolean) as { product: Product; quantity: number }[];

    if (changed) {
      setCartItems(updatedCart);
    }
  }, [products]);

  // Quick Catalog selection additions
  const addProductToCart = (product: Product) => {
    const liveProduct = products.find((p) => p.id === product.id) || product;
    if (liveProduct.remaining <= 0) return; // Out of stock
    
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === liveProduct.id);
      if (existing) {
        if (existing.quantity >= liveProduct.remaining) return prev; // Limit to stock
        return prev.map((item) =>
          item.product.id === liveProduct.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product: liveProduct, quantity: 1 }];
    });
  };

  const decrementProductInCart = (productId: string) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === productId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((item) => item.product.id !== productId);
      }
      return prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const removeProductFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Total checkout due amount
  const getCartTotal = () => {
    if (cartItems.length > 0) {
      return cartItems.reduce((acc, item) => acc + item.product.sellingPrice * item.quantity, 0);
    }
    return parseFloat(cashierAmount) || 0;
  };

  // Total checkout cost (for calculating profit)
  const getCartTotalCost = () => {
    if (cartItems.length > 0) {
      return cartItems.reduce((acc, item) => acc + item.product.costPrice * item.quantity, 0);
    }
    // For manual numpad amount, let's assume a standard 15% profit margin cost fallback
    const total = parseFloat(cashierAmount) || 0;
    return total * 0.85;
  };

  // Process a sale checkout
  const processCheckout = (
    paymentMethod: 'Cash' | 'Airtel Money' | 'MTN MoMo' | 'Nkongole (Debt)',
    debtorId?: string
  ): boolean => {
    const total = getCartTotal();
    if (total <= 0) return false;

    const totalCost = getCartTotalCost();
    const totalProfit = total - totalCost;

    // Build the items list
    const saleItems = cartItems.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      sellingPrice: item.product.sellingPrice,
      costPrice: item.product.costPrice
    }));

    // If no catalog items, simulate a quick numpad general sale item
    if (saleItems.length === 0) {
      saleItems.push({
        productId: 'quick-sale',
        productName: 'Quick Sale / Custom',
        quantity: 1,
        sellingPrice: total,
        costPrice: totalCost
      });
    }

    // 1. Handle Debt logic if paymentMethod is Nkongole
    if (paymentMethod === 'Nkongole (Debt)') {
      if (!debtorId) return false;
      const currentDebtors = repository.getDebtors();
      const debtor = currentDebtors.find((d) => d.id === debtorId);
      if (!debtor) return false;

      // Update Debtor details
      const newTransaction: DebtTransaction = {
        id: `t_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type: 'debt_increment',
        description: cartItems.length > 0
          ? `Purchase: ${cartItems.map(i => `${i.product.name} x${i.quantity}`).join(', ')}`
          : 'Quick Sale Debt',
        amount: total,
        date: getFormattedDate(),
        time: getFormattedTime()
      };

      const updatedDebtors = currentDebtors.map((d) => {
        if (d.id === debtorId) {
          return {
            ...d,
            outstanding: d.outstanding + total,
            transactions: [newTransaction, ...d.transactions]
          };
        }
        return d;
      });
      updateDebtorsState(updatedDebtors);
    }

    // 2. Reduce stock of actual catalog products sold
    if (cartItems.length > 0) {
      const updatedProducts = products.map((prod) => {
        const cartItem = cartItems.find((ci) => ci.product.id === prod.id);
        if (cartItem) {
          const newRemaining = Math.max(0, prod.remaining - cartItem.quantity);
          // If product went out of stock or became low stock, trigger a notification
          if (newRemaining === 0 && prod.remaining > 0) {
            setTimeout(() => {
              addNotification(
                'Product Out of Stock 🚨',
                `"${prod.name}" has completely run out of stock!`,
                'restock'
              );
            }, 100);
          } else if (newRemaining > 0 && newRemaining <= 5 && prod.remaining > 5) {
            setTimeout(() => {
              addNotification(
                'Low Stock Warning ⚠️',
                `"${prod.name}" is running low (${newRemaining} ${prod.unit || 'pcs'} left).`,
                'restock'
              );
            }, 100);
          }
          return {
            ...prod,
            remaining: newRemaining
          };
        }
        return prod;
      });
      updateProductsState(updatedProducts);
    }

    // 3. Save new Sale Transaction
    const newSale: Sale = {
      id: `s_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      invoiceNumber: generateInvoiceNumber(),
      items: saleItems,
      totalAmount: total,
      totalProfit: totalProfit,
      date: getFormattedDate(),
      time: getFormattedTime(),
      paymentMethod,
      debtorId
    };

    updateSalesState([newSale, ...sales]);

    // Add notification
    if (paymentMethod === 'Nkongole (Debt)' && debtorId) {
      const dbtr = repository.getDebtors().find(d => d.id === debtorId);
      if (dbtr) {
        addNotification(
          'Nkongole Charged',
          `K ${total.toFixed(2)} charged on credit to ${dbtr.name}'s account.`,
          'sale'
        );
      }
    } else {
      addNotification(
        'New Sale Completed',
        `K ${total.toFixed(2)} received via ${paymentMethod} (${saleItems.length} items).`,
        'sale'
      );
    }

    // Reset cashier input
    setCashierAmount('0');
    setCartItems([]);
    return true;
  };

  // --- 2. Inventory Operations ---
  const addProduct = (
    name: string,
    category: string,
    costPrice: number,
    sellingPrice: number,
    initialStock: number,
    barcode?: string,
    unit?: string
  ): boolean => {
    // Prevent duplicating identical items by checking name (case-insensitive) or same barcode
    const existingIndex = products.findIndex((prod) => {
      const sameName = prod.name.trim().toLowerCase() === name.trim().toLowerCase();
      const sameBarcode = barcode && prod.barcode && prod.barcode.trim() === barcode.trim();
      return sameName || sameBarcode;
    });

    if (existingIndex !== -1) {
      const existingProduct = products[existingIndex];
      const updatedProducts = [...products];
      const newStock = existingProduct.remaining + initialStock;

      updatedProducts[existingIndex] = {
        ...existingProduct,
        costPrice,
        sellingPrice,
        category,
        unit: unit || existingProduct.unit || 'pcs',
        remaining: newStock,
        barcode: barcode || existingProduct.barcode
      };

      updateProductsState(updatedProducts);
      addNotification(
        'Product Stock Merged',
        `Product "${existingProduct.name}" already exists. Added +${initialStock} to stock (New Total: ${newStock} ${unit || 'pcs'}).`,
        'restock'
      );
      return false; // Merged
    }

    const newProduct: Product = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name,
      category,
      costPrice,
      sellingPrice,
      remaining: initialStock,
      barcode: barcode || undefined,
      unit: unit || 'pcs'
    };
    updateProductsState([...products, newProduct]);
    addNotification(
      'Product Created',
      `New product "${name}" added to inventory with ${initialStock} ${unit || 'pcs'}.`,
      'restock'
    );
    return true; // Newly created
  };

  const addStock = (productId: string, quantity: number) => {
    let affectedProdName = '';
    let newBal = 0;
    const updatedProducts = products.map((prod) => {
      if (prod.id === productId) {
        affectedProdName = prod.name;
        newBal = prod.remaining + quantity;
        return {
          ...prod,
          remaining: newBal
        };
      }
      return prod;
    });
    updateProductsState(updatedProducts);
    if (affectedProdName) {
      addNotification(
        'Stock Added',
        `Restocked +${quantity} units of "${affectedProdName}". New balance: ${newBal}.`,
        'restock'
      );
    }
  };

  // --- 3. Debt (Nkongole) Operations ---
  const recordRepayment = (debtorId: string, amount: number, paymentMethod: string): Debtor | null => {
    const debtor = debtors.find((d) => d.id === debtorId);
    if (!debtor || amount <= 0) return null;

    const newTransaction: DebtTransaction = {
      id: `t_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: 'repayment',
      description: `Repayment (${paymentMethod})`,
      amount,
      date: getFormattedDate(),
      time: getFormattedTime()
    };

    let updatedDebtor: Debtor | null = null;

    const updatedDebtors = debtors.map((d) => {
      if (d.id === debtorId) {
        updatedDebtor = {
          ...d,
          outstanding: Math.max(0, d.outstanding - amount),
          transactions: [newTransaction, ...d.transactions]
        };
        return updatedDebtor;
      }
      return d;
    });

    updateDebtorsState(updatedDebtors);

    // Also record as a transaction in general sales log
    const repaymentSale: Sale = {
      id: `s_rep_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      invoiceNumber: generateInvoiceNumber(),
      items: [{
        productId: 'repayment',
        productName: `Nkongole Repayment (${debtor.name})`,
        quantity: 1,
        sellingPrice: amount,
        costPrice: 0 // Debt repayments have 100% margin relative to current flow
      }],
      totalAmount: amount,
      totalProfit: amount,
      date: getFormattedDate(),
      time: getFormattedTime(),
      paymentMethod: paymentMethod as any
    };
    updateSalesState([repaymentSale, ...sales]);

    addNotification(
      'Nkongole Repayment',
      `Received K ${amount.toFixed(2)} repayment from ${debtor.name} via ${paymentMethod}.`,
      'repayment'
    );

    return updatedDebtor;
  };

  const addNewDebtor = (name: string, phone: string, initialOutstanding: number): Debtor => {
    const names = name.split(/\s+/);
    const initials = names.map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const newDebtor: Debtor = {
      id: `d_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name,
      phone,
      outstanding: initialOutstanding,
      daysActive: 0,
      initials,
      transactions: initialOutstanding > 0 ? [
        {
          id: `t_init_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          type: 'debt_increment',
          description: 'Initial Active Debt Balance',
          amount: initialOutstanding,
          date: getFormattedDate(),
          time: getFormattedTime()
        }
      ] : []
    };

    const currentDebtors = repository.getDebtors();
    updateDebtorsState([newDebtor, ...currentDebtors]);

    addNotification(
      'New Debtor Ledger',
      `Created ledger for ${name} (${phone}) with K ${initialOutstanding.toFixed(2)} outstanding.`,
      'debtor'
    );

    return newDebtor;
  };

  const deleteDebtor = (debtorId: string) => {
    const debtor = debtors.find(d => d.id === debtorId);
    const updated = debtors.filter((d) => d.id !== debtorId);
    updateDebtorsState(updated);
    if (debtor) {
      addNotification(
        'Debtor Account Deleted',
        `Account for ${debtor.name} has been completely deleted.`,
        'debtor'
      );
    }
  };

  const clearPaidDebtors = () => {
    const paidCount = debtors.filter(d => d.outstanding <= 0).length;
    const updated = debtors.filter((d) => d.outstanding > 0);
    updateDebtorsState(updated);
    if (paidCount > 0) {
      addNotification(
        'Cleared Paid Debtors',
        `Purged ${paidCount} fully paid debtor ledger(s) from active logs.`,
        'debtor'
      );
    }
  };

  // --- 4. Analytics Calculations ---
  const getTotalNetProfit = (): number => {
    // If mock sales are present, show the seed profit base. Otherwise start from 0.00.
    const hasSeedSales = sales.some(s => s.id === 's1' || s.id === 's2' || s.id === 's3' || s.id === 's4');
    const seedProfit = hasSeedSales ? 14250.00 : 0.00;
    const newSales = hasSeedSales 
      ? sales.filter(s => !s.id.startsWith('s1') && !s.id.startsWith('s2') && !s.id.startsWith('s3') && !s.id.startsWith('s4'))
      : sales;
    const extraProfit = newSales.reduce((acc, s) => acc + s.totalProfit, 0);
    return seedProfit + extraProfit;
  };

  const getGrossSales = (): number => {
    // If mock sales are present, show the seed gross base. Otherwise start from 0.00.
    const hasSeedSales = sales.some(s => s.id === 's1' || s.id === 's2' || s.id === 's3' || s.id === 's4');
    const seedGross = hasSeedSales ? 32410.00 : 0.00;
    const newSales = hasSeedSales
      ? sales.filter(s => !s.id.startsWith('s1') && !s.id.startsWith('s2') && !s.id.startsWith('s3') && !s.id.startsWith('s4'))
      : sales;
    const extraGross = newSales.reduce((acc, s) => acc + s.totalAmount, 0);
    return seedGross + extraGross;
  };

  const getTotalTransactionsCount = (): number => {
    // If mock sales are present, show the seed transactions count. Otherwise start from 0.
    const hasSeedSales = sales.some(s => s.id === 's1' || s.id === 's2' || s.id === 's3' || s.id === 's4');
    const seedCount = hasSeedSales ? 1042 : 0;
    const newSalesCount = hasSeedSales
      ? sales.filter(s => !s.id.startsWith('s1') && !s.id.startsWith('s2') && !s.id.startsWith('s3') && !s.id.startsWith('s4')).length
      : sales.length;
    return seedCount + newSalesCount;
  };

  const clearLedgerData = () => {
    localStorage.removeItem('bine_pos_products');
    localStorage.removeItem('bine_pos_debtors');
    localStorage.removeItem('bine_pos_sales');
    localStorage.removeItem('bine_pos_notifications');
    setProducts([]);
    setDebtors([]);
    setSales([]);
    setNotifications([]);
    addNotification(
      'Database Cleared',
      'Pristine empty ledger created. Ready for your own products and custom categories.',
      'info'
    );
  };

  return {
    // States
    products,
    debtors,
    sales,
    notifications,
    settings,
    
    // Numpad terminal
    cashierAmount,
    pressNumpadKey,
    deleteNumpadDigit,
    clearNumpadAmount,

    // Catalog Cart
    cartItems,
    addProductToCart,
    decrementProductInCart,
    removeProductFromCart,
    clearCart,
    getCartTotal,
    getCartTotalCost,
    processCheckout,
    selectedCatalogCategory,
    setSelectedCatalogCategory,

    // Operations
    addProduct,
    addStock,
    recordRepayment,
    addNewDebtor,
    deleteDebtor,
    clearPaidDebtors,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    updateSettings: updateSettingsState,
    clearLedgerData,

    // Analytics metrics
    getTotalNetProfit,
    getGrossSales,
    getTotalTransactionsCount
  };
}
