import React, { useState } from 'react';

interface ContactChannelProps {
  titleEn: string;
  titleZh: string;
  content: string;
  actionTextEn: string;
  actionTextZh: string;
}

export const ContactChannel: React.FC<ContactChannelProps> = ({
  titleEn,
  titleZh,
  content,
  actionTextEn,
  actionTextZh
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = content;
        // Move outside screen
        textArea.style.position = 'absolute';
        textArea.style.left = '-999999px';
        document.body.prepend(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (error) {
          console.error('Fallback copy failed', error);
        } finally {
          textArea.remove();
        }
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="group relative flex flex-col items-start justify-between gap-4 border border-white/[0.06] bg-[#050505] p-5 transition-colors duration-500 hover:border-lab-red/30 sm:flex-row sm:items-center sm:p-8">
      {/* Corner crosshairs */}
      <div className="absolute left-0 top-0 h-1.5 w-1.5 border-l border-t border-white/20 transition-colors duration-500 group-hover:border-lab-red/60" />
      <div className="absolute right-0 top-0 h-1.5 w-1.5 border-r border-t border-white/20 transition-colors duration-500 group-hover:border-lab-red/60" />
      <div className="absolute bottom-0 left-0 h-1.5 w-1.5 border-b border-l border-white/20 transition-colors duration-500 group-hover:border-lab-red/60" />
      <div className="absolute bottom-0 right-0 h-1.5 w-1.5 border-b border-r border-white/20 transition-colors duration-500 group-hover:border-lab-red/60" />

      <div className="w-full min-w-0 sm:flex-1">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
          {titleEn} <span className="opacity-50">/ {titleZh}</span>
        </h3>
        <p className="mt-2 break-all font-mono text-base tracking-[0.12em] text-white/90 sm:break-normal sm:text-xl sm:tracking-widest">
          {content}
        </p>
      </div>

      <button
        onClick={handleCopy}
        className={`min-h-11 w-full shrink-0 border px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors sm:w-auto sm:px-6 sm:tracking-[0.15em] ${
          copied 
            ? 'border-lab-red bg-lab-red/10 text-lab-red' 
            : 'border-white/10 bg-white/[0.02] text-white/70 hover:border-white/30 hover:bg-white/5 hover:text-white'
        }`}
      >
        {copied ? 'COPIED / 已复制' : `${actionTextEn} / ${actionTextZh}`}
      </button>
      
      {/* Hover Red Line Effect */}
      <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-lab-red/50 transition-all duration-700 ease-out group-hover:w-full" />
    </div>
  );
};
