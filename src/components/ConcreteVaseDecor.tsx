import React from 'react';

interface ConcreteVaseProps {
  className?: string;
  variant?: 'fluted' | 'sculptural' | 'stepped' | 'monolith';
  opacity?: string;
}

export const ConcreteVaseDecor: React.FC<ConcreteVaseProps> = ({
  className = 'w-48 h-64',
  variant = 'sculptural',
  opacity = 'opacity-20',
}) => {
  if (variant === 'fluted') {
    return (
      <svg
        viewBox="0 0 160 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} ${opacity} pointer-events-none select-none text-stone-600`}
      >
        {/* Fluted Minimalist Brutalist Concrete Vessel */}
        <path
          d="M40 20 H120 L135 70 L115 190 H45 L25 70 Z"
          fill="currentColor"
          fillOpacity="0.08"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Fluted Vertical Grooves */}
        <line x1="55" y1="20" x2="55" y2="190" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="70" y1="20" x2="70" y2="190" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="85" y1="20" x2="85" y2="190" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="105" y1="20" x2="105" y2="190" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
        {/* Lip & Pedestal */}
        <ellipse cx="80" cy="20" rx="40" ry="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M35 190 H125 V202 H35 Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  if (variant === 'stepped') {
    return (
      <svg
        viewBox="0 0 160 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} ${opacity} pointer-events-none select-none text-stone-600`}
      >
        {/* Stepped Architectural Concrete Column Vase */}
        <rect x="50" y="20" width="60" height="24" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.07" />
        <rect x="40" y="44" width="80" height="30" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
        <rect x="30" y="74" width="100" height="90" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08" />
        <rect x="42" y="164" width="76" height="26" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.12" />
        <rect x="25" y="190" width="110" height="14" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
        <line x1="80" y1="74" x2="80" y2="164" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.5" />
      </svg>
    );
  }

  // Default: Sculptural Asymmetric Brutalist Vase
  return (
    <svg
      viewBox="0 0 180 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${opacity} pointer-events-none select-none text-stone-700`}
    >
      {/* Heavy Brutalist Sculptural Arch Vase with Void */}
      <path
        d="M30 40 C30 40 50 15 90 15 C130 15 150 40 150 40 L160 170 C160 195 140 215 115 215 H65 C40 215 20 195 20 170 L30 40 Z"
        fill="currentColor"
        fillOpacity="0.07"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Brutalist Void / Arch in center */}
      <path
        d="M70 120 C70 95 80 85 90 85 C100 85 110 95 110 120 V165 H70 V120 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.05"
      />
      {/* Horizontal Mold Seam lines */}
      <line x1="25" y1="80" x2="155" y2="80" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
      <line x1="22" y1="140" x2="158" y2="140" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
      <circle cx="90" cy="50" r="14" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" />
    </svg>
  );
};
