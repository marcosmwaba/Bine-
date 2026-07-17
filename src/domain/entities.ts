import { Product } from '../types';

export function formatCurrency(amount: number): string {
  return 'K ' + amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function checkStockLevel(product: Product): 'out_of_stock' | 'low_stock' | 'normal' {
  if (product.remaining <= 0) return 'out_of_stock';
  if (product.remaining <= 5) return 'low_stock';
  return 'normal';
}

export function generateInvoiceNumber(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `INV-${num}`;
}

export function getFormattedDate(): string {
  const d = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function getFormattedTime(): string {
  const d = new Date();
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${hours}:${minutes} ${ampm}`;
}
