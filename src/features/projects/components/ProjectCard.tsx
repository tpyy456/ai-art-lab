import React from 'react';
import { ProjectData } from '../projectsData';

interface ProjectCardProps {
  project: ProjectData;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="group relative w-full border border-white/[0.06] bg-[#080808] p-6 transition-colors duration-500 hover:border-lab-red/30 sm:p-8">
      {/* Corner Crosshairs */}
      <div className="absolute left-0 top-0 h-2 w-2 border-l border-t border-white/20 transition-colors duration-500 group-hover:border-lab-red/60" />
      <div className="absolute right-0 top-0 h-2 w-2 border-r border-t border-white/20 transition-colors duration-500 group-hover:border-lab-red/60" />
      <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-white/20 transition-colors duration-500 group-hover:border-lab-red/60" />
      <div className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-white/20 transition-colors duration-500 group-hover:border-lab-red/60" />

      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-white/[0.04] pb-6 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 font-mono text-[10px] text-lab-red/80 tracking-[0.2em]">{project.number}</p>
          <h3 className="text-lg font-medium text-white/90 uppercase tracking-widest">{project.titleZh}</h3>
          <p className="mt-1 font-mono text-[11px] text-white/40 uppercase tracking-[0.1em]">{project.titleEn}</p>
        </div>
        <div className="flex items-center">
          <span className={`inline-block px-3 py-1 font-mono text-[10px] uppercase tracking-widest ${
            project.status.includes('READY') ? 'border border-lab-red/30 text-lab-red bg-lab-red/5' : 
            project.status.includes('PROGRESS') ? 'border border-white/20 text-white/70 bg-white/5' : 
            'border border-white/10 text-white/40 border-dashed'
          }`}>
            {project.status}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 sm:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] text-white/30 uppercase tracking-[0.2em]">Project Type / 项目类型</span>
          <p className="text-[13px] text-white/80">{project.type}</p>
        </div>
        
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] text-white/30 uppercase tracking-[0.2em]">My Role / 我的角色</span>
          <p className="text-[13px] text-white/80">{project.role}</p>
        </div>
        
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] text-white/30 uppercase tracking-[0.2em]">Key Actions / 关键动作</span>
          <p className="text-[13px] text-white/80">{project.actions}</p>
        </div>
        
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] text-white/30 uppercase tracking-[0.2em]">Capabilities / 对应能力</span>
          <p className="text-[13px] text-white/80">{project.capabilities}</p>
        </div>
      </div>
      
      {/* Hover Red Line Effect */}
      <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-lab-red/50 transition-all duration-700 ease-out group-hover:w-full" />
    </div>
  );
};