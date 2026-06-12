import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProjectData } from '../projectsData';

interface ProjectDetailModalProps {
  project: ProjectData | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (project) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [project]);

  return (
    <AnimatePresence>
      {project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-12">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-[#020202]/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex max-h-[88dvh] w-full max-w-4xl flex-col overflow-hidden border border-white/[0.08] bg-[#050505] shadow-[0_0_40px_rgba(220,38,38,0.08)] sm:max-h-full"
          >
            {/* Corner Markers */}
            <div className="absolute left-0 top-0 h-3 w-3 border-l border-t border-lab-red/60" />
            <div className="absolute right-0 top-0 h-3 w-3 border-r border-t border-lab-red/60" />
            <div className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-lab-red/60" />
            <div className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-lab-red/60" />
            
            {/* Top Scanning Line */}
            <motion.div 
              className="absolute left-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-lab-red/80 to-transparent opacity-50"
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />

            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#080808] px-4 py-2.5 sm:px-6 sm:py-5">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-5 w-5 items-center justify-center border border-lab-red/30 bg-lab-red/10">
                  <div className="h-1.5 w-1.5 bg-lab-red animate-pulse" />
                </div>
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-lab-red">
                  Archive Viewer
                </span>
              </div>
              
              <button 
                onClick={onClose}
                className="group flex min-h-11 items-center gap-2 px-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/50 transition-colors hover:text-white sm:min-h-0 sm:px-0 sm:tracking-[0.15em]"
              >
                CLOSE / 关闭
                <span className="text-lab-red opacity-0 transition-opacity group-hover:opacity-100">x</span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-5 sm:p-10">
              
              {/* Title Section */}
              <div className="mb-8 sm:mb-12">
                <p className="mb-3 font-mono text-[11px] text-lab-red/80 tracking-[0.2em]">
                  {project.number}
                </p>
                <h2 className="text-xl font-medium uppercase tracking-[0.08em] text-white/90 sm:text-3xl sm:tracking-widest">
                  {project.titleZh}
                </h2>
                <p className="mt-2 font-mono text-xs text-white/40 uppercase tracking-[0.1em]">
                  {project.titleEn}
                </p>
                <div className="mt-6 inline-block border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white/70">
                  {project.type}
                </div>
              </div>

              {/* Detail Grid */}
              <div className="grid gap-x-12 gap-y-7 sm:grid-cols-2 sm:gap-y-10">
                
                <div className="flex flex-col gap-2">
                  <h4 className="font-mono text-[10px] text-white/30 uppercase tracking-[0.2em] border-b border-white/[0.04] pb-2">
                    Background / 项目背景
                  </h4>
                  <p className="text-[13px] leading-relaxed text-white/80 pt-1">
                    {project.details.background}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="font-mono text-[10px] text-white/30 uppercase tracking-[0.2em] border-b border-white/[0.04] pb-2">
                    My Role / 我的角色
                  </h4>
                  <p className="text-[13px] leading-relaxed text-white/80 pt-1">
                    {project.role}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <h4 className="font-mono text-[10px] text-white/30 uppercase tracking-[0.2em] border-b border-white/[0.04] pb-2">
                    Workflow / 工作流程
                  </h4>
                  <p className="text-[13px] leading-relaxed text-white/80 pt-1">
                    {project.details.workflow}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="font-mono text-[10px] text-white/30 uppercase tracking-[0.2em] border-b border-white/[0.04] pb-2">
                    Key Actions / 关键动作
                  </h4>
                  <p className="text-[13px] leading-relaxed text-white/80 pt-1">
                    {project.actions}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="font-mono text-[10px] text-white/30 uppercase tracking-[0.2em] border-b border-white/[0.04] pb-2">
                    Quality Rules / 质量规则
                  </h4>
                  <p className="text-[13px] leading-relaxed text-white/80 pt-1">
                    {project.details.qualityRules}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="font-mono text-[10px] text-white/30 uppercase tracking-[0.2em] border-b border-white/[0.04] pb-2">
                    Output / 产出结果
                  </h4>
                  <p className="text-[13px] leading-relaxed text-white/80 pt-1">
                    {project.details.output}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="font-mono text-[10px] text-white/30 uppercase tracking-[0.2em] border-b border-white/[0.04] pb-2">
                    Ability Mapping / 能力对应
                  </h4>
                  <p className="text-[13px] leading-relaxed text-white/80 pt-1">
                    {project.capabilities}
                  </p>
                </div>

              </div>
              
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
