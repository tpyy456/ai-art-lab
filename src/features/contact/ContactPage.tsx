import React, { useEffect } from 'react';
import { useScanTransition } from '../../components/transition/RedScanTransition';
import { ContactChannel } from './components/ContactChannel';
import { WechatQrPlaceholder } from './components/WechatQrPlaceholder';

export const ContactPage: React.FC = () => {
  const { navigateWithScan } = useScanTransition();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBackHome = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateWithScan('/');
  };

  return (
    <div className="min-h-screen w-full bg-[#030303] text-white selection:bg-lab-red/30 selection:text-white">
      {/* Top Navigation Bar */}
      <nav className="fixed left-0 top-0 z-40 w-full border-b border-white/[0.04] bg-[#030303]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-12">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-4">
            <div className="h-2 w-2 rounded-full bg-lab-red shadow-[0_0_10px_rgba(220,38,38,0.6)]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60 sm:text-xs sm:tracking-[0.3em]">
              Contact Terminal
            </span>
          </div>
          
          <button
            onClick={handleBackHome}
            className="group flex h-11 shrink-0 items-center gap-1 px-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white/50 transition-colors hover:text-white sm:h-auto sm:gap-2 sm:px-0 sm:text-[11px] sm:tracking-[0.2em]"
          >
            <span className="text-lab-red opacity-0 transition-opacity duration-300 group-hover:opacity-100">{'<'}</span>
            BACK HOME / 返回首页
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-5 pb-24 pt-28 sm:px-6 sm:pb-32 sm:pt-32 lg:px-12 lg:pt-40">
        
        {/* Section 1: Page Header */}
        <header className="mb-16 border-b border-white/[0.06] pb-8 sm:mb-20 sm:pb-12">
          <h1 className="mb-6 text-3xl font-medium uppercase tracking-[0.12em] text-white sm:text-5xl sm:tracking-[0.2em]">
            CONTACT <span className="text-white/40">/ 联系我</span>
          </h1>
          <p className="max-w-2xl font-mono text-[12px] uppercase leading-relaxed tracking-[0.15em] text-white/50">
            Open for AI Trainer, Model Evaluation and Data Quality roles.
            <br />
            <span className="mt-4 block tracking-normal opacity-80">
              可沟通 AI 训练师、大模型评测、数据质检相关机会。
            </span>
          </p>
        </header>

        {/* Two Column Layout for Desktop */}
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-24">
          
          {/* Section 2: Contact Channels */}
          <section>
            <h2 className="mb-8 font-mono text-sm uppercase tracking-[0.2em] text-white/70">
              CONTACT CHANNELS <span className="text-white/30">/ 联系方式</span>
            </h2>
            
            <div className="flex flex-col gap-6">
              <ContactChannel 
                titleEn="EMAIL"
                titleZh="邮箱"
                content="2767188571@qq.com"
                actionTextEn="COPY EMAIL"
                actionTextZh="复制邮箱"
              />
              
              <ContactChannel 
                titleEn="PHONE"
                titleZh="电话"
                content="18339577708"
                actionTextEn="COPY PHONE"
                actionTextZh="复制电话"
              />
              
              <ContactChannel 
                titleEn="WECHAT"
                titleZh="微信"
                content="lcebear131"
                actionTextEn="COPY WECHAT"
                actionTextZh="复制微信"
              />
            </div>
          </section>

          {/* Section 3: Wechat QR */}
          <section className="flex flex-col">
            <h2 className="mb-8 font-mono text-sm uppercase tracking-[0.2em] text-white/70">
              WECHAT QR <span className="text-white/30">/ 微信二维码</span>
            </h2>
            <div className="flex flex-1 items-center justify-center pb-8 lg:pb-0">
              <WechatQrPlaceholder />
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};
