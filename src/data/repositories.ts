import { Product, Debtor, Sale, Settings, AppNotification } from '../types';

const PRODUCTS_KEY = 'bine_pos_products';
const DEBTORS_KEY = 'bine_pos_debtors';
const SALES_KEY = 'bine_pos_sales';
const SETTINGS_KEY = 'bine_pos_settings';
const NOTIFICATIONS_KEY = 'bine_pos_notifications';

const DEFAULT_PRODUCTS: Product[] = [];

const DEFAULT_DEBTORS: Debtor[] = [];

const DEFAULT_SALES: Sale[] = [];

const DEFAULT_SETTINGS: Settings = {
  businessName: 'My Business Ltd',
  mobileMoneyNumber: '+260 970 000 000',
  ownerName: 'Zambian Merchant',
  darkMode: false,
  localSmsScraper: true
};

export const repository = {
  getProducts(): Product[] {
    const data = localStorage.getItem(PRODUCTS_KEY);
    if (!data) {
      this.saveProducts(DEFAULT_PRODUCTS);
      return DEFAULT_PRODUCTS;
    }
    return JSON.parse(data);
  },

  saveProducts(products: Product[]): void {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  },

  getDebtors(): Debtor[] {
    const data = localStorage.getItem(DEBTORS_KEY);
    if (!data) {
      this.saveDebtors(DEFAULT_DEBTORS);
      return DEFAULT_DEBTORS;
    }
    return JSON.parse(data);
  },

  saveDebtors(debtors: Debtor[]): void {
    localStorage.setItem(DEBTORS_KEY, JSON.stringify(debtors));
  },

  getSales(): Sale[] {
    const data = localStorage.getItem(SALES_KEY);
    if (!data) {
      this.saveSales(DEFAULT_SALES);
      return DEFAULT_SALES;
    }
    return JSON.parse(data);
  },

  saveSales(sales: Sale[]): void {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  },

  getSettings(): Settings {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) {
      this.saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(data);
  },

  saveSettings(settings: Settings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  getNotifications(): AppNotification[] {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!data) {
      const defaultNotifications: AppNotification[] = [
        {
          id: 'n_welcome',
          title: 'Welcome to Bine POS',
          message: 'Track sales, manage inventory, and monitor Nkongole ledgers seamlessly.',
          time: '08:00 AM',
          type: 'info',
          read: false
        }
      ];
      this.saveNotifications(defaultNotifications);
      return defaultNotifications;
    }
    return JSON.parse(data);
  },

  saveNotifications(notifications: AppNotification[]): void {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }
};
