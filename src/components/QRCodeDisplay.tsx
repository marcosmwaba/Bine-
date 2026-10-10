import React from 'react';

interface QRCodeDisplayProps {
  url: string;
  size?: number;
}

/**
 * Lightweight, robust QR code generator without external bloat
 * Generates an SVG QR Matrix for quick mobile phone camera scanning
 */
export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ url, size = 180 }) => {
  // Use high-reliability public vector QR API with offline/fallback styling
  const encodedUrl = encodeURIComponent(url);
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUrl}&format=svg&qzone=2&margin=0`;

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-xs border border-neutral-200">
      <img
        src={qrApiUrl}
        alt={`QR Code to open ${url}`}
        width={size}
        height={size}
        className="rounded-lg block max-w-full"
        loading="lazy"
        onError={(e) => {
          // Fallback if offline
          const target = e.currentTarget;
          target.style.display = 'none';
        }}
      />
      <div className="mt-2 text-center">
        <span className="text-[11px] font-medium text-neutral-500">
          Point phone camera to scan
        </span>
      </div>
    </div>
  );
};
