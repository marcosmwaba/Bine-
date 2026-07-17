import React from 'react';

interface BineLogoProps {
  className?: string;
  height?: number | string;
}

export default function BineLogo({ className = "h-8", height }: BineLogoProps) {
  return (
    <svg 
      viewBox="0 0 110 50" // Narrowed viewBox width from 140 to 110 to clip empty space
      className={`${className} select-none`} 
      style={height ? { height } : undefined}
      fill="none" 
      xmlns="http://w3.org"
    >
      <defs>
        <style>{`
          .serif-bold {
            font-family: 'Georgia', 'Times New Roman', 'Playfair Display', serif;
            font-weight: 700;
          }
        `}</style>
      </defs>
      
      {/* Capital B (Black) */}
      <text x="4" y="41" fontSize="48" fill="#000000" className="serif-bold">B</text>
      
      {/* Lowercase i (Red) - Pulled tight into the B */}
      <text x="34" y="41" fontSize="46" fill="#C1272D" className="serif-bold">i</text>
      
      {/* Lowercase n (Orange) - Nested right under the dot/stem of the i */}
      <text x="48" y="41" fontSize="44" fill="#F7931E" className="serif-bold">n</text>
      
      {/* Lowercase e (Green) - Tucked into the shoulder of the n */}
      <text x="76" y="41" fontSize="44" fill="#1B824C" className="serif-bold">e</text>
      
      {/* Repositioned elegant white swoops cutting across the new tight layout */}
      <path 
        d="M 12 36 C 22 31, 30 24, 38 24 C 28 26, 20 31, 12 36 Z" 
        fill="#ffffff" 
      />
      <path 
        d="M 11 38 C 22 33, 31 25, 39 23 C 28 26, 19 32, 11 38 Z" 
        fill="#ffffff" 
      />
    </svg>
  );
}
