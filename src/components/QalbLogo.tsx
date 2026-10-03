import React from 'react';

interface QalbLogoProps {
  className?: string;
  variant?: 'badge' | 'compact' | 'full';
  showSubtitle?: boolean;
}

export const QalbLogo: React.FC<QalbLogoProps> = ({
  className = 'w-10 h-10',
  variant = 'badge',
  showSubtitle = true,
}) => {
  if (variant === 'full') {
    return (
      <div className="flex items-center gap-3">
        <img
          src="/logo.svg"
          alt="QALB AL Kharasana by pryzm empire"
          className="w-12 h-12 rounded-xl object-contain shadow-md border border-stone-700/60"
        />
        <div className="flex flex-col">
          <span className="text-[10px] text-blue-400 font-semibold tracking-wide">
            By pryzm empire
          </span>
          <span className="text-lg font-black tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif] leading-tight">
            QALB AL <span className="font-medium text-stone-200">Kharasana</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl bg-[#EDE6DE] flex items-center justify-center shadow-md border border-stone-700/50 ${className}`}>
      <img
        src="/logo.svg"
        alt="QALB AL Kharasana"
        className="w-full h-full object-cover"
      />
    </div>
  );
};
