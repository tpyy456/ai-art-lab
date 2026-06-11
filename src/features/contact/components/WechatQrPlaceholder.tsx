import React from 'react';

export const WechatQrPlaceholder: React.FC = () => {
  return (
    <div className="relative flex aspect-square w-full max-w-[280px] flex-col items-center justify-center border border-lab-red/20 bg-[#020202] p-8">
      {/* Corner Brackets */}
      <div className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-lab-red/50" />
      <div className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-lab-red/50" />
      <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-lab-red/50" />
      <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-lab-red/50" />

      {/* Center Reticle */}
      <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute left-1/2 top-0 h-full w-[1px] -translate-x-1/2 bg-lab-red/10" />
        <div className="absolute left-0 top-1/2 h-[1px] w-full -translate-y-1/2 bg-lab-red/10" />
      </div>

      {/* Simulated QR Blocks */}
      <div className="absolute left-6 top-6 h-12 w-12 border-4 border-white/5" />
      <div className="absolute right-6 top-6 h-12 w-12 border-4 border-white/5" />
      <div className="absolute bottom-6 left-6 h-12 w-12 border-4 border-white/5" />
      
      {/* Image Fallback Check (for future) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img 
          src="/contact/wechat-qr.png" 
          alt="Wechat QR"
          className="h-full w-full object-contain opacity-0"
          onError={(e) => {
            // Hide broken image icon if image doesn't exist yet
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      {/* Status Text */}
      <div className="z-10 mt-2 text-center">
        <div className="mb-2 flex justify-center">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-lab-red" />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
          QR CODE WILL BE ADDED
          <br />
          <span className="mt-1 block tracking-[0.1em] opacity-80">二维码稍后接入</span>
        </p>
      </div>
      
      {/* Scanning Line Overlay */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="h-[2px] w-full animate-[scan_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-lab-red/40 to-transparent blur-[1px]" />
      </div>
    </div>
  );
};