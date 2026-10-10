import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle,
  QrCode,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { Product, Debtor, Sale, Expense, Settings } from '../types';
import { publishStoreData, PublishResult } from '../services/apiSync';
import { QRCodeDisplay } from './QRCodeDisplay';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  debtors: Debtor[];
  sales: Sale[];
  expenses: Expense[];
  settings: Settings;
  onViewDashboard: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  products,
  debtors,
  sales,
  expenses,
  settings,
  onViewDashboard,
}) => {
  const [publishing, setPublishing] = useState(false);
  const [lastResult, setLastResult] = useState<PublishResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  // Build the permanent dashboard URL
  const origin = window.location.origin;
  const dashboardUrl = `${origin}?view=dashboard`;

  // Compute live summary statistics to package
  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalProfit = sales.reduce((sum, s) => sum + s.totalProfit, 0);
  const totalDebtOutstanding = debtors.reduce((sum, d) => sum + d.outstanding, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const inventoryValuationCost = products.reduce((sum, p) => sum + (p.costPrice * p.remaining), 0);
  const inventoryValuationRetail = products.reduce((sum, p) => sum + (p.sellingPrice * p.remaining), 0);
  const lowStockCount = products.filter(p => p.remaining <= 5).length;

  const handlePublish = async () => {
    setPublishing(true);
    setLastResult(null);

    const payload = {
      storeId: 'bine-retail-main',
      businessName: settings.businessName || 'Bine Smart Retail POS',
      currency: 'MWK',
      publishedAt: new Date().toISOString(),
      publishedBy: settings.ownerName || 'Active Register',
      summary: {
        totalRevenue,
        totalProfit,
        totalDebtOutstanding,
        totalExpenses,
        inventoryValuationCost,
        inventoryValuationRetail,
        lowStockCount,
        totalTransactionsCount: sales.length,
        totalProductsCount: products.length,
        totalDebtorsCount: debtors.length,
      },
      products,
      sales,
      debtors,
      expenses,
      settings,
    };

    const res = await publishStoreData(payload);
    setPublishing(false);
    setLastResult(res);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(dashboardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 leading-tight">Publish to Cloud Web API</h2>
              <p className="text-xs text-neutral-500">Sync live store records to remote owner dashboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Snapshot Summary Preview */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 uppercase tracking-wider">
              <span>Current Snapshot Package</span>
              <span className="text-blue-600 lowercase font-normal">{products.length} stock items · {sales.length} sales</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-neutral-100 shadow-2xs">
                <span className="text-neutral-500 block text-[11px]">Gross Revenue</span>
                <span className="font-bold text-neutral-900 font-mono tabular-nums text-sm">
                  MWK {totalRevenue.toLocaleString()}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-neutral-100 shadow-2xs">
                <span className="text-neutral-500 block text-[11px]">Net Profit</span>
                <span className="font-bold text-emerald-600 font-mono tabular-nums text-sm">
                  MWK {totalProfit.toLocaleString()}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-neutral-100 shadow-2xs">
                <span className="text-neutral-500 block text-[11px]">Outstanding Debt</span>
                <span className="font-bold text-rose-600 font-mono tabular-nums text-sm">
                  MWK {totalDebtOutstanding.toLocaleString()}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-neutral-100 shadow-2xs">
                <span className="text-neutral-500 block text-[11px]">Stock Valuation (Cost)</span>
                <span className="font-bold text-neutral-800 font-mono tabular-nums text-sm">
                  MWK {inventoryValuationCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="space-y-3">
            <button
              onClick={handlePublish}
              disabled={publishing}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-all ${
                publishing
                  ? 'bg-blue-400 text-white cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white shadow-blue-500/20'
              }`}
            >
              {publishing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Packaging & Uploading to Cloud...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Publish Current Data to Cloud Now</span>
                </>
              )}
            </button>

            {/* Success / Error Feedback */}
            {lastResult && (
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                  lastResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {lastResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">
                    {lastResult.success ? 'Snapshot Published Successfully!' : 'Publishing Error'}
                  </div>
                  <div className="text-[11px] opacity-90 mt-0.5">
                    {lastResult.success
                      ? `Cloud server updated at ${new Date(lastResult.publishedAt || '').toLocaleTimeString()}. Remote viewers can now see the newest figures.`
                      : lastResult.error || 'Server rejected request'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Permanent URL & QR Section */}
          <div className="border-t border-neutral-100 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Permanent Remote Web Dashboard
              </span>
              <button
                type="button"
                onClick={() => setShowQR(!showQR)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{showQR ? 'Hide QR Code' : 'Show Phone QR'}</span>
              </button>
            </div>

            {/* QR Code popup/drawer */}
            {showQR && (
              <div className="flex justify-center p-2 bg-neutral-50 rounded-xl border border-neutral-200 animate-in fade-in duration-200">
                <QRCodeDisplay url={dashboardUrl} size={160} />
              </div>
            )}

            {/* URL input with copy */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={dashboardUrl}
                className="flex-1 bg-neutral-100 border border-neutral-200 rounded-lg px-3 py-2 text-xs font-mono text-neutral-700 select-all focus:outline-hidden"
              />
              <button
                type="button"
                onClick={copyLink}
                className="px-3 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-neutral-500 leading-normal">
              Bookmark this fixed link on your smartphone, tablet, or home computer. Whenever the register publishes, your link will immediately display fresh data.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-neutral-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Read-only remote cloud copy</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewDashboard();
              }}
              className="px-4 py-2 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <span>Open Dashboard View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
