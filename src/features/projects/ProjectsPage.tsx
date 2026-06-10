import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScanTransition } from '../../components/transition/RedScanTransition';
import { ProjectCard } from './components/ProjectCard';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { professionalProjects, agentProjects, ProjectData } from './projectsData';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { navigateWithScan } = useScanTransition();
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBackHome = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateWithScan('/');
  };

  return (
    <div className="min-h-screen w-full bg-[#030303] text-white">
      {/* Top Navigation Bar */}
      <nav className="fixed left-0 top-0 z-40 w-full border-b border-white/[0.04] bg-[#030303]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-lab-red shadow-[0_0_10px_rgba(220,38,38,0.6)]" />
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/60">
              Project Archive
            </span>
          </div>
          
          <button
            onClick={handleBackHome}
            className="group flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white"
          >
            <span className="opacity-0 transition-opacity duration-300 group-hover:opacity-100 text-lab-red">{'<'}</span>
            BACK HOME / 返回首页
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative mx-auto max-w-5xl px-6 pb-32 pt-32 lg:px-12 lg:pt-40">
        
        {/* Background Ambient Structure */}
        <div className="pointer-events-none absolute inset-0 -z-10 flex justify-center opacity-[0.15]">
          <div className="h-full w-full max-w-4xl border-x border-white/5 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]" />
        </div>

        {/* Page Header */}
        <header className="mb-24 border-b border-white/[0.06] pb-12">
          <h1 className="mb-6 text-4xl font-medium uppercase tracking-[0.2em] text-white sm:text-5xl">
            PROJECTS / 项目
          </h1>
          <p className="max-w-2xl font-mono text-[12px] uppercase leading-relaxed tracking-[0.15em] text-white/50">
            A structured archive of role-related practice, AI agent collaboration, and experimental systems.
            <br />
            <span className="mt-2 block tracking-normal opacity-80">这里记录与岗位实践、AI Agent 协作和个人实验相关的项目。</span>
          </p>
        </header>

        <div className="relative">
          {/* Vertical Scanning Axis */}
          <div className="absolute bottom-0 left-4 top-0 hidden w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent sm:block">
            <div className="absolute left-[-1px] top-1/4 h-32 w-[3px] bg-gradient-to-b from-transparent via-lab-red/40 to-transparent blur-[1px]" />
          </div>

          {/* Section 1: Professional Practice */}
          <section className="mb-24 sm:pl-16">
            <div className="mb-10 relative">
              <div className="absolute -left-12 top-1/2 hidden h-[1px] w-8 bg-white/20 sm:block" />
              <div className="absolute -left-[51px] top-1/2 hidden h-1.5 w-1.5 -translate-y-1/2 rounded-full border border-lab-red bg-black sm:block" />
              <h2 className="text-xl font-medium uppercase tracking-[0.15em] text-white/90">
                PROFESSIONAL PRACTICE <span className="text-white/40">/ 岗位实践</span>
              </h2>
              <p className="mt-3 text-[13px] text-white/50">
                与 AI 训练师、数据标注、内容评测、质量判断相关的项目经验。
              </p>
            </div>
            
            <div className="flex flex-col gap-8">
              {professionalProjects.map((project) => (
                <div key={project.id} className="relative">
                  <div className="absolute -left-12 top-1/2 hidden h-[1px] w-12 bg-white/10 sm:block" />
                  <ProjectCard 
                    project={project} 
                    onClick={() => setSelectedProject(project)}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: AI Agent Practice */}
          <section className="sm:pl-16">
            <div className="mb-10 relative">
              <div className="absolute -left-12 top-1/2 hidden h-[1px] w-8 bg-white/20 sm:block" />
              <div className="absolute -left-[51px] top-1/2 hidden h-1.5 w-1.5 -translate-y-1/2 rounded-full border border-lab-red bg-black sm:block" />
              <h2 className="text-xl font-medium uppercase tracking-[0.15em] text-white/90">
                AI AGENT PRACTICE <span className="text-white/40">/ AI Agent 实践</span>
              </h2>
              <p className="mt-3 text-[13px] text-white/50">
                使用 Codex、Claude、Trae 等工具完成的个人项目、交互实验和自动化工具。
              </p>
            </div>
            
            <div className="flex flex-col gap-8">
              {agentProjects.map((project) => (
                <div key={project.id} className="relative">
                  <div className="absolute -left-12 top-1/2 hidden h-[1px] w-12 bg-white/10 sm:block" />
                  <ProjectCard 
                    project={project} 
                    onClick={() => setSelectedProject(project)}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

      </main>

      {/* Detail Modal Overlay */}
      <ProjectDetailModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
    </div>
  );
};