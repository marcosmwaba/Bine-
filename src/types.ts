export interface Product {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  remaining: number;
  barcode?: string;
  unit?: string; // e.g. "pcs", "bottles", "bags", "boxes", "kg"
}

export interface Category {
  id: string;
  name: string;
  iconName: string; // Used to look up Lucide icons dynamically
}

export interface DebtTransaction {
  id: string;
  type: 'debt_increment' | 'repayment';
  description: string;
  amount: number;
  date: string; // e.g. '12 Oct 2023'
  time: string; // e.g. '14:20'
}

export interface Debtor {
  id: string;
  name: string;
  phone: string;
  outstanding: number;
  daysActive: number;
  initials: string;
  transactions: DebtTransaction[];
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    sellingPrice: number;
    costPrice: number;
  }[];
  totalAmount: number;
  totalProfit: number;
  date: string; // e.g. '14 Jul 2026'
  time: string; // e.g. '10:45 AM'
  paymentMethod: 'Cash' | 'Airtel Money' | 'MTN MoMo' | 'Nkongole (Debt)';
  debtorId?: string; // Optional if sold on debt
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string; // e.g. '18 Jul 2026'
  time: string; // e.g. '10:45 AM'
}

export interface Settings {
  businessName: string;
  mobileMoneyNumber: string;
  ownerName: string;
  darkMode: boolean;
  localSmsScraper: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'sale' | 'repayment' | 'debtor' | 'restock' | 'info' | 'expense';
  read: boolean;
}

