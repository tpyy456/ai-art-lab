import React, { useState } from 'react';

export const RoleMatchAnalyzer: React.FC = () => {
  const [jdText, setJdText] = useState('');
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [error, setError] = useState('');

  const handleAnalyze = () => {
    if (!jdText.trim()) {
      setError('请先粘贴岗位 JD / Please paste a job description first');
      return;
    }
    setError('');
    setStatus('analyzing');
    setTimeout(() => {
      setStatus('done');
    }, 1500);
  };

  return (
    <div className="relative border border-white/[0.06] bg-[#080808] p-5 transition-colors duration-500 hover:border-lab-red/30 sm:p-8">
      {/* Corner crosshairs */}
      <div className="absolute left-0 top-0 h-2 w-2 border-l border-t border-white/20" />
      <div className="absolute right-0 top-0 h-2 w-2 border-r border-t border-white/20" />
      <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-white/20" />
      <div className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-white/20" />

      <h3 className="mb-6 font-mono text-xs uppercase tracking-[0.12em] text-lab-red sm:text-[13px] sm:tracking-[0.2em]">
        ROLE MATCH ANALYZER <span className="text-white/40">/ 岗位匹配分析器</span>
      </h3>
      
      <div className="mb-6">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.1em] text-white/40">
          LOCAL DEMO / 本地演示版 (当前为本地演示分析，不上传任何岗位信息。)
        </p>
        <textarea 
          className="h-32 w-full resize-none border border-white/10 bg-black p-4 text-[13px] text-white/80 transition-colors focus:border-lab-red/50 focus:outline-none"
          placeholder="请将岗位 JD 粘贴到这里，系统将基于我的简历信息生成岗位匹配分析..."
          value={jdText}
          onChange={(e) => {
            setJdText(e.target.value);
            if (error) setError('');
            if (status === 'done') setStatus('idle');
          }}
        />
        {error && <p className="mt-2 font-mono text-[11px] text-lab-red">{error}</p>}
      </div>
      
      <button 
        onClick={handleAnalyze}
        disabled={status === 'analyzing'}
        className="min-h-11 w-full border border-white/20 bg-white/[0.02] px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-white/80 transition-colors hover:border-white/40 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6"
      >
        {status === 'analyzing' ? 'ANALYZING...' : 'ANALYZE MATCH / 分析匹配度'}
      </button>

      {status === 'done' && (
        <div className="mt-8 border-t border-white/[0.06] pt-8 animate-in fade-in duration-500">
          <div className="mb-8 flex items-center gap-4">
             <div className="text-4xl font-light text-lab-red">82<span className="text-xl text-white/30">/100</span></div>
             <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
               MATCH SCORE<br />匹配度
             </div>
          </div>
          
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <h4 className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-lab-red/90">
                MATCHED ABILITIES / 匹配能力
              </h4>
              <ul className="space-y-3 text-[13px] text-white/70">
                <li className="flex gap-3"><span className="text-lab-red/50">+</span> 数据标注与质检经验</li>
                <li className="flex gap-3"><span className="text-lab-red/50">+</span> SFT 与多轮对话标注经验</li>
                <li className="flex gap-3"><span className="text-lab-red/50">+</span> 艺术 / 美术史垂类背景</li>
                <li className="flex gap-3"><span className="text-lab-red/50">+</span> 标注规范与规则文档意识</li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-yellow-500/80">
                RISK POINTS / 风险项
              </h4>
              <ul className="space-y-3 text-[13px] text-white/70">
                <li className="flex gap-3"><span className="text-yellow-500/50">-</span> 真实工程开发经验仍偏应用层</li>
                <li className="flex gap-3"><span className="text-yellow-500/50">-</span> 需要继续补充大模型评测指标表达</li>
              </ul>
            </div>
            
            <div className="sm:col-span-2">
              <h4 className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-blue-400/80">
                INTERVIEW FOCUS / 面试表达建议
              </h4>
              <ul className="space-y-3 text-[13px] text-white/70">
                <li className="flex gap-3"><span className="text-blue-400/50">›</span> 重点讲网易有道艺术垂类 SFT 标注与 NotebookLM 自建 RAG 知识库</li>
                <li className="flex gap-3"><span className="text-blue-400/50">›</span> 重点讲金山 AI 客服多轮对话质检经验</li>
                <li className="flex gap-3"><span className="text-blue-400/50">›</span> 补充说明个人网站项目体现 AI Agent 协作、需求拆解和验收能力</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
