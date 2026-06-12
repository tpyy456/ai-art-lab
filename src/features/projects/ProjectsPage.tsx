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
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-12">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-4">
            <div className="h-2 w-2 rounded-full bg-lab-red shadow-[0_0_10px_rgba(220,38,38,0.6)]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60 sm:text-xs sm:tracking-[0.3em]">
              Project Archive
            </span>
          </div>
          
          <button
            onClick={handleBackHome}
            className="group flex h-11 shrink-0 items-center gap-1 px-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white/50 transition-colors hover:text-white sm:h-auto sm:gap-2 sm:px-0 sm:text-[11px] sm:tracking-[0.2em]"
          >
            <span className="opacity-0 transition-opacity duration-300 group-hover:opacity-100 text-lab-red">{'<'}</span>
            BACK HOME / 返回首页
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-5 pb-24 pt-28 sm:px-6 sm:pb-32 sm:pt-32 lg:px-12 lg:pt-40">
        
        {/* Page Header */}
        <header className="mb-16 border-b border-white/[0.06] pb-8 sm:mb-24 sm:pb-12">
          <h1 className="mb-6 text-3xl font-medium uppercase tracking-[0.12em] text-white sm:text-5xl sm:tracking-[0.2em]">
            PROJECTS / 项目
          </h1>
          <p className="max-w-2xl font-mono text-[12px] uppercase leading-relaxed tracking-[0.15em] text-white/50">
            A structured archive of role-related practice, AI agent collaboration, and experimental systems.
            <br />
            <span className="mt-2 block tracking-normal opacity-80">这里记录与岗位实践、AI Agent 协作和个人实验相关的项目。</span>
          </p>
        </header>

        {/* Section 1: Professional Practice */}
        <section className="mb-16 sm:mb-24">
          <div className="mb-10">
            <h2 className="text-lg font-medium uppercase tracking-[0.1em] text-white/90 sm:text-xl sm:tracking-[0.15em]">
              PROFESSIONAL PRACTICE <span className="text-white/40">/ 岗位实践</span>
            </h2>
            <p className="mt-3 text-[13px] text-white/50">
              与 AI 训练师、数据标注、内容评测、质量判断相关的项目经验。
            </p>
          </div>
          
          <div className="flex flex-col gap-8">
            {professionalProjects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </div>
        </section>

        {/* Section 2: AI Agent Practice */}
        <section>
          <div className="mb-10">
            <h2 className="text-lg font-medium uppercase tracking-[0.1em] text-white/90 sm:text-xl sm:tracking-[0.15em]">
              AI AGENT PRACTICE <span className="text-white/40">/ AI Agent 实践</span>
            </h2>
            <p className="mt-3 text-[13px] text-white/50">
              使用 Codex、Claude、Trae 等工具完成的个人项目、交互实验和自动化工具。
            </p>
          </div>
          
          <div className="flex flex-col gap-8">
            {agentProjects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </div>
        </section>

      </main>

      {/* Detail Modal Overlay */}
      <ProjectDetailModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
    </div>
  );
};
