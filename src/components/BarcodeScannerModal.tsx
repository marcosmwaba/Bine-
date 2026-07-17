import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Scan, Camera, AlertCircle, Check, Keyboard } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { Product } from '../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  products: Product[];
  title?: string;
}

// Sound Synthesizer Beep using Web Audio API
export function playBeep() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1400, audioCtx.currentTime); // High pitch retail scanner beep
    gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.12);
  } catch (e) {
    console.warn("Audio Context beep not supported or blocked by user gesture:", e);
  }
}

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onScan,
  products,
  title = "Barcode Scanner"
}: BarcodeScannerModalProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [successBarcode, setSuccessBarcode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'camera' | 'simulate' | 'manual'>('camera');

  const handleBarcodeDetected = (code: string) => {
    if (successBarcode) return; // Prevent double scan triggers
    
    playBeep();
    setSuccessBarcode(code);
    
    // Stop scanner as soon as code is found to prevent multi-fires or background resource drain
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(err => console.warn("Failed to stop scanner after scan:", err));
    }
    
    // Animate scan flash, then trigger parent callback and close
    setTimeout(() => {
      onScan(code);
      setSuccessBarcode(null);
    }, 850);
  };

  // Start & Stop Camera Stream with html5-qrcode
  useEffect(() => {
    let activeScanner: Html5Qrcode | null = null;
    let isMounted = true;

    if (isOpen && activeTab === 'camera' && !successBarcode) {
      setCameraError(null);

      // We need a short timeout to make sure the target element #qr-reader is mounted in the DOM
      const initTimeout = setTimeout(() => {
        if (!isMounted) return;

        // Check if browser/environment supports camera APIs
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraError("Your browser or device does not support camera access in this context. Please ensure HTTPS is used, or use the Simulator / Type Code tabs.");
          return;
        }

        try {
          const scanner = new Html5Qrcode("qr-reader");
          activeScanner = scanner;
          scannerRef.current = scanner;

          scanner.start(
            { facingMode: "environment" },
            {
              fps: 15,
              qrbox: (width, height) => {
                const size = Math.min(width, height, 250);
                return { width: size, height: size };
              },
              aspectRatio: 1.0,
            },
            (decodedText) => {
              if (decodedText && isMounted) {
                handleBarcodeDetected(decodedText);
              }
            },
            () => {
              // Verbose frame error, ignore it to keep logs clean
            }
          ).catch((err) => {
            console.error("Html5Qrcode start failed:", err);
            if (isMounted) {
              setCameraError("Camera permission denied, or camera not found. Please ensure you have granted camera permissions for this site/app.");
            }
          });
        } catch (e) {
          console.error("Html5Qrcode initialization failed:", e);
          if (isMounted) {
            setCameraError("Could not initialize the camera scanner in this environment.");
          }
        }
      }, 250);

      return () => {
        clearTimeout(initTimeout);
        isMounted = false;
        if (activeScanner && activeScanner.isScanning) {
          activeScanner.stop().catch(err => console.warn("Failed to stop scanner on unmount:", err));
        }
      };
    }
  }, [isOpen, activeTab, successBarcode]);

  // Clean up state & stop scanning on general modal close or reset
  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.warn("Failed to stop scanner on modal close:", err));
      }
      setSuccessBarcode(null);
      setManualBarcode('');
      setCameraError(null);
    }
  }, [isOpen]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleBarcodeDetected(manualBarcode.trim());
    }
  };

  // Extract products that actually have barcodes for easy simulation clicking
  const barcodedProducts = products.filter(p => p.barcode);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-[200] flex flex-col justify-end">
        {/* Scrim */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black backdrop-blur-xs cursor-pointer"
          onClick={onClose}
        />

        {/* Scanner Panel */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          className="relative bg-white rounded-t-3xl shadow-2xl z-10 w-full max-h-[92%] flex flex-col overflow-hidden border-t border-gray-150 pb-safe"
        >
          {/* Header Drag Handle / Decorator */}
          <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto my-3 shrink-0" />

          {/* Title Area */}
          <div className="px-5 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2 text-[#003820]">
              <Scan className="w-5 h-5 animate-pulse" />
              <h2 className="font-sans font-extrabold text-lg">
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scanner Navigation Tabs */}
          <div className="flex px-4 border-b border-gray-150 bg-white mt-3 shrink-0">
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex-1 py-2.5 text-center font-sans font-extrabold text-xs border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'camera'
                  ? 'border-[#003820] text-[#003820]'
                  : 'border-transparent text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Camera className="w-4 h-4" />
              Live Camera
            </button>
            <button
              onClick={() => setActiveTab('simulate')}
              className={`flex-1 py-2.5 text-center font-sans font-extrabold text-xs border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'simulate'
                  ? 'border-[#003820] text-[#003820]'
                  : 'border-transparent text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Scan className="w-4 h-4" />
              Simulator
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2.5 text-center font-sans font-extrabold text-xs border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'manual'
                  ? 'border-[#003820] text-[#003820]'
                  : 'border-transparent text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              Type Code
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 flex flex-col justify-between min-h-0">
            <AnimatePresence mode="wait">
              {activeTab === 'camera' && (
                <motion.div
                  key="camera"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4 flex-1 justify-center"
                >
                  {cameraError ? (
                    <div className="bg-red-50 border border-red-150 rounded-2xl p-4 text-center max-w-[280px] flex flex-col items-center">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <p className="font-sans font-bold text-xs text-gray-900 mb-1">Camera Feed Disabled</p>
                      <p className="text-[10px] text-gray-500 leading-normal mb-3">
                        {cameraError}
                      </p>
                      <div className="flex flex-col gap-1.5 w-full">
                        <button
                          type="button"
                          onClick={() => {
                            setCameraError(null);
                            setActiveTab('manual');
                            setTimeout(() => setActiveTab('camera'), 50);
                          }}
                          className="py-1.5 w-full bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-sans font-bold transition-all cursor-pointer"
                        >
                          Retry Camera Permission
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('simulate')}
                          className="py-1.5 w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-[10px] font-sans font-medium transition-all cursor-pointer"
                        >
                          Use Barcode Simulator
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Video Box */
                    <div className="relative w-full aspect-square max-w-[280px] bg-black rounded-2xl overflow-hidden border-2 border-dashed border-[#0f5132] shadow-inner flex items-center justify-center shrink-0">
                      {successBarcode ? (
                        /* Success Scanning Indicator */
                        <div className="absolute inset-0 bg-[#0f5132]/90 flex flex-col items-center justify-center text-white z-20">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-16 h-16 rounded-full bg-white text-[#0f5132] flex items-center justify-center shadow-lg"
                          >
                            <Check className="w-10 h-10 stroke-[3]" />
                          </motion.div>
                          <span className="font-sans font-extrabold text-sm mt-3 uppercase tracking-wider">
                            Scanned Successfully!
                          </span>
                          <span className="font-mono text-[11px] opacity-80 mt-1 bg-black/30 px-3 py-1 rounded-full">
                            {successBarcode}
                          </span>
                        </div>
                      ) : (
                        <>
                          <div id="qr-reader" className="w-full h-full overflow-hidden [&>video]:object-cover [&>video]:w-full [&>video]:h-full" />
                          {/* Red Laser Scanning line */}
                          <div className="absolute inset-x-0 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-[bounce_2s_infinite] top-1/4 z-10" />
                          
                          {/* Target Box Corners */}
                          <div className="absolute inset-8 border border-white/45 rounded-lg pointer-events-none flex items-center justify-center z-10">
                            <span className="text-[10px] text-white/50 font-sans tracking-wide uppercase bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-xs">Align Barcode</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-gray-400 text-center leading-relaxed max-w-[260px]">
                    Point your device camera directly at the barcode. The system will auto-detect the code in real-time.
                  </p>
                </motion.div>
              )}

              {activeTab === 'simulate' && (
                <motion.div
                  key="simulate"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 flex-1 flex flex-col justify-between min-h-0"
                >
                  {successBarcode && (
                    <div className="bg-[#0f5132]/10 border border-[#0f5132]/30 rounded-xl p-3 flex items-center gap-3 text-[#003820]">
                      <Check className="w-5 h-5 text-green-600 stroke-[3]" />
                      <div className="text-left">
                        <p className="font-sans font-extrabold text-xs">Simulated Barcode Read!</p>
                        <p className="font-mono text-[10px] text-gray-500">{successBarcode}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 text-left">
                    <p className="font-sans text-xs font-bold text-gray-700">
                      Zambian Retail Store Catalog Simulator
                    </p>
                    <p className="text-[11px] text-gray-400 leading-snug">
                      Tap any product below to simulate scanning its barcode immediately as if you placed it under the camera lens:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[220px] pr-1 flex-1">
                    {barcodedProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleBarcodeDetected(p.barcode!)}
                        className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-150 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-all text-left active:scale-[0.98] cursor-pointer"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-sans font-extrabold text-xs text-gray-800 truncate leading-tight">
                            {p.name}
                          </p>
                          <p className="font-sans text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide font-bold">
                            {p.category} • <span className="font-mono text-gray-500">{p.barcode}</span>
                          </p>
                        </div>
                        <div className="bg-white px-2.5 py-1 rounded-lg border border-gray-150 shrink-0 font-mono text-[10px] text-[#0f5132] font-bold">
                          Simulate Scan
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Manual Barcode generation helper */}
                  <div className="bg-blue-50/70 border border-blue-100 p-3 rounded-xl flex gap-2.5 text-[11px] text-blue-700 font-sans leading-relaxed text-left">
                    <AlertCircle className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                    <div>
                      <span className="font-bold block">Developer Help</span>
                      Select any of these registered items to test stock reduction, cart compilation, and ledger updates seamlessly.
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'manual' && (
                <motion.div
                  key="manual"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 flex-1"
                >
                  <form onSubmit={handleManualSubmit} className="space-y-4 text-left">
                    <div className="space-y-1">
                      <label className="font-sans text-xs font-bold text-gray-700 block">
                        Enter Barcode / SKU
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="e.g. 6001234567890"
                          value={manualBarcode}
                          onChange={(e) => setManualBarcode(e.target.value)}
                          className="w-full h-11 border border-gray-200 rounded-xl px-4 focus:outline-hidden focus:border-[#0f5132] focus:ring-1 focus:ring-[#0f5132] font-sans text-sm bg-gray-50/50"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!manualBarcode.trim()}
                      className="w-full py-3 bg-[#0f5132] text-white rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#0b3c25] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                      Submit Manual Barcode
                    </button>
                  </form>

                  <p className="text-xs text-gray-400 text-center leading-relaxed pt-2">
                    Useful if the physical barcode on the product is smudged, torn, or unreadable by the camera system.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
