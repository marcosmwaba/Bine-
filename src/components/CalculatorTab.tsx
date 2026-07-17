import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  Bell, 
  Calculator, 
  Trash2, 
  RotateCcw, 
  ArrowLeft, 
  TrendingUp, 
  Percent, 
  Receipt,
  Check,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import BineLogo from './BineLogo';

interface CalculatorTabProps {
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  onOpenSidebar?: () => void;
  settings?: any;
}

export default function CalculatorTab({
  onOpenNotifications,
  unreadNotificationsCount,
  onOpenSidebar,
  settings
}: CalculatorTabProps) {
  // Tabs: 'calculator' or 'business'
  const [activeSubTab, setActiveSubTab] = useState<'standard' | 'business'>('standard');

  // Standard Calculator State
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [calcHistory, setCalcHistory] = useState<Array<{ expr: string; res: string }>>([]);

  // Business math states
  // 1. Margin & Markup
  const [costPrice, setCostPrice] = useState<string>('');
  const [sellingPrice, setSellingPrice] = useState<string>('');
  const [targetMargin, setTargetMargin] = useState<string>('');
  
  // 2. Discount / VAT Estimator
  const [originalAmount, setOriginalAmount] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<string>('');
  const [vatPercent, setVatPercent] = useState<string>('16'); // 16% standard VAT in Zambia

  // Evaluation engine
  const evaluateExpression = (expr: string): string => {
    if (!expr.trim()) return '';
    try {
      // Clean display characters to math operators
      let sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/');

      // Retail Percentage rules:
      // Pattern 1: X + Y% -> X * (1 + Y/100)
      // Pattern 2: X - Y% -> X * (1 - Y/100)
      // Pattern 3: X * Y% -> X * (Y/100)
      // Pattern 4: X / Y% -> X / (Y/100)
      if (sanitized.includes('%')) {
        const percentPattern = /(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)\s*%/g;
        if (percentPattern.test(sanitized)) {
          sanitized = sanitized.replace(percentPattern, (match, base, op, percent) => {
            const b = parseFloat(base);
            const p = parseFloat(percent) / 100;
            if (op === '+') return (b + (b * p)).toString();
            if (op === '-') return (b - (b * p)).toString();
            if (op === '*') return (b * p).toString();
            if (op === '/') return (b / p).toString();
            return match;
          });
        } else {
          // Fallback to replacing single number% with (number / 100)
          sanitized = sanitized.replace(/(\d+(?:\.\d+)?)\s*%/g, '($1/100)');
        }
      }

      // Restrict calculation to safe math tokens (prevent XSS / arbitrary executions)
      if (!/^[0-9\+\-\*\/\.\s\(\)]+$/.test(sanitized)) {
        return 'Error';
      }

      const fn = new Function(`return (${sanitized});`);
      const val = fn();

      if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
        // Round to max 4 decimal places
        return (Math.round(val * 10000) / 10000).toString();
      }
      return 'Error';
    } catch {
      return 'Error';
    }
  };

  const handleKeyPress = (key: string) => {
    if (key === 'AC') {
      setExpression('');
      setResult('');
    } else if (key === 'C') {
      setExpression(prev => prev.slice(0, -1));
    } else if (key === '=') {
      const res = evaluateExpression(expression);
      if (res && res !== 'Error') {
        // Only save to history if it's a new or different expression
        setCalcHistory(prev => [{ expr: expression, res }, ...prev].slice(0, 5));
        setResult(res);
        setExpression(res); // Allow chaining calculations
      } else {
        setResult('Error');
      }
    } else {
      // Prevent consecutive duplicate operator symbols
      const operators = ['+', '-', '×', '÷', '%', '.'];
      const lastChar = expression.slice(-1);
      if (operators.includes(key) && operators.includes(lastChar)) {
        // Replace last operator with the new one
        setExpression(prev => prev.slice(0, -1) + key);
      } else {
        setExpression(prev => prev + key);
      }
    }
  };

  const loadFromHistory = (item: { expr: string; res: string }) => {
    setExpression(item.expr);
    setResult(item.res);
  };

  // Business Math Calculations
  const calcMarginMarkup = () => {
    const cost = parseFloat(costPrice);
    const sell = parseFloat(sellingPrice);
    if (isNaN(cost) || isNaN(sell) || cost <= 0) return null;

    const profit = sell - cost;
    const margin = (profit / sell) * 100;
    const markup = (profit / cost) * 100;

    return {
      profit,
      margin: Math.round(margin * 100) / 100,
      markup: Math.round(markup * 100) / 100,
    };
  };

  const calcPricingSuggestion = () => {
    const cost = parseFloat(costPrice);
    const marginPct = parseFloat(targetMargin);
    if (isNaN(cost) || isNaN(marginPct) || cost <= 0 || marginPct >= 100 || marginPct < 0) return null;

    const sell = cost / (1 - marginPct / 100);
    const profit = sell - cost;
    const markup = (profit / cost) * 100;

    return {
      sellingPrice: Math.round(sell * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      markup: Math.round(markup * 100) / 100,
    };
  };

  const calcDiscountVat = () => {
    const amt = parseFloat(originalAmount);
    if (isNaN(amt) || amt <= 0) return null;

    const discPct = parseFloat(discountPercent) || 0;
    const vatPct = parseFloat(vatPercent) || 0;

    const discountAmount = amt * (discPct / 100);
    const amountAfterDiscount = amt - discountAmount;
    const vatAmount = amountAfterDiscount * (vatPct / 100);
    const finalAmount = amountAfterDiscount + vatAmount;

    return {
      discountAmount,
      amountAfterDiscount,
      vatAmount,
      finalAmount
    };
  };

  const marginResults = calcMarginMarkup();
  const pricingSuggestion = calcPricingSuggestion();
  const discountResults = calcDiscountVat();

  const calculatorButtons = [
    ['AC', 'C', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '=']
  ];

  const formatZMW = (val: number) => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW'
    }).format(val);
  };

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

      {/* View Selection Toggle */}
      <div className="p-3 bg-gray-50/50 border-b border-gray-100 shrink-0">
        <div className="flex bg-gray-100 rounded-xl p-1 max-w-sm mx-auto">
          <button
            onClick={() => setActiveSubTab('standard')}
            className={`flex-1 py-2 text-xs font-bold font-sans rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'standard'
                ? 'bg-white text-[#0f5132] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            Retail Calculator
          </button>
          <button
            onClick={() => setActiveSubTab('business')}
            className={`flex-1 py-2 text-xs font-bold font-sans rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'business'
                ? 'bg-white text-[#0f5132] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Business Tools
          </button>
        </div>
      </div>

      {/* Scrollable Container for standard/business calculator content */}
      <div className="flex-1 overflow-y-auto pb-24 min-h-0 bg-gray-50/20">
        <AnimatePresence mode="wait">
          {activeSubTab === 'standard' ? (
            <motion.div
              key="calc"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col h-full justify-between max-w-md mx-auto p-4 space-y-4"
            >
              {/* Display Panel */}
              <div className="bg-[#0f5132] text-white p-6 rounded-2xl shadow-md border border-[#0c4027] flex flex-col justify-end items-end min-h-[135px] w-full text-right relative overflow-hidden">
                {/* Background design elements */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-12 -translate-y-12 pointer-events-none" />
                <span className="absolute top-3 left-4 text-[9px] uppercase tracking-widest text-emerald-300 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Quick Retail Math
                </span>
                
                {/* Expression */}
                <div className="text-emerald-200/90 font-mono text-base tracking-wide max-w-full overflow-x-auto whitespace-nowrap scrollbar-none pt-4">
                  {expression || '0'}
                </div>
                
                {/* Live Output */}
                <div className="text-4xl font-extrabold font-sans mt-1.5 tracking-tight truncate max-w-full">
                  {result || evaluateExpression(expression) || '0'}
                </div>
              </div>

              {/* Calculator Buttons Grid */}
              <div className="grid grid-cols-4 gap-2 w-full">
                {calculatorButtons.map((row, rIdx) => (
                  <React.Fragment key={rIdx}>
                    {row.map((btn) => {
                      const isOperator = ['+', '-', '×', '÷', '='].includes(btn);
                      const isClear = ['AC', 'C'].includes(btn);
                      const isPercent = btn === '%';
                      
                      // Double span for the 0 button on the last row
                      const isZero = btn === '0';
                      const colSpan = isZero ? 'col-span-2' : 'col-span-1';

                      // Theme classes
                      let btnTheme = "bg-white border border-gray-100 hover:bg-gray-50 text-gray-800 active:scale-95";
                      if (isOperator) {
                        if (btn === '=') {
                          btnTheme = "bg-[#0f5132] text-white hover:bg-[#0c4027] font-bold shadow-sm active:scale-95";
                        } else {
                          btnTheme = "bg-emerald-50 text-[#0f5132] hover:bg-emerald-100 border border-emerald-100 font-semibold active:scale-95";
                        }
                      } else if (isClear) {
                        btnTheme = "bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100 font-semibold active:scale-95";
                      } else if (isPercent) {
                        btnTheme = "bg-purple-50 text-purple-700 border border-purple-100 hover:bg-purple-100 font-semibold active:scale-95";
                      }

                      return (
                        <button
                          key={btn}
                          onClick={() => handleKeyPress(btn)}
                          className={`${colSpan} h-12 rounded-xl text-sm font-bold font-mono transition-all duration-75 flex items-center justify-center cursor-pointer ${btnTheme}`}
                        >
                          {btn}
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>

              {/* Quick Guide */}
              <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/60 text-[11px] text-gray-600 font-sans leading-relaxed">
                <span className="font-bold text-[#0f5132] block mb-0.5">💡 Retail Tip:</span>
                Apply easy percentages directly! For a 10% discount on <strong className="font-mono">1,500</strong>, type <strong className="font-mono text-[#0f5132]">1500 - 10%</strong> then press <strong className="font-bold">=</strong>.
              </div>

              {/* Calculator History */}
              {calcHistory.length > 0 && (
                <div className="w-full bg-white rounded-2xl p-4 border border-gray-150 shadow-xs mt-2">
                  <div className="flex justify-between items-center mb-2.5">
                    <h3 className="text-gray-500 font-sans text-[11px] font-bold uppercase tracking-wider">
                      Recent Calculations
                    </h3>
                    <button 
                      onClick={() => setCalcHistory([])}
                      className="text-gray-400 hover:text-red-500 p-1 rounded-full transition-colors"
                      title="Clear history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {calcHistory.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => loadFromHistory(item)}
                        className="w-full text-left p-2.5 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors flex justify-between items-center font-mono text-xs group"
                      >
                        <span className="text-gray-500 truncate group-hover:text-[#0f5132]">{item.expr}</span>
                        <div className="flex items-center gap-1.5 font-bold text-gray-800 shrink-0">
                          <span>=</span>
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded-md text-gray-700 text-[11px] group-hover:bg-[#0f5132]/10 group-hover:text-[#0f5132] transition-colors">{item.res}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="biz"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="max-w-md mx-auto p-4 space-y-5"
            >
              {/* Tool 1: Profit Margin & Markup */}
              <div className="bg-white rounded-2xl p-4 border border-gray-150 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
                  <div className="p-1.5 bg-emerald-50 rounded-lg text-[#0f5132]">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-gray-800 font-sans text-xs font-bold">
                      Markup & Profit Margin
                    </h3>
                    <p className="text-gray-400 text-[10px]">
                      Calculate markup/margin or input Target Margin to suggest selling price
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">
                      Cost Price (ZMW)
                    </label>
                    <input
                      type="number"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      placeholder="e.g. 100"
                      className="w-full h-10 px-3 border border-gray-200 rounded-xl font-mono text-xs focus:ring-1 focus:ring-[#0f5132] focus:border-[#0f5132] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">
                      Selling Price (ZMW)
                    </label>
                    <input
                      type="number"
                      value={sellingPrice}
                      onChange={(e) => {
                        setSellingPrice(e.target.value);
                        if (e.target.value) setTargetMargin(''); // Clear target margin if manually setting price
                      }}
                      placeholder="e.g. 130"
                      className="w-full h-10 px-3 border border-gray-200 rounded-xl font-mono text-xs focus:ring-1 focus:ring-[#0f5132] focus:border-[#0f5132] outline-none"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                      Or Target Margin % (Price Builder)
                    </label>
                    {(costPrice || sellingPrice || targetMargin) && (
                      <button
                        onClick={() => {
                          setCostPrice('');
                          setSellingPrice('');
                          setTargetMargin('');
                        }}
                        className="text-red-500 hover:text-red-600 text-[9px] font-bold uppercase tracking-wider"
                      >
                        Reset fields
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    value={targetMargin}
                    onChange={(e) => {
                      setTargetMargin(e.target.value);
                      setSellingPrice(''); // Clear manual price to trigger suggestion
                    }}
                    placeholder="e.g. 20"
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl font-mono text-xs focus:ring-1 focus:ring-[#0f5132] focus:border-[#0f5132] outline-none"
                  />
                </div>

                {marginResults ? (
                  <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100 space-y-2 text-xs font-sans">
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Profit Amount:</span>
                      <span className="font-extrabold text-[#0f5132] font-mono">
                        {formatZMW(marginResults.profit)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Profit Margin:</span>
                      <span className="font-extrabold text-emerald-700 font-mono">
                        {marginResults.margin}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Markup:</span>
                      <span className="font-semibold text-gray-700 font-mono">
                        {marginResults.markup}%
                      </span>
                    </div>
                  </div>
                ) : pricingSuggestion ? (
                  <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100 space-y-2 text-xs font-sans">
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Suggested Selling Price:</span>
                      <span className="font-extrabold text-[#0f5132] font-mono text-sm">
                        {formatZMW(pricingSuggestion.sellingPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Expected Profit:</span>
                      <span className="font-semibold text-emerald-700 font-mono">
                        {formatZMW(pricingSuggestion.profit)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Required Markup:</span>
                      <span className="font-mono text-gray-700">
                        {pricingSuggestion.markup}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2.5 text-[10px] text-gray-400 italic">
                    Enter Cost and Selling Price, or Cost and Target Margin to calculate.
                  </div>
                )}
              </div>

              {/* Tool 2: Discount & Tax Estimator */}
              <div className="bg-white rounded-2xl p-4 border border-gray-150 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-b-gray-100 pb-2.5">
                  <div className="p-1.5 bg-purple-50 rounded-lg text-purple-700">
                    <Percent className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-gray-800 font-sans text-xs font-bold">
                      Discount & VAT Estimator
                    </h3>
                    <p className="text-gray-400 text-[10px]">
                      Estimate client discounts and apply the standard Zambian VAT
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">
                      Base Amount (ZMW)
                    </label>
                    <input
                      type="number"
                      value={originalAmount}
                      onChange={(e) => setOriginalAmount(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full h-10 px-3 border border-gray-200 rounded-xl font-mono text-xs focus:ring-1 focus:ring-[#0f5132] focus:border-[#0f5132] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">
                        Discount %
                      </label>
                      <input
                        type="number"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                        placeholder="e.g. 10"
                        className="w-full h-10 px-3 border border-gray-200 rounded-xl font-mono text-xs focus:ring-1 focus:ring-[#0f5132] focus:border-[#0f5132] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">
                        VAT % (Optional)
                      </label>
                      <input
                        type="number"
                        value={vatPercent}
                        onChange={(e) => setVatPercent(e.target.value)}
                        placeholder="Zambia: 16"
                        className="w-full h-10 px-3 border border-gray-200 rounded-xl font-mono text-xs focus:ring-1 focus:ring-[#0f5132] focus:border-[#0f5132] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {discountResults ? (
                  <div className="bg-purple-50/60 rounded-xl p-3 border border-purple-100 space-y-2 text-xs font-sans">
                    {discountResults.discountAmount > 0 && (
                      <>
                        <div className="flex justify-between items-center text-gray-600">
                          <span>Discount Saved:</span>
                          <span className="font-bold text-orange-600 font-mono">
                            -{formatZMW(discountResults.discountAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-gray-600 text-[11px] border-b border-purple-100/50 pb-1.5">
                          <span>Subtotal:</span>
                          <span className="font-mono">{formatZMW(discountResults.amountAfterDiscount)}</span>
                        </div>
                      </>
                    )}
                    {discountResults.vatAmount > 0 && (
                      <div className="flex justify-between items-center text-gray-600">
                        <span>VAT Amount ({vatPercent}%):</span>
                        <span className="font-semibold text-gray-700 font-mono">
                          +{formatZMW(discountResults.vatAmount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-gray-800 font-bold border-t border-purple-150 pt-1.5 mt-1">
                      <span>Final Price:</span>
                      <span className="text-purple-800 font-mono text-sm font-extrabold">
                        {formatZMW(discountResults.finalAmount)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2.5 text-[10px] text-gray-400 italic">
                    Enter a Base Amount to instantly estimate discount & VAT totals.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
