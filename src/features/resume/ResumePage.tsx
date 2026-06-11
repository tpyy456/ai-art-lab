import React, { useEffect } from 'react';
import { useScanTransition } from '../../components/transition/RedScanTransition';
import { RoleMatchAnalyzer } from './components/RoleMatchAnalyzer';
import { resumeData } from './resumeData';

export const ResumePage: React.FC = () => {
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
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-lab-red shadow-[0_0_10px_rgba(220,38,38,0.6)]" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/60">
              Role Profile
            </span>
          </div>
          
          <button
            onClick={handleBackHome}
            className="group flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white"
          >
            <span className="text-lab-red opacity-0 transition-opacity duration-300 group-hover:opacity-100">{'<'}</span>
            BACK HOME / 返回首页
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 pb-32 pt-32 lg:px-12 lg:pt-40">
        
        {/* Section 1: Page Header */}
        <header className="mb-20 border-b border-white/[0.06] pb-12">
          <h1 className="mb-6 text-4xl font-medium uppercase tracking-[0.2em] text-white sm:text-5xl">
            RESUME <span className="text-white/40">/ 简历</span>
          </h1>
          <p className="max-w-2xl font-mono text-[12px] uppercase leading-relaxed tracking-[0.15em] text-white/50">
            AI Trainer Candidate Profile / AI 训练师候选人档案
            <br />
            <span className="mt-4 block tracking-normal opacity-80">
              基于艺术 / 美术史背景、文本标注与多轮对话质检经验，面向 AI 训练师、大模型评测、数据质检方向。
            </span>
          </p>
        </header>

        {/* Section 2: Target Role */}
        <section className="mb-20">
          <h2 className="mb-8 font-mono text-sm uppercase tracking-[0.2em] text-white/70">
            TARGET ROLE <span className="text-white/30">/ 求职方向</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            {resumeData.targetRoles.map((role, idx) => (
              <span 
                key={idx} 
                className="border border-white/10 bg-white/[0.02] px-4 py-2 text-[13px] text-white/80 transition-colors hover:border-white/30"
              >
                {role}
              </span>
            ))}
          </div>
        </section>

        {/* Section 3: Core Capability */}
        <section className="mb-20">
          <h2 className="mb-8 font-mono text-sm uppercase tracking-[0.2em] text-white/70">
            CORE CAPABILITY <span className="text-white/30">/ 核心能力</span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {resumeData.capabilities.map((group, idx) => (
              <div key={idx} className="border border-white/[0.04] bg-[#050505] p-6">
                <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.1em] text-lab-red/80">
                  {group.category}
                </h3>
                <ul className="flex flex-col gap-2">
                  {group.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-[13px] text-white/70">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/20" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Experience */}
        <section className="mb-20">
          <h2 className="mb-8 font-mono text-sm uppercase tracking-[0.2em] text-white/70">
            EXPERIENCE <span className="text-white/30">/ 实习经历</span>
          </h2>
          <div className="flex flex-col gap-12 border-l border-white/10 pl-6 sm:pl-8 ml-2">
            {resumeData.experiences.map((exp) => (
              <div key={exp.id} className="relative">
                {/* Timeline Dot */}
                <div className="absolute -left-[31px] top-1.5 h-2 w-2 rounded-full border border-lab-red bg-black sm:-left-[39px]" />
                
                <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-lg font-medium text-white/90">{exp.company}</h3>
                    <p className="mt-1 text-[13px] text-white/60">{exp.role}</p>
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/40">
                    {exp.period}
                  </span>
                </div>
                
                <ul className="flex flex-col gap-2.5">
                  {exp.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-3 text-[13px] leading-relaxed text-white/70">
                      <span className="mt-2 h-[1px] w-2 shrink-0 bg-lab-red/50" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Education */}
        <section className="mb-20">
          <h2 className="mb-8 font-mono text-sm uppercase tracking-[0.2em] text-white/70">
            EDUCATION <span className="text-white/30">/ 教育背景</span>
          </h2>
          <div className="border border-white/[0.04] bg-[#050505] p-6 sm:p-8">
            <div className="mb-6 flex flex-col items-start justify-between gap-2 border-b border-white/[0.06] pb-6 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-lg font-medium text-white/90">{resumeData.education.school}</h3>
                <p className="mt-1 text-[13px] text-white/60">{resumeData.education.major}</p>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/40">
                {resumeData.education.period}
              </span>
            </div>
            
            <ul className="flex flex-col gap-2.5">
              {resumeData.education.notes.map((note, i) => (
                <li key={i} className="flex items-start gap-3 text-[13px] leading-relaxed text-white/70">
                  <span className="mt-2 h-[1px] w-2 shrink-0 bg-white/20" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section 6: Resume File & Role Match */}
        <section>
          <h2 className="mb-8 font-mono text-sm uppercase tracking-[0.2em] text-white/70">
            RESUME FILE & ROLE MATCH <span className="text-white/30">/ 简历文件与岗位匹配</span>
          </h2>
          
          <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
            {/* A. Resume File */}
            <div className="flex flex-col items-start justify-center border border-white/[0.04] bg-[#050505] p-6 sm:p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center border border-white/10 bg-white/[0.02]">
                <svg className="h-5 w-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <button 
                disabled
                className="mb-3 border border-white/10 px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-white/30 cursor-not-allowed"
              >
                DOWNLOAD RESUME / 下载简历
              </button>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/30">
                RESUME FILE NOT READY / 简历文件暂未接入
              </p>
            </div>

            {/* B. Role Match Analyzer */}
            <RoleMatchAnalyzer />
          </div>
        </section>

      </main>
    </div>
  );
};