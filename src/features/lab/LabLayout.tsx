import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type LabLayoutProps = {
  title: string;
  children: ReactNode;
};

// LAB 共享外壳：只做基础黑底 / 红色细线 / 返回首页 / 模块标题。
// 复用首页设计语言（黑底、细线、红色仅作激活），不做复杂视觉。
export default function LabLayout({ title, children }: LabLayoutProps) {
  return (
    <div className="relative min-h-screen bg-lab-black text-white">
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/[0.06] bg-black/20 px-5 backdrop-blur-xl sm:px-8 lg:px-14">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between text-[11px] uppercase tracking-[0.18em]">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-white/70 transition-colors duration-300 hover:text-lab-red"
          >
            <span className="h-px w-6 bg-white/30 transition-colors duration-300 group-hover:bg-lab-red" />
            返回首页
          </Link>
          <span className="text-white/45">{title}</span>
          <span className="inline-flex items-center gap-2 text-lab-red">
            <span className="h-1.5 w-1.5 rounded-full bg-lab-red" />
            LAB
          </span>
        </div>
      </header>
      <main className="relative min-h-screen pt-16">{children}</main>
    </div>
  );
}
